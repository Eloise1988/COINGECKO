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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {defaultVersusCoin}              by default prices are against "usd"
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a dimensional array containing the prices
 **/

async function GECKOPRICE(ticker_array,defaultVersusCoin){

  Utilities.sleep(Math.random() * 100)
  try{
    pairExtractRegex = /(.*)-(.*)/, coinSet = new Set(), versusCoinSet = new Set(), pairList = [];

    defaultValueForMissingData = null;
    if(typeof defaultVersusCoin === 'undefined') defaultVersusCoin = "usd";
    defaultVersusCoin=defaultVersusCoin.toLowerCase();
    Logger.log(defaultVersusCoin)
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return an array containing the 24h volumes
 **/

async function GECKOVOLUME(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns an array of market caps
 **/ 
async function GECKOCAP(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns the fully diluted market caps 
 **/ 
async function GECKOCAPDILUTED(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns the cryptocurrencies 24H percent price change
 **/ 
async function GECKO24HPRICECHANGE(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @returns the fully diluted market cap of BTCUSD
 **/ 
async function GECKORANK(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the ATH price
 **/
 async function GECKOATH(ticker_array,currency,defaultValueForMissingData){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}                   an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the ATL prices
 **/
 async function GECKOATL(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return an array containing the 24hour high prices
 **/
 async function GECKO24HIGH(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {cryptocurrencies}               the cryptocurrency ticker/array of tickers/id you want the prices from
 * @param {currency}                       by default "usd"
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return an array containing the 24h low prices
 **/
 async function GECKO24LOW(ticker_array,currency){
  Utilities.sleep(Math.random() * 100)
  try{
    let defaultVersusCoin = "usd", coinSet = new Set(), pairExtractRegex = /(.*)-(.*)/, pairList = [];
    
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
 * @param {ticker}                 the cryptocurrency ticker 
 * @param {ticker2}                the cryptocurrency ticker against which you want the %chage
 * @param {price,volume, or marketcap}     the type of change you are looking for
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
 * @param {ticker}                 the cryptocurrency ticker 
 * @param {ticker2}                the cryptocurrency ticker/currency against which you want the %change
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
 * @param {ticker}                 the cryptocurrency ticker 
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
 * @param {ticker}                 the cryptocurrency ticker 
 * @param {ticker2}                the cryptocurrency ticker against which you want the %chage
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
 * @param {cryptocurrency}          the cryptocurrency ticker
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
 * @param {cryptocurrency}          the cryptocurrency id 
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
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd 
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
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd 
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
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd 
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
const CoinList = {"index": "index-cooperative", "btc": "bitcoin", "eth": "ethereum", "bnb": "binancecoin", "xrp": "ripple", "usdt": "tether", "doge": "dogecoin", "ada": "cardano", "dot": "polkadot", "uni": "universe-token", "bch": "bitcoin-cash", "ltc": "litecoin", "link": "chainlink", "usdc": "usd-coin", "vet": "vechain", "sol": "solana", "xlm": "stellar", "theta": "theta-token", "fil": "filecoin", "okb": "okb", "wbtc": "wrapped-bitcoin", "trx": "tron", "neo": "neo", "busd": "binance-usd", "xmr": "monero", "luna": "wrapped-terra", "bsv": "bitcoin-cash-sv", "aave": "aave", "cake": "pancakeswap-token", "eos": "eos", "etc": "ethereum-classic", "klay": "klay-token", "miota": "iota", "atom": "cosmos", "ftt": "freetip", "matic": "matic-network", "mkr": "maker", "cro": "crypto-com-chain", "ht": "huobi-token", "btt": "bittorrent-2", "ceth": "compound-ether", "cusdc": "compound-usd-coin", "xtz": "tezos", "avax": "avalanche-2", "algo": "algorand", "comp": "compound-coin", "dai": "dai", "ksm": "kusama", "cdai": "cdai", "rune": "thorchain-erc20", "egld": "elrond-erd-2", "dash": "dash", "xem": "nem", "chz": "chiliz", "hot": "hotnow", "snx": "havven", "zec": "zcash", "hbar": "hedera-hashgraph", "dcr": "decred", "waves": "waves", "enj": "enjincoin", "zil": "zilliqa", "cel": "celsius-degree-token", "sushi": "sushi", "leo": "leo-token", "dgb": "digibyte", "stx": "stox", "nexo": "nexo", "amp": "amp-token", "grt": "golden-ratio-token", "sc": "siacoin", "near": "near", "ust": "uservice", "ftm": "fantom", "bat": "basic-attention-token", "mana": "decentraland", "yfi": "yearn-finance", "btg": "bitcoin-gold", "rvn": "ravencoin", "ont": "ontology", "qtum": "qtum", "hbtc": "huobi-btc", "uma": "uma", "icx": "icon", "hnt": "hymnode", "zrx": "0x", "iost": "iostoken", "lusd": "liquity-usd", "nano": "nano", "one": "one-hundred-coin-2", "bnt": "bancor", "chsb": "swissborg", "zen": "zencash", "arrr": "pirate-chain", "xvs": "venus", "ankr": "ankr", "ar": "arweave", "pax": "payperex", "flow": "flow", "wrx": "wazirx", "kcs": "kucoin-shares", "rsr": "reserve-rights-token", "omg": "omisego", "xdc": "xuedaocoin", "bake": "bakerytoken", "dent": "dent", "omi": "ecomi", "win": "wink", "prom": "prometeus", "vgx": "ethos", "tlm": "alien-worlds", "fei": "fei-protocol", "crv": "curve-dao-token", "npxs": "pundi-x", "xvg": "verge", "tusd": "true-usd", "1inch": "1inch", "xsushi": "xsushi", "ren": "republic-protocol", "pundix": "pundi-x-2", "lsk": "lisk", "nxm": "nxm", "husd": "husd", "bcha": "bitcoin-cash-abc-2", "steth": "stakehound-staked-ether", "tel": "telcoin", "cfx": "conflux-token", "lpt": "livepeer", "gt": "gdac-token", "snt": "status", "lrc": "loopring", "bal": "balancer", "btmx": "bmax", "ckb": "nervos-network", "renbtc": "renbtc", "vtho": "vethor-token", "oxy": "oxygen", "tribe": "tribe-2", "mir": "mir-coin", "celo": "celo", "ocean": "ocean-protocol", "ldo": "lido-dao", "ray": "raydium", "cusdt": "compound-usdt", "srm": "serum", "band": "band-protocol", "alpha": "alpha-finance", "zks": "zkswap", "ewt": "energy-web-token", "reef": "reef-finance", "qnt": "quant-network", "btcst": "btc-standard-hashrate-token", "axs": "axie-infinity", "hbc": "hybrid-bank-cash", "stmx": "storm", "glm": "golem", "iotx": "iotex", "nkn": "nkn", "inj": "injective-protocol", "dodo": "dodo", "fun": "funfair", "cuni": "compound-uniswap", "med": "medibloc", "skl": "skale", "bot": "bounce-token", "fet": "fetch-ai", "ton": "ton-crystal", "bcd": "bitcoin-diamond", "sxp": "swipe", "kncl": "kyber-network", "sand": "san-diego-coin", "twt": "trust-wallet-token", "waxp": "wax", "kobe": "shabu-shabu", "kin": "kin", "ersdl": "unfederalreserve", "audio": "audius", "etn": "electroneum", "agi": "singularitynet", "mdx": "mandala-exchange-token", "ardr": "ardor", "oxt": "orchid-protocol", "maid": "maidsafecoin", "ampl": "ampleforth", "orn": "orion-protocol", "cvc": "civic", "woo": "wootrade-network", "ogn": "origin-protocol", "celr": "celer-network", "nmr": "numeraire", "uos": "ultra", "kava": "kava", "meta": "the-metaonez", "sys": "syscoin", "gno": "gnosis", "forth": "ampleforth-governance-token", "steem": "steem", "eps": "epanus", "kmd": "komodo", "ant": "antcoin", "usdn": "neutrino", "snm": "sonm", "tko": "tokocrypto", "utk": "utrust", "rpl": "rocket-pool", "poly": "polymath-network", "bts": "bolt-true-share", "anc": "aragon-china-token", "seth": "sether", "nwc": "newscrypto-coin", "btm": "bytom", "orbs": "orbs", "ark": "ark", "vlx": "valix", "wan": "wanchain", "rfox": "redfox-labs-2", "lina": "linear-bsc", "akt": "akash-network", "keep": "keep-network", "sfp": "safepal", "alcx": "alchemix", "lend": "ethlend", "swap": "trustswap", "alice": "my-neighbor-alice", "xhv": "haven", "storj": "storj", "badger": "badger-dao", "noia": "noia-network", "ubt": "unibright", "uqc": "uquid-coin", "klv": "klever", "super": "supercoin", "kai": "kardiachain", "mtl": "metal", "rep": "augur", "strax": "stratis", "iq": "iq-cash", "ava": "concierge-io", "hns": "handshake", "coti": "coti", "alpaca": "alpaca-finance", "trac": "origintrail", "math": "math", "dnt": "district0x", "vra": "verasity", "rose": "oasis-network", "ghx": "gamercoin", "htr": "hathor", "rif": "rif-token", "scrt": "secret", "rdd": "reddcoin", "pols": "polkastarter", "fx": "fx-coin", "titan": "titanswap", "rlc": "iexec-rlc", "mona": "monavale", "gas": "gas", "hive": "hive", "ctsi": "cartesi", "sure": "insure", "czrx": "compound-0x", "zmt": "zipmex-token", "tomo": "tomochain", "elf": "aelf", "qkc": "quark-chain", "rook": "rook", "paid": "paid-network", "susd": "nusd", "chr": "chromaway", "cre": "cybereits", "jst": "just", "ern": "ethernity-chain", "dia": "dia-data", "quick": "quick", "mask": "nftx-hashmasks-index", "nrv": "nerve-finance", "pac": "paccoin", "perp": "perpetual-protocol", "cru": "curium", "iris": "iris-network", "wnxm": "wrapped-nxm", "ppt": "populous", "dag": "constellation-labs", "dpi": "defipulse-index", "prq": "parsiq", "aion": "aion", "mft": "mainframe", "vai": "vaiot", "ramp": "ramp", "ela": "elastos", "lto": "lto-network", "nu": "nucypher", "powr": "power-ledger", "lamb": "lambda", "gny": "gny", "fine": "refinable", "mln": "melon", "lit": "lition", "cbat": "compound-basic-attention-token", "bunny": "rocket-bunny", "lyxe": "lukso-token", "vrsc": "verus-coin", "xor": "oracolxor", "c20": "crypto20", "exrd": "e-radix", "pha": "pha", "trb": "trebit-network", "auction": "auction", "edg": "edgeless", "rndr": "render-token", "nrg": "energi", "fsn": "fsn", "shr": "sharering", "adx": "adex", "pond": "marlin", "atri": "atari", "api3": "api3", "akro": "akropolis", "bcn": "bytecoin", "divi": "divi", "gala": "gala", "xprt": "persistence", "xaut": "tether-gold", "loc": "lockchain", "firo": "zcoin", "dao": "dao-maker", "maps": "maps", "ddx": "derivadao", "ae": "aeternity", "bscpad": "bscpad", "hxro": "hxro", "srk": "sparkpoint", "bifi": "bitcoin-file", "tt": "thunder-token", "rly": "rally-2", "vite": "vite", "beam": "beam", "any": "anyone", "rgt": "rari-governance-token", "mx": "mx-token", "bel": "bella-protocol", "nuls": "nuls", "loomold": "loom-network", "erg": "ergo", "tvk": "terra-virtua-kolect", "torn": "tornado-cash", "ohm": "olympus", "req": "request-network", "kda": "kadena", "nmx": "nominex", "frax": "frax", "aeth": "aave-eth-v1", "usdp": "usdp", "xcm": "coinmetro", "lon": "tokenlon", "boa": "boa", "cream": "cream-2", "slp": "smooth-love-potion", "lbc": "lbry-credits", "ctk": "certik", "blz": "bluzelle", "arpa": "arpa-chain", "om": "mantra-dao", "pivx": "pivx", "ignis": "ignis", "wozx": "wozx", "bzrx": "bzx-protocol", "pnk": "kleros", "data": "streamr-datacoin", "duck": "dlp-duck-token", "bar": "fc-barcelona-fan-token", "emc2": "einsteinium", "grs": "groestlcoin", "sfi": "socketfinance", "znn": "zenon", "col": "unit-protocol", "mxc": "mxc", "hydra": "hydra", "dsla": "stacktical", "pcx": "chainx", "cos": "contentos", "sparta": "sparta-startups", "hard": "hard-protocol", "front": "frontier-token", "whale": "whale-coin", "bfc": "bit_financial", "tru": "truebit-protocol", "ycc": "yuan-chain-coin", "dusk": "dusk-network", "rfr": "refract", "sero": "super-zero", "drgn": "dragonchain", "free": "free-coin", "pro": "propy", "gusd": "gemini-dollar", "solve": "solve-care", "paxg": "pax-gold", "cbk": "cobak-token", "albt": "allianceblock", "oxen": "loki-network", "yfii": "yfii-finance", "wicc": "waykichain", "nxs": "nexus", "vsp": "vesper-finance", "stake": "xdai-stake", "spi": "shopping-io", "cope": "cope", "hegic": "hegic", "dego": "derogold", "slt": "slt", "auto": "cube", "safemars": "safemars", "mhc": "metahash", "hoge": "hoge-finance", "hc": "hshare", "rai": "rai-finance", "fida": "bonfida", "aergo": "aergo", "psg": "paris-saint-germain-fan-token", "dero": "dero", "farm": "seed2need", "fio": "fio-protocol", "vsys": "v-systems", "lgo": "legolas-exchange", "df": "dforce-token", "fis": "stafi", "step": "step-finance", "svcs": "givingtoservices", "png": "pangolin", "stpt": "stp-network", "vtc": "vertcoin", "uft": "unlend-finance", "ghst": "aavegotchi", "get": "themis", "phb": "red-pulse", "gxc": "game-x-coin", "visr": "visor", "root": "rootkit", "chain": "chain-games", "evn": "envion", "sbtc": "soft-bitcoin", "pib": "passive-income-bot", "vxv": "vectorspace", "esd": "empty-set-dollar", "nim": "nimiq-2", "bondly": "bondly", "rcn": "ripio-credit-network", "mith": "mithril", "nxt": "nxt", "apl": "apollon-limassol", "id": "everid", "suku": "suku", "nest": "nest", "armor": "armor", "ast": "airswap", "fxs": "frax-share", "fxf": "finxflo", "cnd": "cindicator", "pnt": "penta", "xdb": "digitalbits", "feg": "feg-token-bsc", "swth": "switcheo", "idex": "aurora-dao", "mta": "yottachainmena", "rad": "radicle", "wing": "wing-shop", "suter": "suterusu", "core": "cvault-finance", "val": "valkyrie-network", "nbr": "niobio-cash", "mrph": "morpheus-network", "zai": "zero-collateral-dai", "juld": "julswap", "skey": "smartkey", "belt": "belt", "zero": "zero-exchange", "bao": "bao-finance", "rdn": "raiden-network", "eth2x-fli": "eth-2x-flexible-leverage-index", "qsp": "quantstamp", "yld": "yield-coin", "eco": "ormeus-ecosystem", "dock": "dock", "kp3r": "keep3rv1", "creth2": "cream-eth2", "rari": "rarible", "mbox": "mobox", "tbtc": "t-bitcoin", "helmet": "helmet-insure", "aioz": "aioz-network", "nsbt": "neutrino-system-base-token", "vid": "videocoin", "unfi": "unifi-protocol-dao", "hai": "hackenai", "slink": "softlink", "nftx": "nftx", "dmt": "dark-matter", "dg": "degate", "sky": "skycoin", "for": "fortuna-sittard-fan-token", "kyl": "kylin-network", "btu": "bitsou", "dexe": "dexe", "mbl": "moviebloc", "go": "tron-go", "wow": "wowswap", "gto": "gifto", "peak": "marketpeak", "mcb": "mcdex", "swingby": "swingby", "eac": "earthcoin", "lqty": "liquity", "zb": "zb-token", "bmi": "bridge-mutual", "usdx": "usdx-stablecoin", "bepro": "bet-protocol", "veth": "voucher-eth", "baas": "baasid", "ring": "darwinia-network-native-token", "sbd": "steem-dollars", "boson": "boson-protocol", "sai": "sideshift-ai", "frm": "ferrum-network", "bdp": "bidipass", "bip": "bip", "dea": "dea", "revv": "revv", "dcn": "dentacoin", "cocos": "cocos-bcx", "dgd": "digixdao", "polk": "polkamarkets", "aria20": "arianee", "cube": "somnium-space-cubes", "conv": "convergence", "gbyte": "byteball", "sx": "sportx", "dfy": "dotify", "upp": "unipump", "xed": "exeedme", "waultx": "wault", "insur": "insurace", "oce": "oceanex-token", "nebl": "neblio", "bdpi": "interest-bearing-dpi", "cfi": "cyberfi", "key": "momo-key", "wault": "wault-finance-old", "aqt": "aqt-token", "bond": "bonded-finance", "zcn": "0chain", "grin": "grin", "dext": "idextools", "wtc": "waltonchain", "salt": "saltswap", "hez": "hermez-network-token", "bor": "boringdao", "bz": "bit-z-token", "gvt": "genesis-vision", "smart": "smartway-finance", "met": "metronome", "sntvt": "sentivate", "vidt": "v-id-blockchain", "seur": "seur", "layer": "unilayer", "xpr": "proton", "moc": "momocash", "dvpn": "sentinel", "nex": "nexfin", "buidl": "dfohub", "xhdx": "hydradx", "bank": "float-protocol", "nas": "nebulas", "zee": "zeroswap", "nav": "nav-coin", "edr": "endor", "el": "elysia", "cards": "cardstarter", "lpool": "launchpool", "cusd": "celo-dollar", "filda": "filda", "juv": "juventus-fan-token", "yvault-lp-ycurve": "yvault-lp-ycurve", "soul": "soul-token", "sha": "safe-haven", "pi": "pchain", "tidal": "tidal-finance", "pltc": "ptokens-ltc", "cxo": "cargox", "xrt": "robonomics-network", "xbase": "eterbase", "cover": "cover-protocol", "krt": "terra-krw", "mdt": "measurable-data-token", "occ": "occamfi", "troy": "troy", "xyo": "xyo-network", "vitae": "vitae", "dip": "dipper-network", "ddim": "duckdaodime", "lgcy": "lgcy-network", "sdt": "terra-sdt", "clo": "cryptlo", "dora": "dora-factory", "acs": "acryptos", "mph": "morpher", "mark": "benchmark-protocol", "ilv": "illuvium", "cvp": "cvp-token", "hunt": "hunt-token", "digg": "digg", "ifc": "insurance-fintech", "wcres": "wrapped-crescofin", "xsn": "stakenet", "dep": "depth-token", "qash": "qash", "snl": "sport-and-leisure", "bscx": "bscex", "via": "viacoin", "xsgd": "xsgd", "veri": "veritaseum", "mitx": "morpheus-labs", "card": "cardstack", "media": "media-network", "musd": "master-usd", "ioc": "iocoin", "dbc": "deepbrain-chain", "meme": "memetic", "eurs": "stasis-eurs", "trtl": "turtlecoin", "bux": "buxcoin", "lym": "lympo", "labs": "labs-group", "hzn": "horizon-protocol", "bft": "bitget-defi-token", "opium": "opium", "mtsla": "mirrored-tesla", "ult": "shardus", "bdt": "block-duelers", "mix": "mixmarvel", "swftc": "swftcoin", "miau": "mirrored-ishares-gold-trust", "wabi": "wabi", "bytz": "slate", "mgoogl": "mirrored-google", "yaxis": "yaxis", "bpro": "bitcloud-pro", "apy": "apy-finance", "tct": "tycoon-global", "aleph": "aleph", "wxt": "wirex", "ichi": "ichi-farm", "cnfi": "connect-financial", "marsh": "unmarshal", "nmc": "namecoin", "ppay": "plasma-finance", "mamzn": "mirrored-amazon", "cut": "carbon-utility-token", "value": "value-liquidity", "htb": "hotbit-token", "mslv": "mirrored-ishares-silver-trust", "mqqq": "mirrored-invesco-qqq-trust", "cudos": "cudos", "cws": "crowns", "ban": "banano", "tone": "te-food", "lcx": "lcx", "qrl": "quantum-resistant-ledger", "egg": "nestree", "axn": "axion", "bax": "babb", "maapl": "mirrored-apple", "wex": "waultswap", "blank": "blank", "mmsft": "mirrored-microsoft", "mnflx": "mirrored-netflix", "rocks": "social-rocket", "arch": "archer-dao-governance-token", "unn": "union-protocol-governance-token", "kine": "kine-protocol", "six": "six-network", "fic": "florafic", "kan": "kan", "superbid": "superbid", "soc": "soda-coin", "muso": "mirrored-united-states-oil-fund", "combo": "furucombo", "usdk": "usdk", "ltx": "lattice-token", "cdt": "blox", "wpr": "wepower", "xdn": "digitalnote", "shopx": "splyt", "btse": "btse-token", "glch": "glitch-protocol", "abl": "airbloc-protocol", "mbaba": "mirrored-alibaba", "umb": "umbrella-network", "mtwtr": "mirrored-twitter", "etp": "metaverse-etp", "swrv": "swerve-dao", "rbc": "robbocoach", "oddz": "oddz", "yve-crvdao": "vecrv-dao-yvault", "ppc": "philips-pay-coin", "pendle": "pendle", "mvixy": "mirrored-proshares-vix", "dht": "dhedge-dao", "zap": "zap", "ndx": "newdex-token", "brd": "bread", "mbx": "mobiecoin", "zano": "zano", "poolz": "poolz-finance", "ablock": "any-blocknet", "inv": "inverse-finance", "pool": "poolcoin", "mtlx": "mettalex", "burst": "burst", "ovr": "ovr", "orai": "oraichain-token", "xend": "xend-finance", "axel": "axel", "sake": "sake-token", "nebo": "csp-dao-network", "pre": "presearch", "wgr": "wagerr", "tips": "fedoracoin", "cgg": "chain-guardians", "opct": "opacity", "dextf": "dextf", "impulse": "impulse-by-fdr", "block": "blocknet", "mod": "modum", "tlos": "telos", "pros": "prosper", "yam": "yam-2", "coin": "coinbase-tokenized", "fcl": "fractal", "part": "particl", "cas": "cactus-finance", "mda": "moeda-loyalty-points", "fst": "filestorm", "oly": "olyseum", "wom": "wom-token", "socks": "unisocks", "kex": "kira-network", "amlt": "coinfirm-amlt", "bmx": "bitmart-token", "crpt": "crypterium", "zt": "ztcoin", "deus": "deus-finance", "poa": "poa-network", "gal": "galatasaray-fan-token", "stn": "sting", "tau": "lamden", "adp": "adappter-token", "enq": "enq-enecuum", "sngls": "singulardtv", "nif": "unifty", "appc": "appcoins", "koge": "bnb48-club-token", "mtv": "multivac", "hit": "hitchain", "route": "route", "spank": "spankchain", "ubxt": "upbots", "mobi": "mobius", "flx": "felix", "evx": "everex", "xtk": "xtake", "bix": "bibox-token", "foam": "foam-protocol", "govi": "govi", "ost": "simple-token", "pbtc35a": "pbtc35a", "xcur": "curate", "vib": "viberate", "aitra": "aitra", "niox": "autonio", "gth": "gather", "pmon": "polkamon", "bbr": "boolberry", "dyn": "dynamic", "txl": "tixl-new", "fct": "firmachain", "dta": "data", "bmxx": "multiplier-bsc", "ask": "permission-coin", "flux": "flux-protocol", "cmt": "cybermiles", "kono": "konomi-network", "k21": "k21", "must": "mustangtoken", "tfb": "truefeedbackchain", "cvnt": "content-value-network", "rfuel": "rio-defi", "oax": "openanx", "ice": "ice-token", "roobee": "roobee", "mtx": "matryx", "exnt": "exnetwork-token", "pbtc": "ptokens-btc", "ncash": "nucleus-vision", "vnla": "vanilla-network", "props": "props", "ptf": "powertrade-fuel", "nlg": "gulden", "eng": "enigma", "trade": "unitrade", "mdo": "midas-dollar", "agve": "agave-token", "pkf": "polkafoundry", "dhc": "deltahub-community", "abt": "arcblock", "acm": "actinium", "idle": "idle", "hakka": "hakka-finance", "shroom": "shroom-finance", "bry": "berry-data", "upunk": "unicly-cryptopunks-collection", "game": "gamecredits", "fwt": "freeway-token", "apys": "apyswap", "ubq": "ubiq", "valor": "smart-valor", "nix": "nix-platform", "octo": "octofi", "qlc": "qlink", "saito": "saito", "dec": "distributed-energy-coin", "ruff": "ruff", "top": "token-of-power", "aoa": "aurora", "swg": "swirge", "matter": "antimatter", "sdx": "swapdex", "sylo": "sylo", "vee": "blockv", "spc": "star-pacific-coin", "tnb": "time-new-bank", "anj": "anj", "tryb": "bilira", "muse": "muse-2", "jrt": "jarvis-reward-token", "tkn": "tokencard", "act": "achain", "hny": "honey", "ele": "elementrem", "mork": "mork", "mxx": "multiplier", "plu": "pluton", "san": "santiment-network-token", "jul": "jul", "defi5": "defi-top-5-tokens-index", "shft": "shyft-network-2", "ocn": "odyssey", "fnt": "falcon-token", "strong": "strong", "ngm": "e-money", "man": "matrix-ai-network", "efx": "effect-network", "kpad": "kickpad", "alpa": "alpaca", "fuel": "etherparty", "mth": "monetha", "unc": "unicrypt", "atm": "atletico-madrid", "ktn": "kattana", "razor": "razor-network", "mbtc": "minibitcoin", "uncx": "unicrypt-2", "gains": "gains", "l2": "leverj-gluon", "gmt": "gambit", "bskt": "basketcoin", "safe2": "safe2", "cs": "credits", "sfuel": "sparkpoint-fuel", "dlt": "agrello", "bac": "btc-alpha-token", "nyzo": "nyzo", "si": "siren", "myst": "mysterium", "room": "option-room", "fuse": "fuse-network-token", "yf-dai": "yfdai-finance", "dfd": "defidollar-dao", "1337": "1337", "bles": "blind-boxes", "mint": "mintcoin", "coval": "circuits-of-value", "spnd": "spendcoin", "brew": "cafeswap-token", "xla": "ripple-alpha", "pma": "pumapay", "egt": "elastic-dao", "nct": "name-changing-token", "chi": "chi-gastoken", "geo": "geocoin", "mds": "midas-dollar-share", "xmx": "xmax", "btcz": "bitcoinz", "gnx": "genaro-network", "plr": "pillar", "watch": "yieldwatch", "dust": "dust-token", "kit": "kittoken", "ach": "alchemy-pay", "glq": "graphlinq-protocol", "iqn": "iqeon", "abyss": "the-abyss", "like": "likecoin", "dafi": "dafi-protocol", "swm": "swarm", "raze": "raze-network", "umx": "unimex-network", "cht": "crypto-heroes-token", "xmy": "myriadcoin", "yop": "yield-optimization-platform", "xio": "xio", "nft": "nft-protocol", "jup": "jupiter", "pickle": "pickle-finance", "hord": "hord", "ruler": "ruler-protocol", "haus": "daohaus", "btc2": "bitcoin-2", "b20": "b20", "vidya": "vidya", "urqa": "ureeqa", "uip": "unlimitedip", "srn": "sirin-labs-token", "cov": "covesting", "vrx": "verox", "cv": "carvertical", "open": "open-platform", "scc": "sea-cucumber-chain", "euno": "euno", "pay": "tenx", "julien": "julien", "mtrg": "meter", "bas": "basis-share", "gxt": "gem-exchange-and-trading", "hget": "hedget", "white": "whiteheart", "apm": "apm-coin", "bird": "birdchain", "yfl": "yflink", "flo": "flourmix", "fnx": "financex-exchange", "daofi": "daofi", "ode": "odem", "xcash": "x-cash", "cntr": "centaur", "tcake": "pancaketools", "bgov": "bgov", "dxd": "dxdao", "push": "ethereum-push-notification-service", "xeq": "triton", "onx": "onix", "wdc": "wisdom-chain", "hpb": "high-performance-blockchain", "nsure": "nsure-network", "la": "latoken", "hvn": "hiveterminal", "krl": "kryll", "cbc": "cbccoin", "glc": "globalcoin", "bwf": "beowulf", "dov": "dovu", "par": "par-stablecoin", "urus": "urus-token", "bmc": "blackmoon-crypto", "gen": "evolution", "arcx": "arc-governance", "dusd": "defidollar", "cvn": "cvcoin", "dtx": "digital-ticks", "premia": "premia", "tera": "tera-smart-money", "onion": "deeponion", "lien": "lien", "synx": "syndicate", "$anrx": "anrkey-x", "og": "one-genesis", "robot": "robot", "unistake": "unistake", "smt": "smartmesh", "dos": "dos-network", "moon": "moon", "koin": "koinon", "psl": "pastel", "cmp": "component", "ftc": "feathercoin", "plot": "plotx", "argon": "argon", "asr": "as-roma-fan-token", "alch": "alchemy-dao", "axpr": "axpire", "jur": "jur", "pcnt": "playcent", "rby": "rubycoin", "daps": "daps-token", "sph": "spheroid-universe", "yla": "yearn-lazy-ape", "utnp": "universa", "hy": "hybrix", "webd": "webdollar", "dev": "deviantcoin", "amb": "amber", "nfy": "non-fungible-yearn", "aga": "aga-token", "udoo": "howdoo", "pla": "playdapp", "rio": "realio-network", "tky": "thekey", "idna": "idena", "dvg": "daoventures", "paint": "paint", "wasabi": "wasabix", "prt": "portion", "auscm": "auric-network", "raini": "rainicorn", "nec": "nectar-token", "sdefi": "sdefi", "xpx": "proximax", "fsw": "fsw-token", "usf": "unslashed-finance", "itc": "iot-chain", "dough": "piedao-dough-v2", "euler": "euler-tools", "emc": "edumetrix-coin", "nanj": "nanjcoin", "giv": "givly-coin", "ugas": "ultrain", "kat": "kambria", "int": "internet-node-token", "rnt": "oneroot-network", "ones": "oneswap-dao-token", "xpc": "xpet-coin", "iov": "carlive-chain", "grid": "grid", "gswap": "gameswap-org", "bcp": "bitcoin-platinum", "etho": "ether-1", "mfg": "syncfab", "deri": "deri-protocol", "xlq": "alqo", "mvp": "mvp", "dgtx": "digitex-futures-exchange", "ghost": "ghostprism", "balpha": "balpha", "crep": "compound-augur", "auc": "auctus", "dyp": "defi-yield-protocol", "nuts": "squirrel-finance", "time": "timeminer", "lua": "lua-token", "dashd": "dash-diamond", "token": "swaptoken", "its": "iteration-syndicate", "snow": "snowblossom", "cnn": "cnn", "dappt": "dapp-com", "instar": "insights-network", "shard": "shard", "epic": "epic", "crwny": "crowny-token", "dmd": "dmd", "zefu": "zenfuse", "drc": "drc-mobility", "quai": "quai-dao", "credit": "credit-2", "btcp": "bitcoin-pro", "oin": "oin-finance", "linka": "linka", "etha": "etha-lend", "cti": "clintex-cti", "gro": "growth-defi", "shift": "shift", "doki": "doki-doki-finance", "geeq": "geeq", "pop!": "pop", "twin": "twinci", "phr": "phore", "asp": "aspire", "vex": "vexanium", "dows": "shadows", "thugs": "thugs-finance", "wings": "wings", "btx": "bitcore", "pot": "hotpot-base-token", "eved": "evedo", "fvt": "finance-vote", "smty": "smoothy", "you": "you-chain", "ccx": "conceal", "bask": "basketdao", "meth": "farming-bad", "hbd": "hive_dollar", "world": "world-token", "road": "road", "rendoge": "rendoge", "cnns": "cnns", "unifi": "unifi-defi", "yee": "yee", "ten": "tenet", "lcc": "litecoin-cash", "stv": "stvke-network", "phnx": "phoenixdao", "mwat": "restart-energy", "degen": "degen-index", "bcdt": "blockchain-certified-data-token", "xst": "xstable-protocol", "cofi": "coinfi", "agar": "aga-rewards-2", "tcap": "total-crypto-market-cap-token", "smartcredit": "smartcredit-token", "sgt": "snglsdao-governance-token", "flash": "flash", "gleec": "gleec-coin", "sig": "signal-token", "rmt": "sureremit", "bis": "bismuth", "kek": "cryptokek", "pipt": "power-index-pool-token", "oxb": "oxbull-tech", "play": "play-token", "chp": "coinpoker", "xcp": "counterparty", "can": "coinwaycoin", "umask": "unicly-hashmasks-collection", "propel": "payrue", "cwbtc": "compound-wrapped-btc", "gum": "gourmetgalaxy", "idea": "ideaology", "vvt": "versoview", "drt": "domraider", "ixc": "ixcoin", "hbt": "hubii-network", "chonk": "chonk", "awx": "auruscoin", "cc10": "cryptocurrency-top-10-tokens-index", "olt": "one-ledger", "neu": "neumark", "equad": "quadrant-protocol", "seen": "seen", "wish": "wishchain", "pink": "pinkcoin", "ntk": "netkoin", "vbk": "veriblock", "bart": "bartertrade", "uniq": "uniqly", "swag": "swag-finance", "tra": "trabzonspor-fan-token", "snob": "snowball-token", "wolf": "moonwolf-io", "cloak": "cloakcoin", "chg": "charg-coin", "klonx": "klondike-finance-v2", "xft": "offshift", "hyve": "hyve", "ousd": "origin-dollar", "aur": "aurix", "msp": "mothership", "ditto": "ditto", "th": "team-heretics-fan-token", "adb": "adbank", "lyr": "lyra", "trtt": "trittium", "sync": "sync-network", "crbn": "carbon", "dime": "dimecoin", "gmee": "gamee", "ixi": "ixicash", "uuu": "u-network", "cot": "cosplay-token", "arth": "arth", "exrn": "exrnchain", "klp": "kulupu", "utu": "utu-coin", "blt": "billetcoin", "azuki": "azuki", "reap": "reapit", "sense": "sense", "inxt": "internxt", "lkr": "lkr-coin", "xvix": "xvix", "rbase": "rbase-finance", "owc": "oduwa-coin", "put": "profile-utility-token", "epan": "paypolitan-token", "dis": "tosdis", "let": "linkeye", "tube": "bittube", "mtc": "muay-thai-pass", "midas": "midas", "yeed": "yggdrash", "maha": "mahadao", "sale": "anysale", "asko": "askobar-network", "blk": "blink", "satt": "satt", "amn": "amon", "yield": "yield-protocol", "yoyow": "yoyow", "fair": "faircoin", "naos": "naos-finance", "lotto": "lotto", "acxt": "ac-exchange-token", "edda": "eddaswap", "b21": "b21", "xpat": "pangea", "777": "jackpot", "upi": "pawtocol", "kebab": "kebab-token", "cpc": "cpcoin", "dsd": "defi-nation-signals-dao", "qbx": "qiibee", "aid": "aidcoin", "scp": "siaprime-coin", "nord": "nord-finance", "alias": "spectrecoin", "ads": "adshares", "bitcny": "bitcny", "rev": "revelation-coin", "fwb": "friends-with-benefits-pro", "npx": "napoleon-x", "ess": "essentia", "vtx": "vortex-network", "true": "true-chain", "sashimi": "sashimi", "bkbt": "beekan", "yuki": "yuki-coin", "mvi": "metaverse-index", "oro": "oro", "raven": "raven-protocol", "defi+l": "piedao-defi-large-cap", "sta": "stable-asset", "stbu": "stobox-token", "snc": "suncontract", "ok": "okcash", "zora": "zoracles", "pbr": "polkabridge", "bfly": "butterfly-protocol-2", "gard": "hashgard", "ut": "ulord", "dfsocial": "defisocial", "sepa": "secure-pad", "efl": "electronicgulden", "lba": "libra-credit", "pgt": "polyient-games-governance-token", "qrk": "quark", "kton": "darwinia-commitment-token", "mfb": "mirrored-facebook", "udo": "unido-ep", "yec": "ycash", "arte": "ethart", "minds": "minds", "dgcl": "digicol-token", "thc": "thc", "skm": "skrumble-network", "tern": "ternio", "catt": "catex-token", "elg": "escoin-token", "gcr": "gold-coin-reserve", "spa": "sperax", "mthd": "method-fi", "uwl": "uniwhales", "nbx": "netbox-coin", "polc": "polka-city", "gysr": "geyser", "lxt": "litex", "veil": "veil", "xpm": "primecoin", "toa": "toacoin", "safe": "safe-coin", "qrx": "quiverx", "vision": "apy-vision", "42": "42-coin", "soar": "soar-2", "emt": "easymine", "sota": "sota-finance", "avt": "aventus", "bbc": "bigbang-core", "sin": "suqa", "eosdt": "equilibrium-eosdt", "dmst": "dmst", "grc": "gridcoin-research", "fund": "fundchains", "pry": "prophecy", "punk-basic": "punk-basic", "ktlyo": "katalyo", "vibe": "vibe", "omni": "omni", "ac": "acoconut", "0xbtc": "oxbitcoin", "waif": "waifu-token", "veo": "amoveo", "2key": "2key", "zcl": "zclassic", "crw": "crown", "mabnb": "mirrored-airbnb", "vrc": "vericoin", "mgs": "mirrored-goldman-sachs", "roya": "royale", "uop": "utopia-genesis-foundation", "swift": "swiftcash", "ppp": "paypie", "prcy": "prcy-coin", "pnd": "pandacoin", "astro": "astro", "unidx": "unidex", "mue": "monetaryunit", "gfarm2": "gains-v2", "vsf": "verisafe", "qun": "qunqun", "crdt": "crdt", "eosc": "eosforce", "zpae": "zelaapayae", "pinkm": "pinkmoon", "xrc": "bitcoin-rhodium", "wiz": "wizard", "xiot": "xiotri", "zdex": "zeedex", "chart": "chartex", "ngc": "naga", "fdr": "french-digital-reserve", "mt": "mytoken", "spdr": "spiderdao", "fera": "fera", "masq": "masq", "smly": "smileycoin", "fls": "fuloos", "four": "the-4th-pillar", "surf": "surfexutilitytoken", "lead": "lead-token", "exy": "experty", "dax": "daex", "fin": "definer", "mega": "megacryptopolis", "zhegic": "zhegic", "aog": "smartofgiving", "assy": "assy-index", "aln": "aluna", "trio": "tripio", "zip": "zip", "mic": "mith-cash", "urac": "uranus", "tad": "tadpole-finance", "bnsd": "bnsd-finance", "dgx": "digix-gold", "bnkr": "bankroll-network", "becn": "beacon", "zer": "zero", "cure": "curecoin", "vault": "vault", "tap": "tapmydata", "acat": "alphacat", "flex": "flex-coin", "dacc": "dacc", "dat": "datum", "chx": "chainium", "moons": "moontools", "rare": "rare", "evt": "elevation-token", "pfl": "professional-fighters-league-fan-token", "d": "denarius", "tent": "snowgem", "mer": "meridaworld", "uct": "unitedcrowd", "2gt": "2gether-2", "fti": "fanstime", "pefi": "penguin-finance", "build": "build-finance", "kif": "kittenfinance", "vxt": "virgox-token", "$based": "based-money", "mrc": "meroechain", "sxrp": "sxrp", "eosdac": "eosdac", "tnt": "tierion", "cns": "centric-cash", "yfiii": "yfiii", "edn": "edenchain", "rel": "relevant", "dmg": "dmm-governance", "mist": "alchemist", "ybo": "young-boys-fan-token", "zco": "zebi", "hgold": "hollygold", "hyc": "hycon", "ctxc": "cortex", "nrch": "enreachdao", "box": "defibox", "next": "nextexchange", "pgn": "pigeoncoin", "oap": "openalexa-protocol", "mamc": "mirrored-amc-entertainment", "ubex": "ubex", "stbz": "stabilize", "start": "startcoin", "ufo": "unknown-fair-object", "all": "alliance-fan-token", "chads": "chads-vc", "pie": "defipie", "cbm": "cryptobonusmiles", "dfio": "defi-omega", "nlc2": "nolimitcoin", "defi++": "piedao-defi", "voice": "nix-bridge-token", "warp": "warp-finance", "xbtc": "xbtc", "mfi": "marginswap", "boost": "boosted-finance", "whirl": "whirl-finance", "hnst": "honest-mining", "inf": "infinium", "rvf": "rocket-vault-finance", "pvt": "pivot-token", "bitto": "bitto-exchange", "vol": "volume-network-token", "etgp": "ethereum-gold-project", "uaxie": "unicly-mystic-axies-collection", "bob": "bobs_repair", "rfi": "reflect-finance", "esp": "espers", "swfl": "swapfolio", "rem": "remme", "betr": "betterbetting", "cor": "coreto", "move": "holyheld-2", "bcug": "blockchain-cuties-universe-governance", "xfund": "xfund", "ong": "ong", "res": "resfinex-token", "axis": "axis-defi", "mm": "millimeter", "ptoy": "patientory", "dank": "mu-dank", "wlt": "warlord-token", "erc20": "erc20", "bc": "block-chain-com", "pasc": "pascalcoin", "nyan-2": "nyan-v2", "infs": "infinity-esaham", "ufr": "upfiring", "tx": "transfercoin", "gfx": "gamyfi-token", "bull": "3x-long-bitcoin-token", "edu": "educoin", "exrt": "exrt-network", "pirate": "piratecash", "degov": "degov", "ddd": "scry-info", "ogo": "origo", "banca": "banca", "dav": "dav", "sfd": "safe-deal", "xas": "asch", "pasta": "pasta-finance", "enb": "earnbase", "dgvc": "degenvc", "bscv": "bscview", "mgme": "mirrored-gamestop", "cai": "club-atletico-independiente", "bitg": "bitcoin-green", "polis": "wrapped-polis", "hsc": "hashcoin", "mcx": "machix", "cgt": "curio-governance", "ag8": "atromg8", "bet": "dao-casino", "family": "the-bitcoin-family", "ait": "aichain", "noahp": "noah-coin", "cliq": "deficliq", "iic": "intelligent-investment-chain", "yeti": "yearn-ecosystem-token-index", "hyn": "hyperion", "uncl": "uncl", "sign": "signaturechain", "totm": "totemfi", "pgl": "prospectors-gold", "bxy": "beaxy-exchange", "bnf": "bonfi", "nty": "nexty", "tdx": "tidex-token", "nka": "incakoin", "n3rdz": "n3rd-finance", "bcv": "bcv", "idh": "indahash", "snet": "snetwork", "ibfk": "istanbul-basaksehir-fan-token", "eye": "beholder", "dth": "dether", "kubo": "kubocoin", "1wo": "1world", "znz": "zenzo", "rsv": "reserve", "share": "share-2", "shdc": "shd-cash", "fyz": "fyooz", "flixx": "flixxo", "odin": "odin-token", "modic": "modern-investment-coin", "cpay": "chainpay", "azr": "aezora", "imt": "moneytoken", "ysec": "yearn-secure", "aaa": "aaa-coin", "eve": "devery", "opt": "ethopt", "snn": "sechain", "pst": "primas", "ppblz": "pepemon-pepeballs", "bomb": "bomb", "zp": "zen-protocol", "pylon": "pylon-finance", "ucash": "ucash", "defi+s": "piedao-defi-small-cap", "dexg": "dextoken-governance", "reec": "renewableelectronicenergycoin", "renzec": "renzec", "web": "webcoin", "qwc": "qwertycoin", "stsla": "stsla", "cur": "currentcoin", "gear": "bitgear", "cap": "capital-finance", "rws": "robonomics-web-services", "vips": "vipstarcoin", "octi": "oction", "frc": "freicoin", "sumo": "sumokoin", "pigx": "pigx", "kcal": "phantasma-energy", "spice": "spice", "fmg": "fm-gallery", "deflct": "deflect", "donut": "donut", "dets": "dextrust", "boom": "boom-token", "crx": "cryptex", "csai": "compound-sai", "monk": "monkey-project", "zxc": "0xcert", "mog": "mogwai", "gdao": "governor-dao", "goat": "goat-cash", "edc": "earndefi", "zlot": "zlot", "dds": "dds-store", "tol": "tolar", "fyd": "find-your-developer", "ethix": "ethichub", "fdd": "frogdao-dime", "ionc": "ionchain-token", "base": "base-protocol", "bbp": "bitbot-protocol", "zeit": "zeitcoin", "launch": "superlauncher", "npxsxem": "pundi-x-nem", "fdo": "firdaos", "lobs": "lobstex-coin", "aux": "aquila-protocol", "krb": "karbo", "idrt": "rupiah-token", "xdna": "xdna", "kgo": "kiwigo", "gmat": "gowithmi", "pta": "petrachor", "yae": "cryptonovae", "xiv": "project-inverse", "adm": "adamant-messenger", "dft": "digifinextoken", "xaur": "xaurum", "dit": "inmediate", "8pay": "8pay", "htre": "hodltree", "tzc": "trezarcoin", "mmaon": "mmaon", "ftx": "fintrux", "slm": "slimcoin", "psi": "passive-income", "tft": "threefold-token", "dogefi": "dogefi", "hmq": "humaniq", "stk": "stk-coin", "elx": "energy-ledger", "ryo": "ryo", "adel": "akropolis-delphi", "doges": "dogeswap", "toshi": "toshi-token", "eko": "echolink", "btb": "bitbar", "error": "484-fund", "bto": "bottos", "rating": "dprating", "ldfi": "lendefi", "xbc": "xbn-community-token", "pis": "polkainsure-finance", "ttn": "titan-coin", "debase": "debase", "dct": "decent", "corn": "popcorn-token", "spn": "spartancoin", "iht": "iht-real-estate-protocol", "gse": "gsenetwork", "rac": "rac", "loot": "nftlootbox", "lock": "lock-token", "foto": "unique-photo", "xwp": "swap", "inft": "infinito", "sact": "srnartgallery", "egem": "ethergem", "dotx": "deli-of-thrones", "fry": "foundrydao-logistics", "tos": "transaction-ongoing-system", "komet": "komet", "rte": "rate3", "upx": "udap", "evc": "eco-value-coin", "uat": "ultralpha", "coni": "coinbene-token", "meri": "merebel", "own": "own-token", "gat": "global-aex-token", "sav3": "sav3", "bfi": "beflect-finance", "exf": "extend-finance", "bund": "bundles", "swirl": "swirl-cash", "sub": "substratum", "dun": "durain-finance", "ind": "indorse", "zipt": "zippie", "mnc": "moneynet", "mcm": "money-cash-miner", "use": "elanausd", "nftp": "nft-platform-index", "shnd": "stronghands", "elec": "electrify-asia", "grft": "graft-blockchain", "tico": "topinvestmentcoin", "ugotchi": "unicly-aavegotchi-astronauts-collection", "nfti": "nft-index", "latx": "latiumx", "cspn": "crypto-sports", "etz": "etherzero", "cag": "change", "poe": "poet", "ctask": "cryptotask-2", "stack": "stackos", "cue": "cue-protocol", "reosc": "reosc-ecosystem", "ors": "orsgroup-io", "xmon": "xmon", "crea": "creativecoin", "zut": "zero-utility-token", "hlc": "halalchain", "gst2": "gastoken", "trst": "wetrust", "wdgld": "wrapped-dgld", "groot": "growth-root", "isla": "defiville-island", "$rope": "rope", "cbix": "cubiex", "xnk": "encocoin", "skull": "skull", "mtn": "medicalchain", "fire": "fireball", "udoki": "unicly-doki-doki-collection", "xdex": "xdefi-governance-token", "adco": "advertise-coin", "yvs": "yvs-finance", "yeld": "yeld-finance", "mush": "mushroom", "mgo": "mobilego", "power": "unipower", "gofi": "goswapp", "stacy": "stacy", "ndr": "noderunners", "adc": "android-chain", "adt": "adtoken", "pmgt": "perth-mint-gold-token", "tango": "keytango", "pct": "perkscoin", "mwg": "metawhale-gold", "trust": "trustworks", "n8v": "wearesatoshi", "dam": "datamine", "gene": "gene", "excl": "exclusivecoin", "lot": "lottery-token", "ehrt": "eight-hours", "pgu": "polyient-games-unity", "mmo": "mmocoin", "bos": "boscore", "zcc": "zero-carbon-project", "fast": "fastswap", "fxp": "fxpay", "rvx": "rivex-erc20", "ptt": "proton-token", "metric": "metric-exchange", "ncc": "neurochain", "mars": "mar-network", "bbk": "brickblock", "malw": "malwarechain", "sphr": "sphere", "xnv": "nerva", "vig": "vig", "troll": "trollcoin", "mntis": "mantis-network", "vdx": "vodi-x", "fjc": "fujicoin", "tff": "tutti-frutti-finance", "vcn": "versacoin", "alley": "nft-alley", "fsxu": "flashx-ultra", "ssp": "smartshare", "ncdt": "nuco-cloud", "aidoc": "ai-doctor", "pny": "peony-coin", "coil": "coil-crypto", "font": "font", "datx": "datx", "fdz": "friendz", "btc++": "piedao-btc", "kennel": "token-kennel", "ss": "sharder-protocol", "ladz": "ladz", "bxc": "bonuscloud", "rot": "rotten", "vox": "vox-finance", "aval": "avaluse", "dogec": "dogecash", "bcpt": "blockmason-credit-protocol", "alv": "allive", "lcs": "localcoinswap", "vrs": "veros", "nov": "novara-calcio-fan-token", "ely": "elysian", "xgg": "10x-gg", "sxag": "sxag", "myx": "myx-network", "rox": "robotina", "portal": "portal", "holy": "holyheld", "omx": "project-shivom", "ifund": "unifund", "sbnb": "sbnb", "ink": "ink", "tend": "tendies", "rpd": "rapids", "zrc": "zrcoin", "zsc": "zeusshield", "ypie": "piedao-yearn-ecosystem-pie", "blue": "blue-swap", "ethv": "ethereum-vault", "milk2": "spaceswap-milk2", "cova": "covalent-cova", "bdg": "bitdegree", "x42": "x42-protocol", "trnd": "trendering", "tie": "ties-network", "pak": "pakcoin", "spx": "sp8de", "dpy": "delphy", "sada": "sada", "bti": "bitcoin-instant", "tnc": "tnc-coin", "twa": "adventure-token", "lun": "lunyr", "sib": "sibcoin", "peps": "pepegold", "buzz": "buzzcoin", "red": "red", "bitx": "bitifex", "gap": "gapp-network", "lnd": "lendingblock", "gyen": "gyen", "ntbc": "note-blockchain", "bir": "birake", "pylnt": "pylon-network", "send": "social-send", "atn": "atn", "svx": "savix", "gex": "globex", "ven": "impulseven", "onc": "one-cash", "hgt": "hellogold", "axi": "axioms", "msr": "masari", "mzc": "maza", "xp": "xp", "abx": "arbidex", "ipc": "ipchain", "snov": "snovio", "depay": "depay", "otb": "otcbtc-token", "ovc": "ovcode", "vi": "vid", "nobl": "noblecoin", "bsty": "globalboost", "flot": "fire-lotto", "mash": "marshmellowdefi", "ecom": "omnitude", "tbb": "trade-butler-bot", "type": "typerium", "thirm": "thirm-protocol", "ppy": "peerplays", "semi": "semitoken", "peg": "pegnet", "ric": "riecoin", "pipl": "piplcoin", "ptn": "palletone", "vdl": "vidulum", "tfl": "trueflip", "xmg": "magi", "tpay": "tokenpay", "wqt": "work-quest", "hush": "hush", "hqx": "hoqu", "hue": "hue", "dyt": "dynamite", "eca": "electra", "ipl": "insurepal", "stop": "satopay", "sct": "clash-token", "ggtk": "gg-token", "bits": "bitcoinus", "xfi": "dfinance", "shake": "spaceswap-shake", "fxt": "fxt-token", "ent": "eternity", "tns": "transcodium", "bkc": "blockchain-knowledge-coin", "toc": "touchcon", "ziot": "ziot", "mis": "themis-2", "ion": "ion", "ptc": "pesetacoin", "mdg": "midas-gold", "tme": "tama-egg-niftygotchi", "unl": "unilock-network", "yfd": "yfdfi-finance", "zmn": "zmine", "stq": "storiqa", "shrmp": "shrimp-capital", "ptm": "potentiam", "ldoge": "litedoge", "chnd": "cashhand", "xbp": "blitzpredict", "srh": "srcoin", "jntr": "jointer", "rmpl": "rmpl", "telos": "telos-coin", "qbt": "qbao", "tcc": "the-champcoin", "1up": "uptrennd", "dws": "dws", "ff": "forefront", "trc": "trich", "taco": "taco-finance", "fusii": "fusible", "zpt": "zeepin", "lync": "lync-network", "alex": "alex", "senc": "sentinel-chain", "cato": "catocoin", "axe": "axe", "dvt": "devault", "nor": "bring", "face": "face", "bloc": "bloc-money", "ucm": "unicly-chris-mccann-collection", "gmc": "gokumarket-credit", "esbc": "e-sport-betting-coin", "wg0": "wrapped-gen-0-cryptokitties", "sphtx": "sophiatx", "ethy": "ethereum-yield", "cnb": "coinsbit-token", "bone": "bone", "bcdn": "blockcdn", "dem": "deutsche-emark", "xlr": "solaris", "axiav3": "axia", "rvt": "rivetz", "gbx": "gbrick", "mota": "motacoin", "revo": "revonetwork", "swt": "swarm-city", "pux": "polypux", "zcr": "zcore", "senpai": "project-senpai", "orcl5": "oracle-top-5", "mbn": "mobilian-coin", "cv2": "colossuscoin-v2", "bnty": "bounty0x", "yfte": "yftether", "qch": "qchi", "hbn": "hobonickels", "lmy": "lunch-money", "plus1": "plusonecoin", "mec": "mecro-coin", "bether": "bethereum", "sishi": "sishi-finance", "beet": "beetle-coin", "jet": "jetcoin", "bitt": "bittoken", "priv": "privcy", "arq": "arqma", "pc": "promotionchain", "fess": "fess-chain", "mwbtc": "metawhale-btc", "scb": "spacecowboy", "pkg": "pkg-token", "ken": "keysians-network", "rito": "rito", "flp": "falopa", "daiq": "daiquilibrium", "kolin": "kolin", "bntx": "bintex-futures", "spd": "spindle", "bgg": "bgogo", "cat": "bitclave", "kmpl": "kiloample", "hac": "hacash", "nfxc": "nfx-coin", "dope": "dopecoin", "alt": "alt-estate", "ethys": "ethereum-stake", "woa": "wrapped-origin-axie", "sxau": "sxau", "1mt": "1million-token", "hand": "showhand", "zusd": "zytara-dollar", "rom": "rom-token", "asafe": "allsafe", "deb": "debitum-network", "brdg": "bridge-protocol", "peng": "penguin", "sxmr": "sxmr", "amz": "amz-coin", "ppdex": "pepedex", "grim": "grimcoin", "corx": "corionx", "pria": "pria", "esk": "eska", "baepay": "baepay", "undg": "unidexgas", "bsov": "bitcoinsov", "renbch": "renbch", "kfx": "knoxfs", "crp": "cross-finance", "comb": "combo-2", "tsf": "teslafunds", "bt": "bitenium-token", "mao": "mao-zedong", "btdx": "bitcloud", "max": "max-token", "ali": "ailink-token", "chai": "chai", "lqd": "liquidity-network", "berry": "berryswap", "tac": "taekwondo-access-credit", "pho": "phoswap", "bltg": "bitcoin-lightning", "rpt": "rug-proof", "wand": "wandx", "bouts": "boutspro", "women": "womencoin", "swing": "swing", "x8x": "x8-project", "vlu": "valuto", "snrg": "synergy", "bboo": "panda-yield", "pht": "phoneum", "r3fi": "r3fi-finance", "onl": "on-live", "tcore": "tornadocore", "lx": "lunarx", "ieth": "iethereum", "almx": "almace-shards", "defo": "defhold", "lid": "liquidity-dividends-protocol", "fyp": "flypme", "emd": "emerald-crypto", "tcash": "tcash", "tmt": "tbc-mart-token", "s": "sharpay", "kp4r": "keep4r", "arnx": "aeron", "netko": "netko", "amm": "micromoney", "tsuki": "tsuki-dao", "metm": "metamorph", "eqt": "equitrader", "saud": "saud", "etm": "electromcoin", "tdp": "truedeck", "sds": "alchemint", "plura": "pluracoin", "cheese": "cheese", "at": "artfinity-token", "mib": "mib-coin", "pch": "popchain", "tix": "blocktix", "myb": "mybit-token", "wiki": "wiki-token", "kerman": "kerman", "mintme": "webchain", "jamm": "flynnjamm", "bez": "bezop", "wck": "wrapped-cryptokitties", "tbx": "tokenbox", "swiss": "swiss-finance", "img": "imagecoin", "star": "filestar", "glox": "glox-finance", "wtt": "giga-watt-token", "ad": "asian-dragon", "fud": "fudfinance", "tsl": "treasure-sl", "yffi": "yffi-finance", "undb": "unibot-cash", "arco": "aquariuscoin", "sins": "safeinsure", "tch": "thorecash", "syn": "synlev", "aem": "atheneum", "d4rk": "darkpaycoin", "uunicly": "unicly-genesis-collection", "mntp": "goldmint", "insn": "insanecoin", "kgc": "krypton-token", "enol": "ethanol", "mon": "moneybyte", "shdw": "shadow-token", "tit": "titcoin", "quin": "quinads", "fors": "foresight", "seos": "seos", "cmct": "cyber-movie-chain", "ags": "aegis", "quan": "quantis", "etg": "ethereum-gold", "smol": "smol", "vgw": "vegawallet-token", "sbs": "staysbase", "ore": "galactrum", "rehab": "nft-rehab", "aced": "aced", "scex": "scex", "arc": "arthur-chain", "orme": "ormeuscoin", "mas": "midas-protocol", "avs": "algovest", "ntrn": "neutron", "btw": "bitwhite", "arct": "arbitragect", "got": "parkingo", "bth": "bitcoin-hot", "gin": "gincoin", "thrt": "thrive", "ird": "iridium", "haut": "hauteclere-shards-2", "fota": "fortuna", "shmn": "stronghands-masternode", "civ": "civitas", "scap": "safecapital", "c2c": "ctc", "crc": "core-chip", "space": "spacecoin", "ugc": "ugchain", "slr": "solarcoin", "a": "alpha-platform", "chop": "porkchop", "kobo": "kobocoin", "jem": "jem", "gem": "gemswap", "sergs": "sergs", "obr": "obr", "pwr": "powercoin", "vtd": "variable-time-dollar", "dogy": "dogeyield", "hndc": "hondaiscoin", "ecte": "eurocoinpay", "naruto2": "naruto-bsc", "skin": "skin-rich", "cxn": "cxn-network", "bbo": "bigbom-eco", "bbs": "bbscoin", "kiwi": "kiwi-token", "yfbt": "yearn-finance-bit", "ffyi": "fiscus-fyi", "steep": "steepcoin", "dln": "delion", "gcn": "gcn-coin", "rupx": "rupaya", "btct": "bitcoin-true", "ifex": "interfinex-bills", "fr": "freedom-reserve", "tic": "tictalk", "paws": "paws-funds", "lkn": "linkcoin-token", "karma": "karma-dao", "pop": "pop-chest-token", "ezw": "ezoow", "mxt": "mixtrust", "vsl": "vslice", "2give": "2give", "svd": "savedroid", "ukg": "unikoin-gold", "wvg0": "wrapped-virgin-gen-0-cryptokitties", "nbc": "niobium-coin", "reb2": "rebased", "lana": "lanacoin", "yft": "yield-farming-token", "ytn": "yenten", "topb": "topb", "ozc": "ozziecoin", "ecoin": "ecoin-2", "medibit": "medibit", "inve": "intervalue", "dex": "alphadex", "esh": "switch", "pfr": "payfair", "vlo": "velo-token", "mcp": "my-crypto-play", "kind": "kindcow-finance", "bgtt": "baguette-token", "cred": "street-credit", "ngot": "ngot", "yui": "yui-hinata", "candy": "crypto-candy", "ella": "ellaism", "adi": "aditus", "arms": "2acoin", "mss": "monster-cash-share", "wfil": "wrapped-filecoin", "cyl": "crystal-token", "horus": "horuspay", "cob": "cobinhood", "prc": "partner", "yfdot": "yearn-finance-dot", "ethbn": "etherbone", "bear": "3x-short-bitcoin-token", "crypt": "cryptcoin", "vsx": "vsync", "jump": "jumpcoin", "delta": "delta-financial", "com": "complus-network", "nat": "nature", "bsd": "basis-dollar", "boli": "bolivarcoin", "shuf": "shuffle-monster", "dim": "dimcoin", "ctrt": "cryptrust", "chl": "challengedac", "croat": "croat", "help": "helpico", "ltb": "litbinex-coin", "mixs": "streamix", "btcv": "bitcoin-vault", "swagg": "swagg-network", "rex": "rex", "rigel": "rigel-finance", "dcntr": "decentrahub-coin", "xjo": "joulecoin", "vivid": "vivid", "scriv": "scriv", "dfx": "dfx-finance", "hur": "hurify", "gic": "giant", "etnx": "electronero", "seq": "sequence", "first": "harrison-first", "opal": "opal", "tkp": "tokpie", "hlix": "helix", "smc": "smartcoin", "yfbeta": "yfbeta", "kts": "klimatas", "aro": "arionum", "gun": "guncoin", "abs": "absorber", "juice": "moon-juice", "plt": "plutus-defi", "cnus": "coinus", "xta": "italo", "cen": "coinsuper-ecosystem-network", "xkr": "kryptokrona", "tig": "tigereum", "raise": "hero-token", "martk": "martkist", "kndc": "kanadecoin", "xbi": "bitcoin-incognito", "bern": "berncash", "bznt": "bezant", "iut": "mvg-token", "kash": "kids-cash", "cymt": "cybermusic", "ynk": "yoink", "pyrk": "pyrk", "vls": "veles", "yfsi": "yfscience", "rugz": "rugz", "evil": "evil-coin", "lcp": "litecoin-plus", "fsbt": "forty-seven-bank", "hb": "heartbout", "aib": "advanced-internet-block", "mol": "molten", "bta": "bata", "stu": "bitjob", "yun": "yunex", "rfctr": "reflector-finance", "tgame": "truegame", "yfox": "yfox-finance", "dfs": "defis-network", "adz": "adzcoin", "cco": "ccore", "ftxt": "futurax", "xco": "xcoin", "sat": "satisfinance", "sdash": "sdash", "datp": "decentralized-asset-trading-platform", "estx": "oryxcoin", "itl": "italian-lira", "tob": "tokens-of-babel", "cps": "cps-coin", "arm": "armours", "hqt": "hyperquant", "zfl": "zedxe", "tri": "trinity-protocol", "bse": "buy-sell", "bugs": "starbugs-shards", "arepa": "arepacoin", "gcg": "gulf-coin-gold", "imgc": "imagecash", "intu": "intucoin", "crad": "cryptoads-marketplace", "pgo": "pengolincoin", "dvs": "davies", "deep": "deeplock", "herb": "herbalist-token", "braz": "brazio", "tok": "tokok", "jigg": "jiggly-finance", "cgi": "coinshares-gold-and-cryptoassets-index-lite", "nice": "nice", "skym": "soar", "jan": "coinjanitor", "yfpi": "yearn-finance-passive-income", "ablx": "able", "pfarm": "farm-defi", "gtm": "gentarium", "araw": "araw-token", "her": "hero-node", "cherry": "cherry", "genix": "genix", "gup": "matchpool", "xgox": "xgox", "ecash": "ethereum-cash", "wgo": "wavesgo", "eltcoin": "eltcoin", "medic": "medic-coin", "bro": "bitradio", "scr": "scorum", "cpr": "cipher", "tmn": "ttanslateme-network-token", "pte": "peet-defi", "inx": "insight-protocol", "knt": "knekted", "bcz": "bitcoin-cz", "shb": "skyhub", "neva": "nevacoin", "team": "team-finance", "mooi": "moonai", "ig": "igtoken", "prix": "privatix", "bzx": "bitcoin-zero", "dbet": "decentbet", "kydc": "know-your-developer", "anon": "anon", "sxtz": "sxtz", "cof": "coffeecoin", "obee": "obee-network", "yamv2": "yam-v2", "war": "warrior-token", "ben": "bitcoen", "info": "infocoin", "atb": "atbcoin", "dtrc": "datarius-cryptobank", "xos": "oasis-2", "xuez": "xuez", "cbx": "bullion", "ero": "eroscoin", "duo": "parallelcoin", "havy": "havy-2", "mcash": "midas-cash", "wrc": "whiterockcasino", "sno": "savenode", "tret": "tourist-review-token", "bonk": "bonk-token", "milf": "milfies", "ezy": "ezystayz", "jade": "jade-currency", "bsds": "basis-dollar-share", "trk": "truckcoin", "rpc": "racing-pigeon-chain", "mcc": "magic-cube", "btcn": "bitcoinote", "edrc": "edrcoin", "ethplo": "ethplode", "coke": "cocaine-cowboy-shards", "aus": "australia-cash", "kwh": "kwhcoin", "mat": "bitsum", "swc": "scanetchain", "rto": "arto", "bon": "bonpay", "swipp": "swipp", "btcs": "bitcoin-silver", "pomac": "poma", "mfc": "mfcoin", "horse": "ethorse", "gxx": "gravitycoin", "bree": "cbdao", "kwatt": "4new", "arion": "arion", "dmb": "digital-money-bits", "lbtc": "lightning-bitcoin", "cjt": "connectjob", "chc": "chunghoptoken", "bit": "bitrewards-token", "joon": "joon", "setc": "setc", "pkb": "parkbyte", "neet": "neetcoin", "cpu": "cpucoin", "prx": "proxynode", "etgf": "etg-finance", "apr": "apr-coin", "ccn": "custom-contract-network", "xd": "scroll-token", "glt": "globaltoken", "care": "carebit", "yffs": "yffs", "jbx": "jboxcoin", "nzl": "zealium", "tds": "tokendesk", "2x2": "2x2", "toto": "tourist-token", "usdq": "usdq", "pnx": "phantomx", "zzzv2": "zzz-finance-v2", "dp": "digitalprice", "klks": "kalkulus", "vaultz": "vaultz", "infx": "influxcoin", "sur": "suretly", "chiefs": "kansas-city-chiefs-win-super-bowl", "lud": "ludos", "ucn": "uchain", "ace": "ace-casino", "stak": "jigstack", "may": "theresa-may-coin", "emrals": "emrals", "note": "dnotes", "deex": "deex", "zyon": "bitzyon", "mac": "matrexcoin", "imp": "ether-kingdoms-token", "wdp": "waterdrop", "genx": "genesis-network", "audax": "audax", "aias": "aiascoin", "actp": "archetypal-network", "aqua": "aqua", "kema": "kemacoin", "joint": "joint", "impl": "impleum", "lnc": "linker-coin", "bloody": "bloody-token", "cash2": "cash2", "desh": "decash", "boat": "boat", "bold": "boldman-capital", "payx": "paypex", "cou": "couchain", "boxx": "boxx", "zoc": "01coin", "hippo": "hippo-finance", "rle": "rich-lab-token", "burn": "blockburn", "yfuel": "yfuel", "btcred": "bitcoin-red", "vikky": "vikkytoken", "veco": "veco", "sinoc": "sinoc", "sfcp": "sf-capital", "nrve": "narrative", "seal": "sealchain", "ethm": "ethereum-meta", "wild": "wild-crypto", "wbt": "whalesburg", "drip": "dripper-finance", "ctsc": "cts-coin", "gsr": "geysercoin", "nyx": "nyxcoin", "mar": "markyt", "cnct": "connect", "apc": "alpha-coin", "epc": "electronic-pk-chain", "gtx": "goaltime-n", "$noob": "noob-finance", "lno": "livenodes", "goss": "gossipcoin", "ulg": "ultragate", "cdm": "condominium", "mst": "mysterious-sound", "ylc": "yolo-cash", "taj": "tajcoin", "jmc": "jemoo-community", "xstar": "starcurve", "chan": "chancoin", "ntr": "netrum", "cow": "cowboy-finance", "npc": "npccoin", "gst": "gemstone", "vgr": "voyager", "mftu": "mainstream-for-the-underground", "exo": "exosis", "xgcs": "xgalaxy", "tour": "touriva", "kgs": "kingscoin", "klon": "klondike-finance", "xap": "apollon", "guess": "peerguess", "labx": "stakinglab", "tux": "tuxcoin", "bacon": "baconswap", "stream": "streamit-coin", "wtl": "welltrado", "arb": "arbit", "swyftt": "swyft", "snd": "snodecoin", "idefi": "idefi", "itt": "intelligent-trading-tech", "yfid": "yfidapp", "yfrb": "yfrb-finance", "ams": "amsterdamcoin", "rntb": "bitrent", "gali": "galilel", "strng": "stronghold", "reex": "reecore", "drm": "dodreamchain", "noodle": "noodle-finance", "osina": "osina", "gdr": "guider", "dalc": "dalecoin", "kkc": "primestone", "jiaozi": "jiaozi", "bm": "bitcomo", "distx": "distx", "nrp": "neural-protocol", "xczm": "xavander-coin", "abet": "altbet", "rzn": "rizen-coin", "sove": "soverain", "dtc": "datacoin", "mafi": "mafia-network", "house": "toast-finance", "aet": "aerotoken", "agu": "agouti", "znd": "zenad", "roco": "roiyal-coin", "cct": "clap-clap-token", "hash": "hash", "kmx": "kimex", "cdzc": "cryptodezirecash", "mexp": "moji-experience-points", "exus": "exus-coin", "litb": "lightbit", "gfn": "game-fanz", "bsgs": "basis-gold-share", "clc": "cifculation", "eny": "emergency-coin", "rise": "rise", "mnp": "mnpcoin", "ztc": "zeto", "tsd": "true-seigniorage-dollar", "sas": "stand-share", "wcoinbase-iou": "deus-synthetic-coinbase-iou", "btcb": "binance-bitcoin", "hydro": "hydro", "fntb": "fintab", "rank": "rank-token", "dashg": "dash-green", "spe": "saveplanetearth", "trvc": "thrivechain", "paxex": "paxex", "dxo": "dextro", "nyb": "new-year-bull", "bost": "boostcoin", "eld": "eth-limited", "beverage": "beverage", "xsr": "xensor", "exn": "exchangen", "uffyi": "unlimited-fiscusfyi", "guard": "guardium", "kec": "keyco", "asa": "asura", "azum": "azuma-coin", "wtr": "water-token-2", "blry": "billarycoin", "crcl": "crowdclassic", "btcui": "bitcoin-unicorn", "scsx": "secure-cash", "din": "dinero", "abst": "abitshadow-token", "hodl": "hodlearn", "js": "javascript-token", "zzz": "zzz-finance", "sdusd": "sdusd", "polar": "polaris", "yieldx": "yieldx", "faith": "faithcoin", "cnmc": "cryptonodes", "dow": "dowcoin", "varius": "varius", "bul": "bulleon", "chtc": "cryptohashtank-coin", "hlx": "helex-token", "orm": "orium", "mbgl": "mobit-global", "sac": "smart-application-chain", "quot": "quotation-coin", "mano": "mano-coin", "mynt": "mynt", "saros": "saros", "better": "better-money", "sierra": "sierracoin", "oot": "utrum", "dgm": "digimoney", "fsd": "freq-set-dollar", "bkx": "bankex", "bdcash": "bigdata-cash", "ssx": "somesing", "het": "havethertoken", "lms": "lumos", "orox": "cointorox", "gbcr": "gold-bcr", "brix": "brixcoin", "ary": "block-array", "clg": "collegicoin", "wllo": "willowcoin", "voise": "voise", "nbxc": "nibbleclassic", "kaaso": "kaaso", "kreds": "kreds", "ibtc": "improved-bitcoin", "ixrp": "ixrp", "dice": "tronbetdice", "sms": "speed-mining-service", "mek": "meraki", "404": "404", "real": "real-coin", "evi": "evimeria", "bds": "borderless", "yffc": "yffc-finance", "aer": "aeryus", "lux": "luxcoin", "ixtz": "ixtz", "atl": "atlant", "zla": "zilla", "ebtc": "eos-btc", "voco": "provoco", "pirl": "pirl", "idash": "idash", "bze": "bzedge", "arg": "argentum", "pcn": "peepcoin", "icex": "icex", "cstl": "cstl", "up": "unifi-protocol", "cc": "ccswap", "zin": "zin", "mex": "mex", "b26": "b26", "lif": "winding-tree", "owl": "owl-token", "hex": "hex", "ecc": "ecc", "tvt": "tvt", "txt": "txt", "ubu": "ubu-finance", "xtp": "tap", "mox": "mox", "day": "chronologic", "zom": "zoom-protocol", "eox": "eox", "1ai": "1ai", "lbk": "legal-block", "iab": "iab", "yas": "yas", "mvl": "mass-vehicle-ledger", "mrv": "mrv", "bgt": "bgt", "imo": "imo", "msn": "msn", "ucx": "ucx-foundation", "vey": "vey", "sfb": "sfb", "yup": "yup", "ize": "ize", "zos": "zos", "hdt": "hdt", "7up": "7up", "p2p": "p2p-network", "rug": "rug", "aos": "aos", "gya": "gya", "mp3": "mp3", "vbt": "vbt", "fme": "fme", "cpt": "cryptaur", "ges": "ges", "die": "die", "yes": "yes", "zyx": "zyx", "lvx": "level01-derivatives-exchange", "idk": "idk", "kvi": "kvi", "mp4": "mp4", "dad": "decentralized-advertising", "h3x": "h3x", "sov": "sovereign-coin", "onot": "ono", "htm": "htm", "lcg": "lcg", "rxc": "rxc", "3xt": "3xt", "520": "520", "wal": "wal", "sun": "sun-token", "tmc": "tmc-niftygotchi", "olo": "olo", "qusd": "qusd-stablecoin", "azu": "azus", "seer": "seer", "plg": "pledgecamp", "tugz": "tugz", "roc": "roxe", "aeon": "aeon", "biki": "biki", "zpr": "zper", "lze": "lyze", "teat": "teal", "xtrd": "xtrade", "iote": "iote", "bsys": "bsys", "hapi": "hapi", "wise": "wise-token11", "waxe": "waxe", "gasp": "gasp", "xch": "chia", "asta": "asta", "vidy": "vidy", "ympl": "ympl", "bitz": "bitz", "kupp": "kupp", "mini": "mini", "dnc": "danat-coin", "ieos": "ieos", "r34p": "r34p", "s4f": "s4fe", "yfia": "yfia", "cez": "cezo", "ston": "ston", "afro": "afro", "joys": "joys", "plex": "plex", "pway": "pway", "moac": "moac", "iten": "iten", "amix": "amix", "mass": "mass", "suni": "suni", "bpop": "bpop", "whey": "whey", "xbnta": "xbnt", "sltc": "sltc", "scrv": "scrv", "ntm": "netm", "abbc": "alibabacoin", "xfit": "xfit", "bcat": "bcat", "wav3": "wav3", "vvsp": "vvsp", "psrs": "psrs", "ers": "eros", "gr": "grom", "koto": "koto", "post": "postcoin", "boid": "boid", "wbx": "wibx", "novo": "novo", "xels": "xels", "ruc": "rush", "artx": "artx", "ymax": "ymax", "ndau": "ndau", "pick": "pick", "xfii": "xfii", "efin": "efin", "vera": "vera", "gtc": "global-trust-coin", "pofi": "pofi", "bolt": "thunderbolt", "cspc": "chinese-shopping-platform", "obic": "obic", "benz": "benz", "olcf": "olcf", "vndc": "vndc", "xtrm": "xtrm", "trbo": "turbostake", "enx": "enex", "crow": "crow-token", "yfet": "yfet", "b360": "b360", "tun": "tune", "elya": "elya", "asla": "asla", "g999": "g999", "pica": "pica", "ioex": "ioex", "vivo": "vivo", "thx": "thorenext", "lucy": "lucy", "bora": "bora", "rfis": "rfis", "maro": "ttc-protocol", "pika": "pikachu", "n0031": "ntoken0031", "mute": "mute", "cmdx": "cmdx", "sbet": "sbet", "prot": "prot", "yce": "myce", "sono": "sonocoin", "many": "manyswap", "frat": "frat", "fil6": "filecoin-iou", "arke": "arke", "qpy": "qpay", "aly": "ally", "gold": "digital-gold-token", "nilu": "nilu", "vybe": "vybe", "weth": "weth", "reth": "reth", "velo": "velo", "taxi": "taxi", "punk": "punk", "foin": "foincoin", "iron": "iron-stablecoin", "glex": "glex", "dsys": "dsys", "miss": "miss", "cook": "cook", "hopr": "hopr", "musk": "musk", "exor": "exor", "agt": "aisf", "r64x": "r64x", "tena": "tena", "lbrl": "lbrl", "sefi": "sefi", "bast": "bast", "mymn": "mymn", "nova": "nova", "redi": "redi", "usda": "usda", "ibnb": "ibnb", "aeur": "aeur", "acdc": "volt", "lynx": "lynx", "bidr": "binanceidr", "xls": "elis", "sti": "stib-token", "amis": "amis", "evan": "evan", "vspy": "vspy", "qcad": "qcad", "ng": "ngin", "usdl": "usdl", "zeon": "zeon", "ln": "link", "attn": "attn", "zinc": "zinc", "dray": "dray", "utip": "utip", "hype": "hype-finance", "kala": "kala", "camp": "camp", "donu": "donu", "xdai": "xdai", "mogx": "mogu", "apix": "apix", "olxa": "olxa", "gmb": "gamb", "swop": "swop", "sg20": "sg20", "dogz": "dogz", "etor": "etor", "tosc": "t-os", "bare": "bare", "zyro": "zyro", "lyfe": "lyfe", "hope": "hope-token", "noku": "noku", "dtmi": "dtmi", "dmme": "dmme-app", "arx": "arcs", "rccc": "rccc", "guns": "guns", "arix": "arix", "chbt": "chbt", "bu": "bumo", "xank": "xank", "oryx": "oryx", "alis": "alis", "gana": "gana", "peos": "peos", "xeuro": "xeuro", "apn": "apron", "lc": "lightningcoin", "alphr": "alphr", "sop": "sopay", "haz": "hazza", "plx": "playcoin", "rfbtc": "rfbtc", "altom": "altcommunity-coin", "pitch": "pitch", "aunit": "aunit", "bitsz": "bitsz", "p2pg": "p2pgo", "fo": "fibos", "gena": "genta", "antr": "antra", "ilg": "ilgon", "ccomp": "ccomp", "upbnb": "upbnb", "ytusd": "ytusd", "btr": "bitrue-token", "qob": "qobit", "saave": "saave", "bud": "buddy", "xknca": "xknca", "dudgx": "dudgx", "funjo": "funjo", "paper": "paper", "acoin": "aladdin-coins", "egold": "egold", "sgoog": "sgoog", "crave": "crave", "piasa": "piasa", "vld": "valid", "omb": "ombre", "manna": "manna", "oks": "okschain", "mks": "makes", "eurxb": "eurxb", "modex": "modex", "jwl": "jewel", "axl": "axial", "lytx": "lytix", "tower": "tower", "em": "eminer", "imusd": "imusd", "flap": "flapp", "rup": "rupee", "xazab": "xazab", "keyt": "rebit", "lkk": "lykke", "toz": "tozex", "xin": "infinity-economics", "lunes": "lunes", "blood": "blood", "bxiot": "bxiot", "tks": "tokes", "trybe": "trybe", "kxusd": "kxusd", "ptd": "pilot", "mla": "moola", "kvnt": "kvant", "unify": "unify", "slnv2": "slnv2", "zlp": "zuplo", "senso": "senso", "morc": "dynamic-supply", "az": "azbit", "knv": "kanva", "vinci": "vinci", "swace": "swace", "mvr": "mavro", "bid": "blockidcoin", "defla": "defla", "amr": "ammbr", "myu": "myubi", "nexxo": "nexxo", "myo": "mycro-ico", "lgbtq": "pride", "xmark": "xmark", "hatch": "hatch-dao", "fla": "fiola", "emoj": "emoji", "husky": "husky", "blurt": "blurt", "raku": "rakun", "dby": "dobuy", "cvr": "polkacover", "carat": "carat", "cprop": "cprop", "xra": "ratecoin", "keyfi": "keyfi", "lucky": "lucky-2", "br34p": "br34p", "vesta": "vesta", "gof": "golff", "ox": "orcax", "kcash": "kcash", "xtx": "xtock", "cms": "comsa", "pzm": "prizm", "stamp": "stamp", "joy": "joy-coin", "stonk": "stonk", "utrin": "utrin", "sts": "sbank", "eidos": "eidos", "digex": "digex", "bliss": "bliss-2", "cvl": "civil", "seeds": "seeds", "fx1": "fanzy", "byts": "bytus", "imbtc": "the-tokenized-bitcoin", "snflx": "snflx", "qc": "qovar-coin", "sls": "salus", "twist": "twist", "ifx24": "ifx24", "amon": "amond", "cyb": "cybex", "tro": "tro-network", "ing": "iungo", "trism": "trism", "vidyx": "vidyx", "lex": "elxis", "pando": "pando", "gig": "gigecoin", "mts": "mtblock", "miami": "miami", "xfe": "feirm", "pgpay": "puregold-token", "wco": "winco", "xsp": "xswap", "grimm": "grimm", "mpl": "maple-finance", "xax": "artax", "xnc": "xenios", "xkncb": "xkncb", "rkn": "rakon", "vso": "verso", "asimi": "asimi", "voltz": "voltz", "bubo": "budbo", "ifarm": "ifarm", "tlr": "taler", "nsg": "nasgo", "basic": "basic", "dxiot": "dxiot", "yusra": "yusra", "sbe": "sombe", "fln": "fline", "ybusd": "ybusd", "vmr": "vomer", "ferma": "ferma", "hve2": "uhive", "spok": "spock", "ksk": "kskin", "atx": "aston", "aico": "aicon", "zch": "zilchess", "ecu": "decurian", "fil12": "fil12", "grain": "grain-token", "sheng": "sheng", "dlike": "dlike", "sld": "safelaunchpad", "steel": "steel", "atp": "atlas-protocol", "posh": "shill", "pizza": "pizzaswap", "ean": "eanto", "bion": "biido", "earnx": "earnx", "clam": "clams", "tools": "tools", "krex": "kronn", "$aapl": "aapl", "aloha": "aloha", "fleta": "fleta", "mnguz": "mangu", "pazzy": "pazzy", "usdex": "usdex-2", "mooni": "mooni", "franc": "franc", "srune": "srune", "blast": "blast", "sar": "saren", "omega": "omega", "temco": "temco", "atd": "atd", "acryl": "acryl", "ipfst": "ipfst", "tup": "tenup", "ysr": "ystar", "xfuel": "xfuel", "clt": "coinloan", "byron": "bitcoin-cure", "topia": "topia", "bsha3": "bsha3", "hplus": "hplus", "atmos": "atmos", "mozox": "mozox", "alb": "albos", "point": "point", "plut": "pluto", "fma": "flama", "peach": "peach", "ikomp": "ikomp", "u": "ucoin", "spt": "spectrum", "ehash": "ehash", "klt": "klend", "visio": "visio", "jvz": "jiviz", "xnode": "xnode", "ibank": "ibank", "hdi": "heidi", "sem": "semux", "sklay": "sklay", "akn": "akoin", "tor": "torchain", "xsnxa": "xsnx", "vnx": "venox", "eql": "equal", "bulls": "bulls", "merge": "merge", "xen": "xenon-2", "xgm": "defis", "tsr": "tesra", "xfg": "fango", "seele": "seele", "rlx": "relax-protocol", "seed": "seed-venture", "mri": "mirai", "xpo": "x-power-chain", "samzn": "samzn", "cdex": "codex", "xhd": "xrphd", "con": "converter-finance", "libfx": "libfx", "ceds": "cedars", "gxi": "genexi", "ebst": "eboost", "xinchb": "xinchb", "dacs": "dacsee", "dexm": "dexmex", "r3t": "rock3t", "2goshi": "2goshi", "usnbt": "nubits", "s1inch": "s1inch", "lcnt": "lucent", "onebtc": "onebtc", "lib": "banklife", "bfx": "bitfex", "nlx": "nullex", "xdag": "dagger", "onit": "onbuff", "yac": "yacoin", "ama": "amaten", "bsy": "bestay", "hdp.\u0444": "hedpay", "gunthy": "gunthy", "yfo": "yfione", "dcore": "decore", "ilk": "inlock-token", "boo": "bamboo-token", "dogira": "dogira", "echt": "e-chat", "trat": "tratok", "cso": "crespo", "xaaveb": "xaaveb", "mgx": "margix", "renfil": "renfil", "aapx": "ampnet", "i0c": "i0coin", "brtr": "barter", "incnt": "incent", "spg": "super-gold", "tyc": "tycoon", "dess": "dessfi", "entone": "entone", "fdn": "fundin", "oil": "crudeoil-finance", "xhi": "hicoin", "erc223": "erc223", "rabbit": "rabbit", "stri": "strite", "mmd": "mimidi", "bstx": "blastx", "a5t": "alpha5", "qi": "qiswap", "nkc": "nework", "xqr": "qredit", "inn": "innova", "orb": "orbitcoin", "glf": "gallery-finance", "xsh": "shield", "pgf7t": "pgf500", "xym": "symbol", "vancat": "vancat", "xbtg": "bitgem", "zag": "zigzag", "rblx": "rublix", "meowth": "meowth", "uis": "unitus", "apx": "appics", "qrn": "qureno", "gneiss": "gneiss", "yco": "y-coin", "xlt": "nexalt", "dfni": "defini", "dns": "bitdns", "mor": "morcrypto-coin", "kiro": "kirobo", "mag": "maggie", "trdx": "trodex", "vbswap": "vbswap", "kicks": "sessia", "hgro": "helgro", "bdx": "beldex", "moneta": "moneta", "egcc": "engine", "byt": "byzbit", "iqq": "iqoniq", "dms": "documentchain", "hpx": "hupayx", "heal": "etheal", "str": "staker", "ocul": "oculor", "fai": "fairum", "pat": "patron", "azzr": "azzure", "tara": "taraxa", "alg": "bitalgo", "dusa": "medusa", "nlm": "nuclum", "uzz": "azuras", "dxr": "dexter", "omm": "omcoin", "clx": "celeum", "nii": "nahmii", "sprink": "sprink", "ivi": "inoovi", "skrp": "skraps", "co2b": "co2bit", "mdu": "mdu", "lop": "kilopi", "kzc": "kzcash", "qoob": "qoober", "bri": "baroin", "dctd": "dctdao", "cntx": "centex", "eauric": "eauric", "vii": "7chain", "wok": "webloc", "aquari": "aquari", "mdm": "medium", "whx": "whitex", "arcona": "arcona", "bep": "blucon", "ec": "eternal-cash", "strk": "strike", "tlo": "talleo", "s8": "super8", "degens": "degens", "anct": "anchor", "sfr": "safari", "levelg": "levelg", "ttr": "tetris", "fit": "financial-investment-token", "kel": "kelvpn", "zdr": "zloadr", "sfn": "safron", "tur": "turret", "mofi": "mobifi", "sefa": "mesefa", "ame": "amepay", "gsfy": "gasify", "swamp": "swamp-coin", "oneeth": "oneeth", "lgc": "gemini", "sead": "seadex", "pan": "panvala-pan", "rfx": "reflex", "wix": "wixlar", "me": "all-me", "news": "cryptonewsnet", "oct": "oraclechain", "jntr/e": "jntre", "bay": "bitbay", "mns": "monnos", "aka": "akroma", "sbt": "solbit", "xditto": "xditto", "sic": "sicash", "bva": "bavala", "bceo": "bitceo", "dka": "dkargo", "stm": "stream", "hfi": "hecofi", "sanc": "sancoj", "jmt": "jmtime", "zoa": "zotova", "roz": "rozeus", "arteon": "arteon", "jntr/b": "jntrb", "wbpc": "buypay", "cod": "codemy", "ecob": "ecobit", "rnx": "roonex", "strn": "saturn-classic-dao-token", "nt": "nexdax", "scribe": "scribe", "dhv": "dehive", "kue": "kuende", "dsr": "desire", "cbt": "cryptocurrency-business-token", "10set": "tenset", "zcx": "unizen", "ubin": "ubiner", "xaavea": "xaavea", "dbnk": "debunk", "acu": "aitheon", "btp": "bitcoin-pay", "evr": "everus", "agol": "algoil", "tewken": "tewken", "djv": "dejave", "gfce": "gforce", "alu": "altura", "egx": "eaglex", "jll": "jllone", "dsgn": "design", "ket": "rowket", "clv": "clover", "dgn": "degen-protocol", "ign": "ignite", "waf": "waffle", "mnm": "mineum", "gaze": "gazetv", "hd": "hubdao", "tem": "temtem", "kk": "kkcoin", "hbx": "hashbx", "pixeos": "pixeos", "min": "mindol", "gmr": "gimmer", "uco": "uniris", "toko": "toko", "mct": "master-contract-token", "dbt": "datbit", "prkl": "perkle", "cir": "circleswap", "bpx": "bispex", "dxf": "dexfin", "mimo": "mimosa", "in": "incoin", "att": "africa-trading-chain", "xsc": "xscoin", "lhcoin": "lhcoin", "pteria": "pteria", "rno": "snapparazzi", "octa": "octans", "usd1": "psyche", "uted": "united-token", "oft": "orient", "fnd": "fundum", "jui": "juiice", "bdk": "bidesk", "yoc": "yocoin", "shorty": "shorty", "zlw": "zelwin", "nbu": "nimbus", "efk": "refork", "kangal": "kangal", "xincha": "xincha", "redbux": "redbux", "raux": "ercaux", "ras": "raksur", "exg": "exgold", "lev": "leverj", "ipm": "timers", "ilc": "ilcoin", "dmx": "dymmax", "usg": "usgold", "fzy": "frenzy", "bst": "bitsten-token", "coup": "coupit", "ebk": "ebakus", "perl": "perlin", "wynaut": "wynaut", "qmc": "qmcoin", "dtep": "decoin", "nux": "peanut", "kam": "bitkam", "r2r": "citios", "lemd": "lemond", "xab": "abosom", "rpzx": "rapidz", "paa": "palace", "ktt": "k-tune", "vsn": "vision-network", "zcor": "zrocor", "xce": "cerium", "ett": "efficient-transaction-token", "zdc": "zodiac", "gom": "gomics", "prstx": "presto", "rhegic": "rhegic", "fpt": "fuupay", "wxc": "wiix-coin", "pusd": "pegsusd", "drk": "drakoin", "bte": "btecoin", "prv": "privacy", "sap": "swaap-stablecoin", "gadoshi": "gadoshi", "ugd": "unigrid", "clb": "clbcoin", "digi": "digible", "opc": "op-coin", "linkusd": "linkusd", "cid": "cryptid", "dion": "dionpay", "lkt": "lukutex", "nld": "newland", "bfic": "bficoin", "kuv": "kuverit", "twee": "tweebaa", "vtar": "vantaur", "cruz": "cruzbit", "htc": "hitcoin", "mnmc": "mnmcoin", "300": "spartan", "c3": "charli3", "wenb": "wenburn", "dkyc": "datakyc", "ausc": "auscoin", "smdx": "somidax", "m": "m-chain", "bixcpro": "bixcpro", "tshp": "12ships", "chrt": "charity", "prophet": "prophet", "cctc": "cctcoin", "rzb": "rizubot", "yot": "payyoda", "mpay": "menapay", "fn": "filenet", "zny": "bitzeny", "pmeer": "qitmeer", "trop": "interop", "swin": "swinate", "avn": "avantage", "caj": "cajutel", "net": "netcoin", "i9c": "i9-coin", "ath": "atheios", "rlz": "relianz", "mql": "miraqle", "ebase": "eurbase", "odex": "one-dex", "seko": "sekopay", "exp": "exchange-payment-coin", "ril": "rilcoin", "imu": "imusify", "ogx": "organix", "sto": "storeum", "eeth": "eos-eth", "fnk": "funkeypay", "rrc": "rrspace", "xmv": "monerov", "msb": "magic-e-stock", "dfo": "defiato", "yplt": "yplutus", "sdgo": "sandego", "tlc": "tl-coin", "rx": "raven-x", "tek": "tekcoin", "pkt": "playkey", "btrn": "biotron", "bafe": "bafe-io", "quo": "vulcano", "poocoin": "poocoin", "kurt": "kurrent", "mlm": "mktcoin", "ibh": "ibithub", "gsm": "gsmcoin", "sup8eme": "sup8eme", "arts": "artista", "hmr": "homeros", "fat": "tronfamily", "flexusd": "flex-usd", "psy": "psychic", "tdi": "tedesis", "baxs": "boxaxis", "aglt": "agrolot", "safebtc": "safebtc", "kal": "kaleido", "xov": "xov", "bliq": "bliquid", "xemx": "xeniumx", "b2c": "b2-coin", "won": "weblock", "hitx": "hithotx", "hawk": "hawkdex", "onigiri": "onigiri", "scl": "sociall", "sata": "signata", "ents": "eunomia", "sjw": "sjwcoin", "sxc": "simplexchain", "fnax": "fnaticx", "dswap": "definex", "tty": "trinity", "mouse": "mouse", "wdx": "wordlex", "psb": "pesobit", "eag": "ea-coin", "asy": "asyagro", "lyra": "scrypta", "onevbtc": "onevbtc", "locg": "locgame", "btrm": "betrium", "tat": "tatcoin", "mel": "caramelswap", "mrat": "moonrat", "bnode": "beenode", "sprts": "sprouts", "kian": "kianite", "xes": "proxeus", "vana": "nirvana", "lthn": "intensecoin", "bni": "betnomi-2", "land": "new-landbox", "ptr": "payturn", "ork": "orakuru", "trl": "trolite", "xat": "shareat", "marks": "bitmark", "cyfm": "cyberfm", "mndao": "moondao", "xcz": "xchainz", "laq": "laq-pay", "vbit": "valobit", "jdc": "jd-coin", "zdx": "zer-dex", "xfyi": "xcredit", "bnp": "benepit", "x0z": "zerozed", "ree": "reecoin", "brat": "brother", "ethp": "ethplus", "pshp": "payship", "celc": "celcoin", "pcm": "precium", "trbt": "tribute", "pyn": "paycent", "bignite": "bignite", "fey": "feyorra", "torpedo": "torpedo", "nug": "nuggets", "aba": "ecoball", "zik": "zik-token", "xiro": "xiropht", "ape": "apecoin", "ntx": "nitroex", "komp": "kompass", "sam": "samurai", "wasp": "wanswap", "cop": "copiosa", "btsg": "bitsong", "ctl": "citadel", "ix": "x-block", "bgc": "be-gaming-coin", "tronish": "tronish", "bitc": "bitcash", "mepad": "memepad", "qtcon": "quiztok", "eum": "elitium", "lar": "linkart", "tlw": "tilwiki", "v": "version", "vgc": "5g-cash", "oto": "otocash", "satoz": "satozhi", "fox": "fox-finance", "btcm": "btcmoon", "onelink": "onelink", "buz": "buzcoin", "mpt": "metal-packaging-token", "xbg": "bitgrin", "boob": "boobank", "betxc": "betxoin", "ubomb": "unibomb", "shroud": "shroud-protocol", "thkd": "truehkd", "peer": "unilord", "lc4": "leocoin", "ala": "aladiex", "xnb": "xeonbit", "tkmn": "tokemon", "coi": "coinnec", "ardx": "ardcoin", "the": "the-node", "dmc": "decentralized-mining-exchange", "bn": "bitnorm", "afrox": "afrodex", "bscgold": "bscgold", "bono": "bonorum-coin", "kyan": "kyanite", "888": "octocoin", "yok": "yokcoin", "youc": "youcash", "chat": "beechat", "ift": "iftoken", "nax": "nextdao", "ael": "aelysir", "sfm": "sfmoney", "wsote": "soteria", "torm": "thorium", "rap": "rapture", "xxa": "ixinium", "csp": "caspian", "dvx": "derivex", "our": "our-pay", "ohmc": "ohm-coin", "cura": "curadai", "cnx": "cryptonex", "some": "mixsome", "tfd": "etf-dao", "gbt": "gulf-bits-coin", "pqt": "prediqt", "rech": "rechain", "fra": "findora", "ekt": "educare", "bool": "boolean", "bly": "blocery", "wcx": "wecoown", "mapc": "mapcoin", "pt": "predict", "vnl": "vanilla", "gpt": "grace-period-token", "fml": "formula", "bswap": "bscswap", "nyex": "nyerium", "vash": "vpncoin", "zig": "zignaly", "prvs": "previse", "swat": "swtcoin", "xscr": "securus", "gps": "triffic", "cha": "chaucha", "jar": "jarvis", "si14": "si14bet", "aby": "artbyte", "spike": "spiking", "dxh": "daxhund", "rtk": "ruletka", "admn": "adioman", "wfx": "webflix", "tgbp": "truegbp", "vspacex": "vspacex", "7e": "7eleven", "crfi": "crossfi", "hal": "halcyon", "mak": "makcoin", "mdtk": "mdtoken", "peth18c": "peth18c", "bin": "binarium", "aget": "agetron", "sum": "sumcoin", "vro": "veraone", "winr": "justbet", "cpz": "cashpay", "ecp": "ecp-technology", "xyz": "jetmint", "kfc": "chicken", "crct": "circuit", "cmg": "cmgcoin", "trm": "tranium", "xph": "phantom", "wyx": "woyager", "iti": "iticoin", "ddm": "ddmcoin", "bim": "bimcoin", "bfire": "bonfire", "pbl": "publica", "halv": "halving-coin", "tcfx": "tcbcoin", "b2b": "b2bcoin-2", "deq": "dequant", "lhb": "lendhub", "fnsp": "finswap", "ttt": "the-transfer-token", "taud": "trueaud", "zum": "zum-token", "mttcoin": "mttcoin", "mnr": "mineral", "bup": "buildup", "mesh": "meshbox", "bnk": "bankera", "shrm": "shrooms", "mb": "microchain", "ccxx": "counosx", "pgs": "pegasus", "igg": "ig-gold", "unos": "unoswap", "axnt": "axentro", "onewing": "onewing", "dgmt": "digimax", "btv": "bitvote", "buy": "burency", "tcad": "truecad", "befx": "belifex", "mkey": "medikey", "wire": "wire", "sola": "solarys", "rhegic2": "rhegic2", "bdo": "bdollar", "mora": "meliora", "zwap": "zilswap", "fk": "fk-coin", "tag": "tagcoin-erc20", "enu": "enumivo", "btkc": "beautyk", "gzro": "gravity", "lmo": "lumeneo", "ktc": "kitcoin", "trcl": "treecle", "yts": "yetiswap", "gtmr": "getmoder", "pxi": "prime-xi", "graph": "unigraph", "nvzn": "invizion", "gasg": "gasgains", "ino": "ino-coin", "vip": "limitless-vip", "moto": "motocoin", "bela": "belacoin", "mnd": "mindcoin", "neex": "neexstar", "bio": "biocrypt", "mci": "mci-coin", "prs": "pressone", "xqn": "quotient", "trad": "tradcoin", "znc": "zioncoin", "fomp": "fompound", "trex": "trexcoin", "zne": "zonecoin", "tep": "tepleton", "mes": "meschain", "guap": "guapcoin", "ltg": "litegold", "pti": "paytomat", "isal": "isalcoin", "aht": "ahatoken", "pok": "poker-io", "char": "charitas", "kok": "kok-coin", "gldx": "goldnero", "orly": "orlycoin", "uty": "unitydao", "black": "eosblack", "dgl": "dgl-coin", "tagr": "tagrcoin", "nmt": "novadefi", "meet": "coinmeet", "mo": "morality", "ubn": "ubricoin", "lxmt": "luxurium", "ea": "ea-token", "eva": "eva-coin", "gldy": "buzzshow", "vps": "vipo-vps", "prime": "primedao", "alh": "allohash", "tnr": "tonestra", "cim": "coincome", "blu": "bluecoin", "pcl": "peculium", "mkcy": "markaccy", "izer": "izeroium", "dgw": "digiwill", "sym": "symverse", "palt": "palchain", "eti": "etherinc", "treat": "treatdao", "cats": "catscoin", "plf": "playfuel", "btcl": "btc-lite", "guss": "guss-one", "bln": "blacknet", "plbt": "polybius", "miro": "mirocana", "ants": "fireants", "wage": "philscurrency", "mbbased": "moonbase", "alr": "alacrity", "btcx": "bitcoinx-2", "enk": "enkronos", "sng": "sinergia", "b2u": "b2u-coin", "job": "jobchain", "bsc": "bitsonic-token", "tv": "ti-value", "wit": "witchain", "trix": "triumphx", "yep": "yep-coin", "txc": "tenxcoin", "cqt": "covalent", "vns": "vns-coin", "zuka": "zukacoin", "homi": "homihelp", "nort": "northern", "bpp": "bitpower", "zuc": "zeuxcoin", "18c": "block-18", "log": "woodcoin", "gram": "gram", "sapp": "sappchain", "wiz1": "wiz-coin", "upl": "uploadea", "amo": "amodule-network", "marx": "marxcoin", "nuko": "nekonium", "kva": "kevacoin", "lion": "coinlion", "vrap": "veraswap", "saga": "sagacoin", "lby": "libonomy", "timec": "time-coin", "izi": "izichain", "b2g": "bitcoiin", "adai": "aave-dai-v1", "sh": "super-hero", "bmj": "bmj-master-nodes", "kali": "kalicoin", "lips": "lipchain", "nawa": "narwhale", "szc": "zugacoin", "100x": "100x-coin", "plat": "bitguild", "scol": "scolcoin", "cash": "litecash", "zg": "zg", "bbt": "blockbase", "bwt": "bittwatt", "gfun": "goldfund-ico", "fts": "fortress", "akc": "akikcoin", "bnana": "banana-token", "stash": "bitstash-marketplace", "inrt": "inrtoken", "oxo": "oxo-farm", "ecoc": "ecochain", "xind": "indinode", "yfr": "youforia", "gix": "goldfinx", "nss": "nss-coin", "nemo": "nemocoin", "edgt": "edgecoin-2", "hca": "harcomia", "kdag": "kdag", "solarite": "solarite", "usdf": "usdf", "vlk": "vulkania", "dfk": "defiking", "blvr": "believer", "llt": "lifeline", "wpt": "worldpet", "bfl": "bitflate", "ic": "ignition", "hburn": "hypeburn", "ape$": "ape-punk", "srnt": "serenity", "xrp-bf2": "xrp-bep2", "hpot": "hash-pot", "yda": "yadacoin", "rvmt": "rivemont", "nan": "nantrade", "bith": "bithachi", "qbz": "queenbee", "torro": "bittorro", "csx": "coinstox", "exmr": "exmr-monero", "ytv": "ytv-coin", "bee": "bee-coin", "fll": "feellike", "aim": "ai-mining", "fraction": "fraction", "obot": "obortech", "nia": "nia-token", "bell": "bellcoin", "pure": "puriever", "eswa": "easyswap", "myfi": "myfichain", "ogods": "gotogods", "nicheman": "nicheman", "gom2": "gomoney2", "mmda": "pokerain", "ctt": "castweet", "ttc": "thetimeschaincoin", "rnb": "rentible", "xgs": "genesisx", "hana": "hanacoin", "lm": "lm-token", "moonstar": "moonstar", "tatm": "tron-atm", "vn": "vice-network", "tacocat": "taco-cat", "elongate": "elongate", "fren": "frenchie", "mbonk": "megabonk", "opnn": "opennity", "club": "clubcoin", "stpc": "starplay", "cali": "calicoin", "cirq": "cirquity", "bpcn": "blipcoin", "ntrs": "nosturis", "xmm": "momentum", "ijc": "ijascoin", "hl": "hl-chain", "dxc": "dex-trade-coin", "bsp": "ballswap", "wdf": "wildfire", "nole": "nolecoin", "hibs": "hiblocks", "ap3": "ap3-town", "agn": "agricoin", "xbs": "bitstake", "pos": "pos-coin", "ocb": "blockmax", "tuna": "tunacoin", "polydoge": "polydoge", "botx": "botxcoin", "payb": "paybswap", "tarm": "armtoken", "cmit": "cmitcoin", "btshk": "bitshark", "libertas": "libertas-token", "0xmr": "0xmonero", "yfim": "yfimobi", "gcash": "gamecash", "adl": "adelphoi", "song": "songcoin", "bnw": "nagaswap", "alp": "alp-coin", "auop": "opalcoin", "mxw": "maxonrow", "wtip": "worktips", "d100": "defi-100", "ftn": "fountain", "mig": "migranet", "slrm": "solareum", "sine": "sinelock", "trp": "tronipay", "lst": "lendroid-support-token", "trusd": "trustusd", "goc": "eligma", "ri": "ri-token", "gze": "gazecoin", "leaf": "leafcoin", "i9x": "i9x-coin", "ddtg": "davecoin", "cx": "circleex", "disk": "darklisk", "spiz": "space-iz", "bkkg": "biokkoin", "pxg": "playgame", "moonmoon": "moonmoon", "hypebet": "hype-bet", "bigo": "bigo-token", "dhd": "dhd-coin", "lf": "linkflow", "svb": "sendvibe", "lol": "emogi-network", "svn": "7finance", "big": "thebigcoin", "xln": "lunarium", "windy": "windswap", "riskmoon": "riskmoon", "rice": "riceswap", "busy": "busy-dao", "html": "htmlcoin", "zpay": "zantepay", "safemoon": "safemoon", "lvl": "levelapp", "l3p": "lepricon", "mrch": "merchdao", "vela": "vela", "aswap": "arbiswap", "azrx": "aave-zrx-v1", "uca": "uca", "fch": "fanaticos-cash", "rage": "rage-fan", "imx": "impermax", "art": "maecenas", "ethpy": "etherpay", "slc": "support-listing-coin", "bcx": "bitcoinx", "pine": "pinecoin", "meetone": "meetone", "xgk": "goldkash", "aknc": "aave-knc-v1", "trn": "tronnodes", "npo": "npo-coin", "nvc": "novacoin", "blowf": "blowfish", "api": "the-apis", "mojo": "mojocoin", "bizz": "bizzcoin", "abat": "aave-bat-v1", "weed": "weedcash", "topc": "topchain", "pvg": "pilnette", "ixt": "insurex", "tmed": "mdsquare", "bsn": "bastonet", "rdct": "rdctoken", "swsh": "swapship", "jobs": "jobscoin", "comfi": "complifi", "lpl": "linkpool", "fastmoon": "fastmoon", "pswap": "porkswap", "asnx": "aave-snx-v1", "qbit": "qubitica", "amkr": "aave-mkr-v1", "prdz": "predictz", "aenj": "aave-enj-v1", "aren": "aave-ren-v1", "daft": "daftcoin", "bca": "bitcoin-atom", "gpu": "gpu-coin", "bnv": "benative", "defy": "defy-farm", "foxd": "foxdcoin", "poke": "pokeball", "syl": "xsl-labs", "ayfi": "ayfi", "prtcle": "particle-2", "nsr": "nushares", "omniunit": "omniunit", "isr": "insureum", "jrex": "jurasaur", "zyn": "zynecoin", "erowan": "sifchain", "cadc": "cad-coin", "coom": "coomcoin", "ndn": "ndn-link", "dyx": "xcoinpay", "jrc": "finchain", "mbs": "micro-blood-science", "naz": "naz-coin", "runes": "runebase", "bcna": "bitcanna", "vlm": "valireum", "tkm": "thinkium", "hta": "historia", "stol": "stabinol", "eds": "endorsit", "icol": "icolcoin", "mne": "minereum", "bag": "blockchain-adventurers-guild", "hdao": "hyperdao", "tar": "tartarus", "lvn": "livenpay", "ragna": "ragnarok", "aya": "aryacoin", "airx": "aircoins", "pdex": "polkadex", "owdt": "oduwausd", "shit": "shitcoin-token", "fly": "franklin", "ouro": "ouroboros", "pvm": "privateum", "7add": "holdtowin", "hpy": "hyper-pay", "lov": "lovechain", "lfc": "linfinity", "gol": "gogolcoin", "gmci": "game-city", "dexa": "dexa-coin", "rrb": "renrenbit", "ycurve": "curve-fi-ydai-yusdc-yusdt-ytusd", "safetoken": "safetoken", "vfil": "venus-fil", "swet": "swe-token", "bito": "bito-coin", "lsh": "leasehold", "tco": "tcoin-fun", "fomo": "fomo-labs", "egc": "ecog9coin", "mtcn": "multiven", "asac": "asac-coin", "homt": "hom-token", "bots": "bot-ocean", "evy": "everycoin", "lv": "lendchain", "betc": "bet-chips", "mch": "meconcash", "fsp": "flashswap", "ltk": "litecoin-token", "loto": "lotoblock", "vusd": "value-usd", "duk+": "dukascoin", "vxvs": "venus-xvs", "dch": "doch-coin", "ball": "ball-coin", "asusd": "aave-susd-v1", "crd": "cryptaldash", "nsd": "nasdacoin", "arnxm": "armor-nxm", "tdps": "tradeplus", "dbtc": "decentralized-bitcoin", "dfc": "defiscale", "drgb": "dragonbit", "fyznft": "fyznft", "whl": "whaleroom", "grg": "rigoblock", "hub": "minter-hub", "stzen": "stakedzen", "hejj": "hedge4-ai", "mgc": "magnachain", "rew": "rewardiqa", "hvt": "hirevibes", "mbit": "mbitbooks", "awg": "aurusgold", "uniusd": "unidollar", "isdt": "istardust", "carr": "carnomaly", "mw": "mirror-world-token", "erz": "earnzcoin", "koel": "koel-coin", "bxh": "bxh", "bazt": "baooka-token", "rth": "rotharium", "dream": "dreamscoin", "lbet": "lemon-bet", "beast": "beast-dao", "vega": "vega-coin", "eup": "eup-chain", "thr": "thorecoin", "dgp": "dgpayment", "long": "long-coin", "pwrb": "powerbalt", "agri": "agrinovuscoin", "mzg": "moozicore", "bchc": "bitcherry", "it": "idc-token", "limit": "limitswap", "pgc": "pegascoin", "rtm": "raptoreum", "repo": "repo", "pump": "pump-coin", "pdai": "prime-dai", "city": "city-coin", "hmnc": "humancoin-2", "asn": "ascension", "agvc": "agavecoin", "fullsend": "full-send", "nnb": "nnb-token", "nanox": "project-x", "v2xt": "v2x-token", "okt": "okexchain", "pton": "foresting", "tcr": "tecracoin", "pass": "passport-finance", "bxt": "bitfxt-coin", "psix": "propersix", "rld": "real-land", "bixb": "bixb-coin", "blfi": "blackfisk", "pivxl": "pivx-lite", "odc": "odinycoin", "flc": "flowchaincoin", "ete": "ethercoin-2", "pazzi": "paparazzi", "bolc": "boliecoin", "sfg": "s-finance", "pdao": "panda-dao", "cbr": "cybercoin", "lbd": "linkbased", "fldt": "fairyland", "mcau": "meld-gold", "thrn": "thorncoin", "vestx": "vestxcoin", "clm": "coinclaim", "abusd": "aave-busd-v1", "ponzi": "ponzicoin", "moontoken": "moontoken", "amsk": "nolewater", "ecos": "ecodollar", "hntc": "hntc-energy-distributed-network", "bnz": "bonezyard", "vbch": "venus-bch", "xpb": "transmute", "vdai": "venus-dai", "ons": "one-share", "yfe": "yfe-money", "hss": "hashshare", "stxym": "stakedxym", "ba": "batorrent", "bitb": "bitcoin-bull", "psk": "pool-of-stake", "solo": "solo-coin", "bns": "bns-token", "miks": "miks-coin", "tls": "tls-token", "bgl": "bitgesell", "bali": "balicoin", "kick": "kickico", "layerx": "unilayerx", "hpc": "happycoin", "bna": "bananatok", "nds": "nodeseeds", "force": "force-dao", "skn": "sharkcoin", "$king": "king-swap", "ani": "anime-token", "coal": "coalculus", "dsc": "data-saver-coin", "hfil": "huobi-fil", "mtp": "multiplay", "argp": "argenpeso", "vlt": "bankroll-vault", "dynge": "dyngecoin", "xscp": "scopecoin", "minty": "minty-art", "bravo": "bravo-coin", "jfin": "jfin-coin", "lbt": "lbt-chain", "ship": "shipchain", "btcr": "bitcurate", "niu": "niubiswap", "stb": "stb-chain", "eland": "etherland", "eto": "essek-tov", "opti": "optitoken", "dkkt": "dkk-token", "vect": "vectorium", "spdx": "spender-x", "vltc": "venus-ltc", "clbk": "cloudbric", "fuzz": "fuzzballs", "akita": "akita-inu", "gera": "gera-coin", "ich": "ideachain", "bbx": "ballotbox", "shpp": "shipitpro", "fgc": "fantasy-gold", "vany": "vanywhere", "bct": "bitcoin-trust", "btzc": "beatzcoin", "capp": "crypto-application-token", "esti": "easticoin", "ns": "nodestats", "payt": "payaccept", "dic": "daikicoin", "wifi": "wifi-coin", "amana": "aave-mana-v1", "cbrl": "cryptobrl", "boltt": "boltt-coin", "sdfi": "stingdefi", "fsafe": "fair-safe", "vest": "vestchain", "kong": "kong-defi", "silk": "silkchain", "honk": "honk-honk", "qtf": "quantfury", "xamp": "antiample", "kashh": "kashhcoin", "grlc": "garlicoin", "fcr": "fromm-car", "pfid": "pofid-dao", "cxp": "caixa-pay", "611": "sixeleven", "stxem": "stakedxem", "yfiig": "yfii-gold", "scu": "securypto", "sybc": "sybc-coin", "crt": "carr-finance", "rc20": "robocalls", "tzt": "tanzanite", "vdot": "venus-dot", "mvh": "moviecash", "pbs": "pbs-chain", "eplus": "epluscoin", "xtg": "xtg-world", "shd": "shardingdao", "slv": "silverway", "wtn": "waletoken", "bnc": "bnoincoin", "orbi": "orbicular", "mic3": "mousecoin", "awbtc": "aave-wbtc-v1", "hebe": "hebeblock", "cach": "cachecoin", "hoo": "hoo-token", "pegs": "pegshares", "nmst": "nms-token", "save": "save-token-us", "zash": "zimbocash", "spk": "sparks", "dfgl": "defi-gold", "crm": "cream", "creva": "crevacoin", "tree": "tree-defi", "navy": "boatpilot", "mswap": "moneyswap", "pocc": "poc-chain", "cnt": "centurion", "krill": "polywhale", "ausdt": "aave-usdt-v1", "2248": "2-2-4-4-8", "vbtc": "venus-btc", "ect": "superedge", "ick": "ick-mask", "omc": "ormeus-cash", "bun": "bunnycoin", "lmch": "latamcash", "zupi": "zupi-coin", "gre": "greencoin", "mytv": "mytvchain", "xrge": "rougecoin", "hypr": "hyperburn", "ltz": "litecoinz", "lland": "lyfe-land", "dpc": "dappcents", "xwo": "wooshcoin-io", "vjc": "venjocoin", "pcb": "451pcbcom", "sports": "zensports", "eqz": "equalizer", "dph": "digipharm", "torq": "torq-coin", "bucks": "swagbucks", "uba": "unbox-art", "lemo": "lemochain", "abc": "abc-chain", "xwc": "whitecoin", "sendwhale": "sendwhale", "candybox": "candy-box", "iai": "iai-token", "apis": "apis-coin", "au": "aurumcoin", "bspay": "brosispay", "newton": "newtonium", "ume": "ume-token", "gbk": "goldblock", "gsmt": "grafsound", "ret": "realtract", "curry": "curryswap", "ksc": "kstarcoin", "eubc": "eub-chain", "bak": "baconcoin", "aab": "aax-token", "poll": "clearpoll", "4art": "4artechnologies", "cpx": "coinxclub", "love": "love-coin", "vt": "vectoraic", "btnt": "bitnautic", "swise": "stakewise", "stc": "coinstarter", "gc": "galaxy-wallet", "naut": "astronaut", "kanda": "telokanda", "lgold": "lyfe-gold", "chess": "chesscoin-0-32", "dlx": "dapplinks", "maya": "maya-coin", "ira": "deligence", "dfi": "defichain", "ecl": "eclipseum", "laika": "laikacoin", "exm": "exmo-coin", "intx": "intexcoin", "skc": "skinchain", "mptc": "mnpostree", "ank": "apple-network", "bzh": "bzh-token", "vxrp": "venus-xrp", "nplc": "plus-coin", "hgh": "hgh-token", "bash": "luckchain", "vnt": "inventoryclub", "vsxp": "venus-sxp", "fmt": "finminity", "hapy": "hapy-coin", "etx": "ethereumx", "fex": "fidex-exchange", "stro": "supertron", "mochi": "mochiswap", "ato": "eautocoin", "inst": "instadapp", "bnx": "bnx", "cate": "cash-tech", "now": "changenow-token", "sprk": "sparkster", "c8": "carboneum", "hxy": "hex-money", "nuvo": "nuvo-cash", "deal": "idealcash", "lir": "letitride", "andes": "andes-coin", "ims": "ims-wallet", "safecomet": "safecomet", "sdao": "solar-dao", "qbc": "quebecoin", "pbase": "polkabase", "newos": "newstoken", "light": "lightning-protocol", "ezpay": "eazypayza", "idl": "idl-token", "vxc": "vinx-coin", "mvc": "mileverse", "spaz": "swapcoinz", "yap": "yap-stone", "sloth": "slothcoin", "trump": "trumpcoin", "curve": "curvehash", "lburst": "loanburst", "dna": "metaverse-dualchain-network-architecture", "bbank": "blockbank", "atusd": "aave-tusd-v1", "glov": "glovecoin", "ausdc": "aave-usdc-v1", "kuky": "kuky-star", "qnc": "qnodecoin", "tknt": "tkn-token", "hlp": "help-coin", "rpepe": "rare-pepe", "nana": "ape-tools", "vgtg": "vgtgtoken", "eost": "eos-trust", "bmh": "blockmesh-2", "scurve": "lp-scurve", "cummies": "cumrocket", "mbm": "mbm-token", "xby": "xtrabytes", "alink": "aave-link-v1", "xtnc": "xtendcash", "nar": "nar-token", "scs": "speedcash", "entrc": "entercoin", "fastx": "transfast", "1gold": "1irstgold", "eswap": "eswapping", "shib": "shiba-inu", "hint": "hintchain", "cbet": "cryptobet", "twi": "trade-win", "ara": "ara-token", "xbe": "xbe-token", "tea": "tea-token", "wpp": "wpp-token", "acsi": "acryptosi", "ryiu": "ryi-unity", "kishu": "kishu-inu", "bitci": "bitcicoin", "ramen": "ramenswap", "nokn": "nokencoin", "ez": "easyfi", "forex": "forexcoin", "nter": "nter", "cell": "cellframe", "sprtz": "spritzcoin", "akm": "cost-coin", "vlink": "venus-link", "dtube": "dtube-coin", "gcx": "germancoin", "sox": "ethersocks", "doos": "doos-token", "vdoge": "venus-doge", "grw": "growthcoin", "dscp": "disciplina-project-by-teachmeplease", "usds": "stableusd", "hum": "humanscape", "shark": "sharkyield", "soda": "soda-token", "cron": "cryptocean", "elt": "elite-swap", "cmm": "commercium", "bynd": "beyondcoin", "xpt": "cryptobuyer-token", "erc": "europecoin", "smg": "smaugs-nft", "vegi": "veggiecoin", "icr": "intercrone", "sugar": "sugarchain", "hungry": "hungrybear", "refraction": "refraction", "kim": "king-money", "soil": "synth-soil", "bmch": "bmeme-cash", "dain": "dain-token", "soak": "soak-token", "ntb": "tokenasset", "snowge": "snowgecoin", "ctc": "culture-ticket-chain", "dapp": "dapp", "crl": "coral-farm", "baby": "baby-token", "speed": "speed-coin", "ktv": "kmushicoin", "invc": "investcoin", "spacedoge": "space-doge", "vlc": "valuechain", "sets": "sensitrust", "noiz": "noiz-chain", "os76": "osmiumcoin", "xbrt": "bitrewards", "escx": "escx-token", "expo": "online-expo", "bnfi": "blaze-defi", "ncat": "nyan-cat", "fotc": "forte-coin", "drep": "drep-new", "fundx": "funder-one", "nah": "strayacoin", "vprc": "vaperscoin", "vbeth": "venus-beth", "gfarm": "gains-farm", "bwx": "blue-whale", "dmch": "darma-cash", "oc": "oceanchain", "bamboo": "bamboo-token-2", "icicb": "icicb-coin", "hgc": "higamecoin", "spring": "springrole", "plc": "platincoin", "fcbtc": "fc-bitcoin", "ogc": "onegetcoin", "sg": "social-good-project", "torj": "torj-world", "qtv": "quish-coin", "cyf": "cy-finance", "lstr": "meetluna", "hptf": "heptafranc", "csc": "casinocoin", "sovi": "sovi-token", "yfis": "yfiscurity", "lvh": "lovehearts", "tons": "thisoption", "ucos": "ucos-token", "cosm": "cosmo-coin", "g-fi": "gorilla-fi", "hora": "hora", "c4t": "coin4trade", "stt": "scatter-cx", "clout": "blockclout", "ist": "ishop-token", "yfms": "yfmoonshot", "ddr": "digi-dinar", "xno": "xeno-token", "szo": "shuttleone", "dtop": "dhedge-top-index", "nac": "nami-trade", "ltfg": "lightforge", "yfi3": "yfi3-money", "bkk": "bkex-token", "phn": "phillionex", "hcs": "help-coins", "vbusd": "venus-busd", "beluga": "belugaswap", "arcee": "arcee-coin", "webn": "web-innovation-ph", "cp3r": "compounder", "clr": "color", "ethsc": "ethereumsc", "chs": "chainsquare", "cicc": "caica-coin", "evny": "evny-token", "nftl": "nftl-token", "itam": "itam-games", "chex": "chex-token", "mbc": "microbitcoin", "bhd": "bitcoin-hd", "rope": "rope-token", "cennz": "centrality", "kswap": "kimchiswap", "mima": "kyc-crypto", "gp": "goldpieces", "cbex": "cryptobexchange", "gm": "gmcoin", "eurx": "etoro-euro", "colx": "colossuscoinxt", "bcnt": "bincentive", "yea": "yeafinance", "talc": "taleshcoin", "qac": "quasarcoin", "fmta": "fundamenta", "elama": "elamachain", "osc": "oasis-city", "btsucn": "btsunicorn", "pod": "payment-coin", "stlp": "tulip-seed", "echo": "token-echo", "lbr": "liber-coin", "brc": "baer-chain", "cntm": "connectome", "zcnox": "zcnox-coin", "elet": "ether-legends", "frmx": "frmx-token", "tune": "tune-token", "stfiro": "stakehound", "ecpn": "ecpntoken", "trib": "contribute", "gpkr": "gold-poker", "nxl": "next-level", "gb": "goldblocks", "isp": "ishop-plus", "mgp": "mangochain", "carbon": "carboncoin", "vx": "vitex", "when": "when-token", "ykz": "yakuza-dao", "mongocm": "mongo-coin", "micro": "micromines", "btcbam": "bitcoinbam", "flt": "fluttercoin", "tavitt": "tavittcoin", "cyt": "cryptokenz", "ctcn": "contracoin", "lof": "lonelyfans", "ping": "cryptoping", "bicas": "bithercash", "gio": "graviocoin", "pmp": "pumpy-farm", "espro": "esportspro", "udai": "unagii-dai", "rich": "richway-finance", "ggive": "globalgive", "nva": "neeva-defi", "vusdc": "venus-usdc", "hyp": "hyperstake", "ybear": "yield-bear", "cng": "cng-casino", "safegalaxy": "safegalaxy", "ueth": "unagii-eth", "usdh": "honestcoin", "ami": "ammyi-coin", "gnt": "greentrust", "tfuel": "theta-fuel", "jt": "jubi-token", "xpn": "pantheon-x", "ygoat": "yield-goat", "daa": "double-ace", "iown": "iown", "rocket": "rocketgame", "zarh": "zarcash", "jgn": "juggernaut", "feta": "feta-token", "kiz": "kizunacoin", "ski": "skillchain", "robet": "robet-coin", "ivy": "ivy-mining", "co2": "collective", "harta": "harta-tech", "uze": "uze-token", "xrd": "raven-dark", "rain": "rain-network", "yfmb": "yfmoonbeam", "fscc": "fisco", "aca": "acash-coin", "dt3": "dreamteam3", "zaif": "zaif-token", "fto": "futurocoin", "brze": "breezecoin", "tronx": "tronx-coin", "trv": "trustverse", "uvu": "ccuniverse", "euru": "upper-euro", "jic": "joorschain", "she": "shinechain", "robo": "robo-token", "brcp": "brcp-token", "tgn": "terragreen", "roul": "roul-token", "coic": "coic", "csm": "consentium", "ecto": "ectoplasma", "stkr": "staker-dao", "comfy": "comfytoken", "vsc": "vsportcoin", "olive": "olivecash", "crex": "crex-token", "uno": "uno-reinsure", "qhc": "qchi-chain", "kt": "kuaitoken", "lrg": "largo-coin", "$g": "gooddollar", "sv7": "7plus-coin", "rview": "reviewbase", "fl": "freeliquid", "dandy": "dandy", "kgw": "kawanggawa", "bec": "betherchip", "deva": "deva-token", "tokc": "tokyo", "dvc": "dragonvein", "beer": "beer-token", "grn": "dascoin", "zest": "thar-token", "kxc": "kingxchain", "basid": "basid-coin", "soge": "space-hoge", "ebsp": "ebsp-token", "rmoon": "rocketmoon", "tvnt": "travelnote", "bab": "basis-bond", "ain": "ai-network", "noahark": "noah-ark", "mad": "mad-network", "divo": "divo-token", "enrg": "energycoin", "yta": "yottacoin", "bnox": "blocknotex", "hart": "hara-token", "konj": "konjungate", "spup": "spurt-plus", "jack": "jack-token", "kub": "kublaicoin", "crn": "chronocoin", "cent": "centercoin", "cnyt": "cny-tether", "vusdt": "venus-usdt", "coral": "coral-swap", "soba": "soba-token", "lnko": "lnko-token", "kfi": "klever-finance", "bsg": "bitsonic-gas", "bff": "bitcoffeen", "lce": "lance-coin", "yland": "yearn-land", "pxc": "phoenixcoin", "nacho": "nacho-coin", "db": "darkbuild-v2", "mexc": "mexc-token", "fuze": "fuze-token", "jcc": "junca-cash", "zlf": "zillionlife", "milk": "score-milk", "sos": "solstarter", "cfl": "cryptoflow", "tuber": "tokentuber", "levl": "levolution", "usdb": "usd-bancor", "roe": "rover-coin", "ypanda": "yieldpanda", "rupee": "hyruleswap", "ltn": "life-token", "dac": "davinci-coin", "syfi": "soft-yearn", "tiim": "triipmiles", "rwn": "rowan-coin", "cl": "coinlancer", "scm": "simulacrum", "wdt": "voda-token", "slam": "slam-token", "hedg": "hedgetrade", "mob": "mobilecoin", "brmv": "brmv-token", "dfm": "defi-on-mcw", "fbt": "fanbi-token", "zeus": "zuescrowdfunding", "dwz": "defi-wizard", "yfip": "yfi-paprika", "tbake": "bakerytools", "ride": "ride-my-car", "gbpu": "upper-pound", "berg": "bergco-coin", "boot": "bootleg-nft", "aidus": "aidus", "hrd": "hrd", "gnto": "goldenugget", "sss": "simple-software-solutions", "rkt": "rocket-fund", "earth": "earth-token", "pal": "playandlike", "svc": "satoshivision-coin", "fc": "futurescoin", "bih": "bithostcoin", "bobt": "boboo-token", "punk-attr-5": "punk-attr-5", "gfnc": "grafenocoin-2", "fans": "unique-fans", "hmc": "harmonycoin", "aries": "aries-chain", "wgp": "w-green-pay", "memes": "memes-token", "zac": "zac-finance", "ioox": "ioox-system", "zcrt": "zcore-token", "ytho": "ytho-online", "cscj": "csc-jackpot", "hland": "hland-token", "tao": "tao-network", "nst": "newsolution", "alc": "alrightcoin", "cbp": "cashbackpro", "erk": "eureka-coin", "qark": "qanplatform", "env": "env-finance", "brb": "rabbit-coin", "marsm": "marsmission", "crypl": "cryptolandy", "munch": "munch-token", "sarco": "sarcophagus", "vd": "vindax-coin", "dt": "dcoin-token", "actn": "action-coin", "trxc": "tronclassic", "scn": "silver-coin", "stark": "stark-chain", "trias": "trias-token", "coy": "coinanalyst", "mdao": "martian-dao", "yoo": "yoo-ecology", "tfg1": "energoncoin", "dragon": "dragon-finance", "dgc": "digitalcoin", "spkl": "spoklottery", "vida": "vidiachange", "beeng": "beeng-token", "orbyt": "orbyt-token", "pint": "pub-finance", "zerc": "zeroclassic", "try": "try-finance", "wemix": "wemix-token", "ddos": "disbalancer", "burger": "burger-swap", "htdf": "orient-walt", "treep": "treep-token", "tlnt": "talent-coin", "per": "per-project", "ecr": "ecredit", "c2o": "cryptowater", "baw": "wab-network", "carom": "carillonium", "node": "whole-network", "vcash": "vcash-token", "genes": "genes-chain", "sipc": "simplechain", "zln": "zillioncoin", "inbox": "inbox-token", "mc": "monkey-coin", "tut": "trust-union", "pkp": "pikto-group", "f1c": "future1coin", "samo": "samoyedcoin", "hwi": "hawaii-coin", "gly": "glyph-token", "xchf": "cryptofranc", "wbnb": "wbnb", "lsv": "litecoin-sv", "ssn": "superskynet", "cub": "crypto-user-base", "cf": "californium", "name": "polkadomain", "mrx": "linda", "lxc": "latex-chain", "mcn": "moneta-verde", "fetish": "fetish-coin", "poodl": "poodle", "porte": "porte-token", "medi": "mediconnect", "bdcc": "bitica-coin", "pox": "pollux-coin", "bnj": "binjit-coin", "ghd": "giftedhands", "ctat": "cryptassist", "dili": "d-community", "hdn": "hidden-coin", "codeo": "codeo-token", "lsilver": "lyfe-silver", "lvt": "lives-token", "punk-attr-4": "punk-attr-4", "kassiahome": "kassia-home", "bvnd": "binance-vnd", "ucr": "ultra-clear", "pbom": "pocket-bomb", "xbn": "xbn", "btour": "btour-chain", "jbp": "jb-protocol", "proud": "proud-money", "drg": "dragon-coin", "carb": "carbon-labs", "hybn": "hey-bitcoin", "aws": "aurus-silver", "sbgo": "bingo-share", "idx": "index-chain", "yo": "yobit-token", "mti": "mti-finance", "gldr": "golder-coin", "pig": "pig-finance", "hxn": "havens-nook", "bcvt": "bitcoinvend", "cbank": "crypto-bank", "live": "tronbetlive", "xrpc": "xrp-classic", "famous": "famous-coin", "cfxq": "cfx-quantum", "zbk": "zbank-token", "cbix7": "cbi-index-7", "dbund": "darkbundles", "god": "bitcoin-god", "kili": "kilimanjaro", "papel": "papel", "yfarm": "yfarm-token", "cdash": "crypto-dash", "gl": "green-light", "mandi": "mandi-token", "wusd": "wrapped-usd", "crg": "cryptogcoin", "esz": "ethersportz", "clva": "clever-defi", "bscs": "bsc-station", "navi": "natus-vincere-fan-token", "bgx": "bitcoingenx", "fed": "fedora-gold", "armx": "armx-unidos", "hiz": "hiz-finance", "fyy": "grandpa-fan", "tbcc": "tbcc-wallet", "dfe": "dfe-finance", "smile": "smile-token", "mkb": "maker-basic", "rugbust": "rug-busters", "mveda": "medicalveda", "btcmz": "bitcoinmono", "tsla": "tessla-coin", "svr": "sovranocoin", "minx": "innovaminex", "liq": "liquidity-bot-token", "yff": "yff-finance", "808ta": "808ta-token", "dogdefi": "dogdeficoin", "jnb": "jinbi-token", "ctrfi": "chestercoin", "mcrn": "macaronswap", "dxy": "dxy-finance", "stax": "stablexswap", "party": "money-party", "wleo": "wrapped-leo", "kip": "khipu-token", "supra": "supra-token", "dcnt": "decenturion", "punk-female": "punk-female", "xpd": "petrodollar", "bridge": "multibridge", "fgp": "fingerprint", "pet": "battle-pets", "nc": "nayuta-coin", "tkc": "token-planets", "viking": "viking-swap", "nyc": "newyorkcoin", "cca": "counos-coin", "wheat": "wheat-token", "grwi": "growers-international", "hg": "hygenercoin", "lnt": "lottonation", "upb": "upbtc-token", "ocp": "oc-protocol", "bccx": "bitconnectx-genesis", "panther": "pantherswap", "mello": "mello-token", "punk-zombie": "punk-zombie", "hdac": "hdac", "hyd": "hydra-token", "sprx": "sprint-coin", "rc": "russell-coin", "remit": "remita-coin", "bolo": "bollo-token", "q8e20": "q8e20-token", "solace": "solace-coin", "dltx": "deltaexcoin", "wsc": "wesing-coin", "gpyx": "pyrexcoin", "tom": "tom-finance", "etf": "entherfound", "cbucks": "cryptobucks", "fred": "fredenergy", "bnxx": "bitcoinnexx", "ttm": "tothe-moon", "jac": "jasper-coin", "ert": "eristica", "pola": "polaris-share", "btd": "bolt-true-dollar", "xqc": "quras-token", "iog": "playgroundz", "pai": "project-pai", "dcy": "dinastycoin", "emoji": "emojis-farm", "but": "bitup-token", "orc": "oracle-system", "vollar": "vollar", "md+": "moon-day-plus", "kyf": "kryptofranc", "skb": "sakura-bloom", "sora": "sorachancoin", "quam": "quam-network", "phoon": "typhoon-cash", "ror": "ror-universe", "alusd": "alchemix-usd", "syax": "staked-yaxis", "xlmg": "stellar-gold", "yt": "cherry-token", "hate": "heavens-gate", "wet": "weshow", "kbtc": "klondike-btc", "ww": "wayawolfcoin", "jus": "just-network", "tym": "timelockcoin", "grap": "grap-finance", "cet": "coinex-token", "yfos": "yfos-finance", "deuro": "digital-euro", "hp": "heartbout-pay", "fds": "fds", "cnz": "coinzo-token", "vnxlu": "vnx-exchange", "rak": "rake-finance", "dfn": "difo-network", "myk": "mykonos-coin", "icnq": "iconiq-lab-token", "soga": "soga-project", "elon": "dogelon-mars", "btllr": "betller-coin", "wxtc": "wechain-coin", "vers": "versess-coin", "lsc": "littlesesame", "pyro": "pyro-network", "allbi": "all-best-ico", "uc": "youlive-coin", "bic": "bitcrex-coin", "elyx": "elynet-token", "dff": "defi-firefly", "yfed": "yfedfinance", "tndr": "thunder-swap", "cops": "cops-finance", "rckt": "rocket-token", "ryip": "ryi-platinum", "btcu": "bitcoin-ultra", "ft1": "fortune1coin", "ebox": "ethbox-token", "pow": "eos-pow-coin", "kper": "kper-network", "dcb": "digital-coin", "fkx": "fortknoxter", "1mil": "1million-nfts", "yd-eth-mar21": "yd-eth-mar21", "unii": "unii-finance", "trt": "taurus-chain", "bcm": "bitcoinmoney", "usdu": "upper-dollar", "dzar": "digital-rand", "vlad": "vlad-finance", "dio": "deimos-token", "fnb": "finexbox-token", "seol": "seed-of-love", "ttx": "talent-token", "obtc": "boringdao-btc", "wiken": "project-with", "tst": "touch-social", "vena": "vena-network", "tyt": "tianya-token", "pamp": "pamp-network", "hokk": "hokkaidu-inu", "xt": "xtcom-token", "kodx": "king-of-defi", "zttl": "zettelkasten", "xcon": "connect-coin", "poc": "poc-blockchain", "bingus": "bingus-token", "ine": "intellishare", "fcx": "fission-cash", "exe": "8x8-protocol", "emdc": "emerald-coin", "yd-btc-jun21": "yd-btc-jun21", "moar": "moar", "fshn": "fashion-coin", "wcc": "wincash-coin", "load": "load-network", "acr": "acreage-coin", "cann": "cannabiscoin", "zep": "zeppelin-dao", "bcf": "bitcoin-fast", "etet": "etet-finance", "xdef2": "xdef-finance", "mich": "charity-alfa", "gogo": "gogo-finance", "eqo": "equos-origin", "crts": "cryptotipsfr", "xmoo": "cloud-moolah", "kseed": "kush-finance", "cla": "candela-coin", "loa": "loa-protocol", "spmk": "space-monkey", "lp": "lepard-coin", "yuno": "yuno-finance", "noel": "noel-capital", "etna": "etna-network", "emrx": "emirex-token", "prqboost": "parsiq-boost", "sfund": "seedify-fund", "neww": "newv-finance", "yg": "yearn-global", "esrc": "echosoracoin", "hugo": "hugo-finance", "mhlx": "helixnetwork", "hogl": "hogl-finance", "balo": "balloon-coin", "dixt": "dixt-finance", "kpc": "koloop-basic", "mach": "mach", "map": "marcopolo", "latino": "latino-token", "yfix": "yfix-finance", "nxct": "xchain-token", "bbgc": "bigbang-game", "modx": "model-x-coin", "btchg": "bitcoinhedge", "wbind": "wrapped-bind", "xts": "xaviera-tech", "blcc": "bullers-coin", "yd-eth-jun21": "yd-eth-jun21", "ethbnt": "ethbnt", "mvt": "the-movement", "earn$": "earn-network", "ubx": "ubix-network", "agrs": "agoras", "don": "donnie-finance", "biot": "biopassport", "phl": "placeh", "lpc": "lightpaycoin", "azt": "az-fundchain", "nvt": "nervenetwork", "dcw": "decentralway", "zuz": "zuz-protocol", "vkt": "vankia-chain", "loon": "loon-network", "htn": "heartnumber", "wxdai": "wrapped-xdai", "ivc": "invoice-coin", "vcg": "vipcoin-gold", "maki": "maki-finance", "ccrb": "cryptocarbon", "ymen": "ymen-finance", "tpt": "token-pocket", "moma": "mochi-market", "chm": "cryptochrome", "haze": "haze-finance", "yfib": "yfibalancer-finance", "cord": "cord-defi-eth", "wst": "winsor-token", "btap": "bta-protocol", "isikc": "isiklar-coin", "epg": "encocoinplus", "lnx": "linix", "wavax": "wrapped-avax", "grpl": "grpl-finance-2", "gcz": "globalchainz", "fridge": "fridge-token", "adk": "aidos-kuneen", "btca": "bitcoin-anonymous", "mtr": "meter-stable", "cnrg": "cryptoenergy", "bia": "bilaxy-token", "husl": "hustle-token", "more": "legends-room", "wcelo": "wrapped-celo", "wec": "wave-edu-coin", "yd-btc-mar21": "yd-btc-mar21", "yape": "gorillayield", "prob": "probit-exchange", "mcan": "medican-coin", "onex": "onex-network", "sd": "smart-dollar", "add": "add-xyz-new", "dx": "dxchain", "molk": "mobilink-coin", "hc8": "hydrocarbon-8", "awt": "airdrop-world", "umc": "universal-marketing-coin", "btad": "bitcoin-adult", "onlexpa": "onlexpa-token", "elite": "ethereum-lite", "src": "super-running-coin", "yrise": "yrise-finance", "vinx": "vinx-coin-sto", "torocus": "torocus-token", "wtk": "wadzpay-token", "tai": "tai", "gpc": "greenpay-coin", "chadlink": "chad-link-set", "cac": "coinall-token", "jtt": "joytube-token", "labra": "labra-finance", "xrm": "refine-medium", "ext": "exchain", "cust": "custody-token", "ares": "ares-protocol", "amio": "amino-network", "joos": "joos-protocol", "o-ocean-mar22": "o-ocean-mar22", "qcore": "qcore-finance", "dark": "darkbuild", "yfpro": "yfpro-finance", "bundb": "unidexbot-bsc", "neuro": "neuro-charity", "most": "most-protocol", "womi": "wrapped-ecomi", "scha": "schain-wallet", "gts": "gt-star-token", "scat": "sad-cat-token", "brn": "brainaut-defi", "fam": "yefam-finance", "prd": "predator-coin", "btnyx": "bitonyx-token", "b1p": "b-one-payment", "lnk": "link-platform", "l2p": "lung-protocol", "gmng": "global-gaming", "xsm": "spectrum-cash", "btf": "btf", "creed": "creed-finance", "ganja": "trees-finance", "swusd": "swusd", "mngo": "mango-markets", "ytsla": "ytsla-finance", "kombat": "crypto-kombat", "ul": "uselink-chain", "btcf": "bitcoin-final", "sbdo": "bdollar-share", "fork": "gastroadvisor", "anty": "animalitycoin", "tfc": "treasure-financial-coin", "geth": "guarded-ether", "nfi": "norse-finance", "yfive": "yfive-finance", "dmtc": "dmtc-token", "wxtz": "wrapped-tezos", "dscvr": "dscvr-finance", "rhea": "rheaprotocol", "ftb": "free-tool-box", "bpc": "backpacker-coin", "lem": "lemur-finance", "woop": "woonkly-power", "nbs": "new-bitshares", "phtf": "phantom-token", "gcbn": "gas-cash-back", "atls": "atlas", "hosp": "hospital-coin", "69c": "6ix9ine-chain", "wmatic": "wmatic", "whole": "whitehole-bsc", "yyfi": "yyfi-protocol", "yfst": "yfst-protocol", "pfi": "protocol-finance", "idt": "investdigital", "bmt": "bmining-token", "iflt": "inflationcoin", "yffii": "yffii-finance", "xns": "xeonbit-token", "brap": "brapper-token", "nbot": "naka-bodhi-token", "dino": "jurassic-farm", "xcf": "cenfura-token", "wnl": "winstars", "exnx": "exenox-mobile", "elcash": "electric-cash", "cp": "cryptoprofile", "tcp": "the-crypto-prophecies", "wae": "wave-platform", "rbtc": "rootstock", "xfc": "football-coin", "halo": "halo-platform", "tnet": "title-network", "gvc": "gemvault-coin", "yeth": "fyeth-finance", "nash": "neoworld-cash", "slme": "slime-finance", "invox": "invox-finance", "acpt": "crypto-accept", "bdog": "bulldog-token", "tuda": "tutors-diary", "water": "water-finance", "xag": "xrpalike-gene", "vdg": "veridocglobal", "oac": "one-army-coin", "glo": "glosfer-token", "pearl": "pearl-finance", "afin": "afin-coin", "blc": "bullionschain", "ltcb": "litecoin-bep2", "aura": "aura-protocol", "hcc": "holiday-chain", "hnc": "helleniccoin", "pyr": "vulcan-forged", "ztnz": "ztranzit-coin", "hyfi": "hyper-finance", "fras": "frasindo-rent", "bday": "birthday-cake", "port": "packageportal", "btri": "trinity-bsc", "idon": "idoneus-token", "payou": "payou-finance", "crwn": "crown-finance", "vgd": "vangold-token", "atc": "atlantic-coin", "inb": "insight-chain", "obsr": "observer-coin", "bhig": "buckhath-coin", "prism": "prism-network", "emont": "etheremontoken", "entrp": "hut34-entropy", "bsh": "bitcoin-stash", "volts": "volts-finance", "wtp": "web-token-pay", "luc": "play2live", "hcut": "healthchainus", "blzn": "blaze-network", "pmc": "paymastercoin", "spore": "spore-engineering", "swipe": "swipe-network", "adf": "ad-flex-token", "kbond": "klondike-bond", "gng": "gold-and-gold", "codex": "codex-finance", "eyes": "eyes-protocol", "vcoin": "tronvegascoin", "xao": "alloy-project", "cdy": "bitcoin-candy", "nmn": "99masternodes", "krypto": "kryptobellion", "wzec": "wrapped-zcash", "brg": "bridge-oracle", "scifi": "scifi-finance", "momo": "momo-protocol", "wpx": "wallet-plus-x", "tiox": "trade-token", "froge": "froge-finance", "mort": "dynamic-supply-tracker", "vancii": "vanci-finance", "mxf": "mixty-finance", "pipi": "pippi-finance", "neal": "neal", "hx": "hyperexchange", "gent": "genesis-token", "dawn": "dawn-protocol", "stakd": "stakd-finance", "aplp": "apple-finance", "feed": "feeder-finance", "rsct": "risecointoken", "bks": "barkis", "dpr": "deeper-network", "jsb": "jsb-foundation", "buc": "buyucoin-token", "liquid": "netkoin-liquid", "zoom": "coinzoom-token", "gzil": "governance-zil", "aph": "apholding-coin", "amc": "anonymous-coin", "nya": "nyanswop-token", "neon": "neonic-finance", "eveo": "every-original", "bcb": "bcb-blockchain", "ltcu": "litecoin-ultra", "mlk": "milk-alliance", "wanatha": "wrapped-anatha", "kbc": "karatgold-coin", "gnc": "galaxy-network", "es": "era-swap-token", "bcash": "bankcoincash", "dgnn": "dragon-network", "owo": "one-world-coin", "pjm": "pajama-finance", "bribe": "bribe-token", "cxc": "capital-x-cell", "upeur": "universal-euro", "bpt": "bitpumps-token", "deve": "divert-finance", "ccy": "cryptocurrency", "pareto": "pareto-network", "npw": "new-power-coin", "gvy": "groovy-finance", "fsc": "five-star-coin", "rick": "infinite-ricks", "umbr": "umbra-network", "3crv": "lp-3pool-curve", "aedart": "aedart-network", "upxau": "universal-gold", "ucap": "unicap-finance", "wtf": "walnut-finance", "mzk": "muzika-network", "banana": "apeswap-finance", "pepr": "pepper-finance", "thor": "asgard-finance", "hnb": "hashnet-biteco", "dop": "dopple-finance", "shild": "shield-network", "elena": "elena-protocol", "eer": "ethereum-erush", "etr": "electric-token", "new": "newton-project", "spex": "sproutsextreme", "dart": "dart-insurance", "sch": "schillingcoin", "svs": "silver-gateway", "ubtc": "united-bitcoin", "dbix": "dubaicoin-dbix", "cavo": "excavo-finance", "mtns": "omotenashicoin", "cdl": "coindeal-token", "btrl": "bitcoinregular", "gs": "genesis-shards", "metp": "metaprediction", "coll": "collateral-pay", "xuc": "exchange-union", "prtn": "proton-project", "wac": "warranty-chain", "tcnx": "tercet-network", "espi": "spider-ecology", "hltc": "huobi-litecoin", "cad": "candy-protocol", "cbtc": "classicbitcoin", "bfr": "bridge-finance", "cvt": "civitas-protocol", "mcbase": "mcbase-finance", "vcco": "vera-cruz-coin", "steak": "steaks-finance", "forestry": "forestry-token", "lyn": "lynchpin_token", "miva": "minerva-wallet", "mayp": "maya-preferred-223", "afcash": "africunia-bank", "polven": "polka-ventures", "evo": "dapp-evolution", "ucoin": "universal-coin", "osm": "options-market", "xdt": "xwc-dice-token", "ethmny": "ethereum-money", "erd": "eldorado-token", "zseed": "sowing-network", "sedo": "sedo-pow-token", "prdx": "predix-network", "perx": "peerex-network", "shrimp": "shrimp-finance", "hdot": "huobi-polkadot", "chord": "chord-protocol", "atis": "atlantis-token", "ccake": "cheesecakeswap", "ica": "icarus-finance", "mov": "motiv-protocol", "dwc": "digital-wallet", "abao": "aladdin-galaxy", "fff": "force-for-fast", "ths": "the-hash-speed", "xlab": "xceltoken-plus", "yf4": "yearn4-finance", "uto": "unitopia-token", "bog": "bogged-finance", "hdw": "hardware-chain", "ald": "aludra-network", "ct": "communitytoken", "ecoreal": "ecoreal-estate", "sifi": "simian-finance", "esg": "empty-set-gold", "byn": "beyond-finance", "snb": "synchrobitcoin", "kimchi": "kimchi-finance", "nfd": "nifdo-protocol", "bnsg": "bns-governance", "heth": "huobi-ethereum", "kmw": "kepler-network", "xmc": "monero-classic-xmc", "lncx": "luna-nusa-coin", "bbl": "bubble-network", "wscrt": "secret-erc20", "katana": "katana-finance", "2based": "2based-finance", "sofi": "social-finance", "sho": "showcase-token", "bsk": "bitcoinstaking", "bf": "bitforex", "dynmt": "dynamite-token", "onez": "the-nifty-onez", "gjco": "giletjaunecoin", "ctg": "cryptorg-token", "usdo": "usd-open-dollar", "afi": "aries-financial-token", "lnot": "livenodes-token", "bcc": "basis-coin-cash", "m3c": "make-more-money", "dimi": "diminutive-coin", "sheesha": "sheesha-finance", "brzx": "braziliexs-token", "labo": "the-lab-finance", "fusion": "fusion-energy-x", "vct": "valuecybertoken", "afen": "afen-blockchain", "hps": "happiness-token", "fico": "french-ico-coin", "ldn": "ludena-protocol", "dxts": "destiny-success", "typh": "typhoon-network", "cwv": "cryptoworld-vip", "qcx": "quickx-protocol", "weather": "weather-finance", "plst": "philosafe-token", "advc": "advertisingcoin", "esce": "escroco", "rlr": "relayer-network", "wmpro": "wm-professional", "bpakc": "bitpakcointoken", "fol": "folder-protocol", "wccx": "wrapped-conceal", "ans": "ans-crypto-coin", "bwb": "bw-token", "nos": "nitrous-finance", "eoc": "everyonescrypto", "sprkl": "sparkle", "xyx": "burn-yield-burn", "esn": "escudonavacense", "krg": "karaganda-token", "aevo": "aevo", "yfiking": "yfiking-finance", "nftart": "nft-art-finance", "pxl": "piction-network", "uusdc": "unagii-usd-coin", "spl": "simplicity-coin", "axa": "alldex-alliance", "ssj": "super-saiya-jin", "comc": "community-chain", "libref": "librefreelencer", "ufc": "union-fair-coin", "emb": "block-collider", "kimochi": "kimochi-finance", "usdj": "just-stablecoin", "moonday": "moonday-finance", "altm": "altmarkets-coin", "rfy": "rfyield-finance", "idv": "idavoll-network", "wsta": "wrapped-statera", "boc": "bitorcash-token", "yfild": "yfilend-finance", "cst": "cryptosolartech", "cnp": "cryptonia-poker", "chal": "chalice-finance", "craft": "decraft-finance", "nyan": "yieldnyan-token", "smpl": "smpl-foundation", "slice": "tranche-finance", "stpl": "stream-protocol", "aens": "aen-smart-token", "ram": "ramifi", "wag8": "wrapped-atromg8", "bttr": "bittracksystems", "kmc": "king-maker-coin", "renbtccurve": "lp-renbtc-curve", "bst1": "blueshare-token", "trips": "trips-community", "snbl": "safenebula", "trdl": "strudel-finance", "shield": "shield-protocol", "yfarmer": "yfarmland-token", "bchip": "bluechips-token", "udt": "unlock-protocol", "mg": "minergate-token", "flexethbtc": "flexeth-btc-set", "mpwr": "empower-network", "blink": "blockmason-link", "print": "printer-finance", "lic": "lightening-cash", "ctx": "cryptex-finance", "tin": "tinfoil-finance", "ec2": "employment-coin", "ddrt": "digidinar-token", "infi": "insured-finance", "skt": "sealblock-token", "tni": "tunnel-protocol", "defit": "defit", "xbt": "elastic-bitcoin", "dvi": "dvision-network", "ringx": "ring-x-platform", "nmp": "neuromorphic-io", "vamp": "vampire-protocol", "tcapethdai": "holistic-eth-set", "gpo": "galaxy-pool-coin", "bci": "bitcoin-interest", "biut": "bit-trust-system", "tcapbtcusdc": "holistic-btc-set", "kdg": "kingdom-game-4-0", "mof": "molecular-future", "idlesusdyield": "idle-susd-yield", "cgc": "cash-global-coin", "sny": "syntheify-token", "spot": "cryptospot-token", "flm": "flamingo-finance", "tsc": "time-space-chain", "bcr": "bankcoin-reserve", "goi": "goforit", "bplc": "blackpearl-chain", "ggc": "gg-coin", "tschybrid": "tronsecurehybrid", "bb": "blackberry-token", "whxc": "whitex-community", "tkx": "tokenize-xchange", "bxk": "bitbook-gambling", "hpt": "huobi-pool-token", "hds": "hotdollars-token", "west": "waves-enterprise", "jfi": "jackpool-finance", "bhc": "billionhappiness", "bcs": "business-credit-substitute", "syfl": "yflink-synthetic", "mtlmc3": "metal-music-coin", "btrs": "bitball-treasure", "roger": "theholyrogercoin", "tori": "storichain-token", "afc": "anti-fraud-chain", "gme": "gamestop-finance", "ssl": "sergey-save-link", "idleusdtyield": "idle-usdt-yield", "wsb": "wall-street-bets-dapp", "degenr": "degenerate-money", "idleusdcyield": "idle-usdc-yield", "saturn": "saturn-network", "scho": "scholarship-coin", "sensi": "sensible-finance", "wbb": "wild-beast-block", "cnet": "currency-network", "unicrap": "unicrap", "ccf": "cerberus", "pld": "pureland-project", "fxtc": "fixed-trade-coin", "myid": "my-identity-coin", "rnrc": "rock-n-rain-coin", "bbi": "bigboys-industry", "qqq": "qqq-token", "cytr": "cyclops-treasure", "xep": "electra-protocol", "nye": "newyork-exchange", "uhp": "ulgen-hash-power", "tomoe": "tomoe", "magi": "magikarp-finance", "ltfn": "litecoin-finance", "tryon": "stellar-invictus", "bdigg": "badger-sett-digg", "swl": "swiftlance-token", "vsd": "value-set-dollar", "pnc": "parellel-network", "usdfl": "usdfreeliquidity", "shx": "stronghold-token", "ipx": "ipx-token", "cyc": "cyclone-protocol", "hcore": "hardcore-finance", "fbn": "five-balance", "mtnt": "mytracknet-token", "supt": "super-trip-chain", "hole": "super-black-hole", "xlpg": "stellarpayglobal", "nnn": "novem-gold-token", "mwc": "mimblewimblecoin", "u8d": "universal-dollar", "tpc": "trading-pool-coin", "yficg": "yfi-credits-group", "tmcn": "timecoin-protocol", "stor": "self-storage-coin", "mdza": "medooza-ecosystem", "ethusdadl4": "ethusd-adl-4h-set", "ell": "eth-ai-limit-loss", "stgz": "stargaze-protocol", "yusdc": "yusdc-busd-pool", "ce": "crypto-excellence", "3cs": "cryptocricketclub", "xrpbull": "3x-long-xrp-token", "rvp": "revolution-populi", "trxbull": "3x-long-trx-token", "itf": "ins3-finance-coin", "ciphc": "cipher-core-token", "reau": "vira-lata-finance", "asm": "assemble-protocol", "xgt": "xion-global-token", "xbtx": "bitcoin-subsidium", "sicc": "swisscoin-classic", "bnbbull": "3x-long-bnb-token", "meteor": "meteorite-network", "sgc": "secured-gold-coin", "twj": "tronweeklyjournal", "goldr": "golden-ratio-coin", "uusdt": "unagii-tether-usd", "bvl": "bullswap-protocol", "mee": "mercurity-finance", "mps": "mt-pelerin-shares", "limex": "limestone-network", "ssf": "safe-seafood-coin", "icp": "dfinity-iou", "eosbull": "3x-long-eos-token", "ghp": "global-hash-power", "vbzrx": "vbzrx", "ctf": "cybertime-finance", "brain": "nobrainer-finance", "bctr": "bitcratic-revenue", "usdap": "bond-appetite-usd", "leobull": "3x-long-leo-token", "cbsn": "blockswap-network", "agov": "answer-governance", "aac": "acute-angle-cloud", "stars": "mogul-productions", "far": "farmland-protocol", "osch": "open-source-chain", "dcl": "delphi-chain-link", "cnc": "global-china-cash", "macpo": "macpo", "mkt": "monkey-king-token", "opcx": "over-powered-coin", "mcat20": "wrapped-moon-cats", "thpt": "helio-power-token", "csto": "capitalsharetoken", "okbbull": "3x-long-okb-token", "rvc": "ravencoin-classic", "encx": "enceladus-network", "sxcc": "southxchange-coin", "stnd": "standard-protocol", "etnxp": "electronero-pulse", "ksp": "klayswap-protocol", "chow": "chow-chow-finance", "mcaps": "mango-market-caps", "foxt": "fox-trading-token", "nhc": "neo-holistic-coin", "hbch": "huobi-bitcoin-cash", "fz": "frozencoin-network", "mhsp": "melonheadsprotocol", "afdlt": "afrodex-labs-token", "ethmoonx": "eth-moonshot-x-yield-set", "catx": "cat-trade-protocol", "xrphedge": "1x-short-xrp-token", "bnbhedge": "1x-short-bnb-token", "rmc": "russian-miner-coin", "cgb": "crypto-global-bank", "wszo": "wrapped-shuttleone", "bnbbear": "3x-short-bnb-token", "trxhedge": "1x-short-trx-token", "mpg": "max-property-group", "hbo": "hash-bridge-oracle", "eoshedge": "1x-short-eos-token", "unit": "universal-currency", "puml": "puml-better-health", "dfly": "dragonfly-protocol", "xuni": "ultranote-infinity", "gbc": "golden-bridge-coin", "pvp": "playervsplayercoin", "brick": "brick", "btfc": "bitcoin-flash-cash", "delta rlp": "rebasing-liquidity", "bbadger": "badger-sett-badger", "rtc": "read-this-contract", "trxbear": "3x-short-trx-token", "cpi": "crypto-price-index", "xrpbear": "3x-short-xrp-token", "yfb2": "yearn-finance-bit2", "lmt": "lympo-market-token", "tan": "taklimakan-network", "ght": "global-human-trust", "dzi": "definition-network", "pol": "proof-of-liquidity", "liqlo": "liquid-lottery-rtc", "kp3rb": "keep3r-bsc-network", "axt": "alliance-x-trading", "tln": "trustline-network", "mco2": "moss-carbon-credit", "okbbear": "3x-short-okb-token", "iop": "internet-of-people", "gsa": "global-smart-asset", "eosbear": "3x-short-eos-token", "yhfi": "yearn-hold-finance", "if": "impossible-finance", "zelda elastic cash": "zelda-elastic-cash", "ang": "aureus-nummus-gold", "leobear": "3x-short-leo-token", "loom": "loom-network-new", "satx": "satoexchange-token", "awc": "atomic-wallet-coin", "abp": "arc-block-protocol", "pmt": "playmarket", "kch": "keep-calm", "fish": "penguin-party-fish", "okbhedge": "1x-short-okb-token", "eqmt": "equus-mining-token", "bafi": "bafi-finance-token", "hbdc": "happy-birthday-coin", "wton": "wrapped-ton-crystal", "ff1": "two-prime-ff1-token", "ygy": "generation-of-yield", "xtzbull": "3x-long-tezos-token", "fcd": "future-cash-digital", "climb": "climb-token-finance", "beth": "binance-eth", "tmh": "trustmarkethub-token", "ledu": "education-ecosystem", "plaas": "plaas-farmers-token", "vgo": "virtual-goods-token", "wcusd": "wrapped-celo-dollar", "zgt": "zg-blockchain-token", "mkrbull": "3x-long-maker-token", "dss": "defi-shopping-stake", "gsc": "global-social-chain", "mclb": "millenniumclub", "cana": "cannabis-seed-token", "trdg": "tardigrades-finance", "okbhalf": "0-5x-long-okb-token", "mina": "mina-protocol", "gmm": "gold-mining-members", "gbh": "global-business-hub", "ceek": "ceek", "yfiv": "yearn-finance-value", "\u2728": "sparkleswap-rewards", "xspc": "spectresecuritycoin", "emp": "electronic-move-pay", "eoshalf": "0-5x-long-eos-token", "upusd": "universal-us-dollar", "sushibull": "3x-long-sushi-token", "xjp": "exciting-japan-coin", "pci": "pay-coin", "yi12": "yi12-stfinance", "ncp": "newton-coin-project", "vit": "vice-industry-token", "sst": "simba-storage-token", "ann": "apexel-natural-nano", "spy": "satopay-yield-token", "yfie": "yfiexchange-finance", "ymf20": "yearn20moonfinance", "wxmr": "wrapped-xmr-btse", "dola": "dola-usd", "bbtc": "binance-wrapped-btc", "bfht": "befasterholdertoken", "vntw": "value-network-token", "hsn": "hyper-speed-network", "pnix": "phoenixdefi-finance", "maticbull": "3x-long-matic-token", "coc": "cocktailbar", "wmc": "wrapped-marblecards", "sxpbull": "3x-long-swipe-token", "wht": "wrapped-huobi-token", "msc": "monster-slayer-cash", "btcgw": "bitcoin-galaxy-warp", "cix100": "cryptoindex-io", "stoge": "stoner-doge", "xrphalf": "0-5x-long-xrp-token", "pxt": "populous-xbrl-token", "yskf": "yearn-shark-finance", "atombull": "3x-long-cosmos-token", "opm": "omega-protocol-money", "amf": "asian-model-festival", "bvg": "bitcoin-virtual-gold", "rrt": "recovery-right-token", "usdtbull": "3x-long-tether-token", "mkrbear": "3x-short-maker-token", "xtzhedge": "1x-short-tezos-token", "hpay": "hyper-credit-network", "fredx": "fred-energy-erc20", "dollar": "dollar-online", "deor": "decentralized-oracle", "sleepy": "sleepy-sloth", "tgco": "thaler", "hzt": "black-diamond-rating", "xtzbear": "3x-short-tezos-token", "usc": "ultimate-secure-cash", "yfc": "yearn-finance-center", "bnfy": "b-non-fungible-yearn", "vgt": "vault12", "uenc": "universalenergychain", "sxphedge": "1x-short-swipe-token", "thex": "thore-exchange", "terc": "troneuroperewardcoin", "maticbear": "3x-short-matic-token", "utt": "united-traders-token", "sxpbear": "3x-short-swipe-token", "nut": "native-utility-token", "wis": "experty-wisdom-token", "forestplus": "the-forbidden-forest", "teo": "trust-ether-reorigin", "scv": "super-coinview-token", "gbpx": "etoro-pound-sterling", "matichedge": "1x-short-matic-token", "xcmg": "connect-mining-coin", "trybbull": "3x-long-bilira-token", "idledaiyield": "idle-dai-yield", "deto": "delta-exchange-token", "sushibear": "3x-short-sushi-token", "aapl": "apple-protocol-token", "wx42": "wrapped-x42-protocol", "tmtg": "the-midas-touch-gold", "ibeth": "interest-bearing-eth", "afo": "all-for-one-business", "gcc": "thegcccoin", "ddn": "data-delivery-network", "crs": "cryptorewards", "vetbull": "3x-long-vechain-token", "yfn": "yearn-finance-network", "trybbear": "3x-short-bilira-token", "knc": "kyber-network-crystal", "xlmbull": "3x-long-stellar-token", "xtzhalf": "0-5x-long-tezos-token", "wows": "wolves-of-wall-street", "qtc": "quality-tracing-chain", "bsbt": "bit-storage-box-token", "marc": "market-arbitrage-coin", "matichalf": "0-5x-long-matic-token", "idlewbtcyield": "idle-wbtc-yield", "intratio": "intelligent-ratio-set", "ocrv": "ocrv", "zomb": "antique-zombie-shards", "ducato": "ducato-protocol-token", "usd": "uniswap-state-dollar", "cft": "coinbene-future-token", "btsc": "beyond-the-scene-coin", "julb": "justliquidity-binance", "xbx": "bitex-global", "adabull": "3x-long-cardano-token", "cts": "chainlink-trading-set", "z502": "502-bad-gateway-token", "znt": "zenswap-network-token", "idletusdyield": "idle-tusd-yield", "seco": "serum-ecosystem-token", "atomhedge": "1x-short-cosmos-token", "ggt": "gard-governance-token", "sxphalf": "0-5x-long-swipe-token", "usdtbear": "3x-short-tether-token", "acd": "alliance-cargo-direct", "wct": "waves-community-token", "gtf": "globaltrustfund-token", "ccm": "crypto-coupons-market", "blo": "based-loans-ownership", "dca": "decentralized-currency-assets", "kun": "qian-governance-token", "lbxc": "lux-bio-exchange-coin", "evz": "electric-vehicle-zone", "htg": "hedge-tech-governance", "incx": "international-cryptox", "edi": "freight-trust-network", "atombear": "3x-short-cosmos-token", "earn": "yearn-classic-finance", "linkpt": "link-profit-taker-set", "efg": "ecoc-financial-growth", "glob": "global-reserve-system", "ddrst": "digidinar-stabletoken", "yefi": "yearn-ethereum-finance", "dcd": "digital-currency-daily", "ecell": "consensus-cell-network", "tgcd": "trongamecenterdiamonds", "paxgbull": "3x-long-pax-gold-token", "xlmbear": "3x-short-stellar-token", "ethbull": "3x-long-ethereum-token", "linkrsico": "link-rsi-crossover-set", "smoke": "the-smokehouse-finance", "vethedge": "1x-short-vechain-token", "bed": "bit-ecological-digital", "algobull": "3x-long-algorand-token", "atomhalf": "0-5x-long-cosmos-token", "adabear": "3x-short-cardano-token", "dpt": "diamond-platform-token", "leg": "legia-warsaw-fan-token", "goz": "goztepe-s-k-fan-token", "adahedge": "1x-short-cardano-token", "zelda spring nuts cash": "zelda-spring-nuts-cash", "hth": "help-the-homeless-coin", "tcat": "the-currency-analytics", "hedge": "1x-short-bitcoin-token", "e2c": "electronic-energy-coin", "dogebull": "3x-long-dogecoin-token", "ihf": "invictus-hyprion-fund", "yfrm": "yearn-finance-red-moon", "ltcbull": "3x-long-litecoin-token", "vetbear": "3x-short-vechain-token", "inteth": "intelligent-eth-set-ii", "set": "save-environment-token", "call": "global-crypto-alliance", "uwbtc": "unagii-wrapped-bitcoin", "well": "wellness-token-economy", "yfp": "yearn-finance-protocol", "smnc": "simple-masternode-coin", "gspi": "gspi", "tgic": "the-global-index-chain", "zelda summer nuts cash": "zelda-summer-nuts-cash", "cvcc": "cryptoverificationcoin", "balbull": "3x-long-balancer-token", "tgct": "tron-game-center-token", "mcpc": "mobile-crypto-pay-coin", "bbb": "bullbearbitcoin-set-ii", "gdc": "global-digital-content", "dant": "digital-antares-dollar", "ahf": "americanhorror-finance", "nami": "nami-corporation-token", "bmp": "brother-music-platform", "half": "0-5x-long-bitcoin-token", "gve": "globalvillage-ecosystem", "ems": "ethereum-message-search", "brz": "brz", "dogehedge": "1x-short-dogecoin-token", "tomobull": "3x-long-tomochain-token", "balbear": "3x-short-balancer-token", "twob": "the-whale-of-blockchain", "ethbear": "3x-short-ethereum-token", "paxgbear": "3x-short-pax-gold-token", "bnkrx": "bankroll-extended-token", "vbnt": "bancor-governance-token", "ltcbear": "3x-short-litecoin-token", "algobear": "3x-short-algorand-token", "aipe": "ai-predicting-ecosystem", "bbe": "bullbearethereum-set-ii", "yfiec": "yearn-finance-ecosystem", "adahalf": "0-5x-long-cardano-token", "wbcd": "wrapped-bitcoin-diamond", "algohedge": "1x-short-algorand-token", "ethrsiapy": "eth-rsi-60-40-yield-set-ii", "fnxs": "financex-exchange-token", "bags": "basis-gold-share-heco", "ltchedge": "1x-short-litecoin-token", "mlgc": "marshal-lion-group-coin", "gator": "alligator-fractal-set", "ethhedge": "1x-short-ethereum-token", "pwc": "prime-whiterock-company", "inex": "internet-exchange-token", "sato": "super-algorithmic-token", "dogebear": "3x-short-dogecoin-token", "linkbull": "3x-long-chainlink-token", "idledaisafe": "idle-dai-risk-adjusted", "nyante": "nyantereum", "tomobear": "3x-short-tomochain-token", "linkbear": "3x-short-chainlink-token", "ass": "australian-safe-shepherd", "idleusdtsafe": "idle-usdt-risk-adjusted", "bvol": "1x-long-btc-implied-volatility-token", "pbtt": "purple-butterfly-trading", "cbn": "connect-business-network", "algohalf": "0-5x-long-algorand-token", "aat": "agricultural-trade-chain", "bsvbull": "3x-long-bitcoin-sv-token", "idleusdcsafe": "idle-usdc-risk-adjusted", "yefim": "yearn-finance-management", "sup": "supertx-governance-token", "linkhedge": "1x-short-chainlink-token", "basd": "binance-agile-set-dollar", "nzdx": "etoro-new-zealand-dollar", "rae": "rae-token", "sxut": "spectre-utility-token", "bhp": "blockchain-of-hash-power", "ethhalf": "0-5x-long-ethereum-token", "btceth5050": "btc-eth-equal-weight-set", "ethmo": "eth-momentum-trigger-set", "tomohedge": "1x-short-tomochain-token", "defibull": "3x-long-defi-index-token", "paxghalf": "0-5x-long-pax-gold-token", "p2ps": "p2p-solutions-foundation", "best": "bitpanda-ecosystem-token", "upt": "universal-protocol-token", "balhalf": "0-5x-long-balancer-token", "pec": "proverty-eradication-coin", "dogehalf": "0-5x-long-dogecoin-token", "htbull": "3x-long-huobi-token-token", "linkhalf": "0-5x-long-chainlink-token", "cmid": "creative-media-initiative", "sxdt": "spectre-dividend-token", "ulu": "universal-liquidity-union", "defihedge": "1x-short-defi-index-token", "byte": "btc-network-demand-set-ii", "xautbull": "3x-long-tether-gold-token", "defibear": "3x-short-defi-index-token", "eth2": "eth2-staking-by-poolx", "cmccoin": "cine-media-celebrity-coin", "wcdc": "world-credit-diamond-coin", "bptn": "bit-public-talent-network", "licc": "life-is-camping-community", "brrr": "money-printer-go-brrr-set", "cgen": "community-generation", "fame": "saint-fame", "bsvbear": "3x-short-bitcoin-sv-token", "lega": "link-eth-growth-alpha-set", "anw": "anchor-neural-world-token", "htbear": "3x-short-huobi-token-token", "bsvhalf": "0-5x-long-bitcoin-sv-token", "drgnbull": "3x-long-dragon-index-token", "btceth7525": "btc-eth-75-25-weight-set", "cva": "crypto-village-accelerator", "xautbear": "3x-short-tether-gold-token", "dcto": "decentralized-crypto-token", "chft": "crypto-holding-frank-token", "iqc": "intelligence-quickly-chain", "defihalf": "0-5x-long-defi-index-token", "cute": "blockchain-cuties-universe", "ethbtc7525": "eth-btc-75-25-weight-set", "rsp": "real-estate-sales-platform", "btmxbull": "3x-long-bitmax-token-token", "wgrt": "waykichain-governance-coin", "midbull": "3x-long-midcap-index-token", "sbx": "degenerate-platform", "bchbull": "3x-long-bitcoin-cash-token", "arcc": "asia-reserve-currency-coin", "yfka": "yield-farming-known-as-ash", "xac": "general-attention-currency", "cusdtbull": "3x-long-compound-usdt-token", "altbull": "3x-long-altcoin-index-token", "kncbull": "3x-long-kyber-network-token", "drgnbear": "3x-short-dragon-index-token", "acc": "asian-african-capital-chain", "eth20smaco": "eth_20_day_ma_crossover_set", "privbull": "3x-long-privacy-index-token", "xauthalf": "0-5x-long-tether-gold-token", "thetabull": "3x-long-theta-network-token", "btcrsiapy": "btc-rsi-crossover-yield-set", "midbear": "3x-short-midcap-index-token", "fact": "fee-active-collateral-token", "btcfund": "btc-fund-active-trading-set", "bitn": "bitcoin-company-network", "qdao": "q-dao-governance-token-v1-0", "bchhedge": "1x-short-bitcoin-cash-token", "eth50smaco": "eth-50-day-ma-crossover-set", "lpnt": "luxurious-pro-network-token", "kyte": "kambria-yield-tuning-engine", "innbc": "innovative-bioresearch", "ethrsi6040": "eth-rsi-60-40-crossover-set", "btmxbear": "3x-short-bitmax-token-token", "bchbear": "3x-short-bitcoin-cash-token", "yfdt": "yearn-finance-diamond-token", "innbcl": "innovativebioresearchclassic", "thetabear": "3x-short-theta-network-token", "compbull": "3x-long-compound-token-token", "cusdthedge": "1x-short-compound-usdt-token", "scds": "shrine-cloud-storage-network", "midhalf": "0-5x-long-midcap-index-token", "privhedge": "1x-short-privacy-index-token", "altbear": "3x-short-altcoin-index-token", "bxa": "blockchain-exchange-alliance", "blct": "bloomzed-token", "thetahedge": "1x-short-theta-network-token", "cusdtbear": "3x-short-compound-usdt-token", "eth26emaco": "eth-26-day-ema-crossover-set", "etas": "eth-trending-alpha-st-set-ii", "bchhalf": "0-5x-long-bitcoin-cash-token", "mqss": "set-of-sets-trailblazer-fund", "eth12emaco": "eth-12-day-ema-crossover-set", "bullshit": "3x-long-shitcoin-index-token", "kncbear": "3x-short-kyber-network-token", "drgnhalf": "0-5x-long-dragon-index-token", "mlr": "mega-lottery-services-global", "privbear": "3x-short-privacy-index-token", "eloap": "eth-long-only-alpha-portfolio", "cnyq": "cnyq-stablecoin-by-q-dao-v1", "ethbtcemaco": "eth-btc-ema-ratio-trading-set", "greed": "fear-greed-sentiment-set-ii", "jpyq": "jpyq-stablecoin-by-q-dao-v1", "compbear": "3x-short-compound-token-token", "ethemaapy": "eth-26-ema-crossover-yield-set", "comphedge": "1x-short-compound-token-token", "privhalf": "0-5x-long-privacy-index-token", "tip": "technology-innovation-project", "althalf": "0-5x-long-altcoin-index-token", "ethbtcrsi": "eth-btc-rsi-ratio-trading-set", "thetahalf": "0-5x-long-theta-network-token", "hedgeshit": "1x-short-shitcoin-index-token", "tusc": "original-crypto-coin", "ibp": "innovation-blockchain-payment", "knchalf": "0-5x-long-kyber-network-token", "bloap": "btc-long-only-alpha-portfolio", "bearshit": "3x-short-shitcoin-index-token", "linkethrsi": "link-eth-rsi-ratio-trading-set", "halfshit": "0-5x-long-shitcoin-index-token", "bbra": "boobanker-research-association", "bcac": "business-credit-alliance-chain", "ustonks-apr21": "ustonks-apr21", "uch": "universidad-de-chile-fan-token", "yvboost": "yvboost", "etcbull": "3x-long-ethereum-classic-token", "cdsd": "contraction-dynamic-set-dollar", "etcbear": "3x-short-ethereum-classic-token", "mauni": "matic-aave-uni", "bhsc": "blackholeswap-compound-dai-usdc", "madai": "matic-aave-dai", "bocbp": "btc-on-chain-beta-portfolio-set", "ntrump": "no-trump-augur-prediction-token", "mayfi": "matic-aave-yfi", "epm": "extreme-private-masternode-coin", "malink": "matic-aave-link", "ethpa": "eth-price-action-candlestick-set", "eth20macoapy": "eth-20-ma-crossover-yield-set-ii", "etchalf": "0-5x-long-ethereum-classic-token", "mausdc": "matic-aave-usdc", "ibvol": "1x-short-btc-implied-volatility", "maweth": "matic-aave-weth", "matusd": "matic-aave-tusd", "mausdt": "matic-aave-usdt", "maaave": "matic-aave-aave", "ylab": "yearn-finance-infrastructure-labs", "bqt": "blockchain-quotations-index-token", "pxgold-may2021": "pxgold-synthetic-gold-31-may-2021", "ebloap": "eth-btc-long-only-alpha-portfolio", "ethmacoapy": "eth-20-day-ma-crossover-yield-set", "ugas-jan21": "ulabs-synthetic-gas-futures-expiring-1-jan-2021", "usns": "ubiquitous-social-network-service", "leloap": "link-eth-long-only-alpha-portfolio", "cring": "darwinia-crab-network", "exchbull": "3x-long-exchange-token-index-token", "gusdt": "gusd-token", "ttmc": "tsingzou-tokyo-medical-cooperation", "zjlt": "zjlt-distributed-factoring-network", "cbe": "cbe", "exchbear": "3x-short-exchange-token-index-token", "emtrg": "meter-governance-mapped-by-meter-io", "apeusd-snx-dec21": "apeusd-snx-synthetic-usd-dec-2021", "apeusd-uni-dec21": "apeusd-uni-synthetic-usd-dec-2021", "exchhedge": "1x-short-exchange-token-index-token", "apeusd-uma-dec21": "apeusd-uma-synthetic-usd-dec-2021", "apeusd-aave-dec21": "apeusd-aave-synthetic-usd-dec-2021", "dvp": "decentralized-vulnerability-platform", "apeusd-link-dec21": "apeusd-link-synthetic-usd-dec-2021", "ddam": "decentralized-data-assets-management", "exchhalf": "0-5x-long-echange-token-index-token", "linkethpa": "eth-link-price-action-candlestick-set", "qdefi": "qdefi-rating-governance-token-v2", "ugas-jun21": "ugas-jun21", "realtoken-18276-appoline-st-detroit-mi": "realtoken-18276-appoline-st-detroit-mi", "realtoken-8342-schaefer-hwy-detroit-mi": "realtoken-8342-schaefer-hwy-detroit-mi", "realtoken-25097-andover-dr-dearborn-mi": "realtoken-25097-andover-dr-dearborn-mi", "dml": "decentralized-machine-learning", "realtoken-9336-patton-st-detroit-mi": "realtoken-9336-patton-st-detroit-mi", "realtoken-20200-lesure-st-detroit-mi": "realtoken-20200-lesure-st-detroit-mi", "pxusd-mar2022": "pxusd-synthetic-usd-expiring-31-mar-2022", "pxusd-mar2021": "pxusd-synthetic-usd-expiring-1-april-2021", "cdr": "communication-development-resources-token", "realtoken-16200-fullerton-ave-detroit-mi": "realtoken-16200-fullerton-avenue-detroit-mi", "pxgold-mar2022": "pxgold-synthetic-gold-expiring-31-mar-2022", "realtoken-10024-10028-appoline-st-detroit-mi": "realtoken-10024-10028-appoline-st-detroit-mi", "bchnrbtc-jan-2021": "bchnrbtc-synthetic", "uusdrbtc-oct": "uusdrbtc-synthetic-token-expiring-1-october-2020", "uusdweth-dec": "yusd-synthetic-token-expiring-31-december-2020", "uusdrbtc-dec": "uusdrbtc-synthetic-token-expiring-31-december-2020", "mario-cash-jan-2021": "mario-cash-jan-2021"};

//End
