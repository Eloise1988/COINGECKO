/*====================================================================================================================================*
  CoinGecko Google Sheet Feed by Eloise1988
  ====================================================================================================================================
  Version:      2.0
  Project Page: https://github.com/Eloise1988/COINGECKO
  Copyright:    (c) 2021 by Eloise1988
                
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  
  The following code helped me a lot in optimizing: https://gist.github.com/hesido/c04bab6b8dc9d802e14e53aeb996d4b2
  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing CoinGecko's price, volume & market cap feeds into Google spreadsheets. Functions include:

     GECKOPRICE            For use by end users to cryptocurrency prices 
     GECKOVOLUME           For use by end users to cryptocurrency 24h volumes
     GECKOCAP              For use by end users to cryptocurrency total market caps
     GECKOPRICEBYNAME      For use by end users to cryptocurrency prices by id, one input only
     GECKOVOLUMEBYNAME     For use by end users to cryptocurrency 24h volumes by id, one input only
     GECKOCAPBYNAME        For use by end users to cryptocurrency total market caps by id, one input only
     GECKOCHANGE           For use by end users to cryptocurrency % change price, volume, mkt
     GECKOHIST             For use by end users to cryptocurrency historical prices, volumes, mkt
     GECKOATH              For use by end users to cryptocurrency All Time High Prices
     GECKOATL              For use by end users to cryptocurrency All Time Low Prices
     GECKO24HIGH           For use by end users to cryptocurrency 24H Low Price
     GECKO24LOW            For use by end users to cryptocurrency 24H High Price
     GECKO_ID_DATA         For use by end users to cryptocurrency data end points
     GECKO_LOGO            For use by end users to cryptocurrency Logos by ticker
     GECKO_LOGOBYNAME      For use by end users to cryptocurrency Logos by id


  If ticker isn't functionning please refer to the coin's id you can find in the following JSON pas: https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1

  
  For bug reports see https://github.com/Eloise1988/COINGECKO/issues
  
  
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  2.0.0  May 2021 New Release
 *====================================================================================================================================*/


/** GECKOPRICE
 * Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The price feed can be an array of tickers or a single ticker.
 * By default, data gets transformed into a array/number so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKOPRICE("BTC")
 *   =GECKOPRICE("BTC-EUR")
 *   =GECKOPRICE(B16:B35,"CHF")           
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {defaultVersusCoin}              by default prices are against "usd", only 1 input
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a dimensional array containing the prices
 **/

async function GECKOPRICE(ticker_array,defaultVersusCoin){

  Utilities.sleep(Math.random() * 100)
  try{
    pairExtractRegex = /(.*)[/](.*)/, coinSet = new Set(), versusCoinSet = new Set(), pairList = [];

    defaultValueForMissingData = null;
    if(typeof defaultVersusCoin === 'undefined') defaultVersusCoin = "usd";
    defaultVersusCoin=defaultVersusCoin.toLowerCase();
    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);

    let coinList = [...coinSet].join("%2C");
    let versusCoinList = [...versusCoinSet].join("%2C");

    id_cache=coinList+versusCoinList+'price'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      pairList.map((pair) => pair[0] && (cached[pair[0]] && (cached[pair[0]][pair[1]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + coinList + "&vs_currencies=" + versusCoinList).getContentText());
    Logger.log(tickerList)
    cache.put(id_cache,tickerList);
    
    return pairList.map((pair) => pair[0] && (tickerList[pair[0]] && (tickerList[pair[0]][pair[1]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
        versusCoinSet.add(pair[1]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
        versusCoinSet.add(pair[1]);
      }
    }}
    catch(err){
    return GECKOPRICE(ticker_array,defaultVersusCoin);
  }
  }
  
/** GECKOVOLUME
 * Imports CoinGecko's cryptocurrencies 24h volumes into Google spreadsheets. The feed can be an array of tickers or a single ticker.
 * By default, data gets transformed into an array/number so it looks more like a normal number data import. 
 * For example:
 *
 *   =GECKOVOLUME("BTC","EUR")
 *   =GECKOVOLUME(B16:B35)
 *               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return an array containing the 24h volumes
 **/

async function GECKOVOLUME(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'vol'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].total_volume;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKOVOLUME(ticker_array,currency);
  }
  
}  
/** GECKOCAP
 * Imports cryptocurrencies total market cap into Google spreadsheets. The feed can be an array of tickers or a single ticker.
 * By default, data gets transformed into an array/number 
 * For example:
 *
 *   =GECKOCAP("BTC","EUR")
 *   =GECKOCAP(B16:B35)
 *               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns an array of market caps
 **/ 
async function GECKOCAP(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'mktcap'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].market_cap;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKOCAP(ticker_array,currency);
  }
  
}  

/** GECKOCAPDILUTED
 * Imports cryptocurrencies total diluted market cap into Google spreadsheets. The feed is a dimensional array.
 * For example:
 *
 *   =GECKOCAPDILUTED("BTC","JPY")
 *   =GECKOCAPDILUTED(B16:B35)              
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns the fully diluted market caps 
 **/ 
async function GECKOCAPDILUTED(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'mktcapdiluted'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].fully_diluted_valuation;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKOCAPDILUTED(ticker_array,currency);
  }
  
}  
/** GECKO24HPRICECHANGE
 * Imports cryptocurrencies 24H percent price change into Google spreadsheets. The feed is a dimensional array.
 * For example:
 *
 *   =GECKO24HPRICECHANGE("BTC","EUR")
 *   =GECKO24HPRICECHANGE(B16:B35)               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns the cryptocurrencies 24H percent price change
 **/ 
async function GECKO24HPRICECHANGE(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'GECKO24HPRICECHANGE'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=parseFloat(tickerList[i].price_change_percentage_24h)/100;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKO24HPRICECHANGE(ticker_array,currency);
  }
  
}  

/** GECKORANK
 * Imports cryptocurrencies RANKING into Google spreadsheets. The feed is a dimensional array or single ticker/id.
 * For example:
 *
 *   =GECKORANK("BTC")
 *               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns the Ranks of cryptocurrencies 
 **/ 
async function GECKORANK(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'GECKORANK'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].market_cap_rank;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKORANK(ticker_array,currency);
  }
  
}  
 /** GECKOATH
 * Imports CoinGecko's cryptocurrency All Time High Price into Google spreadsheets. The price feed is an array of tickers.
 * By default, data gets transformed into an array of numbers so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKOATH("ethereum","EUR")
 *   =GECKOATH(a1:a10)                 
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the ATH price
 **/
 async function GECKOATH(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'ath'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].ath;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKOATH(ticker_array,currency);
  }
  
} 
 /** GECKOATL
 * Imports CoinGecko's cryptocurrency All Time Low Price into Google spreadsheets. The price feed is a ONE-dimensional array.
 * By default, data gets transformed into a number so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKOATL("ethereum","EUR")
 *   =GECKOATL(a1:a10)  
 *               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the ATL prices
 **/
 async function GECKOATL(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'atl'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)});
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].atl;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKOATL(ticker_array,currency);
  }
  
}
 /** GECKO24HIGH
 * Imports CoinGecko's cryptocurrency 24h High Prices into Google spreadsheets. The price feed is an array/tickers/ids.
 * By default, data gets transformed into a number number so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKO24HIGH("ethereum","EUR")
 *   =GECKO24HIGH(a1:a10) 
 *               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return an array containing the 24hour high prices
 **/
 async function GECKO24HIGH(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'GECKO24HIGH'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)});
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].high_24h;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKO24HIGH(ticker_array,currency);
  }
  
}  
/** GECKO24LOW
 * Imports CoinGecko's cryptocurrency 24h Low Prices into Google spreadsheets. The price feed is a array.
 * By default, data gets transformed into a number so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKO24LOW("ethereum","EUR")
 *   =GECKO24LOW(a1:a10) 
 *               
 * 
 * @param {cryptocurrencies}               the cryptocurrency RANGE of tickers/id you want the prices from
 * @param {currency}                       by default "usd", only 1 parameter
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return an array containing the 24h low prices
 **/
 async function GECKO24LOW(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)[/](.*)/, pairList = [];
    
    defaultValueForMissingData = null;

    if(ticker_array.map) ticker_array.map(pairExtract);
    else pairExtract(ticker_array);
    
    if(currency) defaultVersusCoin = currency.toLowerCase();
    let coinList = [...coinSet].join("%2C");
    id_cache=coinList+defaultVersusCoin+'GECKO24LOW'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return !isNaN(Number(n)) && Number(n)});
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].low_24h;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "Versus Coin Not Found") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "Coin Not Found")) || "");  
    
    function pairExtract(toExtract) {
      toExtract = toExtract.toString().toLowerCase();
      let match, pair;
      if(match = toExtract.match(pairExtractRegex)) {
        pairList.push(pair = [CoinList[match[1]] || match[1], match[2]]);
        coinSet.add(pair[0]);
      }
      else {
        pairList.push(pair = [CoinList[toExtract] || toExtract, defaultVersusCoin]);
        coinSet.add(pair[0]);
      }
    }
  }
  catch(err){
    return GECKO24HIGH(ticker_array,currency);
  }
  
}  
/** GECKOHIST
 * Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
 * For example:
 *
 *   =GECKOHIST("BTC","LTC","price", "31-12-2020")
 *   =GECKOHIST("ethereum","USD","volume", "01-01-2021",false)
 *   =GECKOHIST("YFI","EUR","marketcap","06-06-2020",true)
 *               
 * 
 * @param {ticker}                 the cryptocurrency ticker, only 1 parameter 
 * @param {ticker2}                the cryptocurrency ticker against which you want the %chage, only 1 parameter
 * @param {price,volume, or marketcap}   the type of change you are looking for
 * @param {date_ddmmyyy}           the date format dd-mm-yyy get open of the specified date, for close dd-mm-yyy+ 1day
 * @param {by_ticker boolean}       an optional true (data by ticker) false (data by id_name) 
 * @param {parseOptions}           an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the historical open price of BTC -LTC on the 31-12-2020
 **/
async function GECKOHIST(ticker,ticker2,type, date_ddmmyyy,by_ticker=true){
  Utilities.sleep(Math.random() * 100)
  ticker=ticker.toUpperCase()
  ticker2=ticker2.toLowerCase()
  type=type.toLowerCase()
  date_ddmmyyy=date_ddmmyyy.toString()
  id_cache=ticker+ticker2+type+date_ddmmyyy+'hist'

  if(by_ticker==true){
    
    try{
    
    url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    for (var i=0;i<parsedJSON.coins.length;i++) {
      if (parsedJSON.coins[i].symbol==ticker)
      {
        id_coin=parsedJSON.coins[i].id.toString();
        break;
      }
    }}
    catch(err){
      return GECKOHIST(ticker,ticker2,type, date_ddmmyyy,by_ticker=true);
  }
  }
  else{
    id_coin=ticker.toLowerCase()
  }
  
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }
  try{
    
    
    url="https://api.coingecko.com/api/v3/coins/"+id_coin+"/history?date="+date_ddmmyyy+"&localization=false";
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    
    if (type=="price"){
      vol_gecko=parseFloat(parsedJSON.market_data.current_price[ticker2]).toFixed(4);}
    else if (type=="volume")
    { vol_gecko=parseFloat(parsedJSON.market_data.total_volume[ticker2]).toFixed(4);}
    else if (type=="marketcap")
    { vol_gecko=parseFloat(parsedJSON.market_data.market_cap[ticker2]).toFixed(4);}
    else 
    { vol_gecko="Wrong parameter, either price, volume or marketcap";}
    
    if (vol_gecko!="Wrong parameter, either price, volume or marketcap")
      cache.put(id_cache, Number(vol_gecko));
    return Number(vol_gecko);
  }
  
  catch(err){
    return GECKOHIST(ticker,ticker2,type, date_ddmmyyy,by_ticker=true);
  }
  }  
/** GECKOCHANGEBYNAME
 * Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
 * For example:
 *
 *   =GECKOCHANGE("bitcoin","LTC","price", 7)
 *   =GECKOCHANGE("Ehereum","USD","volume", 1)
 *   =GECKOCHANGE("litecoin","EUR","marketcap",365)
 *               
 * 
 * @param {ticker}                 the cryptocurrency ticker, only 1 parameter 
 * @param {ticker2}                the cryptocurrency ticker/currency against which you want the %change, only 1 parameter
 * @param {price,volume, or marketcap}     the type of change you are looking for
 * @param {nb_days}                 the number of days you are looking for the price change, 365days=1year price change 
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the 7D%  price change on BTC (week price % change).
 **/
async function GECKOCHANGEBYNAME(id_coin,ticker2,type, nb_days){
  Utilities.sleep(Math.random() * 100)
  id_coin=id_coin.toLowerCase()
  ticker2=ticker2.toLowerCase()
  type=type.toLowerCase()
  nb_days=nb_days.toString()
  id_cache=id_coin+ticker2+type+nb_days+'changebyname'
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }
  try{
    
    url="https://api.coingecko.com/api/v3/coins/"+id_coin+"/market_chart?vs_currency="+ticker2+"&days="+nb_days;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    if (type=="price")
    { vol_gecko=parseFloat(parsedJSON.prices[parsedJSON.prices.length-1][1]/parsedJSON.prices[0][1]-1).toFixed(4);}
    else if (type=="volume")
    { vol_gecko=parseFloat(parsedJSON.total_volumes[parsedJSON.total_volumes.length-1][1]/parsedJSON.total_volumes[0][1]-1).toFixed(4);}
    else if (type=="marketcap")
    { vol_gecko=parseFloat(parsedJSON.market_caps[parsedJSON.market_caps.length-1][1]/parsedJSON.market_caps[0][1]-1).toFixed(4);}
    else 
    { vol_gecko="Wrong parameter, either price, volume or marketcap";}
    
    if (vol_gecko!="Wrong parameter, either price, volume or marketcap")
      cache.put(id_cache, Number(vol_gecko));
    return Number(vol_gecko);
  }
  
  catch(err){
    return GECKOCHANGEBYNAME(id_coin,ticker2,type, nb_days);
  }

}  
/** GECKO_ID_DATA
 * Imports CoinGecko's cryptocurrency data point, ath, 24h_low, market cap, price... into Google spreadsheets. 
 * For example:
 *
 *   =GECKO_ID_DATA("bitcoin","market_data/ath/usd", false)
 *   =GECKO_ID_DATA("ETH","market_data/ath_change_percentage")
 *   =GECKO_ID_DATA("LTC","market_data/high_24h/usd",true)
 *               
 * 
 * @param {ticker}                 the cryptocurrency ticker, only 1 parameter 
 * @param {parameter}              the parameter separated by "/" ex: "market_data/ath/usd" or "market_data/high_24h/usd"
 * @param {by_ticker boolean}       an optional true (data by ticker) false (data by id_name)          
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the specified parameter.
 **/
async function GECKO_ID_DATA(ticker,parameter, by_ticker=true){
  Utilities.sleep(Math.random() * 100)
  ticker=ticker.toUpperCase()
  if(by_ticker==true){
    
    try{
    
    url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    for (var i=0;i<parsedJSON.coins.length;i++) {
      if (parsedJSON.coins[i].symbol==ticker)
      {
        id_coin=parsedJSON.coins[i].id.toString();
        id_cache=ticker+parameter+'gecko_id_data'
        break;
      }
    }}
    catch(err){
    return GECKO_ID_DATA(ticker,parameter, by_ticker);
  }
  }
  else{
    id_coin=ticker.toLowerCase()
    id_cache=id_coin+parameter+'gecko_id_data'
  }
  
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return cached;
  }
  try{
    
    let parameter_array=parameter.split('/');
    Logger.log(parameter_array)

    url="https://api.coingecko.com/api/v3/coins/"+id_coin;
    

    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    
  
    for(elements in parameter_array){
      parsedJSON=parsedJSON[parameter_array[elements]];
    }
    
    
    cache.put(id_cache, parsedJSON);
    return parsedJSON;
  }
  
  catch(err){
    return GECKO_ID_DATA(ticker,parameter, by_ticker);
  }

}  
/** GECKOCHANGE
 * Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
 * For example:
 *
 *   =GECKOCHANGE("BTC","LTC","price", 7)
 *   =GECKOCHANGE("ETH","USD","volume", 1)
 *   =GECKOCHANGE("YFI","EUR","marketcap",365)
 *               
 * 
 * @param {ticker}                 the cryptocurrency ticker, only 1 parameter 
 * @param {ticker2}                the cryptocurrency ticker against which you want the %chaNge, only 1 parameter
 * @param {price,volume, or marketcap}     the type of change you are looking for
 * @param {nb_days}                 the number of days you are looking for the price change, 365days=1year price change 
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the 7D%  price change on BTC (week price % change).
 **/
async function GECKOCHANGE(ticker,ticker2,type, nb_days){
  Utilities.sleep(Math.random() * 100)
  ticker=ticker.toUpperCase()
  ticker2=ticker2.toLowerCase()
  type=type.toLowerCase()
  nb_days=nb_days.toString()
  id_cache=ticker+ticker2+type+nb_days+'change'
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }
  try{
    url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    for (var i=0;i<parsedJSON.coins.length;i++) {
      if (parsedJSON.coins[i].symbol==ticker)
      {
        id_coin=parsedJSON.coins[i].id.toString();
        break;
      }
    }
    
    url="https://api.coingecko.com/api/v3/coins/"+id_coin+"/market_chart?vs_currency="+ticker2+"&days="+nb_days;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    if (type=="price")
    { vol_gecko=parseFloat(parsedJSON.prices[parsedJSON.prices.length-1][1]/parsedJSON.prices[0][1]-1).toFixed(4);}
    else if (type=="volume")
    { vol_gecko=parseFloat(parsedJSON.total_volumes[parsedJSON.total_volumes.length-1][1]/parsedJSON.total_volumes[0][1]-1).toFixed(4);}
    else if (type=="marketcap")
    { vol_gecko=parseFloat(parsedJSON.market_caps[parsedJSON.market_caps.length-1][1]/parsedJSON.market_caps[0][1]-1).toFixed(4);}
    else 
    { vol_gecko="Wrong parameter, either price, volume or marketcap";}
    
    if (vol_gecko!="Wrong parameter, either price, volume or marketcap")
      cache.put(id_cache, Number(vol_gecko));
    return Number(vol_gecko);
  }
  
  catch(err){
    return GECKOCHANGE(ticker,ticker2,type, nb_days);
  }

} 
/** GECKOLOGO
 * Imports CoinGecko's cryptocurrency Logos into Google spreadsheets. 
 * For example:
 *
 *   =GECKOLOGO("BTC",$A$1)
 *               
 * 
 * @param {cryptocurrency}          the cryptocurrency ticker, only 1 parameter
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return the logo image
 **/
 async function GECKOLOGO(ticker){
  Utilities.sleep(Math.random() * 100)
  ticker=ticker.toUpperCase()
  
  
  id_cache=ticker+'USDGECKOLOGO'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      
      return cached; 
    }
  try{
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
    
      var res = await UrlFetchApp.fetch(url);
      var content = res.getContentText();
      var parsedJSON = JSON.parse(content);
      
      for (var i=0;i<parsedJSON.coins.length;i++) {
        if (parsedJSON.coins[i].symbol==ticker)
        {
          id_coin=parsedJSON.coins[i].id.toString();
          break;
        }
      }
    Logger.log(id_coin)
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + id_coin;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
  
    Logger.log(parsedJSON)
    cache.put(id_cache, parsedJSON[0].image);       
    return parsedJSON[0].image;
    
    
  }
  catch(err){
    return GECKOLOGO(ticker);
  }
  
} 
/** GECKOLOGOBYNAME
 * Imports CoinGecko's cryptocurrency Logos into Google spreadsheets. 
 * For example:
 *
 *   =GECKOLOGOBYNAME("bitcoin",$A$1)
 *               
 * 
 * @param {cryptocurrency}          the cryptocurrency id, only 1 parameter 
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return the logo image
 **/
 async function GECKOLOGOBYNAME(id_coin){
  Utilities.sleep(Math.random() * 100)
  id_coin=id_coin.toLowerCase()
  
  
  id_cache=id_coin+'USDGECKOLOGO'
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      
      return cached; 
    }
  try{
      
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + id_coin;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
  
    Logger.log(parsedJSON)
    cache.put(id_cache, parsedJSON[0].image);       
    return parsedJSON[0].image;
    
    
  }
  catch(err){
    return GECKOLOGOBYNAME(id_coin);
  }
  
} 

/** GECKOPRICEBYNAME
 * Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd).
 * For example:
 *
 *   =GECKOPRICEBYNAME("bitcoin", "USD",$A$1)
 *               
 * 
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd, only 1 parameter 
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the price
 **/
async function GECKOPRICEBYNAME(id_coin,currency){
  Utilities.sleep(Math.random() * 100)
  id_coin=id_coin.toLowerCase()
  currency=currency.toLowerCase()
  id_cache=id_coin+currency+'pricebyname'
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }
  try{
    
    url="https://api.coingecko.com/api/v3/simple/price?ids="+id_coin+"&vs_currencies="+currency;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    price_gecko=parseFloat(parsedJSON[id_coin][currency]);
    cache.put(id_cache, Number(price_gecko));
    
    return Number(price_gecko);
  }
  
  catch(err){
    return GECKOPRICEBYNAME(id_coin,currency);
  }

}
/** GECKOCAPBYNAME
 * Imports CoinGecko's cryptocurrency market capitalization into Google spreadsheets. The id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd). By default, it gets the market cap. If you need to get the fully diluted mktcap, specify the 3rd element as true.
 * For example for normal mkt cap:
 *
 *   =GECKOCAPBYNAME("bitcoin", "USD")
 *               
 * For example for fully diluted mkt cap:
 *
 *   =GECKOCAPBYNAME("bitcoin", "USD",true)
 * 
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd, only 1 parameter 
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {mktcap or fully diluted mktcap}  an optional boolean to get fully diluted valuation
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the marketcap
 **/
async function GECKOCAPBYNAME(id_coin,currency,diluted=false){
  Utilities.sleep(Math.random() * 100)
  id_coin=id_coin.toLowerCase()
  currency=currency.toLowerCase()
  id_cache=id_coin+currency+'capbyname'
  if (diluted==true) {
    id_cache=id_coin+currency+'capbynamediluted'
  }
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }
  try{
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    
    var res = UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    if (diluted==true) {if (parsedJSON[0].fully_diluted_valuation!= null){
      mkt_gecko=parseFloat(parsedJSON[0].fully_diluted_valuation);
      cache.put(id_cache, Number(mkt_gecko));}
      
      else {mkt_gecko=""}}
      
    else 
    { mkt_gecko=parseFloat(parsedJSON[0].market_cap);
      cache.put(id_cache, Number(mkt_gecko));}
      
    
    
    return mkt_gecko;
  }
  
  
  
  catch(err){
    return GECKOCAPBYNAME(id_coin,currency,diluted=false);
  }

}
/** GECKOVOLUMEBYNAME
 * Imports CoinGecko's cryptocurrency 24H Volume into Google spreadsheets. The id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd).
 * For example:
 *
 *   =GECKOVOLUMEBYNAME("bitcoin", "USD",$A$1)
 *               
 * 
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd, only 1 parameter 
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the 24h volume
 **/
async function GECKOVOLUMEBYNAME(id_coin,currency){
  Utilities.sleep(Math.random() * 100)
  id_coin=id_coin.toLowerCase()
  currency=currency.toLowerCase()
  id_cache=id_coin+currency+'volbyname'
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  } 
 
    
  try{
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    vol_gecko=parseFloat(parsedJSON[0].total_volume);
    cache.put(id_cache, Number(vol_gecko));
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return GECKOVOLUMEBYNAME(id_coin,currency);
  }

}
//Coin list of CoinGecko is cached in script to reduce server load and increase performance.
//This list can be updated from the text box that can be found at:
//http://api.charmantadvisory.com/COINGECKOID/json
//Be sure to replace just the part after "=", and keep the ";" at the end for proper syntax.
const CoinList = {"index": "index-cooperative", "btc": "bitcoin", "eth": "ethereum", "bnb": "binancecoin", "doge": "dogecoin", "xrp": "ripple", "usdt": "tether", "ada": "cardano", "dot": "polkadot", "bch": "bitcoin-cash", "ltc": "litecoin", "uni": "uniswap", "link": "chainlink", "usdc": "usd-coin", "etc": "ethereum-classic", "xlm": "stellar", "vet": "vechain", "sol": "solana", "theta": "theta-token", "fil": "filecoin", "trx": "tron", "wbtc": "wrapped-bitcoin", "okb": "okb", "eos": "eos", "neo": "neo", "bsv": "bitcoin-cash-sv", "busd": "binance-usd", "xmr": "monero", "luna": "terra-luna", "atom": "cosmos", "cake": "pancakeswap-token", "miota": "iota", "klay": "klay-token", "aave": "aave", "xtz": "tezos", "ftt": "ftx-token", "ceth": "compound-ether", "cro": "crypto-com-chain", "avax": "avalanche-2", "btt": "bittorrent-2", "matic": "matic-network", "mkr": "maker", "algo": "algorand", "ht": "huobi-token", "cusdc": "compound-usd-coin", "cdai": "cdai", "rune": "thorchain", "dai": "dai", "dash": "dash", "comp": "compound-governance-token", "ksm": "kusama", "waves": "waves", "egld": "elrond-erd-2", "xem": "nem", "zec": "zcash", "zil": "zilliqa", "snx": "havven", "chz": "chiliz", "btg": "bitcoin-gold", "sushi": "sushi", "leo": "leo-token", "hot": "holotoken", "dcr": "decred", "hbar": "hedera-hashgraph", "cel": "celsius-degree-token", "enj": "enjincoin", "amp": "amp-token", "tel": "telcoin", "stx": "blockstack", "dgb": "digibyte", "sc": "siacoin", "nexo": "nexo", "bat": "basic-attention-token", "qtum": "qtum", "ftm": "fantom", "ust": "terrausd", "yfi": "yearn-finance", "grt": "the-graph", "near": "near", "mana": "decentraland", "ont": "ontology", "rvn": "ravencoin", "hbtc": "huobi-btc", "zrx": "0x", "uma": "uma", "hnt": "helium", "lusd": "liquity-usd", "icx": "icon", "bnt": "bancor", "xdc": "xdce-crowd-sale", "omg": "omisego", "iost": "iostoken", "nano": "nano", "zen": "zencash", "chsb": "swissborg", "flow": "flow", "one": "harmony", "pax": "paxos-standard", "ankr": "ankr", "xvs": "venus", "ar": "arweave", "kcs": "kucoin-shares", "gt": "gatechain-token", "arrr": "pirate-chain", "xvg": "verge", "1inch": "1inch", "rsr": "reserve-rights-token", "wrx": "wazirx", "tusd": "true-usd", "fei": "fei-protocol", "crv": "curve-dao-token", "xsushi": "xsushi", "steth": "staked-ether", "win": "wink", "omi": "ecomi", "nxm": "nxm", "dent": "dent", "lsk": "lisk", "bake": "bakerytoken", "vgx": "ethos", "bcha": "bitcoin-cash-abc-2", "ren": "republic-protocol", "snt": "status", "husd": "husd", "npxs": "pundi-x", "lpt": "livepeer", "tlm": "alien-worlds", "tribe": "tribe-2", "pundix": "pundi-x-2", "cfx": "conflux-token", "bal": "balancer", "lrc": "loopring", "bcd": "bitcoin-diamond", "renbtc": "renbtc", "ckb": "nervos-network", "mir": "mirror-protocol", "btmx": "bmax", "oxy": "oxygen", "prom": "prometeus", "vtho": "vethor-token", "ocean": "ocean-protocol", "band": "band-protocol", "cusdt": "compound-usdt", "celo": "celo", "ray": "raydium", "btcst": "btc-standard-hashrate-token", "srm": "serum", "kobe": "shabu-shabu", "ampl": "ampleforth", "reef": "reef-finance", "ersdl": "unfederalreserve", "alpha": "alpha-finance", "sys": "syscoin", "qnt": "quant-network", "zks": "zkswap", "glm": "golem", "hbc": "hbtc-token", "ewt": "energy-web-token", "cuni": "compound-uniswap", "dodo": "dodo", "kava": "kava", "axs": "axie-infinity", "fun": "funfair", "kncl": "kyber-network", "stmx": "storm", "sxp": "swipe", "kmd": "komodo", "skl": "skale", "nkn": "nkn", "inj": "injective-protocol", "woo": "wootrade-network", "ton": "tokamak-network", "iotx": "iotex", "bot": "bounce-token", "maid": "maidsafecoin", "etn": "electroneum", "sand": "the-sandbox", "med": "medibloc", "fet": "fetch-ai", "agi": "singularitynet", "utk": "utrust", "nmr": "numeraire", "oxt": "orchid-protocol", "usdn": "neutrino", "waxp": "wax", "steem": "steem", "ardr": "ardor", "audio": "audius", "orn": "orion-protocol", "cvc": "civic", "gno": "gnosis", "mdx": "mdex", "klv": "klever", "xhv": "haven", "alcx": "alchemix", "seth": "seth", "btm": "bytom", "rlc": "iexec-rlc", "bts": "bitshares", "ogn": "origin-protocol", "kin": "kin", "celr": "celer-network", "twt": "trust-wallet-token", "uos": "ultra", "anc": "anchor-protocol", "rpl": "rocket-pool", "ant": "aragon", "ark": "ark", "snm": "sonm", "poly": "polymath-network", "akt": "akash-network", "rep": "augur", "meta": "metadium", "strax": "stratis", "wan": "wanchain", "forth": "ampleforth-governance-token", "ldo": "lido-dao", "uqc": "uquid-coin", "ubt": "unibright", "sfp": "safepal", "rfox": "redfox-labs-2", "ern": "ethernity-chain", "tko": "tokocrypto", "nwc": "newscrypto-coin", "orbs": "orbs", "eps": "ellipsis", "htr": "hathor", "ctsi": "cartesi", "lina": "linear", "storj": "storj", "lend": "ethlend", "rook": "rook", "vlx": "velas", "badger": "badger-dao", "ava": "concierge-io", "hns": "handshake", "keep": "keep-network", "alice": "my-neighbor-alice", "swap": "trustswap", "titan": "titanswap", "noia": "noia-network", "scrt": "secret", "super": "superfarm", "mtl": "metal", "rose": "oasis-network", "math": "math", "rif": "rif-token", "mona": "monacoin", "kai": "kardiachain", "dnt": "district0x", "coti": "coti", "vra": "verasity", "rdd": "reddcoin", "czrx": "compound-0x", "zmt": "zipmex-token", "tomo": "tomochain", "trac": "origintrail", "qkc": "quark-chain", "iq": "everipedia", "gny": "gny", "pols": "polkastarter", "wnxm": "wrapped-nxm", "gas": "gas", "hive": "hive", "dia": "dia-data", "alpaca": "alpaca-finance", "cummies": "cumrocket", "trb": "tellor", "elf": "aelf", "jst": "just", "prq": "parsiq", "susd": "nusd", "atri": "atari", "iris": "iris-network", "perp": "perpetual-protocol", "ghx": "gamercoin", "dag": "constellation-labs", "sure": "insure", "ramp": "ramp", "fx": "fx-coin", "vai": "vai", "c20": "crypto20", "powr": "power-ledger", "cbat": "compound-basic-attention-token", "pac": "paccoin", "dpi": "defipulse-index", "any": "anyswap", "divi": "divi", "paid": "paid-network", "mask": "mask-network", "bunny": "pancake-bunny", "srk": "sparkpoint", "lto": "lto-network", "cru": "crust-network", "mist": "alchemist", "mft": "mainframe", "aion": "aion", "ppt": "populous", "firo": "zcoin", "lyxe": "lukso-token", "nu": "nucypher", "chr": "chromaway", "rgt": "rari-governance-token", "lit": "litentry", "cre": "carry", "adx": "adex", "api3": "api3", "ela": "elastos", "mln": "melon", "xprt": "persistence", "nrv": "nerve-finance", "lamb": "lambda", "exrd": "e-radix", "xor": "sora", "pha": "pha", "bcn": "bytecoin", "ae": "aeternity", "xaut": "tether-gold", "vrsc": "verus-coin", "rly": "rally-2", "ohm": "olympus", "aeth": "ankreth", "auction": "auction", "hoge": "hoge-finance", "rndr": "render-token", "akro": "akropolis", "hxro": "hxro", "pnk": "kleros", "gala": "gala", "nrg": "energi", "ctk": "certik", "bzrx": "bzx-protocol", "torn": "tornado-cash", "eac": "earthcoin", "edg": "edgeware", "pond": "marlin", "erg": "ergo", "kda": "kadena", "whale": "whale", "loc": "lockchain", "beam": "beam", "maps": "maps", "bel": "bella-protocol", "data": "streamr-datacoin", "frax": "frax", "shr": "sharering", "pnt": "pnetwork", "lon": "tokenlon", "ddx": "derivadao", "usdp": "usdp", "bscpad": "bscpad", "mx": "mx-token", "safemars": "safemars", "fine": "refinable", "bifi": "beefy-finance", "tt": "thunder-token", "nuls": "nuls", "loomold": "loom-network", "quick": "quick", "tvk": "terra-virtua-kolect", "fsn": "fsn", "svcs": "givingtoservices", "ycc": "yuan-chain-coin", "hydra": "hydra", "dao": "dao-maker", "xcm": "coinmetro", "blz": "bluzelle", "arpa": "arpa-chain", "vsp": "vesper-finance", "pivx": "pivx", "nmx": "nominex", "req": "request-network", "col": "unit-protocol", "spi": "shopping-io", "cope": "cope", "om": "mantra-dao", "nxs": "nexus", "slp": "smooth-love-potion", "albt": "allianceblock", "znn": "zenon", "vite": "vite", "tru": "truefi", "ignis": "ignis", "pcx": "chainx", "bar": "fc-barcelona-fan-token", "lbc": "lbry-credits", "sfi": "saffron-finance", "grs": "groestlcoin", "emc2": "einsteinium", "wozx": "wozx", "paxg": "pax-gold", "yfii": "yfii-finance", "duck": "unit-protocol-duck", "drgn": "dragonchain", "mxc": "mxc", "boa": "bosagora", "dsla": "stacktical", "cos": "contentos", "sero": "super-zero", "oxen": "loki-network", "cream": "cream-2", "hard": "hard-protocol", "dusk": "dusk-network", "cbk": "cobak-token", "xdb": "digitalbits", "front": "frontier-token", "wicc": "waykichain", "stake": "xdai-stake", "free": "free-coin", "hc": "hshare", "rfr": "refereum", "peak": "marketpeak", "slt": "smartlands", "bmi": "bridge-mutual", "solve": "solve-care", "wex": "waultswap", "eth2x-fli": "eth-2x-flexible-leverage-index", "farm": "harvest-finance", "png": "pangolin", "visr": "visor", "bondly": "bondly", "bfc": "bifrost", "dego": "dego-finance", "mhc": "metahash", "evn": "evolution-finance", "vtc": "vertcoin", "hegic": "hegic", "vsys": "v-systems", "get": "get-token", "gusd": "gemini-dollar", "nim": "nimiq-2", "stpt": "stp-network", "auto": "auto", "feg": "feg-token", "fida": "bonfida", "skey": "smartkey", "nsbt": "neutrino-system-base-token", "phb": "red-pulse", "swth": "switcheo", "chain": "chain-games", "nftx": "nftx", "fio": "fio-protocol", "slink": "slink", "dea": "dea", "vxv": "vectorspace", "aergo": "aergo", "rari": "rarible", "rai": "rai", "df": "dforce-token", "id": "everid", "esd": "empty-set-dollar", "armor": "armor", "lgo": "legolas-exchange", "fis": "stafi", "ast": "airswap", "dero": "dero", "uft": "unlend-finance", "zero": "zero-exchange", "dg": "decentral-games", "root": "rootkit", "pro": "propy", "creth2": "cream-eth2", "juld": "julswap", "gxc": "gxchain", "nxt": "nxt", "mrph": "morpheus-network", "yld": "yield-app", "val": "sora-validator-token", "waultx": "wault", "idex": "aurora-dao", "fxs": "frax-share", "zai": "zero-collateral-dai", "mith": "mithril", "rad": "radicle", "ghst": "aavegotchi", "mta": "meta", "core": "cvault-finance", "fxf": "finxflo", "suku": "suku", "sbtc": "sbtc", "psg": "paris-saint-germain-fan-token", "wault": "wault-finance-old", "rcn": "ripio-credit-network", "hez": "hermez-network-token", "wing": "wing-finance", "cnd": "cindicator", "eco": "ecofi", "sky": "skycoin", "buidl": "dfohub", "pib": "pibble", "rdn": "raiden-network", "nest": "nest", "suter": "suterusu", "qsp": "quantstamp", "kp3r": "keep3rv1", "helmet": "helmet-insure", "lgcy": "lgcy-network", "dock": "dock", "veth": "vether", "dcn": "dentacoin", "bao": "bao-finance", "apl": "apollo", "dexe": "dexe", "nebl": "neblio", "hai": "hackenai", "nbr": "niobio-cash", "dgd": "digixdao", "belt": "belt", "soul": "phantasma", "sx": "sportx", "unfi": "unifi-protocol-dao", "mbox": "mobox", "kyl": "kylin-network", "seur": "seur", "sai": "sai", "dmt": "dmarket", "tone": "te-food", "tbtc": "tbtc", "bepro": "bet-protocol", "glch": "glitch-protocol", "zb": "zb-token", "aioz": "aioz-network", "vid": "videocoin", "cards": "cardstarter", "go": "gochain", "salt": "salt", "usdx": "usdx", "sbd": "steem-dollars", "conv": "convergence", "met": "metronome", "btu": "btu-protocol", "dfy": "defi-for-you", "mcb": "mcdex", "bip": "bip", "frm": "ferrum-network", "occ": "occamfi", "bond": "barnbridge", "vidt": "v-id-blockchain", "mbl": "moviebloc", "bor": "boringdao", "zee": "zeroswap", "swingby": "swingby", "gvt": "genesis-vision", "cube": "somnium-space-cubes", "wow": "wownero", "gto": "gifto", "aria20": "arianee", "nex": "neon-exchange", "dvpn": "sentinel-group", "ring": "darwinia-network-native-token", "lqty": "liquity", "grin": "grin", "boson": "boson-protocol", "cfi": "cyberfi", "bz": "bit-z-token", "for": "force-protocol", "sntvt": "sentivate", "baas": "baasid", "xed": "exeedme", "dext": "idextools", "zcn": "0chain", "cocos": "cocos-bcx", "gbyte": "byteball", "bdpi": "interest-bearing-dpi", "revv": "revv", "smart": "smartcash", "xhdx": "hydradx", "insur": "insurace", "oce": "oceanex-token", "key": "selfkey", "upp": "sentinel-protocol", "mitx": "morpheus-labs", "aqt": "alpha-quark-token", "wtc": "waltonchain", "nav": "nav-coin", "card": "cardstack", "nas": "nebulas", "bank": "float-protocol", "clo": "callisto", "cusd": "celo-dollar", "sparta": "spartan-protocol-token", "yvault-lp-ycurve": "yvault-lp-ycurve", "digg": "digg", "dip": "etherisc", "lcx": "lcx", "polk": "polkamarkets", "xbase": "eterbase", "bdp": "big-data-protocol", "snl": "sport-and-leisure", "troy": "troy", "moc": "mossland", "xyo": "xyo-network", "sdt": "stake-dao", "ifc": "infinitecoin", "krt": "terra-krw", "bax": "babb", "step": "step-finance", "el": "elysia", "veri": "veritaseum", "mark": "benchmark-protocol", "cxo": "cargox", "tct": "tokenclub", "xpr": "proton", "layer": "unilayer", "sha": "safe-haven", "mdt": "measurable-data-token", "cws": "crowns", "edr": "endor", "ilv": "illuvium", "qash": "qash", "mph": "88mph", "aleph": "aleph", "acs": "acryptos", "vitae": "vitae", "xsn": "stakenet", "unn": "union-protocol-governance-token", "juv": "juventus-fan-token", "xsgd": "xsgd", "dep": "deapcoin", "xrt": "robonomics-network", "tidal": "tidal-finance", "ban": "banano", "dbc": "deepbrain-chain", "eurs": "stasis-eurs", "ioc": "iocoin", "cnfi": "connect-financial", "miau": "mirrored-ishares-gold-trust", "via": "viacoin", "bscx": "bscex", "ichi": "ichi-farm", "cvp": "concentrated-voting-power", "wcres": "wrapped-crescofin", "filda": "filda", "trtl": "turtlecoin", "musd": "musd", "apy": "apy-finance", "mtsla": "mirrored-tesla", "mgoogl": "mirrored-google", "six": "six-network", "hunt": "hunt-token", "mbx": "mobiecoin", "cudos": "cudos", "pi": "pchain", "ult": "ultiledger", "shopx": "splyt", "cover": "cover-protocol", "wabi": "wabi", "opium": "opium", "mslv": "mirrored-ishares-silver-trust", "mamzn": "mirrored-amazon", "xdn": "digitalnote", "hzn": "horizon-protocol", "tlos": "telos", "dora": "dora-factory", "ddim": "duckdaodime", "marsh": "unmarshal", "mqqq": "mirrored-invesco-qqq-trust", "dextf": "dextf", "bdt": "blackdragon-token", "umb": "umbrella-network", "xcur": "curate", "bux": "blockport", "wxt": "wirex", "axn": "axion", "lpool": "launchpool", "cut": "cutcoin", "etp": "metaverse-etp", "mmsft": "mirrored-microsoft", "pltc": "platoncoin", "maapl": "mirrored-apple", "mnflx": "mirrored-netflix", "orai": "oraichain-token", "mtv": "multivac", "muso": "mirrored-united-states-oil-fund", "nmc": "namecoin", "labs": "labs-group", "mix": "mixmarvel", "media": "media-network", "bytz": "slate", "meme": "degenerator", "zap": "zap", "swftc": "swftcoin", "kine": "kine-protocol", "mda": "moeda-loyalty-points", "zano": "zano", "superbid": "superbid", "lym": "lympo", "btse": "btse-token", "fcl": "fractal", "qrl": "quantum-resistant-ledger", "mvixy": "mirrored-proshares-vix", "mbaba": "mirrored-alibaba", "pendle": "pendle", "tryb": "bilira", "mtwtr": "mirrored-twitter", "usdk": "usdk", "htb": "hotbit-token", "rocks": "rocki", "govi": "govi", "kex": "kira-network", "ubxt": "upbots", "impulse": "impulse-by-fdr", "sake": "sake-token", "bmx": "bitmart-token", "egg": "goose-finance", "oddz": "oddz", "ppay": "plasma-finance", "pool": "pooltogether", "part": "particl", "kan": "kan", "wpr": "wepower", "wgr": "wagerr", "combo": "furucombo", "yve-crvdao": "vecrv-dao-yvault", "value": "value-liquidity", "opct": "opacity", "ppc": "peercoin", "sylo": "sylo", "route": "route", "arch": "archer-dao-governance-token", "eng": "enigma", "fic": "filecash", "axel": "axel", "inv": "inverse-finance", "rbc": "rubic", "foam": "foam-protocol", "ltx": "lattice-token", "props": "props", "cdt": "blox", "mtlx": "mettalex", "pkf": "polkafoundry", "dht": "dhedge-dao", "brd": "bread", "pre": "presearch", "blank": "blank", "ovr": "ovr", "burst": "burst", "xla": "stellite", "si": "siren", "gth": "gather", "block": "blocknet", "exnt": "exnetwork-token", "dfd": "defidollar-dao", "nebo": "csp-dao-network", "fst": "futureswap", "ndx": "indexed-finance", "coin": "coinvest", "poolz": "poolz-finance", "xend": "xend-finance", "ost": "simple-token", "deus": "deus-finance", "k21": "k21", "bft": "bnktothefuture", "ask": "permission-coin", "swrv": "swerve-dao", "mod": "modefi", "sfuel": "sparkpoint-fuel", "cgg": "chain-guardians", "crpt": "crypterium", "glq": "graphlinq-protocol", "amlt": "coinfirm-amlt", "oly": "olyseum", "soc": "all-sports", "poa": "poa-network", "evx": "everex", "appc": "appcoins", "pbtc35a": "pbtc35a", "gal": "galatasaray-fan-token", "tips": "fedoracoin", "yam": "yam-2", "socks": "unisocks", "fwt": "freeway-token", "bbr": "bitberry-token", "octo": "octofi", "spank": "spankchain", "yaxis": "yaxis", "tfb": "truefeedbackchain", "cs": "credits", "rfuel": "rio-defi", "cas": "cashaa", "wom": "wom-token", "shard": "shard", "zt": "ztcoin", "aitra": "aitra", "fct": "factom", "sngls": "singulardtv", "adp": "adappter-token", "apys": "apyswap", "nif": "unifty", "shroom": "shroom-finance", "strong": "strong", "mtrg": "meter", "bmxx": "multiplier-bsc", "txl": "tixl-new", "flx": "reflexer-ungovernance-token", "hit": "hitchain", "ablock": "any-blocknet", "flux": "zelcash", "enq": "enq-enecuum", "cvnt": "content-value-network", "pbtc": "ptokens-btc", "dyn": "dynamic", "prob": "probit-exchange", "niox": "autonio", "mobi": "mobius", "ele": "eleven-finance", "upunk": "unicly-cryptopunks-collection", "roobee": "roobee", "koge": "bnb48-club-token", "idle": "idle", "vib": "viberate", "tau": "lamden", "nlg": "gulden", "pros": "prosper", "ptf": "powertrade-fuel", "ngm": "e-money", "umx": "unimex-network", "pmon": "polkamon", "bix": "bibox-token", "oax": "openanx", "anj": "anj", "mdo": "midas-dollar", "rby": "rubycoin", "vee": "blockv", "tkn": "tokencard", "credit": "credit", "coval": "circuits-of-value", "dta": "data", "abt": "arcblock", "bpro": "b-protocol", "stn": "stone-token", "muse": "muse-2", "cmt": "cybermiles", "gmt": "gambit", "must": "must", "nct": "polyswarm", "saito": "saito", "acm": "ac-milan-fan-token", "hakka": "hakka-finance", "ubq": "ubiq", "onion": "deeponion", "pma": "pumapay", "jrt": "jarvis-reward-token", "ncash": "nucleus-vision", "xtk": "xtoken", "ice": "ice-token", "vnla": "vanilla-network", "iov": "starname", "kono": "konomi-network", "dhc": "deltahub-community", "dec": "decentr", "spc": "spacechain-erc-20", "game": "gamecredits", "unc": "unicrypt", "brew": "cafeswap-token", "san": "santiment-network-token", "fnt": "falcon-token", "agve": "agave-token", "jul": "jul", "btc2": "bitcoin-2", "dust": "dust-token", "uncx": "unicrypt-2", "bac": "basis-cash", "adk": "aidos-kuneen", "trade": "unitrade", "qlc": "qlink", "bry": "berry-data", "nix": "nix-platform", "wdc": "worldcoin", "moon": "mooncoin", "cov": "covesting", "sdx": "swapdex", "raini": "rainicorn", "aoa": "aurora", "defi5": "defi-top-5-tokens-index", "matter": "antimatter", "razor": "razor-network", "shft": "shyft-network-2", "kit": "dexkit", "pickle": "pickle-finance", "fuel": "fuel-token", "swg": "swirge", "fuse": "fuse-network-token", "atm": "atletico-madrid", "top": "top-network", "hny": "honey", "safe2": "safe2", "act": "achain", "bskt": "basketcoin", "mxx": "multiplier", "mork": "mork", "plu": "pluton", "ruff": "ruff", "abl": "airbloc-protocol", "valor": "smart-valor", "tnb": "time-new-bank", "l2": "leverj-gluon", "dev": "dev-protocol", "myst": "mysterium", "watch": "yieldwatch", "mbtc": "mstable-btc", "1337": "e1337", "mth": "monetha", "chi": "chimaera", "spnd": "spendcoin", "ocn": "odyssey", "alpa": "alpaca", "quai": "quai-dao", "iqn": "iqeon", "like": "likecoin", "hvn": "hiveterminal", "plr": "pillar", "ktn": "kattana", "gains": "gains", "mint": "public-mint", "man": "matrix-ai-network", "ong": "ong-social", "dxd": "dxdao", "dlt": "agrello", "kpad": "kickpad", "mds": "medishares", "cht": "coinhe-token", "bird": "bird-money", "yf-dai": "yfdai-finance", "xio": "xio", "xcash": "x-cash", "egt": "egretia", "gnx": "genaro-network", "robot": "robot", "scc": "stakecube", "btcz": "bitcoinz", "arcx": "arc-governance", "xmx": "xmax", "bgov": "bgov", "room": "option-room", "nyzo": "nyzo", "efx": "effect-network", "yop": "yield-optimization-platform", "dafi": "dafi-protocol", "flo": "flo", "jur": "jur", "la": "latoken", "raze": "raze-network", "urus": "urus-token", "ruler": "ruler-protocol", "daofi": "daofi", "ftc": "feathercoin", "yfl": "yflink", "glc": "goldcoin", "its": "iteration-syndicate", "abyss": "the-abyss", "julien": "julien", "cv": "carvertical", "hget": "hedget", "euno": "euno", "bles": "blind-boxes", "ach": "alchemy-pay", "gxt": "gem-exchange-and-trading", "dov": "dovu", "fnx": "finnexus", "crep": "compound-augur", "bwf": "beowulf", "hpb": "high-performance-blockchain", "vrx": "verox", "cvn": "cvcoin", "tcake": "pancaketools", "urqa": "ureeqa", "krl": "kryll", "jup": "jupiter", "nft": "nft-protocol", "hy": "hybrix", "xeq": "triton", "world": "world-token", "dos": "dos-network", "apm": "apm-coin", "open": "open-governance-token", "vidya": "vidya", "gen": "daostack", "dusd": "defidollar", "rmt": "sureremit", "srn": "sirin-labs-token", "premia": "premia", "psl": "pastel", "synx": "syndicate", "hbt": "habitat", "uip": "unlimitedip", "onx": "onx-finance", "plot": "plotx", "xpx": "proximax", "udoo": "howdoo", "lien": "lien", "nsure": "nsure-network", "$anrx": "anrkey-x", "koin": "koinos", "bas": "basis-share", "oxb": "oxbull-tech", "tao": "taodao", "btcp": "bitcoin-private", "xmy": "myriadcoin", "haus": "daohaus", "argon": "argon", "yla": "yearn-lazy-ape", "can": "canyacoin", "white": "whiteheart", "pay": "tenx", "pla": "plair", "rio": "realio-network", "amb": "amber", "xpc": "experience-chain", "qun": "qunqun", "cbc": "cashbet-coin", "nec": "nectar-token", "ixc": "ixcoin", "euler": "euler-tools", "push": "ethereum-push-notification-service", "unistake": "unistake", "fsw": "fsw-token", "usf": "unslashed-finance", "zefu": "zenfuse", "fxp": "fxpay", "etho": "ether-1", "bmc": "bountymarketcap", "hord": "hord", "axpr": "axpire", "smt": "smartmesh", "sph": "spheroid-universe", "rendoge": "rendoge", "asr": "as-roma-fan-token", "cntr": "centaur", "og": "og-fan-token", "lcc": "litecoin-cash", "swm": "swarm", "gleec": "gleec-coin", "token": "chainswap", "gswap": "gameswap-org", "dough": "piedao-dough-v2", "wasabi": "wasabix", "dtx": "databroker-dao", "utnp": "universa", "dows": "shadows", "balpha": "balpha", "grid": "grid", "geo": "geodb", "par": "parachute", "prt": "portion", "dvg": "daoventures", "sdefi": "sdefi", "cmp": "component", "idna": "idena", "paint": "paint", "int": "internet-node-token", "lua": "lua-token", "emc": "emercoin", "ones": "oneswap-dao-token", "dashd": "dash-diamond", "alch": "alchemy-dao", "dmd": "diamond", "nfy": "non-fungible-yearn", "giv": "givly-coin", "itc": "iot-chain", "webd": "webdollar", "bcp": "bitcashpay", "tera": "tera-smart-money", "wings": "wings", "chonk": "chonk", "pcnt": "playcent", "auc": "auctus", "blk": "blackcoin", "drc": "dracula-token", "snow": "snowswap", "dyp": "defi-yield-protocol", "tky": "thekey", "xcp": "counterparty", "cti": "clintex-cti", "twin": "twinci", "meth": "mirrored-ether", "kat": "kambria", "geeq": "geeq", "nanj": "nanjcoin", "drt": "domraider", "phnx": "phoenixdao", "b20": "b20", "phr": "phore", "deri": "deri-protocol", "dappt": "dapp-com", "mvp": "merculet", "crwny": "crowny-token", "shift": "shift", "vex": "vexanium", "btx": "bitcore", "nuts": "squirrel-finance", "nds": "nodeseeds", "fvt": "finance-vote", "etha": "etha-lend", "bcdt": "blockchain-certified-data-token", "dime": "dimecoin", "b21": "b21", "mwat": "restart-energy", "you": "you-chain", "bart": "bartertrade", "doki": "doki-doki-finance", "ldoge": "litedoge", "ghost": "ghost-by-mcafee", "umask": "unicly-hashmasks-collection", "aga": "aga-token", "owc": "oduwa-coin", "cofi": "cofix", "asp": "aspire", "rnt": "oneroot-network", "dgtx": "digitex-futures-exchange", "linka": "linka", "cot": "cotrader", "awx": "auruscoin", "gro": "growth-defi", "sig": "xsigma", "nord": "nord-finance", "degen": "degen-index", "neu": "neumark", "mfg": "syncfab", "stbu": "stobox-token", "idea": "ideaology", "ten": "tokenomy", "cnn": "cnn", "bask": "basketdao", "aid": "aidcoin", "epic": "epic-cash", "pipt": "power-index-pool-token", "ugas": "ultrain", "utu": "utu-coin", "swag": "swag-finance", "stv": "sint-truidense-voetbalvereniging", "pink": "pinkcoin", "cwbtc": "compound-wrapped-btc", "unifi": "unifi", "oin": "oin-finance", "gum": "gourmetgalaxy", "xlq": "alqo", "xst": "stealthcoin", "cc10": "cryptocurrency-top-10-tokens-index", "epan": "paypolitan-token", "sync": "sync-network", "propel": "payrue", "pinkm": "pinkmoon", "chp": "coinpoker", "time": "chronobank", "aur": "auroracoin", "ads": "adshares", "pot": "potcoin", "yee": "yee", "klonx": "klondike-finance-v2", "ousd": "origin-dollar", "tcap": "total-crypto-market-cap-token", "equad": "quadrant-protocol", "cnns": "cnns", "mtx": "matryx", "vvt": "versoview", "dsd": "dynamic-set-dollar", "olt": "one-ledger", "smty": "smoothy", "smartcredit": "smartcredit-token", "xft": "offshift", "ntk": "neurotoken", "hyve": "hyve", "yeed": "yggdrash", "kek": "cryptokek", "gmee": "gamee", "eved": "evedo", "xvix": "xvix", "blt": "bloom", "msp": "mothership", "vbk": "veriblock", "ditto": "ditto", "tra": "trabzonspor-fan-token", "klp": "kulupu", "yuki": "yuki-coin", "flash": "flash-stake", "snob": "snowball-token", "scp": "siaprime-coin", "sense": "sense", "arte": "ethart", "cloak": "cloakcoin", "rbase": "rbase-finance", "ess": "essentia", "tern": "ternio", "sepa": "secure-pad", "gfarm2": "gains-v2", "azuki": "azuki", "ut": "ulord", "npx": "napoleon-x", "tnt": "tierion", "sgt": "sharedstake-governance-token", "agar": "aga-rewards-2", "sale": "dxsale-network", "hbd": "hive_dollar", "instar": "insights-network", "yield": "yield-protocol", "soar": "soar-2", "qrk": "quark", "ixi": "ixicash", "acxt": "ac-exchange-token", "midas": "midas", "maha": "mahadao", "xpat": "pangea", "satt": "satt", "veil": "veil", "lkr": "polkalokr", "crbn": "carbon", "yoyow": "yoyow", "road": "yellow-road", "mvi": "metaverse-index", "tube": "bittube", "ccx": "conceal", "dun": "dune", "bkbt": "beekan", "kebab": "kebab-token", "dgcl": "digicol-token", "snc": "suncontract", "reap": "reapchain", "true": "true-chain", "sashimi": "sashimi", "wolf": "moonwolf-io", "bitcny": "bitcny", "th": "team-heretics-fan-token", "inxt": "internxt", "lotto": "lotto", "777": "jackpot", "defi+l": "piedao-defi-large-cap", "uuu": "u-network", "upi": "pawtocol", "efl": "electronicgulden", "rev": "revain", "asko": "askobar-network", "let": "linkeye", "minds": "minds", "edda": "eddaswap", "cpc": "cpchain", "fdr": "french-digital-reserve", "pbr": "polkabridge", "amn": "amon", "fair": "fairgame", "trtt": "trittium", "xbtc": "xbtc", "exrn": "exrnchain", "gcr": "global-coin-research", "arth": "arth", "adb": "adbank", "qrx": "quiverx", "kton": "darwinia-commitment-token", "mfb": "mirrored-facebook", "seen": "seen", "mthd": "method-fi", "punk-basic": "punk-basic", "play": "herocoin", "xfund": "xfund", "put": "putincoin", "mtc": "medical-token-currency", "0xbtc": "oxbitcoin", "uwl": "uniwhales", "fwb": "friends-with-benefits-pro", "bis": "bismuth", "pnd": "pandacoin", "omni": "omni", "elg": "escoin-token", "dis": "tosdis", "uniq": "uniqly", "bfly": "butterfly-protocol-2", "ok": "okcash", "fund": "unification", "surf": "surf-finance", "kangal": "kangal", "dav": "dav", "wish": "mywish", "raven": "raven-protocol", "xpm": "primecoin", "sta": "statera", "toa": "toacoin", "oro": "oro", "naos": "naos-finance", "nbx": "netbox-coin", "pgt": "polyient-games-governance-token", "thc": "hempcoin-thc", "sign": "signaturechain", "ac": "acoconut", "dfsocial": "defisocial", "qbx": "qiibee", "eosdt": "equilibrium-eosdt", "sota": "sota-finance", "bbc": "tradove", "vision": "apy-vision", "zip": "zip", "grc": "gridcoin-research", "lxt": "litex", "veo": "amoveo", "tad": "tadpole-finance", "alias": "spectrecoin", "lba": "libra-credit", "gysr": "geyser", "safe": "safe-coin-2", "auscm": "auric-network", "mabnb": "mirrored-airbnb", "spa": "sperax", "masq": "masq", "lyr": "lyra", "udo": "unido-ep", "skm": "skrumble-network", "unidx": "unidex", "ktlyo": "katalyo", "xiot": "xiotri", "smly": "smileycoin", "mgs": "mirrored-goldman-sachs", "roya": "royale", "catt": "catex-token", "ode": "odem", "force": "force-dao", "polc": "polka-city", "dacc": "dacc", "zora": "zoracles", "mm": "mm-token", "pry": "prophecy", "crdt": "crdt", "erc20": "erc20", "crw": "crown", "sin": "suqa", "42": "42-coin", "mt": "mytoken", "waif": "waifu-token", "mfi": "marginswap", "emt": "emanate", "gard": "hashgard", "aln": "aluna", "obot": "obortech", "vsf": "verisafe", "rare": "unique-one", "2key": "2key", "wiz": "crowdwiz", "bnkr": "bankroll-network", "uop": "utopia-genesis-foundation", "zhegic": "zhegic", "exy": "experty", "four": "the-4th-pillar", "avt": "aventus", "eosdac": "eosdac", "bnsd": "bnsd-finance", "fera": "fera", "tpay": "tokenpay", "astro": "astrotools", "$based": "based-money", "prcy": "prcy-coin", "lead": "lead-token", "spdr": "spiderdao", "vibe": "vibe", "ngc": "naga", "eosc": "eosforce", "assy": "assy-index", "daps": "daps-token", "dgx": "digix-gold", "fls": "flits", "mic": "mith-cash", "dat": "datum", "trio": "tripio", "quin": "quinads", "xrc": "bitcoin-rhodium", "bob": "bobs_repair", "coll": "collateral-pay", "becn": "beacon", "dax": "daex", "kif": "kittenfinance", "dfio": "defi-omega", "warp": "warp-finance", "vol": "volume-network-token", "nrch": "enreachdao", "cure": "curecoin", "zdex": "zeedex", "mue": "monetaryunit", "pfl": "professional-fighters-league-fan-token", "2gt": "2gether-2", "sxrp": "sxrp", "nlc2": "nolimitcoin", "dmst": "dmst", "odin": "odin-protocol", "d": "denarius", "mega": "megacryptopolis", "upx": "uplexa", "uaxie": "unicly-mystic-axies-collection", "aog": "smartofgiving", "mamc": "mirrored-amc-entertainment", "axis": "axis-defi", "zer": "zero", "chads": "chads-vc", "vault": "vault", "chart": "chartex", "vrc": "vericoin", "voice": "nix-bridge-token", "vtx": "vortex-defi", "fin": "definer", "ybo": "young-boys-fan-token", "oap": "openalexa-protocol", "swfl": "swapfolio", "rel": "release-ico-project", "mrc": "meritcoins", "stbz": "stabilize", "nka": "incakoin", "all": "alliance-fan-token", "edn": "edenchain", "zco": "zebi", "cbm": "cryptobonusmiles", "defi++": "piedao-defi", "evt": "everitoken", "bomb": "bomb", "zpae": "zelaapayae", "yfiii": "dify-finance", "flex": "flex-coin", "rem": "remme", "mcm": "mochimo", "pefi": "penguin-finance", "tent": "snowgem", "fti": "fanstime", "hyc": "hycon", "bnf": "bonfi", "dmg": "dmm-governance", "inf": "infinitus-token", "build": "build-finance", "tap": "tapmydata", "pvt": "pivot-token", "hgold": "hollygold", "vxt": "virgox-token", "moons": "moontools", "urac": "uranus", "mgme": "mirrored-gamestop", "ufr": "upfiring", "dank": "mu-dank", "nyan-2": "nyan-v2", "family": "the-bitcoin-family", "res": "resfinex-token", "sfd": "safe-deal", "pie": "defipie", "rvf": "rocket-vault-finance", "uncl": "uncl", "dgvc": "degenvc", "hnst": "honest-mining", "ufo": "ufocoin", "bull": "buysell", "ddd": "scry-info", "ppp": "paypie", "pgn": "pigeoncoin", "enb": "earnbase", "zcl": "zclassic", "mcx": "machix", "cns": "centric-cash", "xas": "asch", "bitto": "bitto-exchange", "box": "contentbox", "iut": "mvg-token", "totm": "totemfi", "tx": "transfercoin", "pirate": "piratecash", "bet": "eosbet", "bitg": "bitcoin-green", "bcug": "blockchain-cuties-universe-governance", "ctxc": "cortex", "mer": "mercury", "cpay": "cryptopay", "ptoy": "patientory", "n3rdz": "n3rd-finance", "adc": "audiocoin", "acat": "alphacat", "cur": "curio", "sata": "signata", "dogefi": "dogefi", "8pay": "8pay", "bc": "bitcoin-confidential", "launch": "superlauncher", "crx": "cryptex", "aaa": "app-alliance-association", "cgt": "cache-gold", "exrt": "exrt-network", "base": "base-protocol", "tft": "the-famous-token", "cliq": "deficliq", "pasta": "spaghetti", "chx": "chainium", "move": "holyheld-2", "cap": "cap", "trst": "wetrust", "frc": "freicoin", "ait": "aichain", "infs": "infinity-esaham", "spice": "spice-finance", "polis": "polis", "start": "bscstarter", "ucash": "ucash", "pst": "primas", "renzec": "renzec", "bcv": "bcv", "chg": "charg-coin", "yeti": "yearn-ecosystem-token-index", "pgl": "prospectors-gold", "whirl": "whirl-finance", "deflct": "deflect", "nty": "nexty", "esp": "espers", "pasc": "pascalcoin", "uct": "ucot", "bxy": "beaxy-exchange", "share": "seigniorage-shares", "wlt": "wealth-locks", "cai": "club-atletico-independiente", "gfx": "gamyfi-token", "tdx": "tidex-token", "banca": "banca", "flixx": "flixxo", "zeit": "zeitcoin", "hyn": "hyperion", "1wo": "1world", "dets": "dextrust", "dds": "dds-store", "ogo": "origo", "rfi": "reflect-finance", "bxc": "bitcoin-classic", "slm": "solomon-defi", "rsv": "reserve", "ibfk": "istanbul-basaksehir-fan-token", "kcal": "phantasma-energy", "zp": "zen-protocol", "ysec": "yearn-secure", "eve": "devery", "snn": "sechain", "swift": "swiftcash", "pigx": "pigx", "snet": "snetwork", "donut": "donut", "ethix": "ethichub", "fyz": "fyooz", "hsc": "hashcoin", "edu": "educoin", "dexg": "dextoken-governance", "pylon": "pylon-finance", "znz": "zenzo", "cor": "coreto", "modic": "modern-investment-coin", "web": "webcoin", "reec": "renewableelectronicenergycoin", "defi+s": "piedao-defi-small-cap", "rws": "robonomics-web-services", "eye": "beholder", "elec": "electrify-asia", "ppblz": "pepemon-pepeballs", "yec": "ycash", "sumo": "sumokoin", "dth": "dether", "stsla": "stsla", "gear": "bitgear", "opt": "open-predict-token", "csai": "compound-sai", "azr": "aezora", "zxc": "0xcert", "idh": "indahash", "mog": "mogwai", "goat": "goatcoin", "lobs": "lobstex-coin", "ors": "origin-sport", "degov": "degov", "foto": "unique-photo", "vips": "vipstarcoin", "tico": "topinvestmentcoin", "bscv": "bscview", "octi": "oction", "iic": "intelligent-investment-chain", "tol": "tolar", "boom": "boom-token", "ethv": "ethverse", "xnk": "ink-protocol", "ldfi": "lendefi", "xdna": "extradna", "scifi": "scifi-finance", "aux": "auxilium", "fyd": "find-your-developer", "fdo": "firdaos", "ionc": "ionchain-token", "dotx": "deli-of-thrones", "hmq": "humaniq", "xiv": "project-inverse", "toshi": "toshi-token", "fmg": "fm-gallery", "corn": "cornichon", "ag8": "atromg8", "idrt": "rupiah-token", "debase": "debase", "yae": "cryptonovae", "pta": "petrachor", "krb": "karbo", "mmo": "mmocoin", "next": "nextexchange", "loot": "nftlootbox", "kgo": "kiwigo", "fdz": "friendz", "fdd": "frogdao-dime", "tfl": "trueflip", "dit": "inmediate", "boost": "boosted-finance", "adm": "adamant-messenger", "inft": "infinito", "noahp": "noah-coin", "zlot": "zlot", "ubex": "ubex", "lock": "meridian-network", "ttn": "titan-coin", "shdc": "shd-cash", "psi": "passive-income", "sav3": "sav3", "adel": "akropolis-delphi", "tzc": "trezarcoin", "ftx": "fintrux", "kndc": "kanadecoin", "sub": "substratum", "zut": "zero-utility-token", "bto": "bottos", "monk": "monkey-project", "stk": "stk", "vcn": "versacoin", "gdao": "governor-dao", "npxsxem": "pundi-x-nem", "pct": "percent", "mmaon": "mmaon", "xbc": "bitcoin-plus", "zipt": "zippie", "edc": "edc-blockchain", "etz": "etherzero", "xaur": "xaurum", "evc": "eventchain", "mars": "mars", "spn": "sapien", "gmat": "gowithmi", "rac": "rac", "ryo": "ryo", "bfi": "bearn-fi", "error": "484-fund", "skull": "skull", "bbp": "biblepay", "gse": "gsenetwork", "htre": "hodltree", "ptt": "proton-token", "dft": "defiat", "own": "owndata", "gat": "gatcoin", "ugotchi": "unicly-aavegotchi-astronauts-collection", "ndr": "noderunners", "coni": "coinbene-token", "pis": "polkainsure-finance", "fry": "foundrydao-logistics", "uat": "ultralpha", "iht": "iht-real-estate-protocol", "zcc": "zccoin", "komet": "komet", "bund": "bundles", "eko": "echolink", "elx": "energy-ledger", "swirl": "swirl-cash", "n8v": "wearesatoshi", "ind": "indorse", "hlc": "halalchain", "yeld": "yeld-finance", "nftp": "nft-platform-index", "stacy": "stacy", "nfti": "nft-index", "cv2": "colossuscoin-v2", "mnc": "maincoin", "tff": "tutti-frutti-finance", "grft": "graft-blockchain", "imt": "moneytoken", "exf": "extend-finance", "rpd": "rapids", "power": "unipower", "egem": "ethergem", "qwc": "qwertycoin", "dct": "decent", "reosc": "reosc-ecosystem", "btb": "bitball", "groot": "growth-root", "tos": "thingsoperatingsystem", "wdgld": "wrapped-dgld", "stack": "stacker-ventures", "$rope": "rope", "xdex": "xdefi-governance-token", "font": "font", "sphr": "sphere", "rte": "rate3", "xwp": "swap", "adco": "advertise-coin", "vig": "vig", "tango": "keytango", "ctask": "cryptotask-2", "use": "usechain", "crea": "creativecoin", "mwg": "metawhale-gold", "rating": "dprating", "pny": "peony-coin", "pmgt": "perth-mint-gold-token", "xmon": "xmon", "meri": "merebel", "yvs": "yvs-finance", "fast": "fastswap", "shnd": "stronghands", "onc": "one-cash", "rox": "robotina", "isla": "insula", "xmg": "magi", "gene": "gene-source-code-token", "dope": "dopecoin", "ely": "elysian", "alv": "allive", "lot": "lukki-operating-token", "pgu": "polyient-games-unity", "sact": "srnartgallery", "mgo": "mobilego", "dam": "datamine", "mtn": "medicalchain", "ncc": "neurochain", "ladz": "ladz", "mao": "mao-zedong", "doges": "dogeswap", "myx": "myx-network", "rvx": "rivex-erc20", "araw": "araw-token", "troll": "trollcoin", "ncdt": "nuco-cloud", "malw": "malwarechain", "cue": "cue-protocol", "mntis": "mantis-network", "sada": "sada", "btc++": "piedao-btc", "mas": "midas-protocol", "ss": "sharder-protocol", "at": "abcc-token", "excc": "exchangecoin", "x42": "x42-protocol", "mzc": "maza", "gofi": "goswapp", "bos": "boscoin-2", "holy": "holyheld", "wqt": "work-quest", "ehrt": "eight-hours", "coil": "coil-crypto", "trust": "trust", "ssp": "smartshare", "lcs": "localcoinswap", "ubeeple": "unicly-beeple-collection", "milk2": "spaceswap-milk2", "gex": "globex", "excl": "exclusivecoin", "metric": "metric-exchange", "tend": "tendies", "latx": "latiumx", "vrs": "veros", "poe": "poet", "gst2": "gastoken", "cspn": "crypto-sports", "omx": "project-shivom", "udoki": "unicly-doki-doki-collection", "vox": "vox-finance", "neva": "nevacoin", "thirm": "thirm-protocol", "axi": "axioms", "aidoc": "ai-doctor", "xgg": "10x-gg", "red": "red", "msr": "masari", "xnv": "nerva", "ifund": "unifund", "nov": "novara-calcio-fan-token", "zsc": "zeusshield", "fire": "fire-protocol", "aval": "avaluse", "zrc": "zrcoin", "blue": "blue", "bti": "bitcoin-instant", "ven": "impulseven", "ypie": "piedao-yearn-ecosystem-pie", "ggtk": "gg-token", "buzz": "buzzcoin", "atn": "atn", "xfi": "xfinance", "mash": "masternet", "portal": "portal", "pak": "pakcoin", "bitx": "bitscreener", "vi": "vid", "ion": "ion", "rot": "rotten", "chnd": "cashhand", "svx": "savix", "cova": "covalent-cova", "dpy": "delphy", "bir": "birake", "gyen": "gyen", "spx": "sp8de", "stq": "storiqa", "vdx": "vodi-x", "datx": "datx", "bznt": "bezant", "otb": "otcbtc-token", "stop": "satopay", "abx": "arbidex", "dogec": "dogecash", "bbk": "bitblocks-project", "bsty": "globalboost", "ovc": "ovcode", "dyt": "dynamite", "nobl": "noblecoin", "tme": "tama-egg-niftygotchi", "eca": "electra", "lun": "lunyr", "cbix": "cubiex", "mush": "mushroom", "lnd": "lendingblock", "hbn": "hobonickels", "ipc": "ipchain", "shake": "spaceswap-shake", "sib": "sibcoin", "bcpt": "blockmason-credit-protocol", "twa": "adventure-token", "bdg": "bitdegree", "bether": "bethereum", "hush": "hush", "tbb": "trade-butler-bot", "ecom": "omnitude", "cat": "cat-token", "depay": "depay", "arq": "arqma", "hac": "hackspace-capital", "xp": "xp", "taco": "tacos", "alley": "nft-alley", "tns": "transcodium", "adt": "adtoken", "bkc": "facts", "gap": "gapcoin", "1up": "uptrennd", "unl": "unilock-network", "ric": "riecoin", "semi": "semitoken", "trnd": "trendering", "vdl": "vidulum", "tcc": "the-champcoin", "wtt": "giga-watt-token", "mis": "mithril-share", "kennel": "token-kennel", "ccn": "custom-contract-network", "lync": "lync-network", "tnc": "trinity-network-credit", "alex": "alex", "fxt": "fuzex", "toc": "touchcon", "ziot": "ziot", "tac": "traceability-chain", "sct": "clash-token", "qch": "qchi", "rmpl": "rmpl", "jntr": "jointer", "qbt": "qbao", "tix": "blocktix", "zmn": "zmine", "seos": "seos", "xbp": "blitzpredict", "telos": "telos-coin", "etg": "ethereum-gold", "ethy": "ethereum-yield", "pux": "polypux", "revo": "revomon", "ptn": "palletone", "mota": "motacoin", "wg0": "wrapped-gen-0-cryptokitties", "srh": "srcoin", "snov": "snovio", "pht": "lightstreams", "ff": "forefront", "dvt": "devault", "fsxu": "flashx-ultra", "bone": "bone", "sxag": "sxag", "sbnb": "sbnb", "ipl": "insurepal", "trc": "terracoin", "almx": "almace-shards", "face": "face", "swt": "swarm-city", "bits": "bitstar", "orcl5": "oracle-top-5", "renbch": "renbch", "r3fi": "r3fi-finance", "gmc": "gokumarket-credit", "axe": "axe", "mdg": "midas-gold", "senc": "sentinel-chain", "pho": "photon", "hue": "hue", "senpai": "project-senpai", "zpt": "zeepin", "sphtx": "sophiatx", "bcdn": "blockcdn", "tdp": "truedeck", "xlr": "solaris", "mbn": "membrana-platform", "woa": "wrapped-origin-axie", "nor": "bring", "ntbc": "note-blockchain", "hgt": "hellogold", "btcs": "bitcoin-scrypt", "axiav3": "axia", "btdx": "bitcloud", "shdw": "shadow-token", "zcr": "zcore", "jet": "jetcoin", "rito": "rito", "bloc": "blockcloud", "rvt": "rivetz", "ptm": "potentiam", "plus1": "plusonecoin", "fjc": "fujicoin", "pylnt": "pylon-network", "jump": "jumpcoin", "bitt": "bittoken", "ppy": "peerplays", "ptc": "pesetacoin", "shrmp": "shrimp-capital", "pipl": "piplcoin", "yfte": "yftether", "ken": "keysians-network", "fusii": "fusible", "spd": "stipend", "gbx": "gobyte", "esbc": "e-sport-betting-coin", "ethys": "ethereum-stake", "mwbtc": "metawhale-btc", "cheese": "cheese", "vtd": "variable-time-dollar", "peps": "pepegold", "women": "womencoin", "peg": "pegnet", "ink": "ink", "ucm": "ucrowdme", "lmy": "lunch-money", "mec": "megacoin", "ent": "eternity", "dws": "dws", "crp": "utopia", "type": "typerium", "bnty": "bounty0x", "bntx": "bintex-futures", "bgg": "bgogo", "asafe": "allsafe", "dem": "deutsche-emark", "kolin": "kolin", "arnx": "aeron", "flot": "fire-lotto", "pc": "promotionchain", "fess": "fess-chain", "comb": "combine-finance", "rpt": "rug-proof", "pria": "pria", "alt": "alt-estate", "mcash": "midas-cash", "sxau": "sxau", "hand": "showhand", "bouts": "boutspro", "zusd": "zusd", "lid": "liquidity-dividends-protocol", "rom": "rom-token", "scap": "safecapital", "peng": "penguin", "flp": "gameflip", "undg": "unidexgas", "kmpl": "kiloample", "cnb": "coinsbit-token", "bsov": "bitcoinsov", "deb": "debitum-network", "tsf": "teslafunds", "setc": "setc", "grim": "grimcoin", "scb": "spacecowboy", "pwr": "powercoin", "aced": "aced", "defo": "defhold", "1mt": "1million-token", "a": "alpha-platform", "wand": "wandx", "corx": "corionx", "bbs": "bbscoin", "ali": "ailink-token", "lqd": "liquidity-network", "yffi": "yffi-finance", "swing": "swing", "kfx": "knoxfs", "tch": "tigercash", "cag": "change", "onl": "on-live", "tbx": "tokenbox", "ad": "asian-dragon", "lx": "lux", "bez": "bezop", "sxmr": "sxmr", "kobo": "kobocoin", "yfd": "yfdfi-finance", "tcore": "tornadocore", "ppdex": "pepedex", "rehab": "nft-rehab", "chai": "chai", "etgp": "ethereum-gold-project", "send": "social-send", "bltg": "bitcoin-lightning", "sishi": "sishi-finance", "s": "sharpay", "baepay": "baepay", "bt": "bt-finance", "tsuki": "tsuki-dao", "x8x": "x8-project", "tcash": "tcash", "fyp": "flypme", "brdg": "bridge-protocol", "berry": "rentberry", "dln": "delion", "seq": "sequence", "esk": "eska", "wck": "wrapped-cryptokitties", "kp4r": "keep4r", "saud": "saud", "undb": "unibot-cash", "d4rk": "darkpaycoin", "plura": "pluracoin", "sds": "alchemint", "myb": "mybit-token", "mon": "moneybyte", "ieth": "ieth", "pch": "popchain", "star": "starbase", "etm": "en-tan-mo", "kerman": "kerman", "aem": "atheneum", "swiss": "swiss-finance", "jamm": "flynnjamm", "fors": "foresight", "mib": "mib-coin", "pkg": "pkg-token", "mintme": "webchain", "genix": "genix", "esh": "switch", "enol": "ethanol", "daiq": "daiquilibrium", "img": "imagecoin", "hqx": "hoqu", "topb": "topb", "fud": "fudfinance", "beet": "beetle-coin", "tmt": "traxia", "wiki": "wiki-token", "smc": "smartcoin", "orme": "ormeuscoin", "kgc": "krypton-token", "sins": "safeinsure", "vlu": "valuto", "ozc": "ozziecoin", "glox": "glox-finance", "amm": "micromoney", "quan": "quantis", "vgw": "vegawallet-token", "cmct": "crowd-machine", "eqt": "equitrader", "scex": "scex", "smol": "smol", "rupx": "rupaya", "mntp": "goldmint", "arc": "arcticcoin", "ntrn": "neutron", "bboo": "panda-yield", "bth": "bithereum", "metm": "metamorph", "kubo": "kubocoin", "dogy": "dogeyield", "ags": "aegis", "btw": "bitwhite", "chop": "porkchop", "fr": "freedom-reserve", "space": "spacecoin", "snrg": "synergy", "reb2": "rebased", "got": "gonetwork", "cxn": "cxn-network", "tsl": "energo", "thrt": "thrive", "lkn": "linkcoin-token", "haut": "hauteclere-shards-2", "sbs": "staysbase", "xta": "italo", "steep": "steepcoin", "sergs": "sergs", "uunicly": "unicly-genesis-collection", "avs": "algovest", "c2c": "ctc", "tie": "ties-network", "jem": "jem", "yfbt": "yearn-finance-bit", "ugc": "ugchain", "emd": "emerald-crypto", "slr": "solarcoin", "gem": "gems-2", "syn": "synlev", "btct": "bitcoin-token", "tit": "titcoin", "lana": "lanacoin", "obr": "obr", "fota": "fortuna", "ecte": "eurocoinpay", "max": "maxcoin", "hndc": "hondaiscoin", "bbo": "bigbom-eco", "shmn": "stronghands-masternode", "cato": "catocoin", "ird": "iridium", "pop": "popularcoin", "chl": "challengedac", "vsl": "vslice", "civ": "civitas", "svd": "savedroid", "croat": "croat", "mxt": "martexcoin", "ifex": "interfinex-bills", "bear": "arcane-bear", "tic": "thingschain", "evil": "evil-coin", "ffyi": "fiscus-fyi", "ezw": "ezoow", "adi": "aditus", "sdash": "sdash", "paws": "paws-funds", "crc": "crycash", "yft": "toshify-finance", "priv": "privcy", "nbc": "niobium-coin", "vlo": "velo-token", "dex": "alphadex", "help": "help-token", "delta": "deltachain", "btcv": "bitcoinv", "wvg0": "wrapped-virgin-gen-0-cryptokitties", "ecoin": "ecoin-2", "mcp": "my-crypto-play", "horus": "horuspay", "medibit": "medibit", "inve": "intervalue", "ngot": "ngot", "ukg": "unikoin-gold", "asa": "asura", "gun": "guncoin", "prx": "proxynode", "ore": "oreo", "arms": "2acoin", "2give": "2give", "lcp": "litecoin-plus", "insn": "insanecoin", "yfdot": "yearn-finance-dot", "cyl": "crystal-token", "etnx": "electronero", "kind": "kind-ads-token", "amz": "amazonacoin", "com": "community-token", "ytn": "yenten", "cob": "cobinhood", "prc": "partner", "mixs": "streamix", "horse": "ethorse", "candy": "skull-candy-shards", "crypt": "cryptcoin", "vls": "veles", "xjo": "joulecoin", "wfil": "wrapped-filecoin", "boli": "bolivarcoin", "adz": "adzcoin", "skin": "skincoin", "dim": "dimcoin", "hlix": "helix", "ctrt": "cryptrust", "ethbn": "etherbone", "ella": "ellaism", "karma": "karma-dao", "swagg": "swagg-network", "cymt": "cybermusic", "cen": "coinsuper-ecosystem-network", "arct": "arbitragect", "mol": "molten", "scriv": "scriv", "rex": "rex", "arco": "aquariuscoin", "dcntr": "decentrahub-coin", "first": "harrison-first", "kiwi": "kiwi-token", "mss": "monster-cash-share", "bsd": "bitsend", "nat": "natmin-pure-escrow", "shuf": "shuffle-monster", "naruto2": "naruto-bsc", "imgc": "imagecash", "juice": "moon-juice", "ynk": "yoink", "bern": "berncash", "gcn": "gcn-coin", "ftxt": "futurax", "martk": "martkist", "sat": "sphere-social", "tkp": "tokpie", "aro": "arionum", "xgox": "xgox", "plt": "plutus-defi", "rigel": "rigel-finance", "ezy": "eazy", "cnus": "coinus", "abs": "absolute", "rfctr": "reflector-finance", "yfpi": "yearn-finance-passive-income", "tob": "tokens-of-babel", "tig": "tigereum", "xbi": "bitcoin-incognito", "yfox": "yfox-finance", "xkr": "kryptokrona", "raise": "hero-token", "info": "infocoin", "arepa": "arepacoin", "bta": "bata", "kash": "kids-cash", "dmb": "digital-money-bits", "herb": "herbalist-token", "cred": "verify", "yfbeta": "yfbeta", "arm": "armours", "yui": "yui-hinata", "stu": "bitjob", "vsx": "vsync", "fsbt": "forty-seven-bank", "yun": "yunex", "dfx": "definitex", "aib": "advanced-internet-block", "bse": "buy-sell", "tgame": "truegame", "estx": "oryxcoin", "dfs": "digital-fantasy-sports", "tok": "tokok", "kts": "klimatas", "pyrk": "pyrk", "mat": "bitsum", "atb": "atbcoin", "hqt": "hyperquant", "jade": "jade-currency", "prix": "privatix", "pfarm": "farm-defi", "hur": "hurify", "knt": "kora-network", "bugs": "starbugs-shards", "nice": "nice", "nfxc": "nfx-coin", "jan": "coinjanitor", "pgo": "pengolincoin", "cps": "capricoin", "sno": "savenode", "deep": "deepcloud-ai", "ltb": "litebar", "skym": "soar", "jigg": "jiggly-finance", "ablx": "able", "cpr": "cipher", "dvs": "davies", "tri": "trinity-protocol", "cgi": "coinshares-gold-and-cryptoassets-index-lite", "sxtz": "sxtz", "datp": "decentralized-asset-trading-platform", "rugz": "rugz", "wgo": "wavesgo", "eltcoin": "eltcoin", "yamv2": "yam-v2", "cof": "coffeecoin", "bcz": "bitcoin-cz", "chc": "chaincoin", "opal": "opal", "bgtt": "baguette-token", "scr": "scorum", "ig": "igtoken", "aus": "australia-cash", "xco": "xcoin", "tmn": "ttanslateme-network-token", "bit": "bitmoney", "pte": "peet-defi", "gtm": "gentarium", "gcg": "gulf-coin-gold", "rto": "arto", "znd": "zenad", "kydc": "know-your-developer", "inx": "inmax", "btcn": "bitcoinote", "crad": "cryptoads-marketplace", "edrc": "edrcoin", "cherry": "cherry", "bro": "bitradio", "yfsi": "yfscience", "btcred": "bitcoin-red", "bree": "cbdao", "bonk": "bonk-token", "dtrc": "datarius-cryptobank", "zfl": "zedxe", "obee": "obee-network", "ben": "bitcoen", "mooi": "moonai", "xos": "oasis-2", "team": "team-finance", "xuez": "xuez", "war": "yieldwars-com", "ero": "eroscoin", "cbx": "bullion", "bzx": "bitcoin-zero", "duo": "duo", "havy": "havy-2", "cjt": "connectjob", "hb": "heartbout", "kwh": "kwhcoin", "tret": "tourist-review-token", "milf": "milfies", "dbet": "decentbet", "rpc": "ronpaulcoin", "bsds": "basis-dollar-share", "ecash": "ethereum-cash", "gup": "matchpool", "intu": "intucoin", "mcc": "multicoincasino", "imp": "ether-kingdoms-token", "genx": "genesis-network", "coke": "cocaine-cowboy-shards", "cpu": "cpuchain", "ethplo": "ethplode", "mfc": "mfcoin", "bon": "bonpay", "pomac": "poma", "itl": "italian-lira", "lbtc": "litebitcoin", "swipp": "swipp", "kwatt": "4new", "swyftt": "swyft", "braz": "brazio", "anon": "anon", "swc": "scanetchain", "dp": "digitalprice", "glt": "globaltoken", "pnx": "phantomx", "netko": "netko", "zzzv2": "zzz-finance-v2", "vaultz": "vaultz", "medic": "medic-coin", "bloody": "bloody-token", "shb": "skyhub", "arion": "arion", "etgf": "etg-finance", "nzl": "zealium", "xd": "scroll-token", "apr": "apr-coin", "vgr": "voyager", "2x2": "2x2", "wrc": "worldcore", "toto": "tourist-token", "yffs": "yffs", "klks": "kalkulus", "aias": "aiascoin", "usdq": "usdq", "infx": "influxcoin", "cco": "ccore", "sur": "suretly", "drm": "dreamcoin", "chiefs": "kansas-city-chiefs-win-super-bowl", "gxx": "gravitycoin", "ucn": "uchain", "ace": "tokenstars-ace", "veco": "veco", "note": "dnotes", "desh": "decash", "mst": "mustangcoin", "lud": "ludos", "mac": "machinecoin", "drip": "dripper-finance", "deex": "deex", "wdp": "waterdrop", "kema": "kemacoin", "cash2": "cash2", "actp": "archetypal-network", "yfuel": "yfuel", "rntb": "bitrent", "joon": "joon", "gic": "giant", "ethm": "ethereum-meta", "lnc": "blocklancer", "pfr": "payfair", "jmc": "junsonmingchancoin", "trk": "truckcoin", "sinoc": "sinoc", "aqua": "aquachain", "bold": "boldman-capital", "payx": "paypex", "sfcp": "sf-capital", "cou": "couchain", "boxx": "boxx", "emrals": "emrals", "zyon": "bitzyon", "pkb": "parkbyte", "hippo": "hippo-finance", "$noob": "noob-finance", "vikky": "vikkytoken", "distx": "distx", "ctsc": "cts-coin", "exo": "exosis", "tsd": "true-seigniorage-dollar", "goss": "gossipcoin", "nrve": "narrative", "seal": "seal-finance", "joint": "joint", "gst": "game-stars", "impl": "impleum", "wbt": "whalesburg", "boat": "boat", "npc": "npcoin", "zoc": "01coin", "gsr": "geysercoin", "cnct": "connect", "mar": "mchain", "nyx": "nyxcoin", "rle": "rich-lab-token", "apc": "alpha-coin", "burn": "blockburn", "wild": "wild-crypto", "xstar": "starcurve", "gin": "gincoin", "kgs": "kingscoin", "ntr": "netrum", "dalc": "dalecoin", "gtx": "goaltime-n", "stak": "straks", "bacon": "baconswap", "ams": "amsterdamcoin", "cow": "cowry", "her": "hero-node", "neet": "neetcoin", "xgcs": "xgalaxy", "audax": "audax", "cdm": "condominium", "lno": "livenodes", "tds": "tokendesk", "tour": "touriva", "gdr": "guider", "may": "theresa-may-coin", "wtl": "welltrado", "taj": "tajcoin", "ulg": "ultragate", "hydro": "hydro", "stream": "streamit-coin", "yfid": "yfidapp", "tux": "tuxcoin", "noodle": "noodle-finance", "arb": "arbit", "care": "carebit", "snd": "snodecoin", "mexp": "moji-experience-points", "jbx": "jboxcoin", "idefi": "idefi", "sierra": "sierracoin", "yfrb": "yfrb-finance", "aet": "aerotoken", "kkc": "primestone", "epc": "experiencecoin", "osina": "osina", "strng": "stronghold", "chan": "chancoin", "mftu": "mainstream-for-the-underground", "reex": "reecore", "bm": "bitcomo", "itt": "intelligent-trading-tech", "klon": "klondike-finance", "guess": "peerguess", "jiaozi": "jiaozi", "gali": "galilel", "nrp": "neural-protocol", "house": "toast-finance", "dtc": "datacoin", "gfn": "game-fanz", "kmx": "kimex", "din": "dinero", "mafi": "mafia-network", "labx": "stakinglab", "blry": "billarycoin", "xap": "apollon", "hash": "hash", "ztc": "zent-cash", "clc": "caluracoin", "exus": "exus-coin", "abet": "altbet", "ylc": "yolo-cash", "cct": "crystal-clear", "xczm": "xavander-coin", "litb": "lightbit", "dxo": "dextro", "rise": "rise-protocol", "eny": "emergency-coin", "paxex": "paxex", "sas": "stand-share", "mnp": "mnpcoin", "wcoinbase-iou": "deus-synthetic-coinbase-iou", "scsx": "secure-cash", "bsgs": "basis-gold-share", "roco": "roiyal-coin", "btcb": "bitcoinbrand", "agu": "agouti", "fntb": "fintab", "cnmc": "cryptonodes", "eld": "electrum-dark", "btcui": "bitcoin-unicorn", "dashg": "dash-green", "xsr": "sucrecoin", "spe": "bitcoin-w-spectrum", "vivid": "vivid", "sove": "soverain", "bul": "bulleon", "trvc": "thrivechain", "nyb": "new-year-bull", "beverage": "beverage", "exn": "exchangen", "abst": "abitshadow-token", "guard": "guardium", "rank": "rank-token", "azum": "azuma-coin", "uffyi": "unlimited-fiscusfyi", "hodl": "hodlcoin", "wtr": "water-token-2", "crcl": "crowdclassic", "js": "javascript-token", "kec": "keyco", "cdzc": "cryptodezirecash", "chtc": "cryptohashtank-coin", "zzz": "zzz-finance", "sdusd": "sdusd", "faith": "faithcoin", "polar": "polaris", "dow": "dowcoin", "mbgl": "mobit-global", "yieldx": "yieldx", "bdcash": "bigdata-cash", "varius": "varius", "hlx": "hilux", "orm": "orium", "sac": "stand-cash", "quot": "quotation-coin", "brix": "brixcoin", "mynt": "mynt", "better": "better-money", "mano": "mano-coin", "orox": "cointorox", "oot": "utrum", "dgm": "digimoney", "clg": "collegicoin", "nbxc": "nibbleclassic", "fsd": "freq-set-dollar", "bkx": "bankex", "ssx": "stakeshare", "ary": "block-array", "kreds": "kreds", "het": "havethertoken", "lms": "lumos", "gbcr": "gold-bcr", "wllo": "willowcoin", "ibtc": "ibtc", "voise": "voise", "saros": "saros", "kaaso": "kaaso", "ixrp": "ixrp", "bost": "boostcoin", "dice": "dice-finance", "404": "404", "sms": "speed-mining-service", "mek": "meraki", "real": "real", "evi": "evimeria", "bds": "borderless", "yffc": "yffc-finance", "aer": "aeryus", "lux": "luxcoin", "ixtz": "ixtz", "atl": "atlant", "zla": "zilla", "ebtc": "ebitcoin", "voco": "provoco", "pirl": "pirl", "bze": "bzedge", "idash": "idash", "arg": "argentum", "pcn": "peepcoin", "icex": "icex", "cstl": "cstl", "up": "uptoken", "cc": "cryptocart", "1ai": "1ai", "ucx": "ucx-foundation", "ges": "ges", "mp3": "mp3", "ecc": "ecc", "lcg": "lcg", "iab": "iab", "msn": "msn", "lvx": "level01-derivatives-exchange", "h3x": "h3x", "520": "520", "3xt": "3xt", "htm": "htm", "mox": "mox", "fme": "fme", "ubu": "ubu-finance", "kvi": "kvi", "tmc": "tmc-niftygotchi", "hdt": "hdt", "7up": "7up", "hex": "hex", "wal": "wal", "onot": "ono", "mvl": "mass-vehicle-ledger", "p2p": "p2p-network", "idk": "idk", "mp4": "mp4", "rxc": "rxc", "yup": "yup", "bgt": "bgt", "dad": "decentralized-advertising", "lbk": "legal-block", "mex": "mex", "mrv": "mrv", "lif": "winding-tree", "rug": "rug", "cpt": "cryptaur", "sov": "sovereign-coin", "eox": "eox", "imo": "imo", "pop!": "pop", "day": "chronologic", "gya": "gya", "sun": "sun-token", "tvt": "tvt", "ize": "ize", "vbt": "vbt", "txt": "txt", "yes": "yes", "die": "die", "zyx": "zyx", "owl": "owl-token", "olo": "olo", "yas": "yas", "b26": "b26", "aos": "aos", "sfb": "sfb", "zin": "zin", "zos": "zos", "xtp": "tap", "vey": "vey", "zom": "zoom-protocol", "utip": "utip", "gana": "gana", "zpr": "zper", "bcat": "bcat", "cspc": "chinese-shopping-platform", "vspy": "vspy", "oryx": "oryx", "wise": "wise-token11", "amis": "amis", "dogz": "dogz", "pick": "pick", "peos": "peos", "suni": "suni", "hapi": "hapi", "joys": "joys", "zyro": "zyro", "yfet": "yfet", "arix": "arix", "b360": "b360", "weth": "weth", "acdc": "volt", "xls": "elis", "foin": "foincoin", "donu": "donu", "taxi": "taxi", "rccc": "rccc", "ibnb": "ibnb", "trbo": "turbostake", "novo": "novo", "aeon": "aeon", "mini": "mini", "yce": "myce", "vndc": "vndc", "artx": "artx", "dmme": "dmme-app", "mass": "mass", "n0031": "ntoken0031", "olcf": "olcf", "xank": "xank", "koto": "koto", "ioex": "ioex", "thx": "thorenext", "iron": "iron-stablecoin", "kala": "kala", "tosc": "t-os", "ympl": "ympl", "pica": "pica", "xtrd": "xtrade", "bsys": "bsys", "cmdx": "cmdx", "lbrl": "lbrl", "mymn": "mymn", "xtrm": "xtrm", "vivo": "vivo", "nova": "nova", "noku": "noku", "hype": "hype-finance", "lze": "lyze", "sono": "sonocoin", "roc": "roxe", "cez": "cezo", "dsys": "dsys", "arx": "arcs", "glex": "glex", "sltc": "sltc", "seer": "seer", "fil6": "filecoin-iou", "alis": "alis", "tun": "tune", "waxe": "waxe", "bora": "bora", "camp": "camp", "sbet": "sbet", "sg20": "sg20", "r34p": "r34p", "tena": "tena", "exor": "exor", "scrv": "scrv", "velo": "velo", "psrs": "psrs", "enx": "enex", "moac": "moac", "ntm": "netm", "benz": "benz", "vybe": "vybe", "qcad": "qcad", "bolt": "thunderbolt", "boid": "boid", "attn": "attn", "bitz": "bitz", "pway": "pway", "qusd": "qusd-stablecoin", "gasp": "gasp", "ymax": "ymax", "abbc": "alibabacoin", "gtc": "global-trust-coin", "yfia": "yfia", "teat": "teal", "mute": "mute", "frat": "frat", "qpy": "qpay", "ieos": "ieos", "guns": "guns", "lynx": "lynx", "gmb": "gamb", "elya": "elya", "aly": "ally", "xfit": "xfit", "arke": "arke", "apix": "apix", "post": "postcoin", "punk": "punk", "bidr": "binanceidr", "dnc": "danat-coin", "bu": "bumo", "prot": "prot", "plex": "plex", "usda": "usda", "dray": "dray", "miss": "miss", "zeon": "zeon", "pofi": "pofi", "afro": "afro", "aeur": "aeur", "sti": "stib-token", "many": "manyswap", "reth": "reth", "g999": "g999", "xfii": "xfii", "cook": "cook", "swop": "swop", "evan": "evan", "asta": "asta", "hopr": "hopr", "chbt": "chbt", "zinc": "zinc", "ng": "ngin", "bpop": "bpop", "xbnta": "xbnt", "lyfe": "lyfe", "plg": "pledgecamp", "biki": "biki", "bare": "bare", "nilu": "nilu", "vidy": "vidy", "mogx": "mogu", "vera": "vera", "sefi": "sefi", "wbx": "wibx", "crow": "crow-token", "iten": "iten", "obic": "obic", "redi": "redi", "pika": "pikachu", "s4f": "s4fe", "gr": "grom", "hope": "hope-token", "ston": "ston", "wav3": "wav3", "dtmi": "dtmi", "tugz": "tugz", "olxa": "olxa", "ndau": "ndau", "azu": "azus", "iote": "iote", "ers": "eros", "whey": "whey", "r64x": "r64x", "bast": "bast", "xels": "xels", "xch": "chia-iou", "agt": "aisf", "vvsp": "vvsp", "gold": "digital-gold-token", "xdai": "xdai", "ln": "link", "maro": "ttc-protocol", "rfis": "rfis", "lucy": "lucy", "kupp": "kupp", "etor": "etor", "ruc": "rush", "asla": "asla", "amix": "amix", "usdl": "usdl", "efin": "efin", "musk": "musk", "vld": "valid", "samzn": "samzn", "trism": "trism", "byron": "bitcoin-cure", "seed": "seed-venture", "crave": "crave", "topia": "topia", "sls": "salus", "lc": "lightningcoin", "posh": "shill", "bud": "buddy", "omb": "ombre", "klt": "klend", "tower": "tower", "fma": "flama", "unify": "unify", "nexxo": "nexxo", "eurxb": "eurxb", "alb": "albos", "cyb": "cybex", "hplus": "hplus", "fleta": "fleta", "cprop": "cprop", "fla": "fiola", "gof": "golff", "ksk": "kskin", "vmr": "vomer", "xazab": "xazab", "tks": "tokes", "knv": "kanva", "senso": "senso", "bxiot": "bxiot", "tlr": "taler", "xkncb": "xkncb", "spt": "spectrum", "pgpay": "puregold-token", "apn": "apron", "cvr": "polkacover", "utrin": "utrin", "husky": "husky", "xfuel": "xfuel", "imusd": "imusd", "clam": "clams", "atp": "atlas-protocol", "byts": "bytus", "blood": "blood", "earnx": "earnx", "akn": "akoin", "tsr": "tesra", "keyt": "rebit", "emoj": "emoji", "pando": "pando", "lgbtq": "pride", "mooni": "mooni", "blurt": "blurt", "kcash": "kcash", "asimi": "asimi", "mpl": "maple-finance", "atmos": "atmos", "xsp": "xswap", "merge": "merge", "grimm": "grimm", "ifx24": "ifx24", "egold": "egold", "bion": "biido", "dxiot": "dxiot", "miami": "miami", "axl": "axial", "sop": "sopay", "usdex": "usdex-2", "ecu": "decurian", "plx": "playcoin", "sheng": "sheng", "sld": "safelaunchpad", "xnc": "xenios", "con": "converter-finance", "qob": "qobit", "yusra": "yusra", "lkk": "lykke", "cdex": "codex", "spok": "spock", "ysr": "ystar", "flap": "flapp", "basic": "basic", "vso": "verso", "alphr": "alphr", "joy": "joy-coin", "cms": "comsa", "lex": "elxis", "stonk": "stonk", "rlx": "relax-protocol", "trybe": "trybe", "point": "point", "xnode": "xnode", "carat": "carat", "eql": "equal", "digex": "digex", "vnx": "venox", "peach": "peach", "xknca": "xknca", "lucky": "lucky-2", "xen": "xenon-2", "u": "ucoin", "funjo": "funjo", "mvr": "mavro", "piasa": "piasa", "xhd": "xrphd", "fo": "fibos", "bsha3": "bsha3", "btr": "bitrue-token", "stamp": "stamp", "modex": "modex", "vesta": "vesta", "mri": "mirai", "haz": "hazza", "xtx": "xtock", "srune": "srune", "xin": "infinity-economics", "paper": "paper", "ean": "eanto", "dlike": "dlike", "hve2": "uhive", "bitsz": "bitsz", "ccomp": "ccomp", "zch": "zilchess", "vidyx": "vidyx", "ibank": "ibank", "rkn": "rakon", "mts": "mtblock", "bubo": "budbo", "xfg": "fango", "antr": "antra", "omega": "omega", "jvz": "jiviz", "amon": "amond", "ovi": "oviex", "sar": "saren", "mnguz": "mangu", "myo": "mycro-ico", "tup": "tenup", "altom": "altcommunity-coin", "fln": "fline", "dby": "dobuy", "mozox": "mozox", "snflx": "snflx", "imbtc": "the-tokenized-bitcoin", "xmark": "xmark", "acryl": "acryl", "sklay": "sklay", "sbe": "sombe", "xax": "artax", "mks": "makes", "visio": "visio", "pazzy": "pazzy", "cvl": "civil", "rfbtc": "rfbtc", "twist": "twist", "ing": "iungo", "gena": "genta", "jwl": "jewel", "vinci": "vinci", "kvnt": "kvant", "tro": "tro-network", "sem": "semux", "nsg": "nasgo", "eidos": "eidos", "libfx": "libfx", "aloha": "aloha", "ilg": "ilgon", "swace": "swace", "rup": "rupee", "slnv2": "slnv2", "krex": "kronn", "plut": "pluto", "xfe": "feirm", "sts": "sbank", "atd": "atd", "toz": "tozex", "ox": "orcax", "myu": "myubi", "lunes": "lunes", "oks": "okschain", "franc": "franc", "voltz": "voltz", "raku": "rakun", "defla": "defla", "morc": "dynamic-supply", "fx1": "fanzy", "ferma": "ferma", "dudgx": "dudgx", "tor": "torchain", "ptd": "pilot", "kxusd": "kxusd", "wco": "winco", "atx": "aston", "aico": "aicon", "clt": "coinloan", "xgm": "defis", "sgoog": "sgoog", "grain": "grain-token", "seele": "seele", "seeds": "seeds", "em": "eminer", "lytx": "lytix", "keyfi": "keyfi", "ehash": "ehash", "zlp": "zuplo", "hatch": "hatch-dao", "tools": "tools", "ybusd": "ybusd", "qc": "qovar-coin", "bulls": "bulls", "ipfst": "ipfst", "acoin": "acoin", "temco": "temco", "upbnb": "upbnb", "aunit": "aunit", "hdi": "heidi", "xra": "ratecoin", "amr": "ammbr", "xeuro": "xeuro", "ikomp": "ikomp", "fil12": "fil12", "blast": "blast", "uno": "unobtanium", "pitch": "pitch", "saave": "saave", "mla": "moola", "az": "azbit", "ytusd": "ytusd", "xsnxa": "xsnx", "xpo": "x-power-chain", "$aapl": "aapl", "pizza": "pizzaswap", "p2pg": "p2pgo", "gig": "gigecoin", "bid": "blockidcoin", "ifarm": "ifarm", "steel": "steel", "bliss": "bliss-2", "br34p": "br34p", "manna": "manna", "pzm": "prizm", "oct": "oraclechain", "zoa": "zotova", "ubin": "ubiner", "echt": "e-chat", "yfo": "yfione", "yoc": "yocoin", "dogira": "dogira", "zcx": "unizen", "kzc": "kzcash", "s8": "super8", "trdx": "trodex", "octa": "octans", "xdag": "dagger", "rno": "snapparazzi", "bva": "bavala", "nbu": "nimbus", "sbt": "solbit", "kel": "kelvpn", "acu": "aitheon", "ebst": "eboost", "zag": "zigzag", "ame": "amepay", "ec": "eternal-cash", "aquari": "aquari", "evr": "everus", "ket": "rowket", "lop": "kilopi", "wok": "webloc", "s1inch": "s1inch", "zdc": "zodiac", "dxf": "dexfin", "tewken": "tewken", "xincha": "xincha", "fpt": "fuupay", "onebtc": "onebtc", "oft": "orient", "heal": "etheal", "att": "africa-trading-chain", "2goshi": "2goshi", "sfn": "safron", "jll": "jllone", "usnbt": "nubits", "dgn": "degen-protocol", "dka": "dkargo", "gneiss": "gneiss", "dctd": "dctdao", "raux": "ercaux", "co2b": "co2bit", "degens": "degens", "uzz": "azuras", "boo": "spookyswap", "lhcoin": "lhcoin", "xbtg": "bitgem", "onit": "onbuff", "xsh": "shield", "nlx": "nullex", "dms": "documentchain", "gmr": "gimmer", "scribe": "scribe", "mnm": "mineum", "pixeos": "pixeos", "min": "mindol", "mct": "master-contract-token", "bay": "bitbay", "dmx": "dymmax", "xaaveb": "xaaveb", "bpx": "bispex", "cir": "circleswap", "me": "all-me", "meowth": "meowth", "sead": "seadex", "xinchb": "xinchb", "clv": "clover", "mdu": "mdu", "gsfy": "gasify", "ebk": "ebakus", "xqr": "qredit", "bst": "bitsten-token", "xhi": "hicoin", "apx": "appics", "cso": "crespo", "dcore": "decore", "zdr": "zloadr", "hpx": "hupayx", "incnt": "incent", "perl": "perlin", "byt": "byzbit", "aapx": "ampnet", "redbux": "redbux", "gxi": "genexi", "dusa": "medusa", "xce": "cerium", "moneta": "moneta", "kiro": "kirobo", "jntr/e": "jntre", "dsgn": "design", "stm": "stream", "uted": "united-token", "qmc": "qmcoin", "aka": "akroma", "news": "cryptonewsnet", "jmt": "jmtime", "waf": "waffle", "tem": "temtem", "nt": "nexdax", "nux": "peanut", "bfx": "bitfex", "wbpc": "buypay", "arcona": "arcona", "hdp.\u0444": "hedpay", "lgc": "gemini", "i0c": "i0coin", "mag": "maggie", "trat": "tratok", "usg": "usgold", "strn": "saturn-classic-dao-token", "dxr": "dexter", "nii": "nahmii", "dsr": "desire", "str": "staker", "gfce": "gforce", "zcor": "zrocor", "efk": "refork", "fnd": "fundum", "xsc": "xscoin", "nkc": "nework", "vii": "7chain", "azzr": "azzure", "10set": "tenset", "mgx": "margix", "jui": "juiice", "fit": "financial-investment-token", "pat": "patron", "mofi": "mobifi", "rfx": "reflex", "stri": "strite", "dacs": "dacsee", "bstx": "blastx", "egcc": "engine", "in": "incoin", "xaavea": "xaavea", "btp": "bitcoin-pay", "prstx": "presto", "dbt": "datbit", "yco": "y-coin", "lev": "leverj", "rnx": "roonex", "dtep": "decoin", "agol": "algoil", "bri": "baroin", "mdm": "medium", "kue": "kuende", "ett": "efficient-transaction-token", "dns": "bitdns", "pteria": "pteria", "qoob": "qoober", "kicks": "sessia", "ilc": "ilcoin", "bdx": "beldex", "uco": "uniris", "bceo": "bitceo", "entone": "entone", "sefa": "mesefa", "arteon": "arteon", "cbt": "cryptocurrency-business-token", "qi": "qiswap", "djv": "dejave", "lcnt": "lucent", "dess": "dessfi", "egx": "eaglex", "clx": "celeum", "ktt": "k-tune", "tyc": "tycoon", "ipm": "timers", "a5t": "alpha5", "alg": "bitalgo", "dhv": "dehive", "sprink": "sprink", "dexm": "dexmex", "gunthy": "gunthy", "cntx": "centex", "omm": "omcoin", "roz": "rozeus", "fzy": "frenzy", "nlm": "nuclum", "xlt": "nexalt", "vancat": "vancat", "tara": "taraxa", "coup": "coupit", "eauric": "eauric", "skrp": "skraps", "uis": "unitus", "tur": "turret", "vsn": "vision-network", "strk": "strike", "bsy": "bestay", "ceds": "cedars", "sic": "sicash", "rhegic": "rhegic", "orb": "orbitcoin", "anct": "anchor", "ttr": "tetris", "toko": "toko", "ign": "ignite", "pgf7t": "pgf500", "gom": "gomics", "ras": "raksur", "ivi": "inoovi", "kam": "bitkam", "ama": "amaten", "pcatv3": "pcatv3", "kk": "kkcoin", "dfni": "defini", "vbswap": "vbswap", "cod": "codemy", "oneeth": "oneeth", "bep": "blucon", "renfil": "renfil", "xym": "symbol", "rblx": "rublix", "xab": "abosom", "azx": "azeusx", "exg": "exgold", "wix": "wixlar", "hbx": "hashbx", "fdn": "fundin", "ocul": "oculor", "dbnk": "debunk", "paa": "palace", "usd1": "psyche", "xditto": "xditto", "fai": "fairum", "lib": "banklife", "hgro": "helgro", "pan": "panvala-pan", "oil": "crudeoil-finance", "yac": "yacoin", "spg": "super-gold", "alu": "altura", "tlo": "talleo", "gaze": "gazetv", "zlw": "zelwin", "lemd": "lemond", "shorty": "shorty", "sfr": "safari", "whx": "whitex", "mor": "morcrypto-coin", "mimo": "mimosa", "rpzx": "rapidz", "glf": "gallery-finance", "ecob": "ecobit", "inn": "innova", "iqq": "iqoniq", "sanc": "sancoj", "bdk": "bidesk", "erc223": "erc223", "mns": "monnos", "r3t": "rock3t", "wynaut": "wynaut", "r2r": "citios", "hd": "hubdao", "levelg": "levelg", "swamp": "swamp-coin", "brtr": "barter", "rabbit": "rabbit", "prkl": "perkle", "qrn": "qureno", "ilk": "inlock-token", "hfi": "hecofi", "psb": "pesobit", "zwap": "zilswap", "v": "version", "pcm": "precium", "buy": "burency", "axnt": "axentro", "tek": "tekcoin", "pmeer": "qitmeer", "gaia": "gaiadao", "mpay": "menapay", "7e": "7eleven", "trcl": "treecle", "bly": "blocery", "dxh": "daxhund", "the": "the-node", "tkmn": "tokemon", "xcz": "xchainz", "chat": "beechat", "gpt": "grace-period-token", "peth18c": "peth18c", "xat": "shareat", "mouse": "mouse", "aget": "agetron", "imu": "imusify", "vbit": "valobit", "vgc": "5g-cash", "ufarm": "unifarm", "bnode": "beenode", "quo": "vulcano", "mndao": "moondao", "mrat": "moonrat", "yot": "payyoda", "rzb": "rizubot", "ork": "orakuru", "btv": "bitvote", "tag": "tagcoin-erc20", "wasp": "wanswap", "celc": "celcoin", "pgs": "pegasus", "halv": "halving-coin", "bni": "betnomi-2", "jar": "jarvis", "crct": "circuit", "scl": "sociall", "pkt": "playkey", "btcm": "btcmoon", "komp": "kompass", "igg": "ig-gold", "net": "netcoin", "shroud": "shroud-protocol", "coi": "coinnec", "ardx": "ardcoin", "avn": "avantage", "fml": "formula", "gadoshi": "gadoshi", "mepad": "memepad", "si14": "si14bet", "ddm": "ddmcoin", "pbl": "publica", "gzro": "gravity", "fnsp": "finswap", "lhb": "lendhub", "fox": "fox-finance", "btkc": "beautyk", "btrm": "betrium", "xes": "proxeus", "300": "spartan", "sfm": "sfmoney", "rrc": "rrspace", "caj": "cajutel", "torpedo": "torpedo", "crfi": "crossfi", "btsg": "bitsong", "torm": "thorium", "asy": "asyagro", "deq": "dequant", "tlw": "tilwiki", "boob": "boobank", "ptr": "payturn", "locg": "locgame", "wdx": "wordlex", "ntx": "nitroex", "nax": "nextdao", "dvx": "derivex", "shrm": "shrooms", "qtcon": "quiztok", "xmv": "monerov", "bim": "bimcoin", "winr": "justbet", "mkey": "medikey", "gps": "triffic", "tat": "tatcoin", "tty": "trinity", "vash": "vpncoin", "pt": "predict", "xnb": "xeonbit", "mdtk": "mdtoken", "cura": "curadai", "888": "octocoin", "befx": "belifex", "xiro": "xiropht", "wenb": "wenburn", "dfo": "defiato", "sxc": "simplexchain", "mb": "microchain", "ccxx": "counosx", "dgmt": "digimax", "onewing": "onewing", "xov": "xov", "ogx": "organix", "some": "mixsome", "ath": "atheios", "dkyc": "datakyc", "zny": "bitzeny", "tdi": "tedesis", "bafe": "bafe-io", "poocoin": "poocoin", "dion": "dionpay", "bn": "bitnorm", "linkusd": "linkusd", "hal": "halcyon", "prvs": "previse", "lkt": "lukutex", "wfx": "webflix", "fnk": "funkeypay", "nld": "newland", "bool": "boolean", "htc": "hitcoin", "aglt": "agrolot", "chrt": "charity", "mnr": "mineral", "ree": "reecoin", "sola": "solarys", "opc": "op-coin", "seko": "sekopay", "pusd": "pegsusd", "mql": "miraqle", "spike": "spiking", "odex": "one-dex", "rtk": "ruletka", "gbt": "gulf-bits-coin", "onelink": "onelink", "cha": "chaucha", "digi": "digible", "sjw": "sjwcoin", "dswap": "definex", "kurt": "kurrent", "gsm": "gsmcoin", "flexusd": "flex-usd", "sup8eme": "sup8eme", "yplt": "yplutus", "hamtaro": "hamtaro", "onigiri": "onigiri", "eeth": "eos-eth", "tronish": "tronish", "eag": "ea-coin", "cctc": "cctcoin", "ape": "apecoin", "youc": "youcash", "sto": "storeum", "tcfx": "tcbcoin", "trm": "tranium", "aby": "artbyte", "admn": "adioman", "hitx": "hithotx", "kuv": "kuverit", "ael": "aelysir", "xemx": "xeniumx", "bnk": "bankera", "xfyi": "xcredit", "bdo": "bdollar", "safebtc": "safebtc", "ibh": "ibithub", "rx": "raven-x", "rlz": "relianz", "ala": "aladiex", "sap": "swaap-stablecoin", "prv": "privacy", "mapc": "mapcoin", "trl": "trolite", "oto": "otocash", "sum": "sumcoin", "tlc": "tl-coin", "gaj": "polygaj", "wsote": "soteria", "taud": "trueaud", "ausc": "auscoin", "ethp": "ethplus", "trbt": "tribute", "bixcpro": "bixcpro", "mpt": "metal-packaging-token", "ohmc": "ohm-coin", "w3b": "w3bpush", "jdc": "jd-coin", "wyx": "woyager", "onevbtc": "onevbtc", "ril": "rilcoin", "ekt": "educare", "baxs": "boxaxis", "lc4": "leocoin", "vnl": "vanilla", "tshp": "12ships", "bup": "buildup", "addy": "adamant", "mora": "meliora", "lmo": "lumeneo", "hawk": "hawkdex", "cyfm": "cyberfm", "enu": "enumivo", "mak": "makcoin", "cop": "copiosa", "zig": "zignaly", "mimatic": "mimatic", "xph": "phantom", "nyex": "nyerium", "dmc": "decentralized-mining-exchange", "cid": "cryptid", "xyz": "jetmint", "prophet": "prophet", "mesh": "meshbox", "x0z": "zerozed", "bignite": "bignite", "pshp": "payship", "bnp": "benepit", "zdx": "zer-dex", "cmg": "cmgcoin", "csp": "caspian", "fra": "findora", "wcx": "wecoown", "ktc": "kitcoin", "betxc": "betxoin", "ubomb": "unibomb", "cruz": "cruzbit", "kyan": "kyanite", "ctl": "citadel", "swin": "swinate", "fey": "feyorra", "our": "our-pay", "yok": "yokcoin", "marks": "bitmark", "twee": "tweebaa", "vro": "veraone", "mlm": "mktcoin", "b2c": "b2-coin", "lar": "linkart", "i9c": "i9-coin", "clb": "clbcoin", "bonfire": "bonfire", "bono": "bonorum-coin", "bin": "binarium", "arts": "artista", "wire": "wire", "smdx": "somidax", "ents": "eunomia", "ttt": "the-transfer-token", "mel": "caramelswap", "palg": "palgold", "b2b": "b2bcoin-2", "ecp": "ecp-technology", "sam": "samurai", "ix": "x-block", "msb": "magic-e-stock", "laq": "laq-pay", "vana": "nirvana", "tgbp": "truegbp", "mnmc": "mnmcoin", "m": "m-chain", "peer": "unilord", "ugd": "unigrid", "nug": "nuggets", "bfic": "bficoin", "swat": "swtcoin", "vspacex": "vspacex", "fnax": "fnaticx", "kal": "kaleido", "bte": "btecoin", "bliq": "bliquid", "iti": "iticoin", "xxa": "ixinium", "cpz": "cashpay", "rech": "rechain", "won": "weblock", "zik": "zik-token", "sprts": "sprouts", "aba": "ecoball", "trop": "interop", "lyra": "scrypta", "xscr": "securus", "buz": "buzcoin", "afrox": "afrodex", "psy": "psychic", "xbg": "bitgrin", "kfc": "chicken", "tfd": "etf-dao", "fn": "filenet", "fk": "fk-coin", "ebase": "eurbase", "land": "new-landbox", "pyn": "paycent", "cnx": "cryptonex", "rap": "rapture", "kian": "kianite", "mttcoin": "mttcoin", "drk": "drakoin", "zum": "zum-token", "bgc": "be-gaming-coin", "vtar": "vantaur", "fat": "tronfamily", "c3": "charli3", "bscgold": "bscgold", "rhegic2": "rhegic2", "thkd": "truehkd", "ift": "iftoken", "sdgo": "sandego", "unos": "unoswap", "exp": "exchange-payment-coin", "wxc": "wiix-coin", "btrn": "biotron", "bitc": "bitcash", "lthn": "intensecoin", "brat": "brother", "pqt": "prediqt", "satoz": "satozhi", "eum": "elitium", "hmr": "homeros", "graph": "unigraph", "ic": "ignition", "ea": "ea-token", "aht": "ahatoken", "lxmt": "luxurium", "polystar": "polystar", "pxg": "playgame", "hpot": "hash-pot", "cross": "crosspad", "big": "thebigcoin", "imx": "impermax", "azrx": "aave-zrx-v1", "omniunit": "omniunit", "lol": "emogi-network", "gldx": "goldnero", "mo": "morality", "bigo": "bigo-token", "meet": "coinmeet", "tagr": "tagrcoin", "abat": "aave-bat-v1", "bkkg": "biokkoin", "lf": "linkflow", "svb": "sendvibe", "riskmoon": "riskmoon", "hta": "historia", "hdao": "hyperdao", "mne": "minereum", "yda": "yadacoin", "oxo": "oxo-farm", "nan": "nantrade", "torro": "bittorro", "csx": "coinstox", "bag": "blockchain-adventurers-guild", "safemoon": "safemoon", "busy": "busy-dao", "owdt": "oduwausd", "koko": "kokoswap", "jrc": "finchain", "tkm": "thinkium", "bnv": "benative", "zg": "zg", "fll": "feellike", "bsc": "bitsonic-token", "gasg": "gasgains", "scol": "scolcoin", "vn": "vice-network", "nia": "nia-token", "moonstar": "moonstar", "uca": "uca", "gpu": "gpu-coin", "bell": "bellcoin", "ndn": "ndn-link", "cadc": "cad-coin", "eswa": "easyswap", "solarite": "solarite", "pure": "puriever", "runes": "runebase", "ecoc": "ecochain", "usdf": "new-usdf", "pswap": "porkswap", "qbit": "qubitica", "bfl": "bitflate", "xrp-bf2": "xrp-bep2", "icol": "icolcoin", "mmda": "pokerain", "gom2": "gomoney2", "bmj": "bmj-master-nodes", "isr": "insureum", "fly": "franklin", "mci": "mci-coin", "ttc": "thetimeschaincoin", "lime": "limeswap", "prtcle": "particle-2", "akc": "akikcoin", "sh": "super-hero", "eds": "endorsit", "izi": "izichain", "b2g": "bitcoiin", "shit": "shitcoin-token", "hca": "harcomia", "trix": "triumphx", "wit": "witchain", "amkr": "aave-mkr-v1", "ziti": "ziticoin", "tv": "ti-value", "hana": "hanacoin", "asnx": "aave-snx-v1", "nsr": "nushares", "rvmt": "rivemont", "zyn": "zynecoin", "stash": "bitstash-marketplace", "job": "jobchain", "lvn": "livenpay", "bca": "bitcoin-atom", "llt": "lifeline", "lpl": "linkpool", "enk": "enkronos", "opnn": "opennity", "comfi": "complifi", "jobs": "jobscoin", "fts": "fortress", "cirq": "cirquity", "rdct": "rdctoken", "alr": "alacrity", "xmm": "momentum", "airx": "aircoins", "hl": "hl-chain", "dxc": "dex-trade-coin", "inrt": "inrtoken", "wage": "philscurrency", "tmed": "mdsquare", "ap3": "ap3-town", "fastmoon": "fastmoon", "srnt": "serenity", "ixt": "insurex", "xbs": "bitstake", "adai": "aave-dai-v1", "cqt": "covalent", "tuna": "tunacoin", "topc": "topchain", "bln": "blacknet", "bizz": "bizzcoin", "moonshot": "moonshot", "aim": "ai-mining", "mojo": "mojocoin", "elongate": "elongate", "nvc": "novacoin", "trn": "tronnodes", "btshk": "bitshark", "plf": "playfuel", "spiz": "space-iz", "moto": "motocoin", "amo": "amodule-network", "0xmr": "0xmonero", "aknc": "aave-knc-v1", "libertas": "libertas-token", "eti": "etherinc", "yfim": "yfimobi", "gcash": "gamecash", "char": "charitas", "mbs": "micro-blood-science", "meetone": "meetone", "palt": "palchain", "ocb": "blockmax", "song": "songcoin", "lion": "coinlion", "ape$": "ape-punk", "vip": "limitless-vip", "auop": "opalcoin", "mnd": "mindcoin", "mkcy": "markaccy", "bcx": "bitcoinx", "prs": "pressone", "yfr": "youforia", "moonmoon": "moonmoon", "gix": "goldfinx", "slrm": "solareum", "sine": "sinelock", "pcl": "peculium", "ple": "plethori", "blu": "bluecoin", "slc": "support-listing-coin", "ethpy": "etherpay", "ino": "ino-coin", "lst": "lendroid-support-token", "trusd": "trustusd", "alp": "alp-coin", "goc": "eligma", "yts": "yetiswap", "alh": "allohash", "aya": "aryacoin", "rage": "rage-fan", "trad": "tradcoin", "vps": "vipo-vps", "aswap": "arbiswap", "leaf": "leafcoin", "i9x": "i9x-coin", "lvl": "levelapp", "trex": "trexcoin", "tar": "tartarus", "cx": "circleex", "eva": "eva-coin", "xqn": "quotient", "disk": "darklisk", "mes": "meschain", "ltg": "litegold", "nort": "northern", "btcx": "bitcoinx-2", "npo": "npo-coin", "agn": "agricoin", "jrex": "jurasaur", "pxi": "prime-xi", "homi": "homihelp", "timec": "time-coin", "txc": "tenxcoin", "zne": "zonecoin", "bsp": "ballswap", "fch": "fanaticos-cash", "lips": "lipchain", "wpt": "worldpet", "pos": "pos-coin", "cash": "litecash", "bcna": "bitcanna", "18c": "block-18", "blvr": "believer", "ayfi": "ayfi", "coom": "coomcoin", "bio": "biocrypt", "pine": "pinecoin", "daft": "daftcoin", "botx": "botxcoin", "bela": "belacoin", "cim": "coincome", "gfun": "goldfund-ico", "tnr": "tonestra", "mbonk": "megabonk", "myfi": "myfichain", "vela": "vela", "cats": "catscoin", "tacocat": "taco-cat", "dfk": "defiking", "mrch": "merchdao", "l3p": "lepricon", "edgt": "edgecoin-2", "hypebet": "hype-bet", "bnw": "nagaswap", "svn": "7finance", "fomp": "fompound", "trp": "tronipay", "izer": "izeroium", "nemo": "nemocoin", "cmit": "cmitcoin", "tarm": "armtoken", "plat": "bitguild", "ants": "fireants", "yep": "yep-coin", "dgw": "digiwill", "vns": "va-na-su", "foxd": "foxdcoin", "club": "clubcoin", "treat": "treatdao", "bbt": "blockbase", "kva": "kevacoin", "stol": "stabinol", "znc": "zioncoin", "guss": "guss-one", "plbt": "polybius", "nawa": "narwhale", "hburn": "hypeburn", "stpc": "starplay", "kok": "kok-coin", "bnana": "banana-token", "nss": "nss-coin", "poke": "pokeball", "ragna": "ragnarok", "gldy": "buzzshow", "cali": "calicoin", "adl": "adelphoi", "bpp": "bitpower", "orly": "orlycoin", "miro": "mirocana", "zpay": "zantepay", "erowan": "sifchain", "bpcn": "blipcoin", "ytv": "ytv-coin", "rice": "riceswap", "ntrs": "nosturis", "pok": "poker-io", "sng": "sinergia", "zuka": "zukacoin", "szc": "zugacoin", "wiz1": "wiz-coin", "nuko": "nekonium", "bwt": "bittwatt", "gram": "gram", "pact": "packswap", "sapp": "sappchain", "wtip": "worktips", "upl": "uploadea", "swsh": "swapship", "vlm": "valireum", "uty": "unitydao", "exmr": "exmr-monero", "bee": "bee-coin", "kdag": "kdag", "fren": "frenchie", "qbz": "queenbee", "bith": "bithachi", "art": "maecenas", "payb": "paybswap", "ijc": "ijascoin", "fraction": "fraction", "vrap": "veraswap", "tatm": "tron-atm", "xind": "indinode", "d100": "defi-100", "xgk": "goldkash", "ddtg": "davecoin", "black": "blackhole-protocol", "ftn": "fountain", "dhd": "dhd-coin", "xln": "lunarium", "prdz": "predictz", "pdex": "polkadex", "syl": "xsl-labs", "api": "the-apis", "isal": "isalcoin", "dgl": "dgl-coin", "html": "htmlcoin", "nicheman": "nicheman", "marx": "marxcoin", "blowf": "blowfish", "bsn": "bastonet", "rnb": "rentible", "pvg": "pilnette", "kali": "kalicoin", "vlk": "vulkania", "polydoge": "polydoge", "100x": "100x-coin", "nvzn": "invizion", "guap": "guapcoin", "gze": "gazecoin", "nmt": "novadefi", "mxw": "maxonrow", "saga": "sagacoin", "prime": "primedao", "ctt": "castweet", "tep": "tepleton", "ubn": "ubricoin", "aenj": "aave-enj-v1", "xgs": "genesisx", "pti": "paytomat", "weed": "weedcash", "b2u": "b2u-coin", "defy": "defy-farm", "lby": "libonomy", "dyx": "xcoinpay", "log": "woodcoin", "aren": "aave-ren-v1", "btcl": "btc-lite", "wdf": "wildfire", "mbbased": "moonbase", "zuc": "zeuxcoin", "windy": "windswap", "nole": "nolecoin", "neex": "neexstar", "ogods": "gotogods", "sym": "symverse", "ri": "ri-token", "naz": "naz-coin", "hibs": "hiblocks", "mig": "migranet", "ank": "apple-network", "stb": "starblock", "bspay": "brosispay", "tls": "tls-token", "sdao": "solar-dao", "forex": "forexcoin", "scurve": "lp-scurve", "naut": "astronaut", "fyznft": "fyznft", "rth": "rotharium", "4art": "4artechnologies", "vt": "vectoraic", "torq": "torq-coin", "long": "long-coin", "amsk": "nolewater", "loto": "lotoblock", "hapy": "hapy-coin", "hpc": "happycoin", "skc": "skinchain", "sports": "zensports", "omc": "ormeus-cash", "bash": "luckchain", "mcau": "meld-gold", "intx": "intexcoin", "eubc": "eub-chain", "maya": "maya-coin", "bxt": "bitfxt-coin", "navy": "boatpilot", "sybc": "sybc-coin", "asac": "asac-coin", "tea": "tea-token", "fullsend": "full-send", "hejj": "hedge4-ai", "hgh": "hgh-token", "gsmt": "grafsound", "ira": "deligence", "odc": "odinycoin", "psix": "propersix", "bnc": "bnoincoin", "twi": "trade-win", "pazzi": "paparazzi", "laika": "laikacoin", "okt": "okexchain", "awbtc": "aave-wbtc-v1", "hpy": "hyper-pay", "$king": "king-swap", "fcr": "fromm-car", "stc": "coinstarter", "lfc": "linfinity", "vlt": "bankroll-vault", "ausdc": "aave-usdc-v1", "ship": "shipchain", "mzg": "moozicore", "vsxp": "venus-sxp", "vestx": "vestxcoin", "cxp": "caixa-pay", "pvm": "privateum", "cpx": "coinxclub", "mw": "mirror-world-token", "pbase": "polkabase", "asusd": "aave-susd-v1", "stro": "supertron", "homt": "hom-token", "ycurve": "curve-fi-ydai-yusdc-yusdt-ytusd", "ims": "ims-wallet", "now": "changenow-token", "xbe": "xbe-token", "duk+": "dukascoin", "vxrp": "venus-xrp", "nnb": "nnb-token", "spk": "sparks", "zupi": "zupi-coin", "dph": "digipharm", "crm": "cream", "niu": "niubiswap", "lsh": "leasehold", "pgc": "pegascoin", "jfin": "jfin-coin", "ecos": "ecodollar", "vect": "vectorium", "hmnc": "humancoin-2", "pton": "foresting", "sendwhale": "sendwhale", "dsc": "data-saver-coin", "yfiig": "yfii-gold", "mic3": "mousecoin", "vxvs": "venus-xvs", "alink": "aave-link-v1", "dch": "doch-coin", "nuvo": "nuvo-cash", "xpb": "transmute", "zash": "zimbocash", "7add": "holdtowin", "eqz": "equalizer", "fgc": "fantasy-gold", "hoo": "hoo-token", "yap": "yap-stone", "1gold": "1irstgold", "ani": "anime-token", "stzen": "stakedzen", "ecl": "eclipseum", "uba": "unbox-art", "safetoken": "safetoken", "dfi": "defichain", "safecomet": "safecomet", "cbrl": "cryptobrl", "qbc": "quebecoin", "slv": "silverway", "curry": "curryswap", "mtp": "multiplay", "ausdt": "aave-usdt-v1", "ltz": "litecoinz", "bitb": "bitcoin-bull", "pbs": "pbs-chain", "tcr": "tecracoin", "xscp": "scopecoin", "mgc": "magnachain", "gre": "greencoin", "lbd": "linkbased", "stxem": "stakedxem", "isdt": "istardust", "dfc": "deflacash", "pdao": "panda-dao", "dkkt": "dkk-token", "vdot": "venus-dot", "eland": "etherland", "amana": "aave-mana-v1", "limit": "limitswap", "awg": "aurusgold", "hvt": "hirevibes", "bots": "bot-ocean", "fsp": "flashswap", "dlx": "dapplinks", "mytv": "mytvchain", "entrc": "entercoin", "cbr": "cybercoin", "kanda": "telokanda", "ret": "realtract", "pcb": "451pcbcom", "spdx": "spender-x", "mch": "meconcash", "au": "aurumcoin", "gc": "galaxy-wallet", "gera": "gera-coin", "rew": "rewardiqa", "tco": "tcoin-fun", "xwo": "wooshcoin-io", "andes": "andes-coin", "esti": "easticoin", "dpc": "dappcents", "c8": "carboneum", "abc": "abc-chain", "fuzz": "fuzzballs", "hss": "hashshare", "crt": "carr-finance", "betc": "bet-chips", "solo": "solo-coin", "bixb": "bixb-coin", "rc20": "robocalls", "capp": "crypto-application-token", "trump": "trumpcoin", "mswap": "moneyswap", "pfid": "pofid-dao", "dfgl": "defi-gold", "lov": "lovechain", "ara": "ara-token", "cach": "cachecoin", "qnc": "qnodecoin", "rpepe": "rare-pepe", "hebe": "hebeblock", "hint": "hintchain", "xtnc": "xtendcash", "spaz": "swapcoinz", "mtcn": "multiven", "tknt": "tkn-token", "cell": "cellframe", "vusd": "value-usd", "bravo": "bravo-coin", "vgtg": "vgtgtoken", "wifi": "wifi-coin", "carr": "carnomaly", "agvc": "agavecoin", "nanox": "project-x", "shpp": "shipitpro", "ez": "easyfi", "kong": "kong-defi", "ete": "ethercoin-2", "dexa": "dexa-coin", "kick": "kickico", "miks": "miks-coin", "bgl": "bitgesell", "shd": "shardingdao", "bbank": "blockbank", "fomo": "fomo-labs", "lemo": "lemochain", "blfi": "blackfisk", "lmch": "latamcash", "coal": "coalculus", "dream": "dream-swap", "ick": "ick-mask", "nsd": "nasdacoin", "mvh": "moviecash", "fmt": "finminity", "arnxm": "armor-nxm", "lbt": "lbt-chain", "bitci": "bitcicoin", "moontoken": "moontoken", "vnt": "inventoryclub", "poll": "clearpoll", "pdai": "prime-dai", "pass": "passport-finance", "thrn": "thorncoin", "aab": "aax-token", "kishu": "kishu-inu", "layerx": "unilayerx", "ryiu": "ryi-unity", "koel": "koel-coin", "clbk": "cloudbric", "coshi": "coshi-inu", "boltt": "boltt-coin", "psk": "pool-of-stake", "rrb": "renrenbit", "lbet": "lemon-bet", "wpp": "wpp-token", "lama": "llamaswap", "611": "sixeleven", "grlc": "garlicoin", "nar": "nar-token", "sdfi": "stingdefi", "mptc": "mnpostree", "vfil": "venus-fil", "qtf": "quantfury", "pwrb": "powerbalt", "wtn": "waletoken", "dgp": "dgpayment", "akita": "akita-inu", "cnt": "centurion", "lland": "lyfe-land", "orbi": "orbicular", "hntc": "hntc-energy-distributed-network", "vltc": "venus-ltc", "nana": "ape-tools", "bazt": "baooka-token", "abusd": "aave-busd-v1", "lburst": "loanburst", "mochi": "mochiswap", "eup": "eup-chain", "cate": "cash-tech", "egc": "ecog9coin", "argp": "argenpeso", "opti": "optitoken", "fsafe": "fair-safe", "vbtc": "venus-btc", "ltk": "litecoin-token", "hfil": "huobi-fil", "bna": "bananatok", "bito": "bito-coin", "gmci": "game-city", "ouro": "ouroboros", "ball": "ball-coin", "atusd": "aave-tusd-v1", "lir": "letitride", "vdai": "venus-dai", "btcr": "bitcurate", "kuky": "kuky-star", "sfg": "s-finance", "bnz": "bonezyard", "minty": "minty-art", "xby": "xtrabytes", "pivxl": "pivx-lite", "honk": "honk-honk", "ponzi": "ponzicoin", "dynge": "dyngecoin", "bucks": "swagbucks", "dic": "daikicoin", "mbit": "mbitbooks", "vxc": "vinx-coin", "mbm": "mbm-token", "it": "idc-token", "bun": "bunnycoin", "xtg": "xtg-world", "ume": "ume-token", "silk": "silkchain", "lgold": "lyfe-gold", "vjc": "venjocoin", "scs": "speedcash", "hlp": "help-coin", "tdps": "tradeplus", "fex": "fidex-exchange", "etx": "ethereumx", "nmst": "nms-token", "drgb": "dragonbit", "bns": "bns-token", "bchc": "bitcherry", "repo": "repo", "chess": "chesscoin-0-32", "payt": "payaccept", "ksc": "kstarcoin", "nter": "nter", "curve": "curvehash", "pxl": "piction-network", "glov": "glovecoin", "swise": "stakewise", "apis": "apis-coin", "vany": "vanywhere", "krill": "polywhale", "newos": "newstoken", "eost": "eos-trust", "bmh": "blockmesh-2", "ect": "superedge", "vega": "vega-coin", "hub": "minter-hub", "ons": "one-share", "fastx": "transfast", "hypr": "hyperburn", "skn": "sharkcoin", "beast": "beast-dao", "eplus": "epluscoin", "xamp": "antiample", "bolc": "boliecoin", "exm": "exmo-coin", "tree": "tree-defi", "eto": "essek-tov", "hxy": "hex-money", "fldt": "fairyland", "acsi": "acryptosi", "xwc": "whitecoin", "btnt": "bitnautic", "bnx": "bnx", "bbx": "ballotbox", "jdi": "jdi-token", "lv": "lendchain", "uniusd": "unidollar", "pegs": "pegshares", "ns": "nodestats", "crd": "cryptaldash", "deal": "idealcash", "agri": "agrinovuscoin", "stxym": "stakedxym", "grg": "rigoblock", "pump": "pump-coin", "swet": "swe-token", "gol": "gogolcoin", "creva": "crevacoin", "clm": "coinclaim", "thr": "thorecoin", "sloth": "slothcoin", "scu": "securypto", "ramen": "ramenswap", "btzc": "beatzcoin", "bct": "bitcoin-trust", "erz": "earnzcoin", "inst": "instadapp", "evy": "everycoin", "dbtc": "decentralized-bitcoin", "love": "love-coin", "2248": "2-2-4-4-8", "pocc": "poc-chain", "vest": "vestchain", "nokn": "nokencoin", "asn": "ascension", "rtm": "raptoreum", "bali": "balicoin", "bxh": "bxh", "gbk": "goldblock", "more": "legends-room", "iai": "iai-token", "ba": "batorrent", "candybox": "candy-box", "bak": "baconcoin", "shib": "shiba-inu", "ezpay": "eazypayza", "eswap": "eswapping", "rld": "real-land", "nplc": "plus-coin", "kashh": "kashhcoin", "vbch": "venus-bch", "dna": "metaverse-dualchain-network-architecture", "light": "lightning-protocol", "ich": "ideachain", "newton": "newtonium", "tzt": "tanzanite", "xrge": "rougecoin", "idl": "idl-token", "yfe": "yfe-money", "ato": "eautocoin", "mvc": "mileverse", "whl": "whaleroom", "save": "save-token-us", "city": "city-coin", "flc": "flowchaincoin", "cbet": "cryptobet", "bnfi": "blaze-defi", "fscc": "fisco", "rcube": "retro-defi", "elt": "elite-swap", "qac": "quasarcoin", "talc": "taleshcoin", "arcee": "arcee-coin", "webn": "web-innovation-ph", "nac": "nami-trade", "clout": "blockclout", "hora": "hora", "noahark": "noah-ark", "milk": "score-milk", "tvnt": "travelnote", "rzn": "rizen-coin", "cfl": "cryptoflow", "levl": "levolution", "echo": "token-echo", "usdh": "honestcoin", "szo": "shuttleone", "deva": "deva-token", "bec": "betherchip", "pxc": "phoenixcoin", "soge": "space-hoge", "dac": "davinci-coin", "expo": "online-expo", "hgc": "higamecoin", "phn": "phillionex", "fl": "freeliquid", "xno": "xeno-token", "mbc": "microbitcoin", "sovi": "sovi-token", "dmch": "darma-cash", "vlc": "valuechain", "jcc": "junca-cash", "dt3": "dreamteam3", "ucos": "ucos-token", "co2": "collective", "gnt": "greentrust", "lstr": "meetluna", "sugar": "sugarchain", "dtop": "dhedge-top-index", "udai": "unagii-dai", "hptf": "heptafranc", "fcbtc": "fc-bitcoin", "bwx": "blue-whale", "g-fi": "gorilla-fi", "sets": "sensitrust", "ltfg": "lightforge", "clr": "color", "cp3r": "compounder", "stt": "scatter-cx", "bhd": "bitcoin-hd", "yea": "yeafinance", "kswap": "kimchiswap", "cbex": "cryptobexchange", "rocket": "rocketgame", "brze": "breezecoin", "qhc": "qchi-chain", "vx": "vitex", "icr": "intercrone", "sv7": "7plus-coin", "aca": "acash-coin", "zaif": "zaif-token", "she": "shinechain", "soil": "synth-soil", "tgn": "terragreen", "xpt": "cryptobuyer-token", "rope": "rope-token", "tokc": "tokyo", "dvc": "dragonvein", "kxc": "kingxchain", "divo": "divo-token", "yta": "yottacoin", "kub": "kublaicoin", "lce": "lance-coin", "crn": "chronocoin", "spup": "spurt-plus", "coral": "coral-swap", "basid": "basid-coin", "lvh": "lovehearts", "eurx": "etoro-euro", "cl": "coinlancer", "slam": "slam-token", "xpn": "pantheon-x", "vlink": "venus-link", "vdoge": "venus-doge", "grw": "growthcoin", "hungry": "hungrybear", "bmch": "bmeme-cash", "noiz": "noiz-chain", "dapp": "dapp", "itam": "itam-games", "cyf": "cy-finance", "scm": "simulacrum", "crl": "coral-farm", "usds": "stableusd", "brmv": "brmv-token", "syfi": "soft-yearn", "ebsp": "ebsp-token", "mob": "mobilecoin", "uze": "uze-token", "nftl": "nftl-token", "brcp": "brcp-token", "tronx": "tronx-coin", "ivy": "ivy-mining", "ygoat": "yield-goat", "mad": "mad-network", "usdb": "usd-bancor", "zest": "thar-token", "stfiro": "stakehound", "comfy": "comfytoken", "escx": "escx-token", "ist": "ishop-token", "rupee": "hyruleswap", "cntm": "connectome", "cyt": "cryptokenz", "spacedoge": "space-doge", "jic": "joorschain", "drep": "drep-new", "akm": "cost-coin", "enrg": "energycoin", "frmx": "frmx-token", "fundx": "funder-one", "oc": "oceanchain", "ypanda": "yieldpanda", "hcs": "help-coins", "vbusd": "venus-busd", "tfuel": "theta-fuel", "lrg": "largo-coin", "jaguar": "jaguarswap", "bsg": "bitsonic-gas", "spring": "springrole", "elama": "elamachain", "when": "when-token", "iown": "iown", "grow": "growing-fi", "mgp": "mangochain", "vegi": "veggiecoin", "bicas": "bithercash", "sox": "ethersocks", "mongocm": "mongo-coin", "uvu": "ccuniverse", "gpkr": "gold-poker", "hedg": "hedgetrade", "os76": "osmiumcoin", "wdt": "voda-token", "hyp": "hyperstake", "kim": "king-money", "beer": "beer-token", "$g": "gooddollar", "robo": "robo-token", "zarh": "zarcash", "micro": "micromines", "btcbam": "bitcoinbam", "isp": "ishop-plus", "yfi3": "yfi3-money", "feta": "feta-token", "ecpn": "ecpntoken", "ybear": "yield-bear", "robet": "robet-coin", "bynd": "beyondcoin", "vbeth": "venus-beth", "zlf": "zillionlife", "fuze": "fuze-token", "cnyt": "cny-tether", "bnox": "blocknotex", "ggive": "globalgive", "dandy": "dandy", "trv": "trustverse", "soak": "soak-token", "yfms": "yfmoonshot", "xrd": "raven-dark", "dain": "dain-token", "fto": "futurocoin", "csc": "casinocoin", "ntb": "tokenasset", "ykz": "yakuza-dao", "baby": "baby-token", "elet": "ether-legends", "brc": "baer-chain", "btsucn": "btsunicorn", "speed": "speed-coin", "colx": "colossuscoinxt", "cicc": "caica-coin", "roul": "roul-token", "qtv": "quish-coin", "cron": "cryptocean", "hum": "humanscape", "smartworth": "smartworth", "kt": "kuaitoken", "rich": "richway-finance", "tiim": "triipmiles", "nva": "neeva-defi", "gcx": "germancoin", "konj": "konjungate", "tune": "tune-token", "ktv": "kmushicoin", "hart": "hara-token", "invc": "investcoin", "ogc": "onegetcoin", "torj": "torj-world", "kgw": "kawanggawa", "ddr": "digi-dinar", "chs": "chainsquare", "vsc": "vsportcoin", "ecto": "ectoplasma", "ethsc": "ethereumsc", "olive": "olivecash", "safegalaxy": "safegalaxy", "kiz": "kizunacoin", "harta": "harta-tech", "cennz": "centrality", "zcnox": "zcnox-coin", "jt": "jubi-token", "ami": "ammyi-coin", "trib": "contribute", "lof": "lonelyfans", "xbrt": "bitrewards", "evny": "evny-token", "nah": "strayacoin", "bamboo": "bamboo-token-2", "plc": "platincoin", "jgn": "juggernaut", "carbon": "carboncoin", "chex": "chex-token", "ncat": "nyan-cat", "beluga": "belugaswap", "gp": "goldpieces", "pod": "payment-coin", "bcnt": "bincentive", "espro": "esportspro", "cng": "cng-casino", "nxl": "next-level", "bkk": "bkex-token", "c4t": "coin4trade", "gfarm": "gains-farm", "csm": "consentium", "crex": "crex-token", "rview": "reviewbase", "sprtz": "spritzcoin", "grn": "dascoin", "tuber": "tokentuber", "bab": "basis-bond", "ain": "ai-network", "roe": "rover-coin", "lnko": "lnko-token", "vprc": "vaperscoin", "nacho": "nacho-coin", "db": "darkbuild-v2", "doos": "doos-token", "tavitt": "tavittcoin", "soda": "soda-token", "gm": "gmcoin", "jack": "jack-token", "smg": "smaugs-nft", "rain": "rain-network", "refraction": "refraction", "fotc": "forte-coin", "tons": "thisoption", "mima": "kyc-crypto", "ltn": "life-token", "daa": "double-ace", "soba": "soba-token", "mexc": "mexc-token", "bff": "bitcoffeen", "cent": "centercoin", "ueth": "unagii-eth", "snowge": "snowgecoin", "euru": "upper-euro", "yfmb": "yfmoonbeam", "erc": "europecoin", "ctcn": "contracoin", "yfis": "yfiscurity", "stkr": "staker-dao", "shark": "sharkyield", "dtube": "dtube-coin", "vusdt": "venus-usdt", "cosm": "cosmo-coin", "yland": "yearn-land", "sg": "social-good-project", "vusdc": "venus-usdc", "ping": "cryptoping", "flt": "fluttercoin", "gb": "goldblocks", "pmp": "pumpy-farm", "stlp": "tulip-seed", "icicb": "icicb-coin", "dscp": "disciplina-project-by-teachmeplease", "tsx": "tradestars", "cmm": "commercium", "ctc": "culture-ticket-chain", "rwn": "rowan-coin", "sos": "solstarter", "rmoon": "rocketmoon", "ski": "skillchain", "kfi": "klever-finance", "lbr": "liber-coin", "fmta": "fundamenta", "coic": "coic", "gio": "graviocoin", "osc": "oasis-city", "fgp": "fingerprint", "wbnb": "wbnb", "genes": "genes-chain", "md+": "moon-day-plus", "fbt": "fanbi-token", "wleo": "wrapped-leo", "svc": "satoshivision-coin", "hiz": "hiz-finance", "ssn": "superskynet", "dcy": "dinastycoin", "dgc": "digitalcoin", "memes": "memes-token", "lsv": "litecoin-sv", "ocp": "omni-consumer-protocol", "iog": "playgroundz", "tut": "trust-union", "party": "money-party", "pbom": "pocket-bomb", "ctrfi": "chestercoin", "zerc": "zeroclassic", "f1c": "future1coin", "emoji": "emojis-farm", "yff": "yff-finance", "yo": "yobit-token", "gnto": "goldenugget", "fans": "unique-fans", "gbpu": "upper-pound", "ert": "eristica", "gpyx": "pyrexcoin", "pint": "pub-finance", "mcn": "moneta-verde", "sss": "simple-software-solutions", "ttm": "tothe-moon", "mdao": "martian-dao", "samo": "samoyedcoin", "drg": "dragon-coin", "dt": "dcoin-token", "name": "polkadomain", "fyy": "grandpa-fan", "orc": "oracle-system", "yfarm": "yfarm-token", "lnt": "lottonation", "navi": "natus-vincere-fan-token", "qark": "qanplatform", "q8e20": "q8e20-token", "rc": "russell-coin", "htdf": "orient-walt", "try": "try-finance", "bccx": "bitconnectx-genesis", "cbank": "crypto-bank", "carb": "carbon-labs", "jbp": "jb-protocol", "punk-zombie": "punk-zombie", "bolo": "bollo-token", "cbucks": "cryptobucks", "hdac": "hdac", "kyf": "kryptofranc", "ioox": "ioox-system", "wemix": "wemix-token", "pola": "polaris-share", "kip": "khipu-token", "jnb": "jinbi-token", "fetish": "fetish-coin", "cdash": "crypto-dash", "xchf": "cryptofranc", "tkc": "token-planets", "808ta": "808ta-token", "kili": "kilimanjaro", "wgp": "w-green-pay", "ytho": "ytho-online", "aws": "aurus-silver", "zln": "zillioncoin", "spkl": "spoklottery", "inbox": "inbox-token", "famous": "famous-coin", "punk-attr-4": "punk-attr-4", "fed": "fedora-gold", "fred": "fredenergy", "yoo": "yoo-ecology", "mc": "monkey-coin", "bgx": "bitcoingenx", "but": "bitup-token", "dltx": "deltaexcoin", "dili": "d-community", "sipc": "simplechain", "hland": "hland-token", "xrpc": "xrp-classic", "god": "bitcoin-god", "zbk": "zbank-token", "hxn": "havens-nook", "proud": "proud-money", "dnd": "dungeonswap", "nst": "newsolution", "gly": "glyph-token", "bscs": "bsc-station", "baw": "wab-network", "trias": "trias-token", "cfxq": "cfx-quantum", "tbake": "bakerytools", "aries": "aries-chain", "bcvt": "bitcoinvend", "gfnc": "grafenocoin-2", "live": "tronbetlive", "berg": "bergco-coin", "liq": "liquidity-bot-token", "sarco": "sarcophagus", "node": "whole-network", "treep": "treep-token", "cca": "counos-coin", "cbp": "cashbackpro", "vollar": "vollar", "bdcc": "bitica-coin", "munch": "munch-token", "pkp": "pikto-group", "hdn": "hidden-coin", "hrd": "hrd", "bvnd": "binance-vnd", "trxc": "tronclassic", "ctat": "cryptassist", "punk-female": "punk-female", "dfe": "dfe-finance", "armx": "armx-unidos", "mkb": "maker-basic", "btd": "bolt-true-dollar", "scn": "silver-coin", "tlnt": "talent-coin", "dxy": "dxy-finance", "clva": "clever-defi", "solace": "solace-coin", "dbund": "darkbundles", "pet": "battle-pets", "minx": "innovaminex", "tom": "tom-finance", "mveda": "medicalveda", "bnj": "binjit-coin", "tfg1": "energoncoin", "vcash": "vcash-token", "btour": "btour-chain", "mrx": "linda", "viking": "viking-swap", "panther": "pantherswap", "zac": "zac-finance", "supra": "supra-token", "mti": "mti-finance", "kassiahome": "kassia-home", "bridge": "multibridge", "bobt": "boboo-token", "xpd": "petrodollar", "rkt": "rocket-fund", "xbn": "xbn", "ghd": "giftedhands", "pox": "pollux-coin", "rugbust": "rug-busters", "stax": "stablexswap", "hwi": "hawaii-coin", "zcrt": "zcore-token", "porte": "porte-token", "lsilver": "lyfe-silver", "aidus": "aidus", "dfm": "defi-on-mcw", "tsla": "tessla-coin", "wheat": "wheat-token", "etf": "entherfound", "tbcc": "tbcc-wallet", "mello": "mello-token", "pal": "playandlike", "brb": "rabbit-coin", "zeus": "zuescrowdfunding", "wusd": "wrapped-usd", "punk-attr-5": "punk-attr-5", "env": "env-finance", "gl": "green-light", "hyd": "hydra-token", "crypl": "cryptolandy", "fc": "futurescoin", "mandi": "mandi-token", "grwi": "growers-international", "dragon": "dragon-finance", "esz": "ethersportz", "lvt": "lives-token", "nyc": "newyorkcoin", "burger": "burger-swap", "ecr": "ecredit", "dcnt": "decenturion", "mcrn": "macaronswap", "orbyt": "orbyt-token", "vd": "vindax-coin", "gldr": "golder-coin", "btcmz": "bitcoinmono", "dogdefi": "dogdeficoin", "idx": "index-chain", "coy": "coinanalyst", "jac": "jasper-coin", "remit": "remita-coin", "codeo": "codeo-token", "vida": "vidiachange", "boot": "bootleg-nft", "stark": "stark-chain", "hmc": "harmonycoin", "yfip": "yfi-paprika", "crg": "cryptogcoin", "medi": "mediconnect", "dwz": "defi-wizard", "pai": "project-pai", "pig": "pig-finance", "wsc": "wesing-coin", "nc": "nayuta-coin", "cub": "crypto-user-base", "ucr": "ultra-clear", "cscj": "csc-jackpot", "ddos": "disbalancer", "hybn": "hey-bitcoin", "earth": "earth-token", "ride": "ride-my-car", "c2o": "cryptowater", "redc": "redchillies", "beeng": "beeng-token", "marsm": "marsmission", "poodl": "poodle", "lxc": "latex-chain", "smile": "smile-token", "per": "per-project", "cf": "californium", "carom": "carillonium", "sprx": "sprint-coin", "actn": "action-coin", "bnxx": "bitcoinnexx", "cbix7": "cbi-index-7", "alc": "alrightcoin", "upb": "upbtc-token", "hg": "hygenercoin", "papel": "papel", "xqc": "quras-token", "bih": "bithostcoin", "erk": "eureka-coin", "svr": "sovranocoin", "sbgo": "bingo-share", "etna": "etna-network", "wiken": "project-with", "ttx": "talent-token", "seol": "seed-of-love", "dcw": "decentralway", "dzar": "digital-rand", "poc": "poc-blockchain", "xgc": "xiglute-coin", "orao": "orao-network", "usdu": "upper-dollar", "dixt": "dixt-finance", "chm": "cryptochrome", "obtc": "boringdao-btc", "pow": "eos-pow-coin", "kodx": "king-of-defi", "yd-eth-mar21": "yd-eth-mar21", "nxct": "xchain-token", "hokk": "hokkaidu-inu", "rckt": "rocket-token", "dff": "defi-firefly", "elyx": "elynet-token", "bbq": "barbecueswap", "pamp": "pamp-network", "xdef2": "xdef-finance", "wxtc": "wechain-coin", "earn$": "earn-network", "dcb": "digital-coin", "ubx": "ubix-network", "fshn": "fashion-coin", "loon": "loon-network", "btcu": "bitcoin-ultra", "myk": "mykonos-coin", "hate": "heavens-gate", "ymen": "ymen-finance", "skb": "sakura-bloom", "yd-btc-jun21": "yd-btc-jun21", "vkt": "vankia-chain", "sd": "smart-dollar", "lpc": "lightpaycoin", "hp": "heartbout-pay", "btap": "bta-protocol", "wec": "wave-edu-coin", "htn": "heartnumber", "yfed": "yfedfinance", "fridge": "fridge-token", "wcelo": "wrapped-celo", "tym": "timelockcoin", "mtr": "meter-stable", "cann": "cannabiscoin", "bulk": "bulk-network", "map": "marcopolo", "pyro": "pyro-network", "btca": "bitcoin-anonymous", "cet": "coinex-token", "vena": "vena-network", "alusd": "alchemix-usd", "quam": "quam-network", "gogo": "gogo-finance", "bia": "bilaxy-token", "hogl": "hogl-finance", "tyt": "tianya-token", "kbtc": "klondike-btc", "mok": "mocktailswap", "icnq": "iconiq-lab-token", "ror": "ror-universe", "mhlx": "helixnetwork", "sora": "sorachancoin", "prqboost": "parsiq-boost", "cla": "candela-coin", "noel": "noel-capital", "wet": "weshow", "bingus": "bingus-token", "vnxlu": "vnx-exchange", "fkx": "fortknoxter", "load": "load-network", "exe": "8x8-protocol", "acr": "acreage-coin", "etet": "etet-finance", "mich": "charity-alfa", "lsc": "littlesesame", "zttl": "zettelkasten", "blcc": "bullers-coin", "tst": "touch-social", "moar": "moar", "tndr": "thunder-swap", "wcc": "wincash-coin", "bcf": "bitcoin-fast", "elon": "dogelon-mars", "uc": "youlive-coin", "wst": "winsor-token", "kseed": "kush-finance", "cord": "cord-defi-eth", "dfn": "difo-network", "onex": "onex-network", "fds": "fds", "cnz": "coinzo-token", "xlmg": "stellar-gold", "mcan": "medican-coin", "balo": "balloon-coin", "sfund": "seedify-fund", "lp": "lepard-coin", "husl": "hustle-token", "ww": "wayawolfcoin", "grap": "grap-finance", "vers": "versess-coin", "cnrg": "cryptoenergy", "xts": "xaviera-tech", "isikc": "isiklar-coin", "wavax": "wrapped-avax", "btllr": "betller-coin", "soga": "soga-project", "ccrb": "cryptocarbon", "nvt": "nervenetwork", "jus": "just-network", "vcg": "vipcoin-gold", "ivc": "invoice-coin", "zep": "zeppelin-dao", "phl": "placeh", "wxdai": "wrapped-xdai", "yfos": "yfos-finance", "zuz": "zuz-protocol", "haze": "haze-finance", "yfib": "yfibalancer-finance", "butter": "butter-token", "azt": "az-fundchain", "yt": "cherry-token", "latino": "latino-token", "biot": "biopassport", "don": "donnie-finance", "yg": "yearn-global", "deuro": "digital-euro", "yape": "gorillayield", "emrx": "emirex-token", "allbi": "all-best-ico", "loa": "loa-protocol", "bic": "bitcrex-coin", "mvt": "the-movement", "syax": "staked-yaxis", "yd-eth-jun21": "yd-eth-jun21", "phoon": "typhoon-cash", "ft1": "fortune1coin", "dio": "deimos-token", "grpl": "grpl-finance-2", "mach": "mach", "moma": "mochi-market", "kper": "kper-network", "neww": "newv-finance", "unii": "unii-finance", "yfix": "yfix-finance", "spmk": "space-monkey", "saft": "safe-finance", "bbgc": "bigbang-game", "wbind": "wrapped-bind", "yd-btc-mar21": "yd-btc-mar21", "kpc": "koloop-basic", "btchg": "bitcoinhedge", "hugo": "hugo-finance", "xcon": "connect-coin", "yuno": "yuno-finance", "bcm": "bitcoinmoney", "agrs": "agoras", "esrc": "echosoracoin", "ine": "intellishare", "cops": "cops-finance", "emdc": "emerald-coin", "ethbnt": "ethbnt", "modx": "model-x-coin", "lnx": "linix", "fnb": "finexbox-token", "vlad": "vlad-finance", "eqo": "equos-origin", "ebox": "ethbox-token", "crts": "cryptotipsfr", "ryip": "ryi-platinum", "rak": "rake-finance", "gcz": "globalchainz", "tpt": "token-pocket", "trt": "taurus-chain", "1mil": "1million-nfts", "xt": "xtcom-token", "epg": "encocoinplus", "fcx": "fission-cash", "idon": "idoneus-token", "lem": "lemur-finance", "gcbn": "gas-cash-back", "lunar": "lunar-highway", "pyr": "vulcan-forged", "obsr": "observer-coin", "fam": "yefam-finance", "mngo": "mango-markets", "emont": "etheremontoken", "hx": "hyperexchange", "l2p": "lung-protocol", "vinx": "vinx-coin-sto", "scat": "sad-cat-token", "wzec": "wrapped-zcash", "wtk": "wadzpay-token", "ares": "ares-protocol", "add": "add-xyz-new", "brap": "brapper-token", "volts": "volts-finance", "xrm": "refine-medium", "water": "water-finance", "dscvr": "dscvr-finance", "hnc": "helleniccoin", "pipi": "pippi-finance", "btnyx": "bitonyx-token", "slme": "slime-finance", "blzn": "blaze-network", "geth": "guarded-ether", "ltcb": "litecoin-bep2", "yfive": "yfive-finance", "wxtz": "wrapped-tezos", "xcf": "cenfura-token", "kbond": "klondike-bond", "epk": "epik-protocol", "tcp": "the-crypto-prophecies", "dmtc": "dmtc-token", "blc": "bullionschain", "gnsh": "ganesha-token", "afin": "afin-coin", "krypto": "kryptobellion", "vancii": "vanci-finance", "wnl": "winstars", "yfst": "yfst-protocol", "brn": "brainaut-defi", "ztnz": "ztranzit-coin", "yffii": "yffii-finance", "swipe": "swipe-network", "spore": "spore-engineering", "hcut": "healthchainus", "ganja": "trees-finance", "creed": "creed-finance", "anty": "animalitycoin", "elcash": "electric-cash", "phtf": "phantom-token", "pmc": "paymastercoin", "joos": "joos-protocol", "nbs": "new-bitshares", "wae": "wave-platform", "qwla": "qawalla-token", "bhig": "buckhath-coin", "sbdo": "bdollar-share", "woop": "woonkly-power", "btf": "btf", "oac": "one-army-coin", "inb": "insight-chain", "glo": "glosfer-token", "hyfi": "hyper-finance", "gent": "genesis-token", "swusd": "swusd", "vdg": "veridocglobal", "exnx": "exenox-mobile", "torocus": "torocus-token", "b1p": "b-one-payment", "atc": "atlantic-coin", "invox": "invox-finance", "wtp": "web-token-pay", "amio": "amino-network", "halo": "halo-platform", "hosp": "hospital-coin", "atls": "atlas", "bmt": "bmchain-token", "cac": "coinall-token", "chadlink": "chad-link-set", "ytsla": "ytsla-finance", "rbtc": "rootstock", "dino": "dino-exchange", "fras": "frasindo-rent", "womi": "wrapped-ecomi", "nmn": "99masternodes", "iflt": "inflationcoin", "cp": "cryptoprofile", "xfc": "football-coin", "cdy": "bitcoin-candy", "onlexpa": "onlexpa-token", "dark": "darkbuild", "btad": "bitcoin-adult", "nash": "neoworld-cash", "tuda": "tutors-diary", "yyfi": "yyfi-protocol", "payou": "payou-finance", "froge": "froge-finance", "entrp": "hut34-entropy", "port": "packageportal", "xao": "alloy-project", "molk": "mobilink-coin", "xsm": "spectrum-cash", "gmng": "global-gaming", "wpx": "wallet-plus-x", "adf": "ad-flex-token", "prism": "prism-network", "tfc": "treasure-financial-coin", "src": "super-running-coin", "bundb": "unidexbot-bsc", "btcf": "bitcoin-final", "mxf": "mixty-finance", "bpc": "backpacker-coin", "neal": "neal", "tnet": "title-network", "scha": "schain-wallet", "bdog": "bulldog-token", "rhea": "rheaprotocol", "hc8": "hydrocarbon-8", "crwn": "crown-finance", "jtt": "joytube-token", "tai": "tai", "nfi": "norse-finance", "vcoin": "tronvegascoin", "dawn": "dawn-protocol", "hcc": "holiday-chain", "bsh": "bitcoin-stash", "luc": "play2live", "lyd": "lydia-finance", "yrise": "yrise-finance", "kombat": "crypto-kombat", "prd": "predator-coin", "ul": "uselink-chain", "ftb": "free-tool-box", "bday": "birthday-cake", "elite": "ethereum-lite", "aplp": "apple-finance", "labra": "labra-finance", "dx": "dxchain", "gts": "gt-star-token", "vgd": "vangold-token", "eyes": "eyes-protocol", "umc": "universal-marketing-coin", "mort": "dynamic-supply-tracker", "codex": "codex-finance", "cust": "custody-token", "69c": "6ix9ine-chain", "acpt": "crypto-accept", "brg": "bridge-oracle", "gpc": "greenpay-coin", "wmatic": "wmatic", "nbot": "naka-bodhi-token", "xns": "xeonbit-token", "pearl": "pearl-finance", "idt": "investdigital", "tiox": "trade-token", "gng": "gold-and-gold", "whole": "whitehole-bsc", "qcore": "qcore-finance", "most": "most-protocol", "lnk": "link-platform", "awt": "airdrop-world", "ext": "exchain", "yeth": "fyeth-finance", "stbb": "stabilize-bsc", "neuro": "neuro-charity", "pfi": "protocol-finance", "momo": "momo-protocol", "yfpro": "yfpro-finance", "gvc": "gemvault-coin", "xag": "xrpalike-gene", "aura": "aura-protocol", "btri": "trinity-bsc", "o-ocean-mar22": "o-ocean-mar22", "stakd": "stakd-finance", "fork": "gastroadvisor", "gnc": "galaxy-network", "umbr": "umbra-network", "afcash": "africunia-bank", "recap": "review-capital", "xmc": "monero-classic-xmc", "bog": "bogged-finance", "ltcu": "litecoin-ultra", "zoom": "coinzoom-token", "steak": "steaks-finance", "osm": "options-market", "gs": "genesis-shards", "ecoreal": "ecoreal-estate", "ccy": "cryptocurrency", "thor": "asgard-finance", "esg": "empty-set-gold", "pepr": "pepper-finance", "sofi": "social-finance", "ubtc": "united-bitcoin", "aph": "apholding-coin", "ica": "icarus-finance", "bsk": "bitcoinstaking", "cad": "candy-protocol", "kimchi": "kimchi-finance", "prtn": "proton-project", "3crv": "lp-3pool-curve", "bks": "barkis", "ucoin": "universal-coin", "sch": "schillingcoin", "ucap": "unicap-finance", "new": "newton-project", "upxau": "universal-gold", "2based": "2based-finance", "wtf": "walnut-finance", "onez": "the-nifty-onez", "svs": "silver-gateway", "bribe": "bribe-token", "dquick": "dragons-quick", "gjco": "giletjaunecoin", "mcbase": "mcbase-finance", "cbtc": "classicbitcoin", "ctg": "cryptorg-token", "wanatha": "wrapped-anatha", "rsct": "risecointoken", "fsc": "five-star-coin", "ct": "communitytoken", "mov": "motiv-protocol", "shild": "shield-network", "hdw": "hardware-chain", "fff": "force-for-fast", "uto": "unitopia-token", "kbc": "karatgold-coin", "forestry": "forestry-token", "yf4": "yearn4-finance", "buc": "buyucoin-token", "mzk": "muzika-network", "evo": "dapp-evolution", "zseed": "sowing-network", "heth": "huobi-ethereum", "xuc": "exchange-union", "lyn": "lynchpin_token", "miva": "minerva-wallet", "espi": "spider-ecology", "mayp": "maya-preferred-223", "dwc": "digital-wallet", "vcco": "vera-cruz-coin", "amc": "anonymous-coin", "npw": "new-power-coin", "mtns": "omotenashicoin", "ths": "the-hash-speed", "byn": "beyond-finance", "atis": "atlantis-token", "wscrt": "secret-erc20", "dop": "dopple-finance", "bcash": "bankcoincash", "bcb": "bcb-blockchain", "es": "era-swap-token", "tcnx": "tercet-network", "bnsg": "bns-governance", "polven": "polka-ventures", "btrl": "bitcoinregular", "lncx": "luna-nusa-coin", "hltc": "huobi-litecoin", "bpt": "bitplayer-token", "aedart": "aedart-network", "jsb": "jsb-foundation", "xdt": "xwc-dice-token", "snb": "synchrobitcoin", "hzd": "horizondollar", "hdot": "huobi-polkadot", "eer": "ethereum-erush", "bbl": "bubble-network", "dbix": "dubaicoin-dbix", "sedo": "sedo-pow-token", "spex": "sproutsextreme", "cxc": "capital-x-cell", "feed": "feeder-finance", "ccake": "cheesecakeswap", "cdl": "coindeal-token", "neon": "neonic-finance", "liquid": "netkoin-liquid", "ethmny": "ethereum-money", "eveo": "every-original", "erd": "eldorado-token", "bf": "bitforex", "dgnn": "dragon-network", "cvt": "civitas-protocol", "abao": "aladdin-galaxy", "cavo": "excavo-finance", "etr": "electric-token", "sho": "showcase-token", "nfd": "nifdo-protocol", "dart": "dart-insurance", "sifi": "simian-finance", "rick": "infinite-ricks", "upeur": "universal-euro", "kmw": "kepler-network", "katana": "katana-finance", "prdx": "predix-network", "mlk": "milk-alliance", "hnb": "hashnet-biteco", "cpte": "crypto-puzzles", "ald": "aludra-network", "deve": "divert-finance", "gvy": "groovy-finance", "wac": "warranty-chain", "pjm": "pajama-finance", "perx": "peerex-network", "xlab": "xceltoken-plus", "chord": "chord-protocol", "banana": "apeswap-finance", "gzil": "governance-zil", "elena": "elena-protocol", "dynmt": "dynamite-token", "pareto": "pareto-network", "shrimp": "shrimp-finance", "dpr": "deeper-network", "owo": "one-world-coin", "metp": "metaprediction", "bfr": "bridge-finance", "mg": "minergate-token", "xyx": "burn-yield-burn", "esn": "escudonavacense", "nmp": "neuromorphic-io", "smpl": "smpl-foundation", "m3c": "make-more-money", "moonday": "moonday-finance", "dimi": "diminutive-coin", "flexethbtc": "flexeth-btc-set", "mpwr": "empower-network", "brzx": "braziliexs-token", "cnp": "cryptonia-poker", "cst": "cryptosolartech", "nos": "nitrous-finance", "aens": "aen-smart-token", "ctx": "cryptex-finance", "fish": "penguin-party-fish", "vct": "valuecybertoken", "ec2": "employment-coin", "bttr": "bittracksystems", "boc": "bitorcash-token", "ldn": "ludena-protocol", "stpl": "stream-protocol", "cwv": "cryptoworld-vip", "uusdc": "unagii-usd-coin", "bchip": "bluechips-token", "idv": "idavoll-network", "rfy": "rfyield-finance", "fol": "folder-protocol", "qcx": "quickx-protocol", "slice": "tranche-finance", "typh": "typhoon-network", "blink": "blockmason-link", "usdj": "just-stablecoin", "bpakc": "bitpakcointoken", "comc": "community-chain", "infi": "insured-finance", "wccx": "wrapped-conceal", "libref": "librefreelencer", "defit": "defit", "usdo": "usd-open-dollar", "bst1": "blueshare-token", "gdl": "gondala-finance", "ufc": "union-fair-coin", "afi": "aries-financial-token", "sheesha": "sheesha-finance", "wsta": "wrapped-statera", "ringx": "ring-x-platform", "snbl": "safenebula", "afen": "afen-blockchain", "chal": "chalice-finance", "bcc": "basis-coin-cash", "altm": "altmarkets-coin", "craft": "decraft-finance", "wmpro": "wm-professional", "labo": "the-lab-finance", "nyan": "yieldnyan-token", "nftart": "nft-art-finance", "gdt": "gorilla-diamond", "trips": "trips-community", "trdl": "strudel-finance", "fusion": "fusion-energy-x", "yfild": "yfilend-finance", "emb": "block-collider", "weather": "weather-finance", "udt": "unlock-protocol", "dvi": "dvision-network", "hps": "happiness-token", "skt": "sealblock-token", "rlr": "relayer-network", "ans": "ans-crypto-coin", "advc": "advertisingcoin", "tin": "tinfoil-finance", "ram": "ramifi", "print": "printer-finance", "kimochi": "kimochi-finance", "aevo": "aevo", "yfiking": "yfiking-finance", "pussy": "pussy-financial", "spl": "simplicity-coin", "axa": "alldex-alliance", "kmc": "king-maker-coin", "tni": "tunnel-protocol", "shield": "shield-protocol", "yfarmer": "yfarmland-token", "ssj": "super-saiya-jin", "bwb": "bw-token", "fico": "french-ico-coin", "esce": "escroco", "bpriva": "privapp-network", "sprkl": "sparkle", "lic": "lightening-cash", "eoc": "everyonescrypto", "xbt": "elastic-bitcoin", "renbtccurve": "lp-renbtc-curve", "ddrt": "digidinar-token", "wag8": "wrapped-atromg8", "dxts": "destiny-success", "plst": "philosafe-token", "lnot": "livenodes-token", "krg": "karaganda-token", "nye": "newyork-exchange", "goi": "goforit", "tcapbtcusdc": "holistic-btc-set", "ggc": "gg-coin", "gpo": "galaxy-pool-coin", "whxc": "whitex-community", "syfl": "yflink-synthetic", "eurt": "euro-ritva-token", "shx": "stronghold-token", "tomoe": "tomoe", "tcapethdai": "holistic-eth-set", "ccf": "cerberus", "sny": "syntheify-token", "bbi": "bigboys-industry", "rtf": "regiment-finance", "uhp": "ulgen-hash-power", "atfi": "atlantic-finance", "hds": "hotdollars-token", "bxk": "bitbook-gambling", "tsc": "time-space-chain", "mtlmc3": "metal-music-coin", "fbn": "five-balance", "tschybrid": "tronsecurehybrid", "degenr": "degenerate-money", "bcs": "business-credit-substitute", "btrs": "bitball-treasure", "jfi": "jackpool-finance", "biut": "bit-trust-system", "west": "waves-enterprise", "rnrc": "rock-n-rain-coin", "sensi": "sensible-finance", "myid": "my-identity-coin", "afc": "anti-fraud-chain", "roger": "theholyrogercoin", "idlesusdyield": "idle-susd-yield", "kdg": "kingdom-game-4-0", "gme": "gamestop-finance", "nnn": "novem-gold-token", "supt": "super-trip-chain", "idleusdtyield": "idle-usdt-yield", "cnet": "currency-network", "pnc": "parellel-network", "bb": "blackberry-token", "saturn": "saturn-network", "xlpg": "stellarpayglobal", "hole": "super-black-hole", "unicrap": "unicrap", "u8d": "universal-dollar", "cyc": "cyclone-protocol", "qqq": "qqq-token", "spot": "cryptospot-token", "bdigg": "badger-sett-digg", "mtnt": "mytracknet-token", "cgc": "cash-global-coin", "pld": "pureland-project", "ipx": "ipx-token", "wsb": "wall-street-bets-dapp", "swl": "swiftlance-token", "cytr": "cyclops-treasure", "bplc": "blackpearl-chain", "plum": "plumcake-finance", "ssl": "sergey-save-link", "bhc": "billionhappiness", "tori": "storichain-token", "fxtc": "fixed-trade-coin", "tkx": "tokenize-xchange", "bci": "bitcoin-interest", "vamp": "vampire-protocol", "tryon": "stellar-invictus", "vsd": "value-set-dollar", "scho": "scholarship-coin", "xep": "electra-protocol", "flm": "flamingo-finance", "usdfl": "usdfreeliquidity", "bcr": "bankcoin-reserve", "magi": "magikarp-finance", "idleusdcyield": "idle-usdc-yield", "mof": "molecular-future", "hcore": "hardcore-finance", "mwc": "mimblewimblecoin", "wbb": "wild-beast-block", "hpt": "huobi-pool-token", "ltfn": "litecoin-finance", "xbtx": "bitcoin-subsidium", "mee": "mercurity-finance", "bbkfi": "bitblocks-finance", "mcaps": "mango-market-caps", "osch": "open-source-chain", "meteor": "meteorite-network", "twj": "tronweeklyjournal", "limex": "limestone-network", "mcat20": "wrapped-moon-cats", "mps": "mt-pelerin-shares", "stars": "mogul-productions", "encx": "enceladus-network", "tpc": "trading-pool-coin", "icp": "dfinity-iou", "ghp": "global-hash-power", "etnxp": "electronero-pulse", "stnd": "standard-protocol", "brain": "nobrainer-finance", "mkt": "monkey-king-token", "goldr": "golden-ratio-coin", "chow": "chow-chow-finance", "cnc": "global-china-cash", "asm": "assemble-protocol", "itf": "ins3-finance-coin", "sgc": "secured-gold-coin", "spr": "polyvolve-finance", "agov": "answer-governance", "aac": "acute-angle-cloud", "rvc": "ravencoin-classic", "leobull": "3x-long-leo-token", "ctf": "cybertime-finance", "ciphc": "cipher-core-token", "vbzrx": "vbzrx", "nhc": "neo-holistic-coin", "dcl": "delphi-chain-link", "yficg": "yfi-credits-group", "trxbull": "3x-long-trx-token", "bnbbull": "3x-long-bnb-token", "mdza": "medooza-ecosystem", "usdap": "bond-appetite-usd", "foxt": "fox-trading-token", "xrpbull": "3x-long-xrp-token", "yusdc": "yusdc-busd-pool", "reau": "vira-lata-finance", "ssf": "safe-seafood-coin", "rvp": "revolution-populi", "ell": "eth-ai-limit-loss", "stor": "self-storage-coin", "sicc": "swisscoin-classic", "tmcn": "timecoin-protocol", "macpo": "macpo", "xgt": "xion-global-token", "stgz": "stargaze-protocol", "far": "farmland-protocol", "3cs": "cryptocricketclub", "thpt": "helio-power-token", "okbbull": "3x-long-okb-token", "csto": "capitalsharetoken", "ce": "crypto-excellence", "eosbull": "3x-long-eos-token", "ethusdadl4": "ethusd-adl-4h-set", "bvl": "bullswap-protocol", "sxcc": "southxchange-coin", "cbsn": "blockswap-network", "uusdt": "unagii-tether-usd", "ksp": "klayswap-protocol", "bctr": "bitcratic-revenue", "opcx": "over-powered-coin", "brick": "brick", "ght": "global-human-trust", "bnbbear": "3x-short-bnb-token", "unit": "universal-currency", "rmc": "russian-miner-coin", "tan": "taklimakan-network", "ethmoonx": "eth-moonshot-x-yield-set", "dzi": "definition-network", "xrpbear": "3x-short-xrp-token", "afdlt": "afrodex-labs-token", "bafi": "bafi-finance-token", "mco2": "moss-carbon-credit", "if": "impossible-finance", "copter": "helicopter-finance", "awc": "atomic-wallet-coin", "trxbear": "3x-short-trx-token", "wszo": "wrapped-shuttleone", "xrphedge": "1x-short-xrp-token", "eqmt": "equus-mining-token", "leobear": "3x-short-leo-token", "eosbear": "3x-short-eos-token", "okbhedge": "1x-short-okb-token", "tln": "trustline-network", "mhsp": "melonheadsprotocol", "lmt": "lympo-market-token", "hbch": "huobi-bitcoin-cash", "satx": "satoexchange-token", "liqlo": "liquid-lottery-rtc", "yhfi": "yearn-hold-finance", "okbbear": "3x-short-okb-token", "pmt": "playmarket", "cpi": "crypto-price-index", "abp": "arc-block-protocol", "rtc": "read-this-contract", "ang": "aureus-nummus-gold", "hbo": "hash-bridge-oracle", "bbadger": "badger-sett-badger", "btfc": "bitcoin-flash-cash", "zelda elastic cash": "zelda-elastic-cash", "puml": "puml-better-health", "pol": "proof-of-liquidity", "delta rlp": "rebasing-liquidity", "loom": "loom-network-new", "fz": "frozencoin-network", "dfly": "dragonfly-protocol", "kch": "keep-calm", "mpg": "max-property-group", "yfb2": "yearn-finance-bit2", "iop": "internet-of-people", "eoshedge": "1x-short-eos-token", "bnbhedge": "1x-short-bnb-token", "gsa": "global-smart-asset", "gbc": "golden-bridge-coin", "kp3rb": "keep3r-bsc-network", "xuni": "ultranote-infinity", "trxhedge": "1x-short-trx-token", "pvp": "playervsplayercoin", "axt": "alliance-x-trading", "cgb": "crypto-global-bank", "catx": "cat-trade-protocol", "sst": "simba-storage-token", "vgo": "virtual-goods-token", "wht": "wrapped-huobi-token", "sushibull": "3x-long-sushi-token", "xtzbull": "3x-long-tezos-token", "wton": "wrapped-ton-crystal", "okbhalf": "0-5x-long-okb-token", "spy": "satopay-yield-token", "msc": "monster-slayer-cash", "refi": "realfinance-network", "trdg": "tardigrades-finance", "fcd": "future-cash-digital", "ncp": "newton-coin-project", "bbtc": "binance-wrapped-btc", "ygy": "generation-of-yield", "xspc": "spectresecuritycoin", "yi12": "yi12-stfinance", "wmc": "wrapped-marblecards", "ymf20": "yearn20moonfinance", "mkrbull": "3x-long-maker-token", "mclb": "millenniumclub", "pnix": "phoenixdefi-finance", "gsc": "global-social-chain", "pxt": "populous-xbrl-token", "yfie": "yfiexchange-finance", "maticbull": "3x-long-matic-token", "hbdc": "happy-birthday-coin", "btcgw": "bitcoin-galaxy-warp", "cana": "cannabis-seed-token", "bfht": "befasterholdertoken", "yfiv": "yearn-finance-value", "ceek": "ceek", "eoshalf": "0-5x-long-eos-token", "yskf": "yearn-shark-finance", "upusd": "universal-us-dollar", "hsn": "hyper-speed-network", "coc": "cocktailbar", "sbyte": "securabyte-protocol", "mina": "mina-protocol", "gmm": "gold-mining-members", "vit": "vice-industry-token", "xjp": "exciting-japan-coin", "climb": "climb-token-finance", "\u2728": "sparkleswap-rewards", "ann": "apexel-natural-nano", "dola": "dola-usd", "vntw": "value-network-token", "ledu": "education-ecosystem", "wxmr": "wrapped-xmr-btse", "tmh": "trustmarkethub-token", "dss": "defi-shopping-stake", "sxpbull": "3x-long-swipe-token", "cix100": "cryptoindex-io", "ff1": "two-prime-ff1-token", "stoge": "stoner-doge", "xrphalf": "0-5x-long-xrp-token", "plaas": "plaas-farmers-token", "emp": "electronic-move-pay", "beth": "binance-eth", "zgt": "zg-blockchain-token", "wcusd": "wrapped-celo-dollar", "pci": "pay-coin", "sleepy": "sleepy-sloth", "atombull": "3x-long-cosmos-token", "mkrbear": "3x-short-maker-token", "trybbull": "3x-long-bilira-token", "rrt": "recovery-right-token", "xtzhedge": "1x-short-tezos-token", "afo": "all-for-one-business", "deor": "decentralized-oracle", "fredx": "fred-energy-erc20", "amf": "asian-model-festival", "vgt": "vault12", "hzt": "black-diamond-rating", "usdtbull": "3x-long-tether-token", "teo": "trust-ether-reorigin", "maticbear": "3x-short-matic-token", "opm": "omega-protocol-money", "wx42": "wrapped-x42-protocol", "usc": "ultimate-secure-cash", "dollar": "dollar-online", "thex": "thore-exchange", "matichedge": "1x-short-matic-token", "aapl": "apple-protocol-token", "uenc": "universalenergychain", "idledaiyield": "idle-dai-yield", "hpay": "hyper-credit-network", "yfc": "yearn-finance-center", "terc": "troneuroperewardcoin", "forestplus": "the-forbidden-forest", "scv": "super-coinview-token", "sxpbear": "3x-short-swipe-token", "bnfy": "b-non-fungible-yearn", "deto": "delta-exchange-token", "wis": "experty-wisdom-token", "sxphedge": "1x-short-swipe-token", "xcmg": "connect-mining-coin", "utt": "united-traders-token", "xtzbear": "3x-short-tezos-token", "tmtg": "the-midas-touch-gold", "sushibear": "3x-short-sushi-token", "tgco": "thaler", "bvg": "bitcoin-virtual-gold", "gbpx": "etoro-pound-sterling", "ibeth": "interest-bearing-eth", "nut": "native-utility-token", "sxphalf": "0-5x-long-swipe-token", "ducato": "ducato-protocol-token", "qtc": "quality-tracing-chain", "znt": "zenswap-network-token", "intratio": "intelligent-ratio-set", "linkpt": "link-profit-taker-set", "trybbear": "3x-short-bilira-token", "vetbull": "3x-long-vechain-token", "glob": "global-reserve-system", "marc": "market-arbitrage-coin", "htg": "hedge-tech-governance", "gtf": "globaltrustfund-token", "yfn": "yearn-finance-network", "ddn": "data-delivery-network", "wows": "wolves-of-wall-street", "kun": "qian-governance-token", "julb": "justliquidity-binance", "cft": "coinbene-future-token", "matichalf": "0-5x-long-matic-token", "incx": "international-cryptox", "usdtbear": "3x-short-tether-token", "atombear": "3x-short-cosmos-token", "z502": "502-bad-gateway-token", "knc": "kyber-network-crystal", "ccm": "crypto-coupons-market", "idletusdyield": "idle-tusd-yield", "adabull": "3x-long-cardano-token", "zomb": "antique-zombie-shards", "xlmbull": "3x-long-stellar-token", "evz": "electric-vehicle-zone", "ggt": "gard-governance-token", "edi": "freight-trust-network", "gcc": "thegcccoin", "lbxc": "lux-bio-exchange-coin", "ddrst": "digidinar-stabletoken", "blo": "based-loans-ownership", "smrat": "secured-moonrat-token", "wct": "waves-community-token", "dca": "decentralized-currency-assets", "crs": "cryptorewards", "acd": "alliance-cargo-direct", "atomhedge": "1x-short-cosmos-token", "usd": "uniswap-state-dollar", "infinity": "infinity-protocol-bsc", "xbx": "bitex-global", "cts": "chainlink-trading-set", "earn": "yearn-classic-finance", "seco": "serum-ecosystem-token", "xtzhalf": "0-5x-long-tezos-token", "btsc": "beyond-the-scene-coin", "idlewbtcyield": "idle-wbtc-yield", "efg": "ecoc-financial-growth", "bsbt": "bit-storage-box-token", "smoke": "the-smokehouse-finance", "bbb": "bullbearbitcoin-set-ii", "yfrm": "yearn-finance-red-moon", "xlmbear": "3x-short-stellar-token", "ltcbull": "3x-long-litecoin-token", "bed": "bit-ecological-digital", "hth": "help-the-homeless-coin", "yfp": "yearn-finance-protocol", "cvcc": "cryptoverificationcoin", "nami": "nami-corporation-token", "zelda summer nuts cash": "zelda-summer-nuts-cash", "tgcd": "trongamecenterdiamonds", "tgic": "the-global-index-chain", "goz": "goztepe-s-k-fan-token", "balbull": "3x-long-balancer-token", "smnc": "simple-masternode-coin", "dogebull": "3x-long-dogecoin-token", "vethedge": "1x-short-vechain-token", "vetbear": "3x-short-vechain-token", "gdc": "global-digital-content", "tcat": "the-currency-analytics", "ubi": "universal-basic-income", "ihf": "invictus-hyprion-fund", "tgct": "tron-game-center-token", "dpt": "diamond-platform-token", "ecell": "consensus-cell-network", "inteth": "intelligent-eth-set-ii", "adabear": "3x-short-cardano-token", "paxgbull": "3x-long-pax-gold-token", "bmp": "brother-music-platform", "set": "save-environment-token", "leg": "legia-warsaw-fan-token", "dcd": "digital-currency-daily", "mcpc": "mobile-crypto-pay-coin", "atomhalf": "0-5x-long-cosmos-token", "adahedge": "1x-short-cardano-token", "ethbull": "3x-long-ethereum-token", "call": "global-crypto-alliance", "ahf": "americanhorror-finance", "uwbtc": "unagii-wrapped-bitcoin", "well": "wellness-token-economy", "gspi": "gspi", "algobull": "3x-long-algorand-token", "hedge": "1x-short-bitcoin-token", "linkrsico": "link-rsi-crossover-set", "dant": "digital-antares-dollar", "e2c": "electronic-energy-coin", "zelda spring nuts cash": "zelda-spring-nuts-cash", "yefi": "yearn-ethereum-finance", "yfiec": "yearn-finance-ecosystem", "paxgbear": "3x-short-pax-gold-token", "brz": "brz", "algohedge": "1x-short-algorand-token", "dogebear": "3x-short-dogecoin-token", "adahalf": "0-5x-long-cardano-token", "dogehedge": "1x-short-dogecoin-token", "sato": "super-algorithmic-token", "inex": "internet-exchange-token", "ethhedge": "1x-short-ethereum-token", "ems": "ethereum-message-search", "half": "0-5x-long-bitcoin-token", "balbear": "3x-short-balancer-token", "linkbull": "3x-long-chainlink-token", "algobear": "3x-short-algorand-token", "bbe": "bullbearethereum-set-ii", "gator": "alligator-fractal-set", "uwaifu": "unicly-waifu-collection", "bnkrx": "bankroll-extended-token", "ethbear": "3x-short-ethereum-token", "aipe": "ai-predicting-ecosystem", "twob": "the-whale-of-blockchain", "pwc": "prime-whiterock-company", "ltchedge": "1x-short-litecoin-token", "ethrsiapy": "eth-rsi-60-40-yield-set-ii", "vbnt": "bancor-governance-token", "ltcbear": "3x-short-litecoin-token", "idledaisafe": "idle-dai-risk-adjusted", "tomobull": "3x-long-tomochain-token", "bags": "basis-gold-share-heco", "fnxs": "financex-exchange-token", "mlgc": "marshal-lion-group-coin", "wbcd": "wrapped-bitcoin-diamond", "gve": "globalvillage-ecosystem", "nyante": "nyantereum", "ass": "australian-safe-shepherd", "algohalf": "0-5x-long-algorand-token", "bhp": "blockchain-of-hash-power", "tomobear": "3x-short-tomochain-token", "defibull": "3x-long-defi-index-token", "btceth5050": "btc-eth-equal-weight-set", "pec": "proverty-eradication-coin", "ethmo": "eth-momentum-trigger-set", "p2ps": "p2p-solutions-foundation", "ethhalf": "0-5x-long-ethereum-token", "pbtt": "purple-butterfly-trading", "bvol": "1x-long-btc-implied-volatility-token", "basd": "binance-agile-set-dollar", "cbn": "connect-business-network", "rae": "rae-token", "balhalf": "0-5x-long-balancer-token", "paxghalf": "0-5x-long-pax-gold-token", "linkbear": "3x-short-chainlink-token", "sxut": "spectre-utility-token", "best": "bitpanda-ecosystem-token", "nzdx": "etoro-new-zealand-dollar", "tomohedge": "1x-short-tomochain-token", "aat": "agricultural-trade-chain", "yefim": "yearn-finance-management", "idleusdtsafe": "idle-usdt-risk-adjusted", "upt": "universal-protocol-token", "bsvbull": "3x-long-bitcoin-sv-token", "linkhedge": "1x-short-chainlink-token", "idleusdcsafe": "idle-usdc-risk-adjusted", "sup": "supertx-governance-token", "dogehalf": "0-5x-long-dogecoin-token", "bptn": "bit-public-talent-network", "brrr": "money-printer-go-brrr-set", "cgen": "community-generation", "eth2": "eth2-staking-by-poolx", "fame": "saint-fame", "defibear": "3x-short-defi-index-token", "htbull": "3x-long-huobi-token-token", "cmid": "creative-media-initiative", "linkhalf": "0-5x-long-chainlink-token", "wcdc": "world-credit-diamond-coin", "defihedge": "1x-short-defi-index-token", "bsvbear": "3x-short-bitcoin-sv-token", "byte": "btc-network-demand-set-ii", "lega": "link-eth-growth-alpha-set", "ulu": "universal-liquidity-union", "anw": "anchor-neural-world-token", "sxdt": "spectre-dividend-token", "xautbull": "3x-long-tether-gold-token", "licc": "life-is-camping-community", "cmccoin": "cine-media-celebrity-coin", "arcc": "asia-reserve-currency-coin", "bsvhalf": "0-5x-long-bitcoin-sv-token", "chft": "crypto-holding-frank-token", "btmxbull": "3x-long-bitmax-token-token", "cva": "crypto-village-accelerator", "xautbear": "3x-short-tether-gold-token", "bchbull": "3x-long-bitcoin-cash-token", "defihalf": "0-5x-long-defi-index-token", "sbx": "degenerate-platform", "cute": "blockchain-cuties-universe", "wgrt": "waykichain-governance-coin", "midbull": "3x-long-midcap-index-token", "dcto": "decentralized-crypto-token", "rsp": "real-estate-sales-platform", "btceth7525": "btc-eth-75-25-weight-set", "ethbtc7525": "eth-btc-75-25-weight-set", "iqc": "intelligence-quickly-chain", "htbear": "3x-short-huobi-token-token", "xac": "general-attention-currency", "yfka": "yield-farming-known-as-ash", "drgnbull": "3x-long-dragon-index-token", "yfdt": "yearn-finance-diamond-token", "ethrsi6040": "eth-rsi-60-40-crossover-set", "xauthalf": "0-5x-long-tether-gold-token", "innbc": "innovative-bioresearch", "altbull": "3x-long-altcoin-index-token", "bitn": "bitcoin-company-network", "privbull": "3x-long-privacy-index-token", "eth20smaco": "eth_20_day_ma_crossover_set", "btmxbear": "3x-short-bitmax-token-token", "kyte": "kambria-yield-tuning-engine", "btcrsiapy": "btc-rsi-crossover-yield-set", "kncbull": "3x-long-kyber-network-token", "drgnbear": "3x-short-dragon-index-token", "bchbear": "3x-short-bitcoin-cash-token", "cusdtbull": "3x-long-compound-usdt-token", "eth50smaco": "eth-50-day-ma-crossover-set", "midbear": "3x-short-midcap-index-token", "bchhedge": "1x-short-bitcoin-cash-token", "qdao": "q-dao-governance-token-v1-0", "lpnt": "luxurious-pro-network-token", "acc": "asian-african-capital-chain", "btcfund": "btc-fund-active-trading-set", "thetabull": "3x-long-theta-network-token", "fact": "fee-active-collateral-token", "privbear": "3x-short-privacy-index-token", "altbear": "3x-short-altcoin-index-token", "blct": "bloomzed-token", "etas": "eth-trending-alpha-st-set-ii", "cusdtbear": "3x-short-compound-usdt-token", "cusdthedge": "1x-short-compound-usdt-token", "drgnhalf": "0-5x-long-dragon-index-token", "thetabear": "3x-short-theta-network-token", "mqss": "set-of-sets-trailblazer-fund", "bxa": "blockchain-exchange-alliance", "thetahedge": "1x-short-theta-network-token", "kncbear": "3x-short-kyber-network-token", "mlr": "mega-lottery-services-global", "privhedge": "1x-short-privacy-index-token", "bchhalf": "0-5x-long-bitcoin-cash-token", "eth12emaco": "eth-12-day-ema-crossover-set", "bullshit": "3x-long-shitcoin-index-token", "innbcl": "innovativebioresearchclassic", "eth26emaco": "eth-26-day-ema-crossover-set", "compbull": "3x-long-compound-token-token", "midhalf": "0-5x-long-midcap-index-token", "scds": "shrine-cloud-storage-network", "knchalf": "0-5x-long-kyber-network-token", "bloap": "btc-long-only-alpha-portfolio", "privhalf": "0-5x-long-privacy-index-token", "ethbtcrsi": "eth-btc-rsi-ratio-trading-set", "ethemaapy": "eth-26-ema-crossover-yield-set", "jpyq": "jpyq-stablecoin-by-q-dao-v1", "comphedge": "1x-short-compound-token-token", "tip": "technology-innovation-project", "bearshit": "3x-short-shitcoin-index-token", "ibp": "innovation-blockchain-payment", "ethbtcemaco": "eth-btc-ema-ratio-trading-set", "cnyq": "cnyq-stablecoin-by-q-dao-v1", "compbear": "3x-short-compound-token-token", "thetahalf": "0-5x-long-theta-network-token", "hedgeshit": "1x-short-shitcoin-index-token", "eloap": "eth-long-only-alpha-portfolio", "tusc": "original-crypto-coin", "althalf": "0-5x-long-altcoin-index-token", "greed": "fear-greed-sentiment-set-ii", "bcac": "business-credit-alliance-chain", "uch": "universidad-de-chile-fan-token", "yvboost": "yvboost", "ustonks-apr21": "ustonks-apr21", "bbra": "boobanker-research-association", "linkethrsi": "link-eth-rsi-ratio-trading-set", "etcbull": "3x-long-ethereum-classic-token", "halfshit": "0-5x-long-shitcoin-index-token", "cdsd": "contraction-dynamic-set-dollar", "mauni": "matic-aave-uni", "ntrump": "no-trump-augur-prediction-token", "madai": "matic-aave-dai", "bhsc": "blackholeswap-compound-dai-usdc", "mayfi": "matic-aave-yfi", "epm": "extreme-private-masternode-coin", "etcbear": "3x-short-ethereum-classic-token", "bocbp": "btc-on-chain-beta-portfolio-set", "maaave": "matic-aave-aave", "malink": "matic-aave-link", "etchalf": "0-5x-long-ethereum-classic-token", "mausdt": "matic-aave-usdt", "maweth": "matic-aave-weth", "mausdc": "matic-aave-usdc", "eth20macoapy": "eth-20-ma-crossover-yield-set-ii", "matusd": "matic-aave-tusd", "ethpa": "eth-price-action-candlestick-set", "ibvol": "1x-short-btc-implied-volatility", "ylab": "yearn-finance-infrastructure-labs", "bqt": "blockchain-quotations-index-token", "ugas-jan21": "ulabs-synthetic-gas-futures-expiring-1-jan-2021", "ebloap": "eth-btc-long-only-alpha-portfolio", "pxgold-may2021": "pxgold-synthetic-gold-31-may-2021", "ethmacoapy": "eth-20-day-ma-crossover-yield-set", "usns": "ubiquitous-social-network-service", "zjlt": "zjlt-distributed-factoring-network", "gusdt": "gusd-token", "exchbull": "3x-long-exchange-token-index-token", "leloap": "link-eth-long-only-alpha-portfolio", "ttmc": "tsingzou-tokyo-medical-cooperation", "cring": "darwinia-crab-network", "apeusd-uni-dec21": "apeusd-uni-synthetic-usd-dec-2021", "cbe": "cbe", "exchhedge": "1x-short-exchange-token-index-token", "exchbear": "3x-short-exchange-token-index-token", "emtrg": "meter-governance-mapped-by-meter-io", "apeusd-uma-dec21": "apeusd-uma-synthetic-usd-dec-2021", "apeusd-snx-dec21": "apeusd-snx-synthetic-usd-dec-2021", "apeusd-link-dec21": "apeusd-link-synthetic-usd-dec-2021", "ddam": "decentralized-data-assets-management", "apeusd-aave-dec21": "apeusd-aave-synthetic-usd-dec-2021", "dvp": "decentralized-vulnerability-platform", "exchhalf": "0-5x-long-echange-token-index-token", "linkethpa": "eth-link-price-action-candlestick-set", "ugas-jun21": "ugas-jun21", "qdefi": "qdefi-rating-governance-token-v2", "realtoken-18276-appoline-st-detroit-mi": "realtoken-18276-appoline-st-detroit-mi", "realtoken-8342-schaefer-hwy-detroit-mi": "realtoken-8342-schaefer-hwy-detroit-mi", "realtoken-25097-andover-dr-dearborn-mi": "realtoken-25097-andover-dr-dearborn-mi", "realtoken-9336-patton-st-detroit-mi": "realtoken-9336-patton-st-detroit-mi", "dml": "decentralized-machine-learning", "realtoken-20200-lesure-st-detroit-mi": "realtoken-20200-lesure-st-detroit-mi", "pxusd-mar2022": "pxusd-synthetic-usd-expiring-31-mar-2022", "cdr": "communication-development-resources-token", "pxusd-mar2021": "pxusd-synthetic-usd-expiring-1-april-2021", "pxgold-mar2022": "pxgold-synthetic-gold-expiring-31-mar-2022", "realtoken-16200-fullerton-ave-detroit-mi": "realtoken-16200-fullerton-avenue-detroit-mi", "realtoken-10024-10028-appoline-st-detroit-mi": "realtoken-10024-10028-appoline-st-detroit-mi", "uusdrbtc-oct": "uusdrbtc-synthetic-token-expiring-1-october-2020", "bchnrbtc-jan-2021": "bchnrbtc-synthetic", "uusdrbtc-dec": "uusdrbtc-synthetic-token-expiring-31-december-2020", "uusdweth-dec": "yusd-synthetic-token-expiring-31-december-2020", "mario-cash-jan-2021": "mario-cash-jan-2021"};

//end
