
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
    id_cache=getBase64EncodedMD5(coinList+versusCoinList+'price');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + coinList + "&vs_currencies=" + versusCoinList).getContentText());
    
    var dict = []; 
    for (var i=0;i<pairList.length;i++) {
        if (tickerList.hasOwnProperty(pairList[i][0])) {
          if (tickerList[pairList[i][0]].hasOwnProperty(pairList[i][1])) {
            dict.push(tickerList[pairList[i][0]][pairList[i][1]]);}
          else{dict.push("");}}
        else{dict.push("");}
        };
    cache.put(id_cache,dict);
    
    return dict
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'vol');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))});  
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].total_volume;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'mktcap');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].market_cap;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'mktcapdiluted');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].fully_diluted_valuation;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'GECKO24HPRICECHANGE');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=parseFloat(tickerList[i].price_change_percentage_24h)/100;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'GECKORANK');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].market_cap_rank;
        };
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'ath');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].ath;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'atl');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].atl;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'GECKO24HIGH');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].high_24h;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
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
    id_cache=getBase64EncodedMD5(coinList+defaultVersusCoin+'GECKO24LOW');
    var cache = CacheService.getScriptCache();
    var cached = cache.get(id_cache);
    if (cached != null) {
      result=cached.split(',');
      return result.map(function(n) { return n && ("" || Number(n))}); 
    }
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].low_24h;
        };
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""));   
    
    return pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || "");  
    
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
    //return err
    return GECKO24LOW(ticker_array,currency);
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
    //Logger.log(parameter_array)

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
    //Logger.log(id_coin)
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + id_coin;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);

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
function getBase64EncodedMD5(text)
{ 
  return Utilities.base64Encode( Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text));
}
//Coin list of CoinGecko is cached in script to reduce server load and increase performance.
//This list can be updated from the text box that can be found at:
//http://api.charmantadvisory.com/COINGECKOID/json
//Be sure to replace just the part after "=", and keep the ";" at the end for proper syntax.
const CoinList = {"index": "index-cooperative", "btc": "bitcoin", "eth": "ethereum", "bnb": "binancecoin", "ada": "cardano", "xrp": "ripple", "doge": "dogecoin", "usdt": "tether", "dot": "polkadot", "bch": "bitcoin-cash", "ltc": "litecoin", "uni": "uniswap", "link": "chainlink", "xlm": "stellar", "usdc": "usd-coin", "etc": "ethereum-classic", "vet": "vechain", "sol": "solana", "eos": "eos", "matic": "matic-network", "theta": "theta-token", "trx": "tron", "okb": "okb", "wbtc": "wrapped-bitcoin", "shib": "shiba-inu", "fil": "filecoin", "busd": "binance-usd", "xmr": "monero", "aave": "aave", "neo": "neo", "atom": "cosmos", "klay": "klay-token", "bsv": "bitcoin-cash-sv", "luna": "terra-luna", "ceth": "compound-ether", "ht": "huobi-token", "miota": "iota", "ksm": "kusama", "xtz": "tezos", "safemoon": "safemoon", "cake": "pancakeswap-token", "avax": "avalanche-2", "ftt": "ftx-token", "dai": "dai", "algo": "algorand", "rune": "thorchain", "mkr": "maker", "cdai": "cdai", "cro": "crypto-com-chain", "cusdc": "compound-usd-coin", "btt": "bittorrent-2", "comp": "compound-governance-token", "dash": "dash", "waves": "waves", "zec": "zcash", "leo": "leo-token", "snx": "havven", "sushi": "sushi", "egld": "elrond-erd-2", "xem": "nem", "cel": "celsius-degree-token", "hbar": "hedera-hashgraph", "yfi": "yearn-finance", "chz": "chiliz", "near": "near", "dcr": "decred", "zil": "zilliqa", "amp": "amp-token", "qtum": "qtum", "tel": "telcoin", "ust": "terrausd", "hot": "holotoken", "nexo": "nexo", "enj": "enjincoin", "bat": "basic-attention-token", "btg": "bitcoin-gold", "stx": "blockstack", "ont": "ontology", "grt": "the-graph", "mana": "decentraland", "ftm": "fantom", "dgb": "digibyte", "hbtc": "huobi-btc", "uma": "uma", "lusd": "liquity-usd", "nano": "nano", "zen": "zencash", "gt": "gatechain-token", "sc": "siacoin", "bnt": "bancor", "arrr": "pirate-chain", "omg": "omisego", "zrx": "0x", "one": "harmony", "steth": "staked-ether", "rvn": "ravencoin", "icx": "icon", "crv": "curve-dao-token", "ar": "arweave", "hnt": "helium", "xsushi": "xsushi", "pax": "paxos-standard", "tusd": "true-usd", "xvs": "venus", "iost": "iostoken", "chsb": "swissborg", "flow": "flow", "nxm": "nxm", "lsk": "lisk", "rsr": "reserve-rights-token", "fei": "fei-protocol", "xdc": "xdce-crowd-sale", "ankr": "ankr", "1inch": "1inch", "kcs": "kucoin-shares", "bake": "bakerytoken", "wrx": "wazirx", "bcd": "bitcoin-diamond", "xvg": "verge", "husd": "husd", "vgx": "ethos", "omi": "ecomi", "lpt": "livepeer", "lrc": "loopring", "ren": "republic-protocol", "snt": "status", "win": "wink", "ckb": "nervos-network", "qnt": "quant-network", "feg": "feg-token", "cfx": "conflux-token", "bal": "balancer", "rlc": "iexec-rlc", "pundix": "pundi-x-2", "bcha": "bitcoin-cash-abc-2", "dent": "dent", "tribe": "tribe-2", "cusdt": "compound-usdt", "alpha": "alpha-finance", "renbtc": "renbtc", "btmx": "bmax", "oxy": "oxygen", "npxs": "pundi-x", "celo": "celo", "reef": "reef-finance", "kobe": "shabu-shabu", "mir": "mirror-protocol", "ocean": "ocean-protocol", "woo": "wootrade-network", "ewt": "energy-web-token", "btcst": "btc-standard-hashrate-token", "band": "band-protocol", "ldo": "lido-dao", "vtho": "vethor-token", "hbc": "hbtc-token", "ray": "raydium", "tlm": "alien-worlds", "usdn": "neutrino", "titan": "titanswap", "inj": "injective-protocol", "srm": "serum", "seth": "seth", "kncl": "kyber-network", "glm": "golem", "prom": "prometeus", "ampl": "ampleforth", "erg": "ergo", "nkn": "nkn", "cuni": "compound-uniswap", "kava": "kava", "axs": "axie-infinity", "gno": "gnosis", "rpl": "rocket-pool", "mdx": "mdex", "agi": "singularitynet", "ton": "tokamak-network", "oxt": "orchid-protocol", "alcx": "alchemix", "stmx": "storm", "elon": "dogelon-mars", "fun": "funfair", "steem": "steem", "skl": "skale", "dodo": "dodo", "zks": "zkswap", "sxp": "swipe", "ctsi": "cartesi", "iotx": "iotex", "sand": "the-sandbox", "lend": "ethlend", "ardr": "ardor", "orn": "orion-protocol", "anc": "anchor-protocol", "cvc": "civic", "nmr": "numeraire", "med": "medibloc", "btm": "bytom", "waxp": "wax", "akt": "akash-network", "fet": "fetch-ai", "wan": "wanchain", "klv": "klever", "kmd": "komodo", "xhv": "haven", "strax": "stratis", "coti": "coti", "celr": "celer-network", "rfox": "redfox-labs-2", "poly": "polymath-network", "ant": "aragon", "twt": "trust-wallet-token", "maid": "maidsafecoin", "audio": "audius", "etn": "electroneum", "math": "math", "orbs": "orbs", "ogn": "origin-protocol", "hoge": "hoge-finance", "rook": "rook", "ark": "ark", "bts": "bitshares", "ava": "concierge-io", "ubt": "unibright", "vlx": "velas", "utk": "utrust", "nwc": "newscrypto-coin", "noia": "noia-network", "vai": "vai", "forth": "ampleforth-governance-token", "xprt": "persistence", "safemars": "safemars", "storj": "storj", "uos": "ultra", "badger": "badger-dao", "atri": "atari", "sys": "syscoin", "rep": "augur", "meta": "metadium", "eps": "ellipsis", "keep": "keep-network", "dag": "constellation-labs", "perp": "perpetual-protocol", "ghx": "gamercoin", "tko": "tokocrypto", "snm": "sonm", "wnxm": "wrapped-nxm", "sfp": "safepal", "pols": "polkastarter", "uqc": "uquid-coin", "mtl": "metal", "zmt": "zipmex-token", "pha": "pha", "paxg": "pax-gold", "kai": "kardiachain", "rdd": "reddcoin", "evn": "evolution-finance", "dpi": "defipulse-index", "vra": "verasity", "divi": "divi", "mona": "monacoin", "dnt": "district0x", "iq": "everipedia", "czrx": "compound-0x", "trac": "origintrail", "mx": "mx-token", "gny": "gny", "htr": "hathor", "aion": "aion", "rif": "rif-token", "kin": "kin", "lina": "linear", "auction": "auction", "scrt": "secret", "ersdl": "unfederalreserve", "sure": "insure", "susd": "nusd", "alice": "my-neighbor-alice", "rose": "oasis-network", "swap": "trustswap", "c20": "crypto20", "hive": "hive", "gas": "gas", "elf": "aelf", "powr": "power-ledger", "firo": "zcoin", "svcs": "givingtoservices", "super": "superfarm", "tomo": "tomochain", "dia": "dia-data", "pac": "paccoin", "qkc": "quark-chain", "dao": "dao-maker", "trb": "tellor", "hns": "handshake", "fx": "fx-coin", "aeth": "ankreth", "jst": "just", "ern": "ethernity-chain", "mask": "mask-network", "loc": "lockchain", "prq": "parsiq", "xaut": "tether-gold", "hydra": "hydra", "cbat": "compound-basic-attention-token", "chr": "chromaway", "lyxe": "lukso-token", "hxro": "hxro", "pnk": "kleros", "bcn": "bytecoin", "mft": "mainframe", "cru": "crust-network", "iris": "iris-network", "exrd": "e-radix", "mln": "melon", "ela": "elastos", "paid": "paid-network", "nu": "nucypher", "rly": "rally-2", "quick": "quick", "bunny": "pancake-bunny", "ppt": "populous", "cre": "carry", "fine": "refinable", "usdp": "usdp", "api3": "api3", "blz": "bluzelle", "frax": "frax", "adx": "adex", "alpaca": "alpaca-finance", "pcx": "chainx", "wex": "waultswap", "cope": "cope", "rndr": "render-token", "lit": "litentry", "mist": "alchemist", "lto": "lto-network", "kda": "kadena", "akro": "akropolis", "lon": "tokenlon", "lamb": "lambda", "bond": "barnbridge", "edg": "edgeware", "beam": "beam", "vrsc": "verus-coin", "eth2x-fli": "eth-2x-flexible-leverage-index", "ramp": "ramp", "fsn": "fsn", "whale": "whale", "nmx": "nominex", "srk": "sparkpoint", "any": "anyswap", "vite": "vite", "ddx": "derivadao", "ae": "aeternity", "col": "unit-protocol", "nrg": "energi", "pond": "marlin", "spi": "shopping-io", "shr": "sharering", "duck": "unit-protocol-duck", "bifi": "beefy-finance", "xcm": "coinmetro", "tt": "thunder-token", "gala": "gala", "nuls": "nuls", "yfii": "yfii-finance", "xor": "sora", "maps": "maps", "wozx": "wozx", "cummies": "cumrocket", "cream": "cream-2", "bzrx": "bzx-protocol", "albt": "allianceblock", "ohm": "olympus", "bel": "bella-protocol", "znn": "zenon", "cards": "cardstarter", "ignis": "ignis", "ctk": "certik", "bar": "fc-barcelona-fan-token", "loomold": "loom-network", "pivx": "pivx", "rgt": "rari-governance-token", "om": "mantra-dao", "ycc": "yuan-chain-coin", "mxc": "mxc", "wicc": "waykichain", "nrv": "nerve-finance", "nxs": "nexus", "grs": "groestlcoin", "gal": "galatasaray-fan-token", "data": "streamr-datacoin", "creth2": "cream-eth2", "sero": "super-zero", "png": "pangolin", "tru": "truefi", "eac": "earthcoin", "df": "dforce-token", "stake": "xdai-stake", "farm": "harvest-finance", "slt": "smartlands", "gxc": "gxchain", "req": "request-network", "hegic": "hegic", "sfi": "saffron-finance", "vsp": "vesper-finance", "bscpad": "bscpad", "dea": "dea", "emc2": "einsteinium", "seur": "seur", "nsbt": "neutrino-system-base-token", "tvk": "terra-virtua-kolect", "gusd": "gemini-dollar", "get": "get-token", "hc": "hshare", "stpt": "stp-network", "rfr": "refereum", "hard": "hard-protocol", "peak": "marketpeak", "lbc": "lbry-credits", "pro": "propy", "drgn": "dragonchain", "nxt": "nxt", "arpa": "arpa-chain", "chain": "chain-games", "cos": "contentos", "cbk": "cobak-token", "pnt": "pnetwork", "bfc": "bifrost", "boa": "bosagora", "kyl": "kylin-network", "atm": "atletico-madrid", "sai": "sai", "fida": "bonfida", "sntvt": "sentivate", "slink": "slink", "slp": "smooth-love-potion", "solve": "solve-care", "vtc": "vertcoin", "armor": "armor", "oxen": "loki-network", "front": "frontier-token", "glch": "glitch-protocol", "rai": "rai", "dusk": "dusk-network", "val": "sora-validator-token", "dsla": "stacktical", "zai": "zero-collateral-dai", "dero": "dero", "vsys": "v-systems", "apl": "apollo", "visr": "visor", "fio": "fio-protocol", "dg": "decentral-games", "dgd": "digixdao", "psg": "paris-saint-germain-fan-token", "eco": "ecofi", "yld": "yield-app", "fis": "stafi", "nim": "nimiq-2", "hai": "hackenai", "bepro": "bet-protocol", "auto": "auto", "hez": "hermez-network-token", "bmi": "bridge-mutual", "swth": "switcheo", "kp3r": "keep3rv1", "root": "rootkit", "xdb": "digitalbits", "rcn": "ripio-credit-network", "nftx": "nftx", "skey": "smartkey", "aergo": "aergo", "sx": "sportx", "free": "free-coin", "rad": "radicle", "lgcy": "lgcy-network", "rari": "rarible", "btu": "btu-protocol", "mhc": "metahash", "core": "cvault-finance", "uft": "unlend-finance", "torn": "tornado-cash", "go": "gochain", "met": "metronome", "waultx": "wault", "wault": "wault-finance-old", "lqty": "liquity", "nest": "nest", "suku": "suku", "revv": "revv", "vxv": "vectorspace", "lgo": "legolas-exchange", "zb": "zb-token", "esd": "empty-set-dollar", "sbtc": "sbtc", "ring": "darwinia-network-native-token", "ghst": "aavegotchi", "idex": "aurora-dao", "id": "everid", "dego": "dego-finance", "bondly": "bondly", "aria20": "arianee", "cate": "catecoin", "ast": "airswap", "mcb": "mcdex", "cnd": "cindicator", "phb": "red-pulse", "veth": "vether", "juld": "julswap", "bft": "bnktothefuture", "dbc": "deepbrain-chain", "dock": "dock", "fxs": "frax-share", "mith": "mithril", "mrph": "morpheus-network", "dext": "idextools", "mta": "meta", "usdx": "usdx", "bz": "bit-z-token", "occ": "occamfi", "swingby": "swingby", "salt": "salt", "ult": "ultiledger", "bor": "boringdao", "zcn": "0chain", "pib": "pibble", "wing": "wing-finance", "sky": "skycoin", "bao": "bao-finance", "ban": "banano", "tbtc": "tbtc", "rdn": "raiden-network", "conv": "convergence", "ilv": "illuvium", "snl": "sport-and-leisure", "veri": "veritaseum", "dexe": "dexe", "tone": "te-food", "dcn": "dentacoin", "fxf": "finxflo", "cube": "somnium-space-cubes", "vidt": "v-id-blockchain", "unfi": "unifi-protocol-dao", "cfi": "cyberfi", "cxo": "cargox", "hopr": "hopr", "flux": "zelcash", "qsp": "quantstamp", "wtc": "waltonchain", "ujenny": "jenny-metaverse-dao-token", "bax": "babb", "xhdx": "hydradx", "card": "cardstack", "sbd": "steem-dollars", "lcc": "litecoin-cash", "dmt": "dmarket", "gbyte": "byteball", "for": "force-protocol", "grin": "grin", "mph": "88mph", "cusd": "celo-dollar", "helmet": "helmet-insure", "govi": "govi", "mbl": "moviebloc", "juv": "juventus-fan-token", "route": "route", "xrt": "robonomics-network", "nbr": "niobio-cash", "zero": "zero-exchange", "ppc": "peercoin", "aioz": "aioz-network", "mbox": "mobox", "mod": "modefi", "krt": "terra-krw", "burst": "burst", "bip": "bip", "xbase": "eterbase", "vid": "videocoin", "yvault-lp-ycurve": "yvault-lp-ycurve", "xyo": "xyo-network", "belt": "belt", "nex": "neon-exchange", "frm": "ferrum-network", "opium": "opium", "suter": "suterusu", "tryb": "bilira", "nebl": "neblio", "sparta": "spartan-protocol-token", "smart": "smartcash", "buidl": "dfohub", "edr": "endor", "soul": "phantasma", "nas": "nebulas", "upp": "sentinel-protocol", "btse": "btse-token", "trtl": "turtlecoin", "aqt": "alpha-quark-token", "boson": "boson-protocol", "bdpi": "interest-bearing-dpi", "clo": "callisto", "miau": "mirrored-ishares-gold-trust", "dip": "etherisc", "fwt": "freeway-token", "acs": "acryptos", "trias": "trias-token", "zee": "zeroswap", "insur": "insurace", "htb": "hotbit-token", "dvpn": "sentinel-group", "digg": "digg", "wow": "wownero", "ioc": "iocoin", "tlos": "telos", "apy": "apy-finance", "nav": "nav-coin", "eurs": "stasis-eurs", "cocos": "cocos-bcx", "gto": "gifto", "sdt": "stake-dao", "wcres": "wrapped-crescofin", "key": "selfkey", "mbx": "mobiecoin", "mitx": "morpheus-labs", "moc": "mossland", "xsn": "stakenet", "mgoogl": "mirrored-google", "polk": "polkamarkets", "xsgd": "xsgd", "mslv": "mirrored-ishares-silver-trust", "dfy": "defi-for-you", "mqqq": "mirrored-invesco-qqq-trust", "oxb": "oxbull-tech", "xed": "exeedme", "mamzn": "mirrored-amazon", "mtsla": "mirrored-tesla", "gvt": "genesis-vision", "dep": "deapcoin", "vitae": "vitae", "step": "step-finance", "maapl": "mirrored-apple", "pi": "pchain", "layer": "unilayer", "mmsft": "mirrored-microsoft", "muso": "mirrored-united-states-oil-fund", "oil": "oiler", "oce": "oceanex-token", "wxt": "wirex", "troy": "troy", "zap": "zap", "mdt": "measurable-data-token", "cudos": "cudos", "xpr": "proton", "sha": "safe-haven", "qash": "qash", "upunk": "unicly-cryptopunks-collection", "six": "six-network", "mnflx": "mirrored-netflix", "musd": "musd", "mix": "mixmarvel", "mbaba": "mirrored-alibaba", "tct": "tokenclub", "kan": "kan", "pool": "pooltogether", "daps": "daps-token", "fcl": "fractal", "lpool": "launchpool", "cvp": "concentrated-voting-power", "pltc": "platoncoin", "bmx": "bitmart-token", "nif": "unifty", "via": "viacoin", "pbtc": "ptokens-btc", "acm": "ac-milan-fan-token", "hunt": "hunt-token", "mtwtr": "mirrored-twitter", "mark": "benchmark-protocol", "bdt": "blackdragon-token", "cas": "cashaa", "el": "elysia", "tnt": "tierion", "ones": "oneswap-dao-token", "fst": "futureswap", "baas": "baasid", "usdk": "usdk", "oly": "olyseum", "lcx": "lcx", "flx": "reflexer-ungovernance-token", "xdn": "digitalnote", "ifc": "infinitecoin", "aleph": "aleph", "polx": "polylastic", "media": "media-network", "props": "props", "bytz": "slate", "mvixy": "mirrored-proshares-vix", "ddim": "duckdaodime", "arch": "archer-dao-governance-token", "impulse": "impulse-by-fdr", "spnd": "spendcoin", "blank": "blank", "umb": "umbrella-network", "filda": "filda", "cover": "cover-protocol", "uncx": "unicrypt-2", "dora": "dora-factory", "zano": "zano", "xcur": "curate", "idle": "idle", "deus": "deus-finance", "soc": "all-sports", "yve-crvdao": "vecrv-dao-yvault", "unn": "union-protocol-governance-token", "kex": "kira-network", "ichi": "ichi-farm", "cut": "cutcoin", "crpt": "crypterium", "block": "blocknet", "tips": "fedoracoin", "propel": "payrue", "dec": "decentr", "yam": "yam-2", "socks": "unisocks", "inv": "inverse-finance", "marsh": "unmarshal", "prob": "probit-exchange", "bux": "blockport", "sylo": "sylo", "qrl": "quantum-resistant-ledger", "tidal": "tidal-finance", "ppay": "plasma-finance", "vfox": "vfox", "lym": "lympo", "bmxx": "multiplier-bsc", "plu": "pluton", "pendle": "pendle", "cws": "crowns", "axn": "axion", "bank": "float-protocol", "mda": "moeda-loyalty-points", "coin": "coinvest", "wabi": "wabi", "wgr": "wagerr", "xend": "xend-finance", "combo": "furucombo", "pre": "presearch", "nmc": "namecoin", "dht": "dhedge-dao", "ubxt": "upbots", "dyn": "dynamic", "opct": "opacity", "ask": "permission-coin", "labs": "labs-group", "orai": "oraichain-token", "fic": "filecash", "pbtc35a": "pbtc35a", "tau": "lamden", "rocks": "rocki", "superbid": "superbid", "si": "siren", "ost": "simple-token", "cvnt": "content-value-network", "ablock": "any-blocknet", "unc": "unicrypt", "mtv": "multivac", "foam": "foam-protocol", "brd": "bread", "axel": "axel", "etp": "metaverse-etp", "ode": "odem", "meme": "degenerator", "velo": "velo", "fct": "factom", "myst": "mysterium", "kine": "kine-protocol", "strong": "strong", "anj": "anj", "mobi": "mobius", "sfuel": "sparkpoint-fuel", "wom": "wom-token", "hord": "hord", "hzn": "horizon-protocol", "ltx": "lattice-token", "cnfi": "connect-financial", "amlt": "coinfirm-amlt", "aitra": "aitra", "rbc": "rubic", "swftc": "swftcoin", "part": "particl", "egg": "goose-finance", "bscx": "bscex", "rfuel": "rio-defi", "mtlx": "mettalex", "dextf": "dextf", "bbr": "bitberry-token", "ndx": "indexed-finance", "cdt": "blox", "wpr": "wepower", "naos": "naos-finance", "onion": "deeponion", "value": "value-liquidity", "glq": "graphlinq-protocol", "swrv": "swerve-dao", "cgg": "chain-guardians", "zoom": "coinzoom-token", "dxd": "dxdao", "like": "likecoin", "spank": "spankchain", "shroom": "shroom-finance", "bix": "bibox-token", "oddz": "oddz", "nct": "polyswarm", "k21": "k21", "poa": "poa-network", "vee": "blockv", "defi5": "defi-top-5-tokens-index", "ovr": "ovr", "ice": "ice-token", "tnb": "time-new-bank", "dough": "piedao-dough-v2", "sake": "sake-token", "bdp": "big-data-protocol", "enq": "enq-enecuum", "pickle": "pickle-finance", "cs": "credits", "raini": "rainicorn", "shopx": "splyt", "eosc": "eosforce", "jul": "jul", "spc": "spacechain-erc-20", "appc": "appcoins", "moon": "mooncoin", "koge": "bnb48-club-token", "ele": "eleven-finance", "abt": "arcblock", "evx": "everex", "fund": "unification", "pkf": "polkafoundry", "txl": "tixl-new", "ngm": "e-money", "jrt": "jarvis-reward-token", "trade": "unitrade", "credit": "credit", "kono": "konomi-network", "cmt": "cybermiles", "safe2": "safe2", "mxx": "multiplier", "ousd": "origin-dollar", "polydoge": "polydoge", "san": "santiment-network-token", "sngls": "singulardtv", "mtrg": "meter", "dev": "dev-protocol", "niox": "autonio", "agve": "agave-token", "adp": "adappter-token", "xava": "avalaunch", "nebo": "csp-dao-network", "woofy": "woofy", "ubq": "ubiq", "dust": "dust-token", "plr": "pillar", "adk": "aidos-kuneen", "coval": "circuits-of-value", "poolz": "poolz-finance", "nyzo": "nyzo", "nfy": "non-fungible-yearn", "hny": "honey", "dfd": "defidollar-dao", "gth": "gather", "ncash": "nucleus-vision", "hvn": "hiveterminal", "fuse": "fuse-network-token", "game": "gamecredits", "kit": "dexkit", "robot": "robot", "xfund": "xfund", "act": "achain", "xio": "xio", "yaxis": "yaxis", "egt": "egretia", "sdx": "swapdex", "fnt": "falcon-token", "pmon": "polkamon", "iqn": "iqeon", "hit": "hitchain", "push": "ethereum-push-notification-service", "quai": "quai-dao", "xmx": "xmax", "vib": "viberate", "umx": "unimex-network", "hakka": "hakka-finance", "tfb": "truefeedbackchain", "oax": "openanx", "razor": "razor-network", "mork": "mork", "nlg": "gulden", "must": "must", "yop": "yield-optimization-platform", "qlc": "qlink", "lien": "lien", "cov": "covesting", "muse": "muse-2", "btc2": "bitcoin-2", "saito": "saito", "hget": "hedget", "vnla": "vanilla-network", "udoo": "howdoo", "plot": "plotx", "xcash": "x-cash", "bac": "basis-cash", "room": "option-room", "aoa": "aurora", "roobee": "roobee", "apys": "apyswap", "pay": "tenx", "dhc": "deltahub-community", "asr": "as-roma-fan-token", "mwat": "restart-energy", "iov": "starname", "fuel": "fuel-token", "synx": "syndicate", "cbc": "cashbet-coin", "white": "whiteheart", "pros": "prosper", "top": "top-network", "cofi": "cofix", "scc": "stakecube", "cht": "coinhe-token", "its": "iteration-syndicate", "dta": "data", "nft": "nft-protocol", "exnt": "exnetwork-token", "mpl": "maple-finance", "gnx": "genaro-network", "auscm": "auric-network", "gmt": "gambit", "daofi": "daofi", "shft": "shyft-network-2", "stn": "stone-token", "nec": "nectar-token", "ruff": "ruff", "oin": "oin-finance", "chi": "chimaera", "matter": "antimatter", "brew": "cafeswap-token", "webd": "webdollar", "gen": "daostack", "efx": "effect-network", "ptf": "powertrade-fuel", "hy": "hybrix", "mth": "monetha", "b21": "b21", "mbtc": "mstable-btc", "xla": "stellite", "watch": "yieldwatch", "kpad": "kickpad", "wdc": "worldcoin", "bry": "berry-data", "og": "og-fan-token", "abl": "airbloc-protocol", "valor": "smart-valor", "krl": "kryll", "uip": "unlimitedip", "psl": "pastel", "nix": "nix-platform", "vrx": "verox", "rio": "realio-network", "raven": "raven-protocol", "vidya": "vidya", "dlt": "agrello", "l2": "leverj-gluon", "swg": "swirge", "crep": "compound-augur", "swm": "swarm", "man": "matrix-ai-network", "eng": "enigma", "ach": "alchemy-pay", "koin": "koinos", "minds": "minds", "fnx": "finnexus", "emc": "emercoin", "raze": "raze-network", "yf-dai": "yfdai-finance", "la": "latoken", "smt": "smartmesh", "dafi": "dafi-protocol", "dtx": "databroker-dao", "mint": "public-mint", "bird": "bird-money", "dusd": "defidollar", "axis": "axis-defi", "ftc": "feathercoin", "ocn": "odyssey", "world": "world-token", "julien": "julien", "pma": "pumapay", "itc": "iot-chain", "xpx": "proximax", "alpa": "alpaca", "mds": "medishares", "idea": "ideaology", "arcx": "arc-governance", "shard": "shard", "jur": "jur", "cv": "carvertical", "euno": "euno", "geo": "geodb", "onx": "onx-finance", "usf": "unslashed-finance", "abyss": "the-abyss", "zt": "ztcoin", "haus": "daohaus", "cnns": "cnns", "tra": "trabzonspor-fan-token", "gains": "gains", "prt": "portion", "yfl": "yflink", "prcy": "prcy-coin", "octo": "octofi", "utnp": "universa", "urus": "urus-token", "rmt": "sureremit", "rev": "revain", "1337": "e1337", "pinkm": "pinkmoon", "ktn": "kattana", "cntr": "centaur", "crbn": "carbon", "btx": "bitcore", "paint": "paint", "bwf": "beowulf", "yla": "yearn-lazy-ape", "klp": "kulupu", "wasabi": "wasabix", "unistake": "unistake", "fdr": "french-digital-reserve", "xmy": "myriadcoin", "tky": "thekey", "open": "open-governance-token", "cti": "clintex-cti", "drc": "digital-reserve-currency", "time": "chronobank", "hpb": "high-performance-blockchain", "dov": "dovu", "dvg": "daoventures", "grid": "grid", "pefi": "penguin-finance", "bskt": "basketcoin", "apm": "apm-coin", "flo": "flo", "twin": "twinci", "$anrx": "anrkey-x", "edda": "eddaswap", "meth": "mirrored-ether", "par": "parachute", "tkn": "tokencard", "gmee": "gamee", "dos": "dos-network", "vex": "vexanium", "dmd": "diamond", "dappt": "dapp-com", "ibbtc": "interest-bearing-bitcoin", "zefu": "zenfuse", "msp": "mothership", "gxt": "gem-exchange-and-trading", "euler": "euler-tools", "urqa": "ureeqa", "tcake": "pancaketools", "ixc": "ixcoin", "sph": "spheroid-universe", "ruler": "ruler-protocol", "jup": "jupiter", "nanj": "nanjcoin", "btcz": "bitcoinz", "srn": "sirin-labs-token", "dgtx": "digitex-futures-exchange", "amb": "amber", "npx": "napoleon-x", "btcp": "bitcoin-private", "sig": "xsigma", "nsure": "nsure-network", "rendoge": "rendoge", "shift": "shift", "bcp": "bitcashpay", "rby": "rubycoin", "cnn": "cnn", "reap": "reapchain", "lix": "lixir-protocol", "bpro": "b-protocol", "tao": "taodao", "kat": "kambria", "argon": "argon", "ong": "ong-social", "hyve": "hyve", "nds": "nodeseeds", "aid": "aidcoin", "token": "chainswap", "pla": "plair", "sdefi": "sdefi", "tera": "tera-smart-money", "premia": "premia", "chonk": "chonk", "yee": "yee", "rnt": "oneroot-network", "sense": "sense", "bgov": "bgov", "uncl": "uncl", "instar": "insights-network", "b20": "b20", "bitg": "bitcoin-green", "cmp": "component", "zig": "zignaly", "gswap": "gameswap-org", "gro": "growth-defi", "xeq": "triton", "hand": "showhand", "you": "you-chain", "etho": "ether-1", "dows": "shadows", "stv": "sint-truidense-voetbalvereniging", "snow": "snowswap", "play": "herocoin", "xpc": "experience-chain", "coll": "collateral-pay", "fsw": "fsw-token", "upi": "pawtocol", "neu": "neumark", "aur": "auroracoin", "ugas": "ultrain", "glc": "goldcoin", "degen": "degen-index", "sgt": "sharedstake-governance-token", "deri": "deri-protocol", "int": "internet-node-token", "safe": "safe-coin-2", "btcs": "bitcoin-scrypt", "aga": "aga-token", "xtk": "xtoken", "swag": "swag-finance", "ghost": "ghost-by-mcafee", "giv": "givly-coin", "owc": "oduwa-coin", "pipt": "power-index-pool-token", "geeq": "geeq", "drt": "domraider", "ntk": "neurotoken", "bart": "bartertrade", "wings": "wings", "phnx": "phoenixdao", "cwbtc": "compound-wrapped-btc", "crwny": "crowny-token", "doki": "doki-doki-finance", "axpr": "axpire", "nord": "nord-finance", "ads": "adshares", "wolf": "moonwolf-io", "xlq": "alqo", "dyp": "defi-yield-protocol", "cc10": "cryptocurrency-top-10-tokens-index", "rsv": "reserve", "force": "force-dao", "lua": "lua-token", "awx": "auruscoin", "ten": "tokenomy", "can": "canyacoin", "bas": "basis-share", "vvt": "versoview", "blt": "bloom", "bmc": "bountymarketcap", "sync": "sync-network", "ldoge": "litedoge", "bcdt": "blockchain-certified-data-token", "bis": "bismuth", "smg": "smaugs-nft", "pcnt": "playcent", "chp": "coinpoker", "0xbtc": "oxbitcoin", "ut": "ulord", "mvp": "merculet", "boom": "boom-token", "asp": "aspire", "tcap": "total-crypto-market-cap-token", "yield": "yield-protocol", "utu": "utu-coin", "blk": "blackcoin", "kangal": "kangal", "xcp": "counterparty", "xft": "offshift", "sepa": "secure-pad", "qun": "qunqun", "true": "true-chain", "pnd": "pandacoin", "unifi": "unifi", "mtn": "medicalchain", "rbase": "rbase-finance", "idna": "idena", "amn": "amon", "acat": "alphacat", "mfg": "syncfab", "bles": "blind-boxes", "kko": "kineko", "snob": "snowball-token", "uniq": "uniqly", "acxt": "ac-exchange-token", "gleec": "gleec-coin", "bask": "basketdao", "hbd": "hive_dollar", "kton": "darwinia-commitment-token", "agar": "aga-rewards-2", "epan": "paypolitan-token", "eved": "evedo", "dashd": "dash-diamond", "vbk": "veriblock", "xpat": "pangea", "bkbt": "beekan", "auc": "auctus", "gum": "gourmetgalaxy", "avt": "aventus", "xst": "stealthcoin", "maha": "mahadao", "cot": "cotrader", "pink": "pinkcoin", "grc": "gridcoin-research", "kek": "cryptokek", "fair": "fairgame", "mfb": "mirrored-facebook", "phr": "phore", "asko": "askobar-network", "arth": "arth", "qrk": "quark", "nuts": "squirrel-finance", "spa": "sperax", "defi+l": "piedao-defi-large-cap", "tern": "ternio", "wish": "mywish", "let": "linkeye", "hbt": "habitat", "xiot": "xiotri", "umask": "unicly-hashmasks-collection", "yfiii": "dify-finance", "th": "team-heretics-fan-token", "alch": "alchemy-dao", "bnsd": "bnsd-finance", "azuki": "azuki", "ppp": "paypie", "dun": "dune", "sale": "dxsale-network", "uuu": "u-network", "linka": "linka", "satt": "satt", "etha": "etha-lend", "put": "putincoin", "mm": "mm-token", "pot": "potcoin", "cloak": "cloakcoin", "surf": "surf-finance", "mvi": "metaverse-index", "mabnb": "mirrored-airbnb", "yoyow": "yoyow", "ccx": "conceal", "elg": "escoin-token", "mtc": "medical-token-currency", "emt": "emanate", "yeed": "yggdrash", "sata": "signata", "gcr": "global-coin-research", "alias": "spectrecoin", "balpha": "balpha", "uwl": "uniwhales", "kif": "kittenfinance", "snc": "suncontract", "olt": "one-ledger", "klonx": "klondike-finance-v2", "tad": "tadpole-finance", "sashimi": "sashimi", "roya": "royale", "fry": "foundrydao-logistics", "adb": "adbank", "midas": "midas", "inxt": "internxt", "dsd": "dynamic-set-dollar", "equad": "quadrant-protocol", "ixi": "ixicash", "ditto": "ditto", "zip": "zip", "fvt": "finance-vote", "arte": "ethart", "dime": "dimecoin", "qrx": "quiverx", "isp": "ispolink", "lotto": "lotto", "xpm": "primecoin", "eosdt": "equilibrium-eosdt", "lxt": "litex", "tube": "bittube", "ess": "essentia", "lkr": "polkalokr", "mgs": "mirrored-goldman-sachs", "smartcredit": "smartcredit-token", "dis": "tosdis", "777": "jackpot", "bbc": "tradove", "bitcny": "bitcny", "flash": "flash-stake", "punk-basic": "punk-basic", "ucash": "ucash", "scp": "siaprime-coin", "unidx": "unidex", "skm": "skrumble-network", "gfarm2": "gains-v2", "vision": "apy-vision", "nbx": "netbox-coin", "troll": "trollcoin", "cpc": "cpchain", "mthd": "method-fi", "dat": "datum", "eye": "beholder", "erc20": "erc20", "waif": "waifu-token", "crdt": "crdt", "seen": "seen", "obot": "obortech", "mt": "mytoken", "oap": "openalexa-protocol", "stbu": "stobox-token", "trtt": "trittium", "toa": "toacoin", "pbr": "polkabridge", "eosdac": "eosdac", "fwb": "friends-with-benefits-pro", "sumo": "sumokoin", "ybo": "young-boys-fan-token", "dgcl": "digicol-token", "smly": "smileycoin", "road": "yellow-road", "wiz": "crowdwiz", "epic": "epic-cash", "ok": "okcash", "cat": "cat-token", "trio": "tripio", "ktlyo": "katalyo", "assy": "assy-index", "imt": "moneytoken", "gysr": "geyser", "omni": "omni", "prc": "partner", "xrc": "bitcoin-rhodium", "vibe": "vibe", "chads": "chads-vc", "soar": "soar-2", "efl": "electronicgulden", "dgx": "digix-gold", "dax": "daex", "masq": "masq", "fti": "fanstime", "mic": "mith-cash", "xbtc": "xbtc", "xvix": "xvix", "smty": "smoothy", "sota": "sota-finance", "pgt": "polyient-games-governance-token", "sin": "suqa", "xbc": "bitcoin-plus", "kebab": "kebab-token", "veo": "amoveo", "bfly": "butterfly-protocol-2", "oro": "oro", "spdr": "spiderdao", "zcl": "zclassic", "zora": "zoracles", "sta": "statera", "42": "42-coin", "cns": "centric-cash", "gard": "hashgard", "sign": "signaturechain", "lead": "lead-token", "exy": "experty", "lba": "libra-credit", "exrn": "exrnchain", "polc": "polka-city", "ddd": "scry-info", "fera": "fera", "mdo": "midas-dollar", "astro": "astrotools", "vsf": "verisafe", "udo": "unido-ep", "crw": "crown", "dmst": "dmst", "pry": "prophecy", "zer": "zero", "btc2x-fli": "btc-2x-flexible-leverage-index", "chart": "chartex", "jade": "jade-currency", "pfl": "professional-fighters-league-fan-token", "voice": "nix-bridge-token", "swfl": "swapfolio", "mgme": "mirrored-gamestop", "dfsocial": "defisocial", "2gt": "2gether-2", "uop": "utopia-genesis-foundation", "fxp": "fxpay", "mamc": "mirrored-amc-entertainment", "ftxt": "futurax", "build": "build-finance", "zco": "zebi", "flex": "flex-coin", "nlc2": "nolimitcoin", "edn": "edenchain", "rel": "release-ico-project", "elx": "energy-ledger", "ngc": "naga", "four": "the-4th-pillar", "2key": "2key", "tap": "tapmydata", "qbx": "qiibee", "thc": "hempcoin-thc", "veil": "veil", "cai": "club-atletico-independiente", "ac": "acoconut", "renzec": "renzec", "zhegic": "zhegic", "pwr": "powercoin", "fls": "flits", "dfio": "defi-omega", "cgt": "cache-gold", "uaxie": "unicly-mystic-axies-collection", "pgn": "pigeoncoin", "imx": "impermax", "mue": "monetaryunit", "hnst": "honest-mining", "zlot": "zlot", "catt": "catex-token", "family": "the-bitcoin-family", "nyan-2": "nyan-v2", "start": "bscstarter", "$based": "based-money", "chg": "charg-coin", "inf": "infinitus-token", "mcx": "machix", "cure": "curecoin", "dacc": "dacc", "defi++": "piedao-defi", "nrch": "enreachdao", "cpay": "cryptopay", "ufr": "upfiring", "vxt": "virgox-token", "rem": "remme", "bnkr": "bankroll-network", "vault": "vault", "ctxc": "cortex", "hyc": "hycon", "bob": "bobs_repair", "sxrp": "sxrp", "enb": "earnbase", "stbz": "stabilize", "becn": "beacon", "prare": "polkarare", "tent": "snowgem", "tfl": "trueflip", "zdex": "zeedex", "warp": "warp-finance", "mer": "mercury", "evt": "everitoken", "mrc": "meritcoins", "dav": "dav", "mega": "megacryptopolis", "pvt": "pivot-token", "sada": "sada", "esp": "espers", "excl": "exclusivecoin", "box": "contentbox", "zipt": "zippie", "rvf": "rocket-vault-finance", "mfi": "marginswap", "all": "alliance-fan-token", "dets": "dextrust", "hsc": "hashcoin", "dmg": "dmm-governance", "lid": "liquidity-dividends-protocol", "yeti": "yearn-ecosystem-token-index", "rws": "robonomics-web-services", "bnf": "bonfi", "rare": "unique-one", "pie": "defipie", "dgvc": "degenvc", "xas": "asch", "aln": "aluna", "d": "denarius", "cur": "curio", "donut": "donut", "spice": "spice-finance", "fin": "definer", "cap": "cap", "zpae": "zelaapayae", "chx": "chainium", "bc": "bitcoin-confidential", "bet": "eosbet", "n3rdz": "n3rd-finance", "polis": "polis", "bitto": "bitto-exchange", "pgl": "prospectors-gold", "nty": "nexty", "pasc": "pascalcoin", "add": "add-xyz-new", "sfd": "safe-deal", "tico": "topinvestmentcoin", "ethix": "ethichub", "fyz": "fyooz", "bcug": "blockchain-cuties-universe-governance", "tft": "the-famous-token", "bcv": "bcv", "vrc": "vericoin", "bull": "buysell", "crx": "cryptex", "rfi": "reflect-finance", "tpay": "tokenpay", "base": "base-protocol", "opt": "open-predict-token", "8pay": "8pay", "edu": "educoin", "cor": "coreto", "mtx": "matryx", "metric": "metric-exchange", "deflct": "deflect", "infs": "infinity-esaham", "cbm": "cryptobonusmiles", "cag": "change", "eve": "devery", "zp": "zen-protocol", "bomb": "bomb", "idh": "indahash", "iic": "intelligent-investment-chain", "font": "font", "yec": "ycash", "max": "maxcoin", "dotx": "deli-of-thrones", "pylon": "pylon-finance", "ibfk": "istanbul-basaksehir-fan-token", "tos": "thingsoperatingsystem", "web": "webcoin", "uct": "ucot", "defi+s": "piedao-defi-small-cap", "ptoy": "patientory", "ag8": "atromg8", "pigx": "pigx", "rating": "dprating", "res": "resfinex-token", "ait": "aichain", "aux": "auxilium", "lyr": "lyra", "modic": "modern-investment-coin", "pirate": "piratecash", "vcn": "versacoin", "gdao": "governor-dao", "frc": "freicoin", "dit": "inmediate", "mofi": "mobifi", "ogo": "origo", "yae": "cryptonovae", "ldfi": "lendefi", "snet": "snetwork", "bti": "bitcoin-instant", "csai": "compound-sai", "mog": "mogwai", "odin": "odin-protocol", "exrt": "exrt-network", "moons": "moontools", "upx": "uplexa", "hyn": "hyperion", "mwg": "metawhale-gold", "mchc": "mch-coin", "znz": "zenzo", "swirl": "swirl-cash", "stk": "stk", "hfs": "holderswap", "tol": "tolar", "fmg": "fm-gallery", "hmq": "humaniq", "zxc": "0xcert", "msr": "masari", "foto": "unique-photo", "kgo": "kiwigo", "mcm": "mochimo", "ionc": "ionchain-token", "otb": "otcbtc-token", "1wo": "1world", "move": "holyheld-2", "xdna": "extradna", "scifi": "scifi-finance", "hgold": "hollygold", "tret": "tourist-review-token", "boost": "boosted-finance", "wheat": "wheat-token", "corn": "cornichon", "inft": "infinito", "cliq": "deficliq", "fdd": "frogdao-dime", "psi": "passive-income", "pta": "petrachor", "gear": "bitgear", "ugotchi": "unicly-aavegotchi-astronauts-collection", "idrt": "rupiah-token", "elec": "electrify-asia", "ufo": "ufocoin", "whirl": "whirl-finance", "adc": "audiocoin", "rac": "rac", "pst": "primas", "vips": "vipstarcoin", "sav3": "sav3", "bxc": "bitcoin-classic", "toshi": "toshi-token", "adel": "akropolis-delphi", "dank": "mu-dank", "adm": "adamant-messenger", "stsla": "stsla", "urac": "uranus", "yft": "yield-farming-token", "bfi": "bearn-fi", "vtx": "vortex-defi", "kcal": "phantasma-energy", "skull": "skull", "fyd": "find-your-developer", "shdc": "shd-cash", "ubex": "ubex", "wlt": "wealth-locks", "dth": "dether", "gfx": "gamyfi-token", "lobs": "lobstex-coin", "gmat": "gowithmi", "monk": "monkey-project", "tdx": "tidex-token", "own": "owndata", "gst2": "gastoken", "peg": "pegnet", "updog": "updog", "aaa": "app-alliance-association", "tx": "transfercoin", "share": "seigniorage-shares", "htre": "hodltree", "komet": "komet", "jntr": "jointer", "dogefi": "dogefi", "btb": "bitball", "ppblz": "pepemon-pepeballs", "n8v": "wearesatoshi", "stacy": "stacy", "bxy": "beaxy-exchange", "ss": "sharder-protocol", "ysec": "yearn-secure", "eko": "echolink", "flixx": "flixxo", "xnv": "nerva", "rox": "robotina", "xnk": "ink-protocol", "coni": "coinbene-token", "gat": "gatcoin", "nfti": "nft-index", "rte": "rate3", "vig": "vig", "uat": "ultralpha", "bto": "bottos", "nobl": "noblecoin", "pis": "polkainsure-finance", "fdz": "friendz", "red": "red", "ryo": "ryo", "krb": "karbo", "aog": "smartofgiving", "totm": "totemfi", "sub": "substratum", "aidoc": "ai-doctor", "lock": "meridian-network", "xiv": "project-inverse", "dogec": "dogecash", "xaur": "xaurum", "loot": "nftlootbox", "azr": "aezora", "stack": "stacker-ventures", "power": "unipower", "pct": "percent", "ladz": "ladz", "rpd": "rapids", "reec": "renewableelectronicenergycoin", "reosc": "reosc-ecosystem", "launch": "superlauncher", "lnd": "lendingblock", "iht": "iht-real-estate-protocol", "error": "484-fund", "ftx": "fintrux", "wdgld": "wrapped-dgld", "myx": "myx-network", "mgo": "mobilego", "ors": "origin-sport", "evc": "eventchain", "bbp": "biblepay", "adco": "advertise-coin", "pmgt": "perth-mint-gold-token", "zut": "zero-utility-token", "edc": "edc-blockchain", "mmaon": "mmaon", "lcs": "localcoinswap", "groot": "growth-root", "gse": "gsenetwork", "gex": "globex", "btc++": "piedao-btc", "nftp": "nft-platform-index", "doges": "dogeswap", "dds": "dds-store", "trst": "wetrust", "zeit": "zeitcoin", "debase": "debase", "mmo": "mmocoin", "slm": "solomon-defi", "npxsxem": "pundi-x-nem", "banca": "banca", "spn": "sapien", "xmon": "xmon", "nov": "novara-calcio-fan-token", "sact": "srnartgallery", "ttn": "titan-coin", "exf": "extend-finance", "fdo": "firdaos", "grft": "graft-blockchain", "eca": "electra", "bos": "boscoin-2", "octi": "oction", "mars": "mars", "qwc": "qwertycoin", "axi": "axioms", "mnc": "maincoin", "hlc": "halalchain", "blue": "blue", "yeld": "yeld-finance", "mao": "mao-zedong", "trust": "trust", "xfi": "xfinance", "isla": "insula", "cdzc": "cryptodezirecash", "spx": "sp8de", "portal": "portal", "snn": "sechain", "cv2": "colossuscoin-v2", "pasta": "spaghetti", "ypie": "piedao-yearn-ecosystem-pie", "ncdt": "nuco-cloud", "cspn": "crypto-sports", "meri": "merebel", "use": "usechain", "egem": "ethergem", "etz": "etherzero", "cova": "covalent-cova", "face": "face", "degov": "degov", "zcc": "zccoin", "tend": "tendies", "yvs": "yvs-finance", "rage": "rage-fan", "ndr": "noderunners", "thirm": "thirm-protocol", "vrs": "veros", "bdg": "bitdegree", "tff": "tutti-frutti-finance", "holy": "holyheld", "omx": "project-shivom", "rvx": "rivex-erc20", "udoki": "unicly-doki-doki-collection", "ven": "impulseven", "malw": "malwarechain", "ent": "eternity", "lqd": "liquidity-network", "mntis": "mantis-network", "tango": "keytango", "star": "starbase", "shnd": "stronghands", "dam": "datamine", "sphr": "sphere", "ethv": "ethverse", "gbx": "gobyte", "tbb": "trade-butler-bot", "ctask": "cryptotask-2", "ecom": "omnitude", "bund": "bundles", "dft": "defiat", "ssp": "smartshare", "quin": "quinads", "noahp": "noah-coin", "ind": "indorse", "ethbn": "etherbone", "xp": "xp", "fast": "fastswap", "tzc": "trezarcoin", "vox": "vox-finance", "tns": "transcodium", "xdex": "xdefi-governance-token", "hush": "hush", "lun": "lunyr", "pht": "lightstreams", "ion": "ion", "fxt": "fuzex", "mash": "masternet", "zpt": "zeepin", "crea": "creativecoin", "qch": "qchi", "tnc": "trinity-network-credit", "ifund": "unifund", "bscv": "bscview", "bitx": "bitscreener", "cnus": "coinus", "seos": "seos", "alv": "allive", "atn": "atn", "pgu": "polyient-games-unity", "gyen": "gyen", "cue": "cue-protocol", "excc": "exchangecoin", "ncc": "neurochain", "pny": "peony-coin", "mush": "mushroom", "dpy": "delphy", "rot": "rotten", "onc": "one-cash", "btdx": "bitcloud", "goat": "goatcoin", "pak": "pakcoin", "chnd": "cashhand", "ovc": "ovcode", "milk2": "spaceswap-milk2", "pria": "pria", "aval": "avaluse", "abx": "arbidex", "taco": "tacos", "bsty": "globalboost", "ppy": "peerplays", "xwp": "swap", "dexg": "dextoken-governance", "hqx": "hoqu", "ptt": "proton-token", "vol": "volume-network-token", "xgg": "10x-gg", "hbn": "hobonickels", "tme": "tama-egg-niftygotchi", "datx": "datx", "buzz": "buzzcoin", "twa": "adventure-token", "kennel": "token-kennel", "snov": "snovio", "fire": "fire-protocol", "ric": "riecoin", "ipc": "ipchain", "zrc": "zrcoin", "zsc": "zeusshield", "stop": "satopay", "gofi": "goswapp", "x42": "x42-protocol", "vdx": "vodi-x", "wg0": "wrapped-gen-0-cryptokitties", "bkc": "facts", "ely": "elysian", "sxag": "sxag", "bether": "bethereum", "rmpl": "rmpl", "coil": "coil-crypto", "mzc": "maza", "bir": "birake", "tac": "traceability-chain", "svx": "savix", "depay": "depay", "vi": "vid", "alex": "alex", "sct": "clash-token", "ethy": "ethereum-yield", "zmn": "zmine", "tie": "ties-network", "xlr": "solaris", "toc": "touchcon", "ubeeple": "unicly-beeple-collection", "wqt": "work-quest", "qbt": "qbao", "unl": "unilock-network", "semi": "semitoken", "dct": "decent", "srh": "srcoin", "latx": "latiumx", "dyt": "dynamite", "hgt": "hellogold", "sib": "sibcoin", "almx": "almace-shards", "spd": "stipend", "xbp": "blitzpredict", "fjc": "fujicoin", "adt": "adtoken", "bone": "bone", "ccn": "custom-contract-network", "telos": "telos-coin", "shake": "spaceswap-shake", "bbk": "bitblocks-project", "ggtk": "gg-token", "ehrt": "eight-hours", "stq": "storiqa", "fusii": "fusible", "senc": "sentinel-chain", "mbn": "membrana-platform", "flot": "fire-lotto", "mota": "motacoin", "mis": "mithril-share", "ken": "keysians-network", "next": "nextexchange", "paws": "paws-funds", "cvn": "cvcoin", "bnty": "bounty0x", "vdl": "vidulum", "jet": "jetcoin", "ptn": "palletone", "sphtx": "sophiatx", "ethys": "ethereum-stake", "xmg": "magi", "hue": "hue", "renbch": "renbch", "kgc": "krypton-token", "woa": "wrapped-origin-axie", "bcdn": "blockcdn", "gmc": "gokumarket-credit", "bloc": "blockcloud", "sxau": "sxau", "tch": "tigercash", "grim": "grimcoin", "pylnt": "pylon-network", "revo": "revomon", "senpai": "project-senpai", "bitt": "bittoken", "baepay": "baepay", "send": "social-send", "$rope": "rope", "swt": "swarm-city", "dvt": "devault", "ptm": "potentiam", "women": "womencoin", "her": "hero-node", "ff": "forefront", "tdp": "truedeck", "poe": "poet", "orcl5": "oracle-top-5", "ink": "ink", "img": "imagecoin", "alley": "nft-alley", "yfte": "yftether", "bcpt": "blockmason-credit-protocol", "axe": "axe", "fyp": "flypme", "esbc": "e-sport-betting-coin", "bntx": "bintex-futures", "lmy": "lunch-money", "comb": "combine-finance", "rpt": "rug-proof", "etm": "en-tan-mo", "ziot": "ziot", "jamm": "flynnjamm", "bits": "bitstar", "fsxu": "flashx-ultra", "gap": "gapcoin", "lync": "lync-network", "nor": "bring", "sbnb": "sbnb", "dws": "dws", "rvt": "rivetz", "alt": "alt-estate", "undg": "unidexgas", "pc": "promotionchain", "snrg": "synergy", "brdg": "bridge-protocol", "gene": "gene-source-code-token", "rom": "rom-token", "zusd": "zusd", "tcore": "tornadocore", "kerman": "kerman", "swing": "swing", "bgg": "bgogo", "setc": "setc", "at": "abcc-token", "dope": "dopecoin", "crp": "utopia", "pho": "photon", "eqt": "equitrader", "kolin": "kolin", "bltg": "bitcoin-lightning", "aem": "atheneum", "tsf": "teslafunds", "trnd": "trendering", "cnb": "coinsbit-token", "peng": "penguin", "mas": "midas-protocol", "defo": "defhold", "bez": "bezop", "cbix": "cubiex", "axiav3": "axia", "ali": "ailink-token", "ntrn": "neutron", "r3fi": "r3fi-finance", "bsov": "bitcoinsov", "mec": "megacoin", "yuki": "yuki-coin", "trc": "terracoin", "vsx": "vsync", "etg": "ethereum-gold", "fud": "fudfinance", "zcr": "zcore", "corx": "corionx", "sds": "alchemint", "emd": "emerald-crypto", "onl": "on-live", "swift": "swiftcash", "glox": "glox-finance", "fess": "fess-chain", "mwbtc": "metawhale-btc", "lx": "lux", "chai": "chai", "shrmp": "shrimp-capital", "dem": "deutsche-emark", "a": "alpha-platform", "ppdex": "pepedex", "d4rk": "darkpaycoin", "plus1": "plusonecoin", "hac": "hackspace-capital", "deb": "debitum-network", "arq": "arqma", "fors": "foresight", "wand": "wandx", "s": "sharpay", "ozc": "ozziecoin", "myb": "mybit-token", "tcash": "tcash", "berry": "rentberry", "seq": "sequence", "peps": "pepegold", "ntbc": "note-blockchain", "1mt": "1million-token", "genix": "genix", "saud": "saud", "ieth": "ieth", "tcc": "the-champcoin", "horus": "horuspay", "asafe": "allsafe", "amm": "micromoney", "gin": "gincoin", "mib": "mib-coin", "1up": "uptrennd", "vlu": "valuto", "topb": "topb", "shdw": "shadow-token", "wck": "wrapped-cryptokitties", "bouts": "boutspro", "anon": "anon", "flp": "gameflip", "ucm": "unicly-chris-mccann-collection", "esk": "eska", "sergs": "sergs", "ukg": "unikoin-gold", "tbx": "tokenbox", "undb": "unibot-cash", "esh": "switch", "kmpl": "kiloample", "enol": "ethanol", "ptc": "pesetacoin", "tsuki": "tsuki-dao", "x8x": "x8-project", "arnx": "aeron", "sxmr": "sxmr", "priv": "privcy", "cheese": "cheese", "scb": "spacecowboy", "pipl": "piplcoin", "rito": "rito", "etgp": "ethereum-gold-project", "kobo": "kobocoin", "daiq": "daiquilibrium", "mntp": "goldmint", "vlo": "velo-token", "kndc": "kanadecoin", "labo": "the-lab-finance", "chop": "porkchop", "metm": "metamorph", "cxn": "cxn-network", "sat": "sphere-social", "plura": "pluracoin", "tix": "blocktix", "amz": "amazonacoin", "type": "typerium", "kubo": "kubocoin", "scex": "scex", "beet": "beetle-coin", "arco": "aquariuscoin", "ore": "oreo", "rehab": "nft-rehab", "chl": "challengedac", "kfx": "knoxfs", "cmct": "crowd-machine", "swiss": "swiss-finance", "mintme": "webchain", "kp4r": "keep4r", "uunicly": "unicly-genesis-collection", "yffi": "yffi-finance", "smc": "smartcoin", "bth": "bithereum", "bt": "bt-finance", "mdg": "midas-gold", "ecash": "ethereum-cash", "vgw": "vegawallet-token", "ad": "asian-dragon", "tsl": "energo", "2give": "2give", "reb2": "rebased", "ipl": "insurepal", "gem": "gems-2", "sins": "safeinsure", "quan": "quantis", "fr": "freedom-reserve", "ags": "aegis", "steep": "steepcoin", "orme": "ormeuscoin", "dogy": "dogeyield", "pch": "popchain", "etnx": "electronero", "tmt": "traxia", "ugc": "ugchain", "aced": "aced", "yfd": "yfdfi-finance", "slr": "solarcoin", "pop": "popularcoin", "haut": "hauteclere-shards-2", "bbs": "bbscoin", "scap": "safecapital", "cato": "catocoin", "ibtc": "ibtc", "mon": "moneybyte", "wvg0": "wrapped-virgin-gen-0-cryptokitties", "avs": "algovest", "vtd": "variable-time-dollar", "c2c": "ctc", "yfbeta": "yfbeta", "bbo": "bigbom-eco", "fota": "fortuna", "shmn": "stronghands-masternode", "ctrt": "cryptrust", "ifex": "interfinex-bills", "yfbt": "yearn-finance-bit", "wiki": "wiki-token", "dex": "alphadex", "bear": "arcane-bear", "crc": "crycash", "ird": "iridium", "com": "community-token", "tic": "thingschain", "btw": "bitwhite", "svd": "savedroid", "ezw": "ezoow", "got": "gonetwork", "delta": "deltachain", "ecoin": "ecoin-2", "smol": "smol", "skin": "skincoin", "bboo": "panda-yield", "karma": "karma-dao", "insn": "insanecoin", "space": "spacecoin", "syn": "synlev", "jem": "jem", "mcp": "my-crypto-play", "medibit": "medibit", "inve": "intervalue", "hndc": "hondaiscoin", "dln": "delion", "ngot": "ngot", "obr": "obr", "lkn": "linkcoin-token", "cbx": "bullion", "mss": "monster-cash-share", "sishi": "sishi-finance", "rupx": "rupaya", "thrt": "thrive", "itl": "italian-lira", "nfxc": "nfx-coin", "btct": "bitcoin-token", "nbc": "niobium-coin", "mcash": "midas-cash", "iut": "mvg-token", "cob": "cobinhood", "ynk": "yoink", "dfx": "definitex", "adi": "aditus", "candy": "skull-candy-shards", "mixs": "streamix", "lot": "lukki-operating-token", "swagg": "swagg-network", "xjo": "joulecoin", "dim": "dimcoin", "ffyi": "fiscus-fyi", "gun": "guncoin", "croat": "croat", "scriv": "scriv", "stu": "bitjob", "pux": "polypux", "pkg": "pkg-token", "ella": "ellaism", "bon": "bonpay", "bse": "buy-sell", "sbs": "staysbase", "cyl": "crystal-token", "rfctr": "reflector-finance", "btcv": "bitcoinv", "crypt": "cryptcoin", "mol": "molten", "arms": "2acoin", "imgc": "imagecash", "ecte": "eurocoinpay", "tob": "tokens-of-babel", "juice": "moon-juice", "kind": "kind-ads-token", "edrc": "edrcoin", "xta": "italo", "tit": "titcoin", "kash": "kids-cash", "skym": "soar", "adz": "adzcoin", "shuf": "shuffle-monster", "gbcr": "gold-bcr", "gcn": "gcn-coin", "kiwi": "kiwi-token", "first": "harrison-first", "horse": "ethorse", "yfpi": "yearn-finance-passive-income", "yfox": "yfox-finance", "bsd": "bitsend", "vls": "veles", "evil": "evil-coin", "plt": "plutus-defi", "bern": "berncash", "ytn": "yenten", "wtt": "giga-watt-token", "aqua": "aquachain", "xbi": "bitcoin-incognito", "rex": "rex", "wfil": "wrapped-filecoin", "sierra": "sierracoin", "tig": "tigereum", "civ": "civitas", "vsl": "vslice", "dcntr": "decentrahub-coin", "tok": "tokok", "jump": "jumpcoin", "yui": "yui-hinata", "yfsi": "yfscience", "cymt": "cybermusic", "naruto2": "naruto-bsc", "jan": "coinjanitor", "pfarm": "farm-defi", "hlix": "helix", "fsbt": "forty-seven-bank", "rugz": "rugz", "neva": "nevacoin", "tri": "trinity-protocol", "tgame": "truegame", "raise": "hero-token", "aro": "arionum", "datp": "decentralized-asset-trading-platform", "bgtt": "baguette-token", "cen": "coinsuper-ecosystem-network", "pte": "peet-defi", "pyrk": "pyrk", "yun": "yunex", "boli": "bolivarcoin", "hqt": "hyperquant", "xkr": "kryptokrona", "cred": "verify", "bugs": "starbugs-shards", "pgo": "pengolincoin", "ig": "igtoken", "dmb": "digital-money-bits", "herb": "herbalist-token", "dp": "digitalprice", "war": "yieldwars-com", "deep": "deepcloud-ai", "ltb": "litebar", "cps": "capricoin", "ablx": "able", "jigg": "jiggly-finance", "nice": "nice", "yfdot": "yearn-finance-dot", "bonk": "bonk-token", "xgox": "xgox", "mat": "bitsum", "xuez": "xuez", "eltcoin": "eltcoin", "cgi": "coinshares-gold-and-cryptoassets-index-lite", "chc": "chaincoin", "bro": "bitradio", "lana": "lanacoin", "yamv2": "yam-v2", "opal": "opal", "atb": "atbcoin", "arm": "armours", "scr": "scorum", "gtm": "gentarium", "crad": "cryptoads-marketplace", "xos": "oasis-2", "tkp": "tokpie", "bta": "bata", "cherry": "cherry", "inx": "inmax", "martk": "martkist", "aib": "advanced-internet-block", "rigel": "rigel-finance", "sxtz": "sxtz", "kwh": "kwhcoin", "cpu": "cpuchain", "rpc": "ronpaulcoin", "lcp": "litecoin-plus", "wild": "wild-crypto", "obee": "obee-network", "cpr": "cipher", "kts": "klimatas", "dvs": "davies", "ben": "bitcoen", "dtrc": "datarius-cryptobank", "team": "team-finance", "ezy": "eazy", "gup": "matchpool", "prix": "privatix", "arct": "arbitragect", "duo": "duo", "havy": "havy-2", "abs": "absolute", "hur": "hurify", "araw": "araw-token", "may": "theresa-may-coin", "bznt": "bezant", "bcz": "bitcoin-cz", "bsds": "basis-dollar-share", "cash2": "cash2", "knt": "kora-network", "hb": "heartbout", "mfc": "mfcoin", "rto": "arto", "sno": "savenode", "estx": "oryxcoin", "arion": "arion", "mcc": "multicoincasino", "bree": "cbdao", "wrc": "worldcore", "milf": "milfies", "vgr": "voyager", "gcg": "gulf-coin-gold", "lbtc": "litebitcoin", "pomac": "poma", "btcred": "bitcoin-red", "bzx": "bitcoin-zero", "coke": "cocaine-cowboy-shards", "mooi": "moonai", "kwatt": "4new", "genx": "genesis-network", "btcn": "bitcoinote", "kydc": "know-your-developer", "zzzv2": "zzz-finance-v2", "imp": "ether-kingdoms-token", "sdash": "sdash", "vaultz": "vaultz", "medic": "medic-coin", "hodl": "hodlcoin", "arepa": "arepacoin", "rntb": "bitrent", "guess": "peerguess", "prx": "proxynode", "etgf": "etg-finance", "tds": "tokendesk", "bloody": "bloody-token", "xd": "scroll-token", "cof": "coffeecoin", "stak": "straks", "wgo": "wavesgo", "dbet": "decentbet", "nat": "natmin-pure-escrow", "sur": "suretly", "toto": "tourist-token", "shb": "skyhub", "tmn": "ttanslateme-network-token", "nzl": "zealium", "yfuel": "yfuel", "glt": "globaltoken", "swyftt": "swyft", "2x2": "2x2", "usdq": "usdq", "chiefs": "kansas-city-chiefs-win-super-bowl", "burn": "blockburn", "ucn": "uchain", "ace": "tokenstars-ace", "swc": "scanetchain", "pnx": "phantomx", "nrp": "neural-protocol", "xco": "xcoin", "jiaozi": "jiaozi", "netko": "netko", "kema": "kemacoin", "drip": "dripper-finance", "ethplo": "ethplode", "deex": "deex", "$noob": "noob-finance", "cjt": "connectjob", "yffs": "yffs", "wdp": "waterdrop", "joint": "joint", "swipp": "swipp", "veco": "veco", "impl": "impleum", "actp": "archetypal-network", "note": "dnotes", "emrals": "emrals", "trk": "truckcoin", "pkb": "parkbyte", "lnc": "blocklancer", "desh": "decash", "taj": "tajcoin", "mst": "mustangcoin", "cdm": "condominium", "gst": "game-stars", "audax": "audax", "pfr": "payfair", "gxx": "gravitycoin", "dfs": "digital-fantasy-sports", "bold": "boldman-capital", "cou": "couchain", "boxx": "boxx", "sove": "soverain", "hippo": "hippo-finance", "gic": "giant", "care": "carebit", "gsr": "geysercoin", "vikky": "vikkytoken", "klks": "kalkulus", "tsd": "true-seigniorage-dollar", "apr": "apr-coin", "npc": "npcoin", "nrve": "narrative", "cnct": "connect", "seal": "seal-finance", "asa": "asura", "paxex": "paxex", "mac": "machinecoin", "ctsc": "cts-coin", "joon": "joon", "help": "help-token", "zfl": "zedxe", "trvc": "thrivechain", "cco": "ccore", "epc": "experiencecoin", "info": "infocoin", "noodle": "noodle-finance", "mar": "mchain", "sinoc": "sinoc", "lno": "livenodes", "zyon": "bitzyon", "intu": "intucoin", "sfcp": "sf-capital", "braz": "brazio", "aias": "aiascoin", "apc": "alpha-coin", "infx": "influxcoin", "drm": "dreamcoin", "xstar": "starcurve", "dalc": "dalecoin", "exo": "exosis", "lud": "ludos", "bacon": "baconswap", "yfid": "yfidapp", "ulg": "ultragate", "kgs": "kingscoin", "bit": "bitmoney", "itt": "intelligent-trading-tech", "nyx": "nyxcoin", "aus": "australia-cash", "ethm": "ethereum-meta", "neet": "neetcoin", "distx": "distx", "gtx": "goaltime-n", "ams": "amsterdamcoin", "wbt": "whalesburg", "boat": "boat", "snd": "snodecoin", "cow": "cowry", "agu": "agouti", "xgcs": "xgalaxy", "jbx": "jboxcoin", "yfrb": "yfrb-finance", "rle": "rich-lab-token", "arc": "arcticcoin", "tour": "touriva", "strng": "stronghold", "mnp": "mnpcoin", "chan": "chancoin", "mftu": "mainstream-for-the-underground", "gdr": "guider", "house": "toast-finance", "hydro": "hydro", "bm": "bitcomo", "tux": "tuxcoin", "klon": "klondike-finance", "mexp": "moji-experience-points", "kkc": "primestone", "reex": "reecore", "wtl": "welltrado", "zoc": "01coin", "osina": "osina", "dow": "dowcoin", "mxt": "martexcoin", "kmx": "kimex", "uffyi": "unlimited-fiscusfyi", "aet": "aerotoken", "mafi": "mafia-network", "blry": "billarycoin", "znd": "zenad", "dtc": "datacoin", "ylc": "yolo-cash", "xczm": "xavander-coin", "ztc": "zent-cash", "goss": "gossipcoin", "gali": "galilel", "litb": "lightbit", "ntr": "netrum", "rise": "rise-protocol", "sas": "stand-share", "arb": "arbit", "bsgs": "basis-gold-share", "wcoinbase-iou": "deus-synthetic-coinbase-iou", "jmc": "junsonmingchancoin", "btcb": "bitcoinbrand", "dxo": "dextro", "eny": "emergency-coin", "cct": "crystal-clear", "beverage": "beverage", "fntb": "fintab", "abst": "abitshadow-token", "vivid": "vivid", "din": "dinero", "btcui": "bitcoin-unicorn", "nyb": "new-year-bull", "chtc": "cryptohashtank-coin", "rank": "rank-token", "abet": "altbet", "bul": "bulleon", "xsr": "sucrecoin", "gfn": "game-fanz", "roco": "roiyal-coin", "exn": "exchangen", "guard": "guardium", "labx": "stakinglab", "clc": "caluracoin", "wtr": "water-token-2", "stream": "streamit-coin", "xap": "apollon", "scsx": "secure-cash", "zzz": "zzz-finance", "sdusd": "sdusd", "js": "javascript-token", "payx": "paypex", "dashg": "dash-green", "nka": "incakoin", "exus": "exus-coin", "spe": "bitcoin-w-spectrum", "faith": "faithcoin", "yieldx": "yieldx", "mbgl": "mobit-global", "hlx": "hilux", "eld": "electrum-dark", "azum": "azuma-coin", "cnmc": "cryptonodes", "sac": "stand-cash", "varius": "varius", "polar": "polaris", "brix": "brixcoin", "quot": "quotation-coin", "mynt": "mynt", "kec": "keyco", "better": "better-money", "orm": "orium", "crcl": "crowdclassic", "mano": "mano-coin", "kaaso": "kaaso", "oot": "utrum", "wllo": "willowcoin", "saros": "saros", "dgm": "digimoney", "fsd": "freq-set-dollar", "clg": "collegicoin", "ary": "block-array", "bkx": "bankex", "bdcash": "bigdata-cash", "het": "havethertoken", "lms": "lumos", "ssx": "stakeshare", "voise": "voise", "orox": "cointorox", "nbxc": "nibbleclassic", "kreds": "kreds", "bost": "boostcoin", "ixrp": "ixrp", "dice": "dice-finance", "idefi": "idefi", "mek": "meraki", "404": "404", "sms": "speed-mining-service", "real": "real", "evi": "evimeria", "yffc": "yffc-finance", "aer": "aeryus", "bds": "borderless", "ixtz": "ixtz", "lux": "luxcoin", "atl": "atlant", "zla": "zilla", "ebtc": "ebitcoin", "voco": "provoco", "pirl": "pirl", "bze": "bzedge", "idash": "idash", "arg": "argentum", "pcn": "peepcoin", "icex": "icex", "cstl": "cstl", "up": "uptoken", "cc": "cryptocart", "mp4": "mp4", "ges": "ges", "idk": "idk", "520": "520", "lif": "winding-tree", "mex": "mex", "lvx": "level01-derivatives-exchange", "sfb": "sfb", "ize": "ize", "bgt": "bgt", "yes": "yes", "p2p": "p2p-network", "rug": "rug", "eox": "eox", "ubu": "ubu-finance", "imo": "imo", "ecc": "ecc", "h3x": "h3x", "mox": "mox", "day": "chronologic", "kvi": "kvi", "tmc": "tmc-niftygotchi", "hdt": "hdt", "zin": "zin", "dad": "decentralized-advertising", "tvt": "tvt", "mvl": "mass-vehicle-ledger", "lbk": "legal-block", "vey": "vey", "hex": "hex", "1ai": "1ai", "yas": "yas", "aos": "aos", "7up": "7up", "zos": "zos", "htm": "htm", "olo": "olo", "owl": "owl-token", "die": "die", "onot": "ono", "sun": "sun-token", "iab": "iab", "zyx": "zyx", "vbt": "vbt", "b26": "b26", "pop!": "pop", "mp3": "mp3", "mrv": "mrv", "cpt": "cryptaur", "msn": "msn", "yup": "yup", "3xt": "3xt", "zom": "zoom-protocol", "xtp": "tap", "gya": "gya", "sov": "sovereign-coin", "rxc": "rxc", "fme": "fme", "ucx": "ucx-foundation", "wal": "wal", "lcg": "lcg", "many": "manyswap", "oryx": "oryx", "xfii": "xfii", "iten": "iten", "biki": "biki", "lbrl": "lbrl", "tun": "tune", "artx": "artx", "asla": "asla", "camp": "camp", "fil6": "filecoin-iou", "ioex": "ioex", "pryz": "pryz", "post": "postcoin", "arke": "arke", "qpy": "qpay", "nilu": "nilu", "xels": "xels", "exor": "exor", "bsys": "bsys", "elya": "elya", "afro": "afro", "aeur": "aeur", "agt": "aisf", "kala": "kala", "yfet": "yfet", "plg": "pledgecamp", "weth": "weth", "ymax": "ymax", "ston": "ston", "taxi": "taxi", "lucy": "lucy", "donu": "donu", "noku": "noku", "r34p": "r34p", "ers": "eros", "obic": "obic", "maro": "ttc-protocol", "pofi": "pofi", "apix": "apix", "cez": "cezo", "pica": "pica", "gtc": "global-trust-coin", "bcat": "bcat", "xtrm": "xtrm", "ympl": "ympl", "dmme": "dmme-app", "vspy": "vspy", "punk": "punk", "yce": "myce", "b360": "b360", "enx": "enex", "ieos": "ieos", "lze": "lyze", "xdai": "xdai", "ng": "ngin", "cspc": "chinese-shopping-platform", "zeon": "zeon", "bare": "bare", "xbnta": "xbnt", "bidr": "binanceidr", "bitz": "bitz", "sbet": "sbet", "attn": "attn", "scrv": "scrv", "miss": "miss", "moac": "moac", "iron": "iron-stablecoin", "abbc": "alibabacoin", "amis": "amis", "ndau": "ndau", "ibnb": "ibnb", "bolt": "thunderbolt", "g999": "g999", "pick": "pick", "xfit": "xfit", "gasp": "gasp", "zyro": "zyro", "arix": "arix", "reth": "reth", "waxe": "waxe", "qcad": "qcad", "tena": "tena", "psrs": "psrs", "cook": "cook", "glex": "glex", "pika": "pikachu", "dray": "dray", "novo": "novo", "alis": "alis", "vvsp": "vvsp", "vivo": "vivo", "rccc": "rccc", "frat": "frat", "gmb": "gamb", "azu": "azus", "efin": "efin", "wbx": "wibx", "yfia": "yfia", "olxa": "olxa", "aeon": "aeon", "olcf": "olcf", "arx": "arcs", "r64x": "r64x", "mini": "mini", "soge": "soge", "bpop": "bpop", "teat": "teal", "boid": "boid", "mass": "mass", "joys": "joys", "hapi": "hapi", "wise": "wise-token11", "sefi": "sefi", "tugz": "tugz", "crow": "crow-token", "seer": "seer", "bora": "bora", "vidy": "vidy", "bu": "bumo", "utip": "utip", "trbo": "turbostake", "sltc": "sltc", "xls": "elis", "xch": "chia-iou", "vybe": "vybe", "n0031": "ntoken0031", "mogx": "mogu", "gold": "digital-gold-token", "koto": "koto", "amix": "amix", "gr": "grom", "benz": "benz", "hype": "hype-finance", "ln": "link", "tosc": "t-os", "asta": "asta", "wav3": "wav3", "qusd": "qusd-stablecoin", "cmdx": "cmdx", "lynx": "lynx", "swop": "swop", "aly": "ally", "musk": "musk", "xank": "xank", "sono": "sonocoin", "argo": "argo", "zinc": "zinc", "lyfe": "lyfe", "dogz": "dogz", "roc": "roxe", "kupp": "kupp", "s4f": "s4fe", "vndc": "vndc", "chbt": "chbt", "zpr": "zper", "dnc": "danat-coin", "thx": "thorenext", "evan": "evan", "mute": "mute", "sg20": "sg20", "hope": "hope-token", "dsys": "dsys", "prot": "prot", "foin": "foincoin", "acdc": "volt", "usda": "usda", "redi": "redi", "rfis": "rfis", "whey": "whey", "etor": "etor", "vera": "vera", "suni": "suni", "nova": "nova", "usdl": "usdl", "pway": "pway", "ntm": "netm", "plex": "plex", "mymn": "mymn", "xtrd": "xtrade", "sti": "stib-token", "dtmi": "dtmi", "peos": "peos", "ruc": "rush", "iote": "iote", "bast": "bast", "cyb": "cybex", "burnx": "burnx", "ccomp": "ccomp", "xpo": "x-power-chain", "libfx": "libfx", "vesta": "vesta", "seed": "seed-venture", "miami": "miami", "joy": "joy-coin", "visio": "visio", "znko": "zenko", "tro": "tro-network", "rup": "rupee", "vix": "vixco", "bud": "buddy", "ehash": "ehash", "kcash": "kcash", "manna": "manna", "gig": "gigecoin", "btr": "bitrue-token", "hatch": "hatch-dao", "twist": "twist", "xkncb": "xkncb", "mla": "moola", "dxiot": "dxiot", "kvnt": "kvant", "atmos": "atmos", "yusra": "yusra", "em": "eminer", "ean": "eanto", "uno": "unobtanium", "xtx": "xtock", "xsp": "xswap", "atp": "atlas-protocol", "dlike": "dlike", "xfg": "fango", "lc": "lightningcoin", "pzm": "prizm", "bsha3": "bsha3", "elons": "elons", "zwx": "ziwax", "jvz": "jiviz", "bliss": "bliss-2", "clam": "clams", "dfnd": "dfund", "grimm": "grimm", "aunit": "aunit", "fln": "fline", "topia": "topia", "aico": "aicon", "ilg": "ilgon", "dby": "dobuy", "eidos": "eidos", "clt": "coinloan", "lgbtq": "pride", "vnx": "venox", "tsr": "tesra", "keyt": "rebit", "bid": "blockidcoin", "myo": "mycro-ico", "tks": "tokes", "xfe": "feirm", "xazab": "xazab", "aloha": "aloha", "cvr": "polkacover", "akn": "akoin", "senso": "senso", "ybusd": "ybusd", "fo": "fibos", "mri": "mirai", "xin": "infinity-economics", "usdex": "usdex-2", "sgoog": "sgoog", "slnv2": "slnv2", "hve2": "uhive", "ipfst": "ipfst", "tor": "torchain", "morc": "dynamic-supply", "seele": "seele", "digex": "digex", "earnx": "earnx", "stonk": "stonk", "funjo": "funjo", "acoin": "acoin", "xfuel": "xfuel", "ferma": "ferma", "bulls": "bulls", "xsnxa": "xsnx", "vidyx": "vidyx", "sheng": "sheng", "alphr": "alphr", "bitsz": "bitsz", "ksk": "kskin", "snflx": "snflx", "p2pg": "p2pgo", "sem": "semux", "spok": "spock", "bubo": "budbo", "xax": "artax", "con": "converter-finance", "lex": "elxis", "paper": "paper", "steel": "steel", "gena": "genta", "br34p": "br34p", "defla": "defla", "gof": "golff", "zch": "zilchess", "antr": "antra", "cprop": "cprop", "trism": "trism", "stamp": "stamp", "spt": "spectrum", "apn": "apron", "dudgx": "dudgx", "ifx24": "ifx24", "kxusd": "kxusd", "ing": "iungo", "blurt": "blurt", "vso": "verso", "veth2": "veth2", "altom": "altcommunity-coin", "unify": "unify", "xgm": "defis", "xeuro": "xeuro", "xnc": "xenios", "rlx": "relax-protocol", "xnode": "xnode", "mts": "mtblock", "eql": "equal", "krex": "kronn", "qc": "qovar-coin", "xhd": "xrphd", "ysr": "ystar", "ikomp": "ikomp", "fx1": "fanzy", "xra": "ratecoin", "posh": "shill", "omega": "omega", "eurxb": "eurxb", "xen": "xenon-2", "ifarm": "ifarm", "toz": "tozex", "flap": "flapp", "sts": "sbank", "pando": "pando", "imusd": "imusd", "voltz": "voltz", "az": "azbit", "$aapl": "aapl", "atx": "aston", "alb": "albos", "hdi": "heidi", "point": "point", "upbnb": "upbnb", "merge": "merge", "ibank": "ibank", "franc": "franc", "ct": "communitytoken", "haz": "hazza", "lunes": "lunes", "sklay": "sklay", "fma": "flama", "mooni": "mooni", "asimi": "asimi", "grain": "grain-token", "swace": "swace", "rkn": "rakon", "rfbtc": "rfbtc", "mks": "makes", "byron": "bitcoin-cure", "klt": "klend", "lkk": "lykke", "axl": "axial", "amr": "ammbr", "fleta": "fleta", "hlo": "helio", "mvr": "mavro", "knv": "kanva", "fil12": "fil12", "ptd": "pilot", "mozox": "mozox", "basic": "basic", "egold": "egold", "xmark": "xmark", "cvl": "civil", "amon": "amond", "oks": "okschain", "jwl": "jewel", "lucky": "lucky-2", "bxiot": "bxiot", "bion": "biido", "vmr": "vomer", "plut": "pluto", "trybe": "trybe", "sbe": "sombe", "ox": "orcax", "ytusd": "ytusd", "omb": "ombre", "sop": "sopay", "blood": "blood", "cms": "comsa", "tlr": "taler", "memex": "memex", "atd": "atd", "byts": "bytus", "vinci": "vinci", "pgpay": "puregold-token", "modex": "modex", "tools": "tools", "ecu": "decurian", "blast": "blast", "cdex": "codex", "emoj": "emoji", "wco": "winco", "peach": "peach", "samzn": "samzn", "pizza": "pizzaswap", "piasa": "piasa", "hplus": "hplus", "vld": "valid", "sar": "saren", "pazzy": "pazzy", "mnguz": "mangu", "acryl": "acryl", "gapt": "gaptt", "zlp": "zuplo", "srune": "srune", "pitch": "pitch", "myu": "myubi", "u": "ucoin", "tower": "tower", "qob": "qobit", "husky": "husky", "ovi": "oviex", "saave": "saave", "xknca": "xknca", "sls": "salus", "nsg": "nasgo", "temco": "temco", "sld": "safelaunchpad", "crave": "crave", "imbtc": "the-tokenized-bitcoin", "seeds": "seeds", "viper": "viper", "keyfi": "keyfi", "tup": "tenup", "raku": "rakun", "utrin": "utrin", "fla": "fiola", "carat": "carat", "jll": "jllone", "mgx": "margix", "oct": "oraclechain", "hgro": "helgro", "tlo": "talleo", "incnt": "incent", "rnx": "roonex", "dgn": "degen-protocol", "gunthy": "gunthy", "nt": "nexdax", "byt": "byzbit", "qmc": "qmcoin", "min": "mindol", "dmx": "dymmax", "mct": "master-contract-token", "azzr": "azzure", "bsy": "bestay", "mns": "monnos", "onit": "onbuff", "ec": "eternal-cash", "mag": "maggie", "sic": "sicash", "gfce": "gforce", "whx": "whitex", "naft": "nafter", "mor": "morcrypto-coin", "ktt": "k-tune", "exg": "exgold", "str": "staker", "aapx": "ampnet", "bfx": "bitfex", "ocul": "oculor", "xhi": "hicoin", "waf": "waffle", "dbt": "datbit", "stm": "stream", "qrn": "qureno", "toko": "toko", "xaaveb": "xaaveb", "clv": "clover-finance", "echt": "e-chat", "awo": "aiwork", "dhv": "dehive", "lhcoin": "lhcoin", "degens": "degens", "redbux": "redbux", "pat": "patron", "gaze": "gazetv", "coup": "coupit", "xce": "cerium", "lgc": "gemini", "xdag": "dagger", "hbx": "hashbx", "s8": "super8", "strn": "saturn-classic-dao-token", "spg": "super-gold", "xaavea": "xaavea", "evr": "everus", "dogira": "dogira", "yco": "y-coin", "s1inch": "s1inch", "dess": "dessfi", "pcatv3": "pcatv3", "qi": "qiswap", "boo": "spookyswap", "yoc": "yocoin", "omm": "omcoin", "dxf": "dexfin", "uzz": "azuras", "fpt": "fuupay", "fit": "financial-investment-token", "tyc": "tycoon", "sfn": "safron", "r3t": "rock3t", "rabbit": "rabbit", "nbu": "nimbus", "tem": "temtem", "bstx": "blastx", "sefa": "mesefa", "zlw": "zelwin", "ebst": "eboost", "dusa": "medusa", "lemd": "lemond", "wynaut": "wynaut", "news": "cryptonewsnet", "gmr": "gmr-finance", "stri": "strite", "rpzx": "rapidz", "nux": "peanut", "fzy": "frenzy", "bep": "blucon", "melody": "melody", "hfi": "hecofi", "eauric": "eauric", "inn": "innova", "erc223": "erc223", "sanc": "sancoj", "nkc": "nework", "kicks": "sessia", "ecob": "ecobit", "jui": "juiice", "heal": "etheal", "uponly": "uponly", "bceo": "bitceo", "prkl": "perkle", "moneta": "moneta", "fdn": "fundin", "ilc": "ilcoin", "in": "incoin", "uis": "unitus", "dexm": "dexmex", "egx": "eaglex", "mdu": "mdu", "renfil": "renfil", "cntx": "centex", "bay": "bitbay", "zdc": "zodiac", "usd1": "psyche", "xym": "symbol", "tara": "taraxa", "dbnk": "debunk", "xsc": "xscoin", "gxi": "genexi", "levelg": "levelg", "perl": "perlin", "mdm": "medium", "kabosu": "kabosu", "xinchb": "xinchb", "dacs": "dacsee", "efk": "refork", "kk": "kkcoin", "ama": "amaten", "gneiss": "gneiss", "alg": "bitalgo", "rno": "snapparazzi", "rblx": "rublix", "strk": "strike", "yac": "yacoin", "brtr": "barter", "anct": "anchor", "ubin": "ubiner", "ame": "amepay", "gsfy": "gasify", "zag": "zigzag", "ttr": "tetris", "orfano": "orfano", "zdr": "zloadr", "dtep": "decoin", "entone": "entone", "zoa": "zotova", "lcnt": "lucent", "tewken": "tewken", "sead": "seadex", "vbswap": "vbswap", "vyn": "vyndao", "i0c": "i0coin", "roz": "rozeus", "aquari": "aquari", "prstx": "presto", "octa": "octans", "iqq": "iqoniq", "uted": "united-token", "pgf7t": "pgf500", "raux": "ercaux", "was": "wasder", "dxr": "dexter", "bva": "bavala", "lev": "lever-network", "gom": "gomics", "uco": "uniris", "xab": "abosom", "ebk": "ebakus", "ras": "raksur", "me": "all-me", "bst": "bitsten-token", "ipm": "timers", "rhegic": "rhegic", "bpx": "bispex", "usg": "usgold", "swamp": "swamp-coin", "r2r": "citios", "egcc": "engine", "kam": "bitkam", "dka": "dkargo", "ceds": "cedars", "skrp": "skraps", "a5t": "alpha5", "btp": "bitcoin-pay", "kiro": "kirobo", "10set": "tenset", "ett": "efficient-transaction-token", "nii": "nahmii", "aka": "akroma", "agol": "algoil", "lib": "banklife", "alu": "altura", "oft": "orient", "bdk": "bidesk", "ilk": "inlock-token", "att": "africa-trading-chain", "polyfi": "polyfi", "sxi": "safexi", "oneeth": "oneeth", "trdx": "trodex", "zcx": "unizen", "cso": "crespo", "2goshi": "2goshi", "wbpc": "buypay", "xsh": "shield", "ign": "ignite", "rfx": "reflex", "jntr/e": "jntre", "dfni": "defini", "apx": "appics", "wtm": "waytom", "dsgn": "design", "orb": "orbitcoin", "cbt": "cryptocurrency-business-token", "mimo": "mimosa", "dcore": "decore", "pan": "panvala-pan", "fai": "fairum", "wix": "wixlar", "ket": "rowket", "jmt": "jmtime", "fnd": "fundum", "djv": "dejave", "scribe": "scribe", "lop": "kilopi", "hdp.\u0444": "hedpay", "vii": "7chain", "bdx": "beldex", "donk": "donkey", "meowth": "meowth", "pixeos": "pixeos", "koduro": "koduro", "arteon": "arteon", "dns": "bitdns", "clx": "celeum", "dsr": "desire", "arcona": "arcona", "kue": "kuende", "xlt": "nexalt", "cod": "codemy", "sfr": "safari", "xbtg": "bitgem", "cir": "circleswap", "co2b": "co2bit", "dctd": "dctdao", "glf": "gallery-finance", "usnbt": "nubits", "rich": "richierich-coin", "mnm": "mineum", "bri": "baroin", "onebtc": "onebtc", "nlx": "nullex", "xqr": "qredit", "xditto": "xditto", "shorty": "shorty", "xincha": "xincha", "wok": "webloc", "qoob": "qoober", "nlm": "nuclum", "sbt": "solbit", "kzc": "kzcash", "sprink": "sprink", "ivi": "inoovi", "vsn": "vision-network", "hpx": "hupayx", "azx": "azeusx", "trat": "tratok", "paa": "palace", "pteria": "pteria", "kel": "kelvpn", "zcor": "zrocor", "acu": "aitheon", "vancat": "vancat", "dms": "documentchain", "sconex": "sconex", "yfo": "yfione", "hd": "hubdao", "btcm": "btcmoon", "pyn": "paycent", "psb": "pesobit", "caj": "cajutel", "tronish": "tronish", "300": "spartan", "ddm": "ddmcoin", "mapc": "mapcoin", "buz": "buzcoin", "dion": "dionpay", "digi": "digible", "bnp": "benepit", "bono": "bonorum-coin", "peer": "unilord", "ibh": "ibithub", "ala": "aladiex", "chrt": "charity", "xat": "shareat", "xcz": "xchainz", "yot": "payyoda", "rap": "rapture", "lc4": "leocoin", "eag": "ea-coin", "dmc": "decentralized-mining-exchange", "imu": "imusify", "wire": "wire", "jdc": "jd-coin", "mimatic": "mimatic", "fat": "tronfamily", "xxa": "ixinium", "htc": "hitcoin", "mlm": "mktcoin", "aglt": "agrolot", "bnk": "bankera", "mndao": "moondao", "land": "new-landbox", "ausc": "auscoin", "winr": "justbet", "gbt": "gulf-bits-coin", "x0z": "zerozed", "sdgo": "sandego", "dxh": "daxhund", "peth18c": "peth18c", "vspacex": "vspacex", "baxs": "boxaxis", "ubomb": "unibomb", "vbit": "valobit", "eum": "elitium", "arts": "artista", "quo": "vulcano", "dgmt": "digimax", "spike": "spiking", "rzb": "rizubot", "onewing": "onewing", "bliq": "bliquid", "bixcpro": "bixcpro", "drk": "drakoin", "tag": "tagcoin-erc20", "btv": "bitvote", "pgs": "pegasus", "ape": "apecoin", "poocoin": "poocoin", "bni": "betnomi-2", "gaj": "polygaj", "tfd": "etf-dao", "vltm": "voltium", "ctl": "citadel", "shroud": "shroud-protocol", "kyan": "kyanite", "unos": "unoswap", "ardx": "ardcoin", "coi": "coinnec", "cnx": "cryptonex", "zdx": "zer-dex", "ufarm": "unifarm", "fml": "formula", "si14": "si14bet", "xbg": "bitgrin", "pbl": "publica", "rech": "rechain", "fnsp": "finswap", "bup": "buildup", "vtar": "vantaur", "axnt": "axentro", "rhegic2": "rhegic2", "btkc": "beautyk", "btrn": "biotron", "m": "m-chain", "mdtk": "mdtoken", "ril": "rilcoin", "cop": "copiosa", "rrc": "rrspace", "mpt": "metal-packaging-token", "bscgold": "bscgold", "v": "version", "don": "donnie-finance", "gps": "triffic", "msb": "magic-e-stock", "komp": "kompass", "btsg": "bitsong", "seko": "sekopay", "smdx": "somidax", "bnode": "beenode", "tat": "tatcoin", "addy": "adamant", "laq": "laq-pay", "youc": "youcash", "ntx": "nitroex", "sam": "samurai", "ohmc": "ohm-coin", "sap": "swaap-stablecoin", "moonpaw": "moonpaw", "ttt": "the-transfer-token", "nax": "nextdao", "mkey": "medikey", "yay": "yayswap", "bdo": "bdollar", "xnb": "xeonbit", "bignite": "bignite", "torpedo": "torpedo", "buy": "burency", "hal": "halcyon", "lyra": "scrypta", "satoz": "satozhi", "wenb": "wenburn", "lthn": "intensecoin", "enu": "enumivo", "dvx": "derivex", "mb": "microchain", "xyz": "jetmint", "mesh": "meshbox", "taud": "trueaud", "hmr": "homeros", "ktc": "kitcoin", "bly": "blocery", "twee": "tweebaa", "ath": "atheios", "avn": "avantage", "zny": "bitzeny", "dkyc": "datakyc", "psy": "psychic", "cha": "chaucha", "prvs": "previse", "bn": "bitnorm", "lkt": "lukutex", "ift": "iftoken", "kfc": "chicken", "i9c": "i9-coin", "wfx": "webflix", "palg": "palgold", "gadoshi": "gadoshi", "clb": "clbcoin", "hamtaro": "hamtaro", "sprts": "sprouts", "trbt": "tribute", "ekt": "educare", "ree": "reecoin", "opc": "op-coin", "yok": "yokcoin", "jar": "jarvis", "betxc": "betxoin", "tlw": "tilwiki", "xmv": "monerov", "pshp": "payship", "wcx": "wecoown", "mel": "caramelswap", "mql": "miraqle", "onelink": "onelink", "onevbtc": "onevbtc", "sjw": "sjwcoin", "dswap": "definex", "flexusd": "flex-usd", "bafe": "bafe-io", "sup8eme": "sup8eme", "yplt": "yplutus", "swin": "swinate", "csp": "caspian", "lhb": "lendhub", "eeth": "eos-eth", "jindoge": "jindoge", "b2c": "b2-coin", "cctc": "cctcoin", "nug": "nuggets", "chat": "beechat", "pqt": "prediqt", "vnl": "vanilla", "trop": "interop", "ents": "eunomia", "rlz": "relianz", "tcfx": "tcbcoin", "cpz": "cashpay", "sxc": "simplexchain", "trm": "tranium", "vro": "veraone", "bin": "binarium", "gsm": "gsmcoin", "aby": "artbyte", "mak": "makcoin", "admn": "adioman", "torm": "thorium", "hitx": "hithotx", "mrat": "moonrat", "wasp": "wanswap", "rtk": "ruletka", "ix": "x-block", "sum": "sumcoin", "ael": "aelysir", "tlc": "tl-coin", "gaia": "gaiadao", "fra": "findora", "nyex": "nyerium", "7e": "7eleven", "o3": "o3-swap", "tgbp": "truegbp", "iti": "iticoin", "b2b": "b2bcoin-2", "fk": "fk-coin", "trcl": "treecle", "rx": "raven-x", "bonfire": "bonfire", "prophet": "prophet", "lar": "linkart", "mttcoin": "mttcoin", "mpay": "menapay", "pmeer": "qitmeer", "bgc": "be-gaming-coin", "sgb": "subgame", "xscr": "securus", "tshp": "12ships", "tek": "tekcoin", "ecp": "ecp-technology", "nld": "newland", "cyfm": "cyberfm", "xfyi": "xcredit", "pcm": "precium", "c3": "charli3", "linkusd": "linkusd", "ccxx": "counosx", "dogedao": "dogedao", "befx": "belifex", "rebound": "rebound", "sto": "storeum", "bitc": "bitcash", "ogx": "organix", "crfi": "crossfi", "lmo": "lumeneo", "the": "the-node", "cid": "cryptid", "exp": "exchange-payment-coin", "xov": "xov", "kurt": "kurrent", "ork": "orakuru", "mouse": "mouse", "bte": "btecoin", "mnr": "mineral", "igg": "ig-gold", "brat": "brother", "xemx": "xeniumx", "zwap": "zilswap", "odex": "one-dex", "swat": "swtcoin", "gzro": "gravity", "wyx": "woyager", "dfo": "defiato", "zik": "zik-token", "mepad": "memepad", "ube": "ubeswap", "xiro": "xiropht", "oto": "otocash", "celc": "celcoin", "cura": "curadai", "prv": "privacyswap", "kuv": "kuverit", "vash": "vpncoin", "vgc": "5g-cash", "some": "mixsome", "bool": "boolean", "lnchx": "launchx", "tty": "trinity", "ethp": "ethplus", "fnk": "funkeypay", "vana": "nirvana", "pkt": "playkey", "kian": "kianite", "xph": "phantom", "hawk": "hawkdex", "w3b": "w3bpush", "roo": "roocoin", "tdi": "tedesis", "net": "netcoin", "trl": "trolite", "aba": "ecoball", "pusd": "pegsusd", "gpt": "grace-period-token", "won": "weblock", "wsote": "soteria", "qtcon": "quiztok", "sfm": "sfmoney", "kal": "kaleido", "ebase": "eurbase", "ptr": "payturn", "888": "octocoin", "mora": "meliora", "marks": "bitmark", "our": "our-pay", "fn": "filenet", "pt": "predict", "moochii": "moochii", "fey": "feyorra", "bim": "bimcoin", "cmg": "cmgcoin", "thkd": "truehkd", "shrm": "shrooms", "onigiri": "onigiri", "zum": "zum-token", "asy": "asyagro", "safebtc": "safebtc", "locg": "locgame", "wdx": "wordlex", "halv": "halving-coin", "ugd": "unigrid", "afrox": "afrodex", "scl": "sociall", "tkmn": "tokemon", "wxc": "wiix-coin", "xes": "proxeus", "btrm": "betrium", "sola": "solarys", "biop": "biopset", "fnax": "fnaticx", "boob": "boobank", "bfic": "bficoin", "mnmc": "mnmcoin", "deq": "dequant", "airx": "aircoins", "cmit": "cmitcoin", "foge": "fat-doge", "gpu": "gpu-coin", "txc": "tenxcoin", "bith": "bithachi", "bwt": "bittwatt", "marx": "marxcoin", "defy": "defy-farm", "ubn": "ubricoin", "lion": "lion-token", "moonstar": "moonstar", "oxo": "oxo-farm", "icol": "icolcoin", "eswa": "easyswap", "pure": "puriever", "naz": "naz-coin", "pti": "paytomat", "disk": "darklisk", "hl": "hl-chain", "bsn": "bastonet", "pdex": "polkadex", "agn": "agricoin", "nole": "nolecoin", "aknc": "aave-knc-v1", "btcl": "btc-lite", "zpay": "zantepay", "xqn": "quotient", "log": "woodcoin", "pine": "pinecoin", "lby": "libonomy", "bsp": "ballswap", "art": "maecenas", "wiz1": "wiz-coin", "bio": "biocrypt", "cash": "litecash", "sym": "symverse", "shit": "shitcoin-token", "plf": "playfuel", "cx": "circleex", "ecoc": "ecochain", "neex": "neexstar", "yep": "yep-coin", "xblzd": "blizzard", "koko": "kokoswap", "ebsc": "earlybsc", "busy": "busy-dao", "xind": "indinode", "gram": "gram", "shih": "shih-tzu", "qbit": "qubitica", "bnana": "banana-token", "pswap": "polkaswap", "treat": "treatdao", "hypebet": "hype-bet", "tuna": "tunacoin", "btcx": "bitcoinx-2", "plbt": "polybius", "szc": "zugacoin", "nuko": "nekonium", "elongate": "elongate", "fll": "feellike", "ea": "ea-token", "dxc": "dex-trade-coin", "bsc": "bitsonic-token", "job": "jobchain", "ijc": "ijascoin", "ic": "ignition", "moonmoon": "moonmoon", "tep": "tepleton", "lime": "limeswap", "llt": "lifeline", "zuc": "zeuxcoin", "amo": "amo", "xmm": "momentum", "trad": "tradcoin", "ytv": "ytv-coin", "jrex": "jurasaur", "nss": "nss-coin", "dgw": "digiwill", "bcx": "bitcoinx", "prime": "primedao", "nemo": "nemocoin", "csx": "coinstox", "torro": "bittorro", "qbz": "queenbee", "nsr": "nushares", "libertas": "libertas-token", "pcl": "peculium", "vrap": "veraswap", "fly": "franklin", "nan": "nantrade", "lvl": "levelapp", "gasg": "gasgains", "vlm": "valireum", "riskmoon": "riskmoon", "pinke": "pinkelon", "xln": "lunarium", "ctt": "castweet", "shibapup": "shibapup", "gze": "gazecoin", "exmr": "exmr-monero", "100x": "100x-coin", "mne": "minereum", "sine": "sinelock", "yda": "yadacoin", "isal": "isalcoin", "ocb": "blockmax", "bag": "blockchain-adventurers-guild", "windy": "windswap", "mo": "morality", "vela": "vela", "daft": "daftcoin", "safenami": "safenami", "nvc": "novacoin", "poke": "pokeball", "rdct": "rdctoken", "aswap": "arbiswap", "bigo": "bigo-token", "foxd": "foxdcoin", "morph": "morphose", "nvzn": "invizion", "safezone": "safezone", "gom2": "gomoney2", "sng": "sinergia", "saferune": "saferune", "prtcle": "particle-2", "miro": "mirocana", "rice": "riceswap", "zyn": "zynecoin", "mxw": "maxonrow", "ntrs": "nosturis", "wpt": "worldpet", "cirq": "cirquity", "mbbased": "moonbase", "aya": "aryacoin", "jobs": "jobscoin", "lpl": "linkpool", "gldy": "buzzshow", "mkcy": "markaccy", "chee": "cheecoin", "polymoon": "polymoon", "tv": "ti-value", "pact": "packswap", "black": "blackhole-protocol", "swsh": "swapship", "b2u": "b2u-coin", "ants": "fireants", "dhd": "dhd-coin", "erowan": "sifchain", "swaps": "nftswaps", "fch": "fanaticos-cash", "hpot": "hash-pot", "0xmr": "0xmonero", "ixt": "insurex", "gldx": "goldnero", "fts": "fortress", "fastmoon": "fastmoon", "zne": "zonecoin", "kok": "kok-coin", "saga": "sagacoin", "hca": "harcomia", "kdag": "kdag", "usdf": "usdf", "sapp": "sappchain", "bpp": "bitpower", "dogemoon": "dogemoon", "homi": "homihelp", "tar": "tartarus", "safebank": "safebank", "bcna": "bitcanna", "upl": "uploadea", "fomp": "fompound", "yfim": "yfimobi", "ape$": "ape-punk", "pxi": "prime-xi", "auop": "opalcoin", "stpc": "starplay", "polystar": "polystar", "rnb": "rentible", "solarite": "solarite", "tnr": "tonestra", "blowf": "blowfish", "cali": "calicoin", "bkkg": "biokkoin", "hburn": "hypeburn", "adl": "adelphoi", "trix": "triumphx", "meetone": "meetone", "club": "clubcoin", "dfk": "defiking", "nawa": "narwhale", "wtip": "worktips", "bee": "bee-coin", "runes": "runebase", "eva": "eva-coin", "html": "htmlcoin", "opnn": "opennity", "tpad": "trustpad", "slc": "support-listing-coin", "ethpy": "etherpay", "ltg": "litegold", "bfl": "bitflate", "blvr": "believer", "cross": "crosspad", "ino": "ino-coin", "ziti": "ziticoin", "mbud": "moon-bud", "aim": "ai-mining", "rvmt": "rivemont", "hdao": "hyperdao", "timec": "time-coin", "pxg": "playgame", "mrch": "merchdao", "svb": "sendvibe", "l3p": "lepricon", "znc": "zioncoin", "lf": "linkflow", "trusd": "trustusd", "mci": "mci-coin", "pvg": "pilnette", "enk": "enkronos", "graph": "unigraph", "izi": "izichain", "d100": "defi-100", "mbonk": "megabonk", "i9x": "i9x-coin", "bpcn": "blipcoin", "b2g": "bitcoiin", "adai": "aave-dai-v1", "pos": "pos-coin", "tacocat": "taco-cat", "sh": "super-hero", "asnx": "aave-snx-v1", "bmj": "bmj-master-nodes", "kali": "kalicoin", "payb": "paybswap", "gix": "goldfinx", "azrx": "aave-zrx-v1", "fraction": "fraction", "stol": "stabinol", "isr": "insureum", "lips": "lipchain", "bell": "bellcoin", "topc": "topchain", "hta": "historia", "comfi": "complifi", "jrc": "finchain", "xbs": "bitstake", "pnl": "true-pnl", "ragna": "ragnarok", "botx": "botxcoin", "izer": "izeroium", "yts": "yetiswap", "owdt": "oduwausd", "wage": "philscurrency", "goc": "eligma", "btshk": "bitshark", "cqt": "covalent", "gfun": "goldfund-ico", "guss": "guss-one", "mnd": "mindcoin", "weed": "weedcash", "alp": "alp-coin", "bnv": "benative", "nicheman": "nicheman", "ple": "plethori", "song": "songcoin", "mbs": "micro-blood-science", "cadc": "cad-coin", "lvn": "livenpay", "scol": "scolcoin", "omniunit": "omniunit", "tatm": "tron-atm", "tkm": "thinkium", "eti": "etherinc", "bizz": "bizzcoin", "18c": "block-18", "vns": "va-na-su", "ddtg": "davecoin", "nort": "northern", "uty": "unitydao", "coom": "coomcoin", "srnt": "serenity", "zg": "zg", "lxmt": "luxurium", "hotdoge": "hot-doge", "lol": "emogi-network", "guap": "guapcoin", "vlk": "vulkania", "ftn": "fountain", "svn": "7finance", "bshiba": "bscshiba", "moonshot": "moonshot", "hana": "hanacoin", "ap3": "ap3-town", "api": "the-apis", "blu": "bluecoin", "vip": "limitless-vip", "syl": "xsl-labs", "dgl": "dgl-coin", "leaf": "leafcoin", "palt": "palchain", "npo": "npo-coin", "mojo": "mojocoin", "orly": "orlycoin", "trn": "tronnodes", "bbt": "blockbase", "big": "thebigcoin", "tagr": "tagrcoin", "mes": "meschain", "inrt": "inrtoken", "prs": "pressone", "xgs": "genesisx", "pok": "poker-io", "ayfi": "ayfi", "nia": "nia-token", "wit": "witchain", "nmt": "novadefi", "lst": "lendroid-support-token", "abat": "aave-bat-v1", "nsfw": "xxxnifty", "bln": "blacknet", "akc": "akikcoin", "pnode": "pinknode", "aren": "aave-ren-v1", "cats": "catscoin", "hibs": "hiblocks", "amkr": "aave-mkr-v1", "trex": "trexcoin", "snft": "seedswap", "moto": "motocoin", "xrp-bf2": "xrp-bep2", "kva": "kevacoin", "trp": "tronipay", "edgt": "edgecoin-2", "bela": "belacoin", "wdf": "wildfire", "bnw": "nagaswap", "xgk": "goldkash", "mig": "migranet", "ttc": "thetimeschaincoin", "plat": "bitguild", "dyx": "xcoinpay", "vn": "vice-network", "prdz": "predictz", "alh": "allohash", "myfi": "myfichain", "cim": "coincome", "yfr": "youforia", "bca": "bitcoin-atom", "meet": "coinmeet", "aenj": "aave-enj-v1", "ndn": "ndn-link", "aht": "ahatoken", "drops": "defidrop", "char": "charitas", "eds": "endorsit", "tmed": "mdsquare", "alr": "alacrity", "ri": "ri-token", "spiz": "space-iz", "mmda": "pokerain", "slrm": "solareum", "uca": "uca", "fren": "frenchie", "tarm": "armtoken", "stash": "bitstash-marketplace", "ogods": "gotogods", "dgp": "dgpayment", "gera": "gera-coin", "bnc": "bnoincoin", "fsafe": "fair-safe", "sdao": "singularitydao", "btzc": "beatzcoin", "vltc": "venus-ltc", "psk": "pool-of-stake", "nnb": "nnb-token", "dream": "dream-swap", "ba": "batorrent", "qnc": "qnodecoin", "hejj": "hedge4-ai", "pfid": "pofid-dao", "ick": "ick-mask", "carr": "carnomaly", "pxl": "piction-network", "bixb": "bixb-coin", "exm": "exmo-coin", "cpx": "coinxclub", "hvt": "hirevibes", "sybc": "sybc-coin", "vdot": "venus-dot", "dbtc": "decentralized-bitcoin", "tls": "tls-token", "blfi": "blackfisk", "bamboo": "bamboo-token-2", "mntt": "moontrust", "pton": "foresting", "bna": "bananatok", "kick": "kickico", "dlx": "dapplinks", "tco": "tcoin-fun", "ani": "anime-token", "gmci": "game-city", "dfgl": "defi-gold", "bazt": "baooka-token", "fgc": "fantasy-gold", "ato": "eautocoin", "pluto": "plutopepe", "dkkt": "dkk-token", "dna": "metaverse-dualchain-network-architecture", "bito": "bito-coin", "ryiu": "ryi-unity", "dfc": "deflacash", "ecl": "eclipseum", "sendwhale": "sendwhale", "swise": "stakewise", "jfin": "jfin-coin", "scu": "securypto", "nsd": "nasdacoin", "light": "lightning-protocol", "stro": "supertron", "gol": "gogolcoin", "spaz": "swapcoinz", "vt": "vectoraic", "thrn": "thorncoin", "yfe": "yfe-money", "layerx": "unilayerx", "thr": "thorecoin", "clm": "coinclaim", "whl": "whaleroom", "pbs": "pbs-chain", "btym": "blocktyme", "coshi": "coshi-inu", "inst": "instadapp", "mvh": "moviecash", "safelogic": "safelogic", "orbi": "orbicular", "repo": "repo", "isdt": "istardust", "sports": "zensports", "sdfi": "stingdefi", "drgb": "dragonbit", "erz": "earnzcoin", "fex": "fidex-exchange", "bns": "bns-token", "tdps": "tradeplus", "twi": "trade-win", "city": "city-coin", "hss": "hashshare", "gbk": "goldblock", "candybox": "candy-box", "iai": "iai-token", "ksc": "kstarcoin", "chess": "chesscoin-0-32", "rover": "rover-inu", "btcr": "bitcurate", "nokn": "nokencoin", "mcau": "meld-gold", "toki": "tokyo-inu", "idl": "idl-token", "xby": "xtrabytes", "bali": "balicoin", "crm": "cream", "vsxp": "venus-sxp", "tno": "tnos-coin", "wpp": "wpp-token", "btnt": "bitnautic", "poll": "clearpoll", "acsi": "acryptosi", "ara": "ara-token", "pump": "pump-coin", "rc20": "robocalls", "pegs": "pegshares", "mzg": "moozicore", "spk": "sparks", "odc": "odinycoin", "curry": "curryswap", "hfil": "huobi-fil", "bucks": "swagbucks", "mch": "meme-cash", "grlc": "garlicoin", "skn": "sharkcoin", "ira": "deligence", "bash": "luckchain", "pazzi": "paparazzi", "luck": "lady-luck", "qtf": "quantfury", "mtp": "multiplay", "fullsend": "full-send", "asac": "asac-coin", "egc": "ecog9coin", "kanda": "telokanda", "awbtc": "aave-wbtc-v1", "hgh": "hgh-token", "kuky": "kuky-star", "bspay": "brosispay", "nter": "nter", "zash": "zimbocash", "tea": "tea-token", "dch": "doch-coin", "xamp": "antiample", "vxvs": "venus-xvs", "c8": "carboneum", "vega": "vega-coin", "love": "love-coin", "hpc": "happycoin", "rth": "rotharium", "creva": "crevacoin", "fcr": "fromm-car", "fyznft": "fyznft", "mw": "mirror-world-token", "bmh": "blockmesh-2", "it": "idc-token", "zupi": "zupi-coin", "nar": "nar-token", "bchc": "bitcherry", "beast": "beast-dao", "dogown": "dog-owner", "dsc": "data-saver-coin", "stb": "starblock", "ume": "ume-token", "fmt": "finminity", "safelight": "safelight", "hint": "hintchain", "lbt": "lbt-chain", "bots": "bot-ocean", "arnxm": "armor-nxm", "apis": "apis-coin", "fuzz": "fuzzballs", "eqz": "equalizer", "vect": "vectorium", "agvc": "agavecoin", "ete": "ethercoin-2", "nanox": "project-x", "alink": "aave-link-v1", "glov": "glovecoin", "cbrl": "cryptobrl", "abusd": "aave-busd-v1", "shpp": "shipitpro", "mswap": "moneyswap", "amsk": "nolewater", "ect": "superedge", "safetoken": "safetoken", "vest": "vestchain", "vxc": "vinx-coin", "dic": "daikicoin", "slv": "silverway", "trump": "trumpcoin", "rrb": "renrenbit", "flc": "flowchaincoin", "pass": "passport-finance", "lbd": "linkbased", "maya": "maya-coin", "etx": "ethereumx", "opti": "optitoken", "tzt": "tanzanite", "$king": "king-swap", "ims": "ims-wallet", "lbet": "lemon-bet", "pocc": "poc-chain", "safeorbit": "safeorbit", "lgold": "lyfe-gold", "gre": "greencoin", "cbr": "cybercoin", "skc": "skinchain", "ez": "easyfi", "hnzo": "hanzo-inu", "ultra": "ultrasafe", "kishu": "kishu-inu", "deal": "idealcash", "lmch": "latamcash", "awg": "aurusgold", "limit": "limitswap", "bgl": "bitgesell", "lov": "lovechain", "lsh": "leasehold", "ltz": "litecoinz", "bbx": "ballotbox", "aab": "aax-token", "okt": "okexchain", "bnz": "bonezyard", "duk+": "dukascoin", "laika": "laikacoin", "eland": "etherland", "mgc": "magnachain", "spdx": "spender-x", "pvm": "privateum", "vestx": "vestxcoin", "vany": "vanywhere", "tcr": "tecracoin", "stxem": "stakedxem", "eubc": "eub-chain", "homt": "hom-token", "mptc": "mnpostree", "xtg": "xtg-world", "vjc": "venjocoin", "pwrb": "powerbalt", "nana": "ape-tools", "ank": "apple-network", "hxy": "hex-money", "stzen": "stakedzen", "capp": "crypto-application-token", "mochi": "mochiswap", "agri": "agrinovuscoin", "vbch": "venus-bch", "pdao": "panda-dao", "qbc": "quebecoin", "pgc": "pegascoin", "pdai": "prime-dai", "hmnc": "humancoin-2", "hlp": "help-coin", "yfiig": "yfii-gold", "sfg": "s-finance", "bxt": "bitfxt-coin", "loto": "lotoblock", "bun": "bunnycoin", "nuvo": "nuvo-cash", "abc": "abc-chain", "xpb": "transmute", "lama": "llamaswap", "niu": "niubiswap", "stc": "coinstarter", "ltk": "litecoin-token", "esti": "easticoin", "grg": "rigoblock", "evy": "everycoin", "kong": "kong-defi", "ich": "ideachain", "mvc": "mileverse", "bct": "bitcoin-trust", "bitb": "bitcoin-bull", "ponzi": "ponzicoin", "bitci": "bitcicoin", "hoo": "hoo-token", "mbm": "mbm-token", "cls": "coldstack", "vxrp": "venus-xrp", "xwc": "whitecoin", "dfi": "defichain", "cnt": "centurion", "akita": "akita-inu", "scs": "speedcash", "vusd": "value-usd", "cock": "shibacock", "krill": "polywhale", "pivxl": "pivx-lite", "save": "savetheworld", "stxym": "stakedxym", "amana": "aave-mana-v1", "lland": "lyfe-land", "dynge": "dyngecoin", "dexa": "dexa-coin", "koel": "koel-coin", "rpepe": "rare-pepe", "mbit": "mbitbooks", "vbtc": "venus-btc", "rew": "rewardiqa", "more": "legends-room", "wifi": "wifi-coin", "betc": "bet-chips", "xrge": "rougecoin", "x2p": "xenon-pay", "newton": "newtonium", "ouro": "ouroboros", "hpy": "hyper-pay", "1gold": "1irstgold", "ycurve": "curve-fi-ydai-yusdc-yusdt-ytusd", "atusd": "aave-tusd-v1", "cbet": "cryptobet", "ramen": "ramenswap", "newos": "newstoken", "mtcn": "multiven", "ship": "shipchain", "bak": "baconcoin", "cxp": "caixa-pay", "fomo": "fomo-labs", "2248": "2-2-4-4-8", "7add": "holdtowin", "hebe": "hebeblock", "nmst": "nms-token", "eplus": "epluscoin", "xbe": "xbe-token", "moontoken": "moontoken", "sloth": "slothcoin", "ons": "one-share", "asn": "ascension", "ausdc": "aave-usdc-v1", "miks": "miks-coin", "safecomet": "safecomet", "now": "changenow-token", "pbase": "polkabase", "torq": "torq-coin", "darthelon": "darthelon", "honk": "honk-honk", "swet": "swe-token", "hub": "minter-hub", "ezpay": "eazypayza", "clbk": "cloudbric", "lburst": "loanburst", "ausdt": "aave-usdt-v1", "rld": "real-land", "asusd": "aave-susd-v1", "eup": "eup-chain", "sec": "smilecoin", "coal": "coalculus", "fldt": "fairyland", "bbank": "blockbank", "lir": "letitride", "cach": "cachecoin", "omc": "ormeus-cash", "xwo": "wooshcoin-io", "au": "aurumcoin", "pcb": "451pcbcom", "long": "long-coin", "ret": "realtract", "rtm": "raptoreum", "lfc": "linfinity", "uniusd": "unidollar", "vgtg": "vgtgtoken", "naut": "astronaut", "bolc": "boliecoin", "hypr": "hyperburn", "bp": "bunnypark", "vfil": "venus-fil", "minty": "minty-art", "crd": "cryptaldash", "tree": "tree-defi", "scurve": "lp-scurve", "mytv": "mytvchain", "silk": "silkchain", "eswap": "eswapping", "payt": "payaccept", "psix": "propersix", "navy": "boatpilot", "yap": "yap-stone", "nplc": "plus-coin", "jdi": "jdi-token", "curve": "curvehash", "gc": "galaxy-wallet", "4art": "4artechnologies", "solo": "solo-coin", "andes": "andes-coin", "tknt": "tkn-token", "uba": "unbox-art", "dph": "digipharm", "xtnc": "xtendcash", "bxh": "bxh", "vnt": "inventoryclub", "slf": "solarfare", "vlt": "bankroll-vault", "xscp": "scopecoin", "argp": "argenpeso", "vdai": "venus-dai", "safeearth": "safeearth", "ns": "nodestats", "ecos": "ecodollar", "intx": "intexcoin", "fox": "fox-finance", "wtn": "waletoken", "fastx": "transfast", "hntc": "hntc-energy-distributed-network", "entrc": "entercoin", "shd": "shardingdao", "611": "sixeleven", "boltt": "boltt-coin", "fsp": "flashswap", "starb": "star-shib", "cell": "cellframe", "honey": "honeycomb-2", "flunar": "fairlunar", "ball": "ball-coin", "dpc": "dappcents", "lemo": "lemochain", "forex": "forexcoin", "bravo": "bravo-coin", "hapy": "hapy-coin", "eost": "eos-trust", "lv": "lendchain", "safepluto": "safepluto", "mic3": "mousecoin", "crt": "carr-finance", "kashh": "kashhcoin", "gsmt": "grafsound", "eto": "essek-tov", "bnx": "bnx", "yta": "yottacoin", "vbusd": "venus-busd", "syfi": "soft-yearn", "speed": "speed-coin", "usdb": "usd-bancor", "willie": "williecoin", "sanshu": "sanshu-inu", "bhd": "bitcoin-hd", "elama": "elamachain", "mima": "kyc-crypto", "happy": "happy-coin", "ktv": "kmushicoin", "dt3": "dreamteam3", "divo": "divo-token", "fto": "futurocoin", "elet": "ether-legends", "mexc": "mexc-token", "trib": "contribute", "xbrt": "bitrewards", "coic": "coic", "mgp": "mangochain", "ntb": "tokenasset", "polt": "polkatrain", "phiba": "papa-shiba", "micro": "micromines", "roul": "roul-token", "bwx": "blue-whale", "feed": "feeder-finance", "petal": "bitflowers", "ybear": "yield-bear", "echo": "token-echo", "$g": "gooddollar", "beer": "beer-token", "bhiba": "baby-shiba", "cent": "centercoin", "noahark": "noah-ark", "nah": "strayacoin", "ueth": "unagii-eth", "ain": "ai-network", "robo": "robo-token", "soil": "synth-soil", "bab": "basis-bond", "gp": "goldpieces", "lce": "lance-coin", "kgw": "kawanggawa", "stkr": "staker-dao", "cbex": "cryptobexchange", "hyp": "hyperstake", "tiim": "triipmiles", "bnox": "blocknotex", "nxl": "next-level", "btcbam": "bitcoinbam", "mbc": "microbitcoin", "torj": "torj-world", "fl": "freeliquid", "jgn": "juggernaut", "xpn": "pantheon-x", "plc": "platincoin", "vx": "vitex", "hum": "humanscape", "invc": "investcoin", "ypanda": "yieldpanda", "co2": "collective", "phn": "phillionex", "ebsp": "ebsp-token", "beluga": "belugaswap", "cyt": "cryptokenz", "gfarm": "gains-farm", "yfmb": "yfmoonbeam", "chex": "chex-token", "xpt": "cryptobuyer-token", "lstr": "meetluna", "hgc": "higamecoin", "kxc": "kingxchain", "cnyt": "cny-tether", "grn": "dascoin", "gb": "goldblocks", "rwn": "rowan-coin", "slam": "slam-token", "pod": "payment-coin", "ogc": "onegetcoin", "bkk": "bkex-token", "ddr": "digi-dinar", "dvc": "dragonvein", "sugar": "sugarchain", "dtop": "dhedge-top-index", "fuze": "fuze-token", "jcc": "junca-cash", "zlf": "zillionlife", "cmm": "commercium", "snowge": "snowgecoin", "uvu": "ccuniverse", "zest": "thar-token", "harta": "harta-tech", "gio": "graviocoin", "escx": "escx-token", "tfuel": "theta-fuel", "ltfg": "lightforge", "stt": "scatter-cx", "smartworth": "smartworth", "nva": "neeva-defi", "sos": "solstarter", "scm": "simulacrum", "zcnox": "zcnox-coin", "brcp": "brcp-token", "tons": "thisoption", "cfl": "cryptoflow", "hart": "hara-token", "levl": "levolution", "euru": "upper-euro", "tokc": "tokyo", "sprtz": "spritzcoin", "c4t": "coin4trade", "cntm": "connectome", "yfms": "yfmoonshot", "yfis": "yfiscurity", "tavitt": "tavittcoin", "mad": "mad-network", "tronx": "tronx-coin", "sets": "sensitrust", "akm": "cost-coin", "udai": "unagii-dai", "quickchart": "quickchart", "ivy": "ivy-mining", "icicb": "icicb-coin", "drep": "drep-new", "stlp": "tulip-seed", "flt": "fluttercoin", "crex": "crex-token", "elt": "elite-swap", "lof": "lonelyfans", "bkita": "baby-akita", "kiz": "kizunacoin", "kim": "king-money", "jack": "jack-token", "shark": "polyshark-finance", "btsucn": "btsunicorn", "baby": "baby-token", "lbr": "liber-coin", "safegalaxy": "safegalaxy", "vbeth": "venus-beth", "osc": "oasis-city", "hedg": "hedgetrade", "ygoat": "yield-goat", "rocket": "rocketgame", "spup": "spurt-plus", "cron": "cryptocean", "ctc": "culture-ticket-chain", "cng": "cng-casino", "vdoge": "venus-doge", "cp3r": "compounder", "bynd": "beyondcoin", "wdr": "wider-coin", "lvh": "lovehearts", "carbon": "carboncoin", "noiz": "noiz-chain", "colx": "colossuscoinxt", "when": "when-token", "ucos": "ucos-token", "ami": "ammyi-coin", "soda": "soda-token", "las": "alaska-inu", "spring": "springrole", "xno": "xeno-token", "refraction": "refraction", "ethsc": "ethereumsc", "csm": "consentium", "iown": "iown", "jic": "joorschain", "spirit": "spiritswap", "scorgi": "spacecorgi", "cicc": "caica-coin", "mongocm": "mongo-coin", "bff": "bitcoffeen", "dscp": "disciplina-project-by-teachmeplease", "bmch": "bmeme-cash", "g-fi": "gorilla-fi", "ecpn": "ecpntoken", "fotc": "forte-coin", "bicas": "bithercash", "grw": "growthcoin", "clr": "color", "uze": "uze-token", "sovi": "sovi-token", "carbo": "carbondefi", "arcee": "arcee-coin", "doos": "doos-token", "webn": "web-innovation-ph", "dapp": "dapp", "bnfi": "blaze-defi", "lnko": "lnko-token", "aca": "acash-coin", "ctcn": "contracoin", "wdt": "voda-token", "ykz": "yakuza-dao", "erc": "europecoin", "roe": "rover-coin", "vsc": "vsportcoin", "nac": "nami-trade", "lrg": "largo-coin", "spacedoge": "space-doge", "hcs": "help-coins", "clout": "blockclout", "moonpirate": "moonpirate", "cl": "coinlancer", "expo": "online-expo", "vegi": "veggiecoin", "mob": "mobilecoin", "sdog": "small-doge", "espro": "esportspro", "dogefather": "dogefather", "basid": "basid-coin", "stfiro": "stakehound", "vusdc": "venus-usdc", "frmx": "frmx-token", "kfi": "klever-finance", "dmch": "darma-cash", "icr": "intercrone", "nftl": "nftl-token", "qtv": "quish-coin", "qhc": "qchi-chain", "dandy": "dandy", "mfy": "mifty-swap", "ncat": "nyan-cat", "fundx": "funder-one", "jt": "jubi-token", "yland": "yearn-land", "oc": "oceanchain", "vlc": "valuechain", "shibm": "shiba-moon", "rupee": "hyruleswap", "brze": "breezecoin", "milk": "milk-token", "eurx": "etoro-euro", "chs": "chainsquare", "vprc": "vaperscoin", "rview": "reviewbase", "crl": "coral-farm", "bmt": "bmining-token", "tvnt": "travelnote", "gpkr": "gold-poker", "cosm": "cosmo-coin", "rzn": "rizen-coin", "ist": "ishop-token", "yea": "yeafinance", "cyf": "cy-finance", "rope": "rope-token", "ski": "skillchain", "kt": "kuaitoken", "robet": "robet-coin", "gm": "gmcoin", "rcube": "retro-defi", "daa": "double-ace", "sv7": "7plus-coin", "konj": "konjungate", "gnt": "greentrust", "tgn": "terragreen", "bec": "betherchip", "qac": "quasarcoin", "nacho": "nacho-coin", "vusdt": "venus-usdt", "zaif": "zaif-token", "dain": "dain-token", "jaguar": "jaguarswap", "lowb": "loser-coin", "she": "shinechain", "dtube": "dtube-coin", "xrd": "raven-dark", "bcnt": "bincentive", "pxc": "phoenixcoin", "gcx": "germancoin", "fscc": "fisco", "coral": "coral-swap", "os76": "osmiumcoin", "rain": "rain-network", "safeicarus": "safelcarus", "soak": "soak-token", "usds": "stableusd", "crn": "chronocoin", "sox": "ethersocks", "cennz": "centrality", "zarh": "zarcash", "safecookie": "safecookie", "bsg": "bitsonic-gas", "usdh": "honestcoin", "soba": "soba-token", "brmv": "brmv-token", "trv": "trustverse", "kub": "kublaicoin", "tsx": "tradestars", "enrg": "energycoin", "tune": "tune-token", "feta": "feta-token", "szo": "shuttleone", "hptf": "heptafranc", "tuber": "tokentuber", "hora": "hora", "dac": "davinci-coin", "vlink": "venus-link", "pmp": "pumpy-farm", "sg": "social-good-project", "hungry": "hungrybear", "ping": "cryptoping", "yfi3": "yfi3-money", "db": "darkbuild-v2", "olive": "olivecash", "csc": "casinocoin", "ggive": "globalgive", "deva": "deva-token", "comfy": "comfytoken", "rmoon": "rocketmoon", "itam": "itam-games", "ltn": "life-token", "grow": "growing-fi", "evny": "evny-token", "pkoin": "pocketcoin", "fmta": "fundamenta", "trr": "terran-coin", "dfe": "dfe-finance", "armx": "armx-unidos", "fgp": "fingerprint", "cca": "counos-coin", "bdcc": "bitica-coin", "berg": "bergco-coin", "sipc": "simplechain", "wgp": "w-green-pay", "fyy": "grandpa-fan", "rc": "russell-coin", "pkp": "pikto-group", "aws": "aurus-silver", "punk-female": "punk-female", "fred": "fredenergy", "zerc": "zeroclassic", "cbank": "crypto-bank", "spkl": "spoklottery", "hrd": "hrd", "per": "per-project", "zeus": "zuescrowdfunding", "q8e20": "q8e20-token", "etf": "entherfound", "emoji": "emojis-farm", "tbcc": "tbcc-wallet", "gpyx": "pyrexcoin", "proud": "proud-money", "liq": "liquidity-bot-token", "hachiko": "hachiko-inu", "yo": "yobit-token", "ert": "eristica", "aurora": "auroratoken", "bscs": "bsc-station", "carb": "carbon-labs", "ioox": "ioox-system", "ytho": "ytho-online", "hland": "hland-token", "btour": "btour-chain", "bccx": "bitconnectx-genesis", "navi": "natus-vincere-fan-token", "alc": "alrightcoin", "sss": "simple-software-solutions", "vd": "vindax-coin", "coy": "coinanalyst", "zcrt": "zcore-token", "xxp": "xx-platform", "hyd": "hydra-token", "bolo": "bollo-token", "pola": "polaris-share", "gl": "green-light", "aidus": "aidus", "crypl": "cryptolandy", "vida": "vidiachange", "zln": "zillioncoin", "inbox": "inbox-token", "lxc": "latex-chain", "hiz": "hiz-finance", "porte": "porte-token", "lsilver": "lyfe-silver", "brb": "rabbit-coin", "hxn": "havens-nook", "yoo": "yoo-ecology", "baw": "wab-network", "ttm": "tothe-moon", "wemix": "wemix-token", "fc": "futurescoin", "punk-zombie": "punk-zombie", "cf": "californium", "lvt": "lives-token", "hdac": "hdac", "dfm": "defi-on-mcw", "idx": "index-chain", "stark": "stark-chain", "bnxx": "bitcoinnexx", "yfip": "yfi-paprika", "cbix7": "cbi-index-7", "svr": "sovranocoin", "ctat": "cryptassist", "gnto": "goldenugget", "c2o": "cryptowater", "ucr": "ultra-clear", "punk-attr-5": "punk-attr-5", "punk-attr-4": "punk-attr-4", "live": "tronbetlive", "sprx": "sprint-coin", "xqc": "quras-token", "erk": "eureka-coin", "viking": "viking-swap", "bnj": "binjit-coin", "aries": "aries-chain", "cbp": "cashbackpro", "vcash": "vcash-token", "btd": "bolt-true-dollar", "dbund": "darkbundles", "808ta": "808ta-token", "treep": "treep-token", "node": "whole-network", "qark": "qanplatform", "ghd": "giftedhands", "pox": "pollux-coin", "kassiahome": "kassia-home", "hwi": "hawaii-coin", "ocp": "omni-consumer-protocol", "bobt": "boboo-token", "fans": "unique-fans", "dgc": "digitalcoin", "rkt": "rocket-fund", "cscj": "csc-jackpot", "hmc": "harmonycoin", "tbake": "bakerytools", "dltx": "deltaexcoin", "mcrn": "macaronswap", "name": "polkadomain", "party": "money-party", "stax": "stablexswap", "lsv": "litecoin-sv", "wusd": "wrapped-usd", "esz": "ethersportz", "fed": "fedora-gold", "pig": "pig-finance", "but": "bitup-token", "dt": "dcoin-token", "actn": "action-coin", "htdf": "orient-walt", "cfxq": "cfx-quantum", "kili": "kilimanjaro", "fetish": "fetish-coin", "tsla": "tessla-coin", "famous": "famous-coin", "minx": "innovaminex", "solace": "solace-coin", "bgx": "bitcoingenx", "earth": "earth-token", "orbyt": "orbyt-token", "pint": "pub-finance", "dragon": "dragon-finance", "poodl": "poodle", "codeo": "codeo-token", "ecr": "ecredit", "ssn": "superskynet", "orc": "oracle-system", "xbn": "xbn", "svc": "satoshivision-coin", "md+": "moon-day-plus", "nyc": "newyorkcoin", "tom": "tom-finance", "gfnc": "grafenocoin-2", "mveda": "medicalveda", "clva": "clever-defi", "medi": "mediconnect", "bridge": "multibridge", "mti": "mti-finance", "ride": "ride-my-car", "kip": "khipu-token", "bvnd": "binance-vnd", "upb": "upbtc-token", "vollar": "vollar", "zbk": "zbank-token", "nst": "newsolution", "ddos": "disbalancer", "mandi": "mandi-token", "mc": "monkey-coin", "sarco": "sarcophagus", "bih": "bithostcoin", "xrpc": "xrp-classic", "gly": "glyph-token", "dnd": "dungeonswap", "yfarm": "yfarm-token", "mdao": "martian-dao", "redc": "redchillies", "jac": "jasper-coin", "remit": "remita-coin", "gbpu": "upper-pound", "trxc": "tronclassic", "burger": "burger-swap", "tkc": "turkeychain", "try": "try-finance", "jnb": "jinbi-token", "btcmz": "bitcoinmono", "boot": "bootleg-nft", "papp": "papp-mobile", "pai": "project-pai", "dwz": "defi-wizard", "wsc": "wesing-coin", "xpd": "petrodollar", "pet": "battle-pets", "god": "bitcoin-god", "papel": "papel", "bnbd": "bnb-diamond", "scn": "silver-coin", "lnt": "lottonation", "jshiba": "jomon-shiba", "kp0r": "kp0rnetwork", "nc": "nayuta-coin", "mcn": "moneta-verde", "dcnt": "decenturion", "genes": "genes-chain", "mkb": "maker-basic", "drg": "dragon-coin", "env": "env-finance", "tfg1": "energoncoin", "dcy": "dinastycoin", "munch": "munch-token", "ctrfi": "chestercoin", "sbgo": "bingo-share", "tut": "trust-union", "skrt": "sekuritance", "smile": "smile-token", "fbt": "fanbi-token", "tlnt": "talent-coin", "marsm": "marsmission", "yff": "yff-finance", "dili": "d-community", "hdn": "hidden-coin", "iog": "playgroundz", "pal": "playandlike", "cbucks": "cryptobucks", "hg": "hygenercoin", "crg": "cryptogcoin", "shokk": "shikokuaido", "bcvt": "bitcoinvend", "dxy": "dxy-finance", "mrx": "linda", "samo": "samoyedcoin", "f1c": "future1coin", "cub": "crypto-user-base", "grwi": "growers-international", "panther": "pantherswap", "gldr": "golder-coin", "dpet": "my-defi-pet", "algop": "algopainter", "carom": "carillonium", "cdash": "crypto-dash", "dogdefi": "dogdeficoin", "memes": "memes-token", "mello": "mello-token", "jbp": "jb-protocol", "supra": "supra-token", "hybn": "hey-bitcoin", "wleo": "wrapped-leo", "rugbust": "rug-busters", "pbom": "pocket-bomb", "zac": "zac-finance", "xchf": "cryptofranc", "wbnb": "wbnb", "pamp": "pamp-network", "hp": "heartbout-pay", "xlmg": "stellar-gold", "dfn": "difo-network", "map": "marcopolo", "bulk": "bulk-network", "cet": "coinex-token", "noel": "noel-capital", "cnz": "coinzo-token", "fds": "fds", "wet": "weshow", "vkt": "vankia-chain", "mach": "mach", "esrc": "echosoracoin", "bia": "bilaxy-token", "fnb": "finexbox-token", "biot": "biopassport", "exe": "8x8-protocol", "catnip": "catnip-money", "grpl": "grpl-finance-2", "loa": "loa-protocol", "fridge": "fridge-token", "yfix": "yfix-finance", "btchg": "bitcoinhedge", "pube": "pube-finance", "cord": "cord-defi-eth", "dixt": "dixt-finance", "modx": "model-x-coin", "xgc": "xiglute-coin", "load": "load-network", "yfed": "yfedfinance", "jus": "just-network", "peri": "peri-finance", "cann": "cannabiscoin", "btap": "bta-protocol", "vers": "versess-coin", "yfib": "yfibalancer-finance", "mok": "mocktailswap", "haze": "haze-finance", "etna": "etna-network", "btcu": "bitcoin-ultra", "wst": "winsor-token", "ymen": "ymen-finance", "yd-eth-jun21": "yd-eth-jun21", "ivc": "invoice-coin", "vcg": "vipcoin-gold", "zep": "zeppelin-dao", "loon": "loon-network", "emrx": "emirex-token", "nvt": "nervenetwork", "mhlx": "helixnetwork", "mvt": "the-movement", "poc": "pangea-cleanup-coin", "mich": "charity-alfa", "tndr": "thunder-swap", "yd-btc-mar21": "yd-btc-mar21", "spmk": "space-monkey", "orao": "orao-network", "eqo": "equos-origin", "earn$": "earn-network", "fshn": "fashion-coin", "xt": "xtcom-token", "yd-btc-jun21": "yd-btc-jun21", "blcc": "bullers-coin", "emdc": "emerald-coin", "xts": "xaviera-tech", "alusd": "alchemix-usd", "htn": "heartnumber", "epg": "encocoinplus", "ine": "intellishare", "yd-eth-mar21": "yd-eth-mar21", "xcon": "connect-coin", "phl": "placeh", "sora": "sorachancoin", "grap": "grap-finance", "agrs": "agoras", "prqboost": "parsiq-boost", "nxct": "xchain-token", "hugo": "hugo-finance", "tyt": "tianya-token", "vena": "vena-network", "dcb": "digital-coin", "dcw": "decentralway", "wavax": "wrapped-avax", "fcx": "fission-cash", "bbgc": "bigbang-game", "zuz": "zuz-protocol", "dragn": "astro-dragon", "gcz": "globalchainz", "quam": "quam-network", "ubx": "ubix-network", "kper": "kper-network", "usdu": "upper-dollar", "chm": "cryptochrome", "kodx": "king-of-defi", "xwin": "xwin-finance", "ft1": "fortune1coin", "cla": "candela-coin", "moar": "moar", "ccrb": "cryptocarbon", "isikc": "isiklar-coin", "btca": "bitcoin-anonymous", "bbq": "barbecueswap", "kseed": "kush-finance", "unii": "unii-finance", "moma": "mochi-market", "hogl": "hogl-finance", "lsc": "littlesesame", "pngn": "spacepenguin", "vnxlu": "vnx-exchange", "deuro": "digital-euro", "shibal": "shiba-launch", "skb": "sakura-bloom", "etet": "etet-finance", "bcf": "bitcoin-fast", "hokk": "hokkaidu-inu", "acr": "acreage-coin", "cops": "cops-finance", "cnrg": "cryptoenergy", "sd": "smart-dollar", "yt": "cherry-token", "wcc": "wincash-coin", "husl": "hustle-token", "mtr": "meter-stable", "lnx": "linix", "butter": "butter-token", "fkx": "fortknoxter", "syax": "staked-yaxis", "zttl": "zettelkasten", "mcan": "medican-coin", "dio": "deimos-token", "icnq": "iconiq-lab-token", "kbtc": "klondike-btc", "wcelo": "wrapped-celo", "kpc": "koloop-basic", "yape": "gorillayield", "obtc": "boringdao-btc", "bcm": "bitcoinmoney", "yuno": "yuno-finance", "tst": "touch-social", "yfos": "yfos-finance", "crts": "cryptotipsfr", "wiken": "project-with", "wec": "wave-edu-coin", "yg": "yearn-global", "ttx": "talent-token", "lpc": "lightpaycoin", "seol": "seed-of-love", "neww": "newv-finance", "ethbnt": "ethbnt", "tpt": "token-pocket", "btllr": "betller-coin", "dzar": "digital-rand", "soga": "soga-project", "trt": "taurus-chain", "lp": "lepard-coin", "safemooncash": "safemooncash", "1mil": "1million-nfts", "allbi": "all-best-ico", "myk": "mykonos-coin", "bingus": "bingus-token", "ror": "ror-universe", "azt": "az-fundchain", "pow": "eos-pow-coin", "hate": "heavens-gate", "wbind": "wrapped-bind", "pyro": "pyro-network", "ebox": "ethbox-token", "gogo": "gogo-finance", "phoon": "typhoon-cash", "rckt": "rocket-token", "onex": "onex-network", "rak": "rake-finance", "tym": "timelockcoin", "wxdai": "wrapped-xdai", "ww": "wayawolfcoin", "skill": "cryptoblades", "ryip": "ryi-platinum", "dff": "defi-firefly", "elyx": "elynet-token", "latino": "latino-token", "bic": "bitcrex-coin", "hyper": "hyperchain-x", "dfyn": "dfyn-network", "sfund": "seedify-fund", "vlad": "vlad-finance", "xdef2": "xdef-finance", "balo": "balloon-coin", "uc": "youlive-coin", "saft": "safe-finance", "wxtc": "wechain-coin", "xsm": "spectrum-cash", "gts": "gt-star-token", "l2p": "lung-protocol", "mngo": "mango-markets", "onlexpa": "onlexpa-token", "btri": "trinity-bsc", "womi": "wrapped-ecomi", "aplp": "apple-finance", "mxf": "mixty-finance", "crwn": "crown-finance", "phtf": "phantom-token", "bundb": "unidexbot-bsc", "ul": "uselink-chain", "prism": "prism-network", "lem": "lemur-finance", "rbtc": "rootstock", "nbot": "naka-bodhi-token", "nmn": "99masternodes", "volts": "volts-finance", "atls": "atlas", "spore": "spore-engineering", "hosp": "hospital-coin", "scha": "schain-wallet", "yffii": "yffii-finance", "fras": "frasindo-rent", "dmtc": "dmtc-token", "oac": "one-army-coin", "brap": "brapper-token", "afin": "afin-coin", "wmatic": "wmatic", "yfst": "yfst-protocol", "brn": "brainaut-defi", "anty": "animalitycoin", "idt": "investdigital", "elite": "ethereum-lite", "kbond": "klondike-bond", "entrp": "hut34-entropy", "jtt": "joytube-token", "neal": "neal", "diamond": "diamond-token", "xns": "xeonbit-token", "xfc": "football-coin", "joos": "joos-protocol", "ganja": "trees-finance", "glo": "glosfer-token", "vancii": "vanci-finance", "o-ocean-mar22": "o-ocean-mar22", "gcbn": "gas-cash-back", "creed": "creed-finance", "wtp": "web-token-pay", "obsr": "observer-coin", "dark": "darkbuild", "yfive": "yfive-finance", "gent": "genesis-token", "wzec": "wrapped-zcash", "ext": "exchain", "nbs": "new-bitshares", "yeth": "fyeth-finance", "dino": "dino-exchange", "brg": "bridge-oracle", "btf": "btf", "umc": "universal-marketing-coin", "nfi": "norse-finance", "kombat": "crypto-kombat", "vgd": "vangold-token", "ytsla": "ytsla-finance", "exnx": "exenox-mobile", "vcoin": "tronvegascoin", "wnl": "winstars", "momo": "momo-protocol", "gng": "gold-and-gold", "qcore": "qcore-finance", "btnyx": "bitonyx-token", "ares": "ares-protocol", "slme": "slime-finance", "inb": "insight-chain", "bdog": "bulldog-token", "blzn": "blaze-network", "pyr": "vulcan-forged", "btad": "bitcoin-adult", "tai": "tai", "idon": "idoneus-token", "fam": "yefam-finance", "ltcb": "litecoin-bep2", "port": "packageportal", "hyfi": "hyper-finance", "molk": "mobilink-coin", "mort": "dynamic-supply-tracker", "gpc": "greenpay-coin", "peech": "peach-finance", "sbdo": "bdollar-share", "eyes": "eyes-protocol", "ztnz": "ztranzit-coin", "hc8": "hydrocarbon-8", "froge": "froge-finance", "gnsh": "ganesha-token", "cdy": "bitcoin-candy", "src": "super-running-coin", "amio": "amino-network", "wpx": "wallet-plus-x", "elcash": "electric-cash", "dawn": "dawn-protocol", "hx": "hyperexchange", "invox": "invox-finance", "woop": "woonkly-power", "nash": "neoworld-cash", "stbb": "stabilize-bsc", "pipi": "pippi-finance", "awt": "airdrop-world", "emont": "etheremontoken", "69c": "6ix9ine-chain", "iflt": "inflationcoin", "dirty": "dirty-finance", "bday": "birthday-cake", "bsh": "bitcoin-stash", "vdg": "veridocglobal", "tuda": "tutors-diary", "fork": "gastroadvisor", "swipe": "swipe-network", "luc": "play2live", "qwla": "qawalla-token", "labra": "labra-finance", "stakd": "stakd-finance", "aura": "aura-protocol", "most": "most-protocol", "gvc": "gemvault-coin", "atc": "atlantic-coin", "cp": "cryptoprofile", "yrise": "yrise-finance", "chadlink": "chad-link-set", "pfi": "protocol-finance", "yfpro": "yfpro-finance", "krypto": "kryptobellion", "tnet": "title-network", "dogen": "dogen-finance", "rhea": "rheaprotocol", "prd": "predator-coin", "lunar": "lunar-highway", "tfc": "treasure-financial-coin", "bpc": "backpacker-coin", "halo": "halo-platform", "epk": "epik-protocol", "tcp": "the-crypto-prophecies", "blc": "bullionschain", "gmng": "global-gaming", "lyd": "lydia-finance", "acpt": "crypto-accept", "xao": "alloy-project", "ftb": "free-tool-box", "xrm": "refine-medium", "wae": "wave-platform", "swusd": "swusd", "lnk": "link-platform", "pmc": "paymastercoin", "zefi": "zcore-finance", "xag": "xrpalike-gene", "adf": "ad-flex-token", "hnc": "helleniccoin", "dscvr": "dscvr-finance", "dx": "dxchain", "payou": "payou-finance", "scat": "sad-cat-token", "yyfi": "yyfi-protocol", "cust": "custody-token", "b1p": "b-one-payment", "torocus": "torocus-token", "bhig": "buckhath-coin", "wxtz": "wrapped-tezos", "water": "water-finance", "vinx": "vinx-coin-sto", "hcut": "healthchainus", "neuro": "neuro-charity", "whole": "whitehole-bsc", "geth": "guarded-ether", "hcc": "holiday-chain", "btcf": "bitcoin-final", "xcf": "cenfura-token", "wtk": "wadzpay-token", "codex": "codex-finance", "pearl": "pearl-finance", "tiox": "trade-token", "pjm": "pajama-finance", "hdot": "huobi-polkadot", "cad": "candy-protocol", "espi": "spider-ecology", "zseed": "sowing-network", "miva": "minerva-wallet", "cspr": "casper-network", "roy": "royal-protocol", "nfd": "nifdo-protocol", "bsk": "bitcoinstaking", "esg": "empty-set-gold", "cbtc": "classicbitcoin", "lncx": "luna-nusa-coin", "mtns": "omotenashicoin", "2based": "2based-finance", "ucap": "unicap-finance", "gs": "genesis-shards", "snb": "synchrobitcoin", "ths": "the-hash-speed", "xpose": "xpose-protocol", "pepr": "pepper-finance", "sho": "showcase-token", "osm": "options-market", "neon": "neonic-finance", "sifi": "simian-finance", "onez": "the-nifty-onez", "ethmny": "ethereum-money", "afcash": "africunia-bank", "snowball": "snowballtoken", "hzd": "horizondollar", "ecoreal": "ecoreal-estate", "mov": "motiv-protocol", "upxau": "universal-gold", "cdl": "coindeal-token", "dpr": "deeper-network", "dart": "dart-insurance", "dquick": "dragons-quick", "cpte": "crypto-puzzles", "hnb": "hashnet-biteco", "umbr": "umbra-network", "aph": "apholding-coin", "bcash": "bankcoincash", "cvt": "civitas-protocol", "vcco": "vera-cruz-coin", "prtn": "proton-project", "kmw": "kepler-network", "yf4": "yearn4-finance", "recap": "review-capital", "gjco": "giletjaunecoin", "lat": "platon-network", "gnc": "galaxy-network", "es": "era-swap-token", "eveo": "every-original", "bribe": "bribe-token", "dynmt": "dynamite-token", "ccy": "cryptocurrency", "fsc": "five-star-coin", "gzil": "governance-zil", "xlab": "xceltoken-plus", "ltcu": "litecoin-ultra", "owo": "one-world-coin", "polven": "polka-ventures", "byn": "beyond-finance", "steak": "steaks-finance", "lyn": "lynchpin_token", "bnsg": "bns-governance", "dwc": "digital-wallet", "new": "newton-project", "dgnn": "dragon-network", "upeur": "universal-euro", "gvy": "groovy-finance", "svs": "silver-gateway", "wanatha": "wrapped-anatha", "mlk": "milk-alliance", "btrl": "bitcoinregular", "jsb": "jsb-foundation", "heth": "huobi-ethereum", "perx": "peerex-network", "etr": "electric-token", "xdt": "xwc-dice-token", "banana": "apeswap-finance", "bfr": "bridge-finance", "shild": "shield-network", "ccake": "cheesecakeswap", "liquid": "netkoin-liquid", "fff": "force-for-fast", "amc": "anonymous-coin", "swfi": "swirge-finance", "spex": "sproutsextreme", "chad": "the-chad-token", "chord": "chord-protocol", "thor": "asgard-finance", "mayp": "maya-preferred-223", "evo": "dapp-evolution", "bog": "bogged-finance", "tcnx": "tercet-network", "prdx": "predix-network", "raptor": "raptor-finance", "cxc": "capital-x-cell", "wscrt": "secret-erc20", "hltc": "huobi-litecoin", "dbix": "dubaicoin-dbix", "wtf": "walnut-finance", "uto": "unitopia-token", "foc": "theforce-trade", "sofi": "social-finance", "hdw": "hardware-chain", "cbd": "greenheart-cbd", "bf": "bitforex", "erd": "eldorado-token", "katana": "katana-finance", "bbl": "bubble-network", "rsct": "risecointoken", "cavo": "excavo-finance", "ctg": "cryptorg-token", "xuc": "exchange-union", "sch": "schillingcoin", "shrimp": "shrimp-finance", "elena": "elena-protocol", "ubtc": "united-bitcoin", "bpt": "bitpumps-token", "deve": "divert-finance", "kimchi": "kimchi-finance", "atis": "atlantis-token", "xmc": "monero-classic-xmc", "sedo": "sedo-pow-token", "buc": "buyucoin-token", "mzk": "muzika-network", "wac": "warranty-chain", "uskita": "american-akita", "rick": "infinite-ricks", "ald": "aludra-network", "mcbase": "mcbase-finance", "metp": "metaprediction", "rosn": "roseon-finance", "bks": "barkis", "pareto": "pareto-network", "dop": "dopple-finance", "eer": "ethereum-erush", "npw": "new-power-coin", "kbc": "karatgold-coin", "ica": "icarus-finance", "3crv": "lp-3pool-curve", "ucoin": "universal-coin", "qcx": "quickx-protocol", "tni": "tunnel-protocol", "skt": "sealblock-token", "kmc": "king-maker-coin", "hps": "happiness-token", "ec2": "employment-coin", "axa": "alldex-alliance", "typh": "typhoon-network", "renbtccurve": "lp-renbtc-curve", "altm": "altmarkets-coin", "bchip": "bluechips-token", "infi": "insured-finance", "yfiking": "yfiking-finance", "idv": "idavoll-network", "wmpro": "wm-professional", "nyan": "yieldnyan-token", "chal": "chalice-finance", "aens": "aen-smart-token", "pussy": "pussy-financial", "spl": "simplicity-coin", "ringx": "ring-x-platform", "emb": "block-collider", "yfild": "yfilend-finance", "wccx": "wrapped-conceal", "wsta": "wrapped-statera", "rlr": "relayer-network", "nftart": "nft-art-finance", "mpwr": "empower-network", "flexethbtc": "flexeth-btc-set", "pokelon": "pokelon-finance", "ufc": "union-fair-coin", "mg": "minergate-token", "afen": "afen-blockchain", "wag8": "wrapped-atromg8", "ddrt": "digidinar-token", "fish": "penguin-party-fish", "snbl": "safenebula", "kimochi": "kimochi-finance", "trdl": "strudel-finance", "nos": "nitrous-finance", "bwb": "bw-token", "fol": "folder-protocol", "bpakc": "bitpakcointoken", "bst1": "blueshare-token", "trips": "trips-community", "ssj": "super-saiya-jin", "udt": "unlock-protocol", "fusion": "fusion-energy-x", "xbt": "elastic-bitcoin", "uusdc": "unagii-usd-coin", "krg": "karaganda-token", "ctx": "cryptex-finance", "plst": "philosafe-token", "vct": "valuecybertoken", "defit": "defit", "slice": "tranche-finance", "brzx": "braziliexs-token", "dimi": "diminutive-coin", "bcc": "basis-coin-cash", "m3c": "make-more-money", "bpriva": "privapp-network", "afi": "aries-financial-token", "moonday": "moonday-finance", "bashtank": "baby-shark-tank", "usdo": "usd-open-dollar", "eoc": "everyonescrypto", "weather": "weather-finance", "stpl": "stream-protocol", "cnp": "cryptonia-poker", "advc": "advertisingcoin", "nmp": "neuromorphic-io", "dvi": "dvision-network", "blink": "blockmason-link", "aevo": "aevo", "wsienna": "sienna-erc20", "boc": "bitorcash-token", "smpl": "smpl-foundation", "tin": "tinfoil-finance", "shield": "shield-protocol", "fico": "french-ico-coin", "ldn": "ludena-protocol", "dxts": "destiny-success", "cwv": "cryptoworld-vip", "ans": "ans-crypto-coin", "libref": "librefreelencer", "gdl": "gondala-finance", "print": "printer-finance", "craft": "decraft-finance", "esce": "escroco", "sprkl": "sparkle", "xyx": "burn-yield-burn", "esn": "escudonavacense", "yfarmer": "yfarmland-token", "lic": "lightening-cash", "sheesha": "sheesha-finance", "comc": "community-chain", "gdt": "globe-derivative-exchange", "usdj": "just-stablecoin", "rfy": "rfyield-finance", "bttr": "bittracksystems", "ram": "ramifi", "elongd": "elongate-duluxe", "sensi": "sensible-finance", "ggc": "gg-coin", "idleusdcyield": "idle-usdc-yield", "myid": "my-identity-coin", "cytr": "cyclops-treasure", "ipx": "ipx-token", "eurt": "euro-ritva-token", "bxk": "bitbook-gambling", "hds": "hotdollars-token", "syfl": "yflink-synthetic", "magi": "magikarp-finance", "uhp": "ulgen-hash-power", "gme": "gamestop-finance", "bb": "blackberry-token", "cyc": "cyclone-protocol", "idlesusdyield": "idle-susd-yield", "idleusdtyield": "idle-usdt-yield", "pnc": "parellel-network", "qqq": "qqq-token", "swl": "swiftlance-token", "flm": "flamingo-finance", "supt": "super-trip-chain", "bcr": "bankcoin-reserve", "bplc": "blackpearl-chain", "eggp": "eggplant-finance", "kdg": "kingdom-game-4-0", "sny": "syntheify-token", "tschybrid": "tronsecurehybrid", "hcore": "hardcore-finance", "jfi": "jackpool-finance", "ccf": "cerberus", "tsc": "time-space-chain", "wsb": "wall-street-bets-dapp", "pld": "pureland-project", "rnrc": "rock-n-rain-coin", "hole": "super-black-hole", "unicrap": "unicrap", "mtlmc3": "metal-music-coin", "tkx": "tokenize-xchange", "whxc": "whitex-community", "tomoe": "tomoe", "cgc": "cash-global-coin", "rtf": "regiment-finance", "tryon": "stellar-invictus", "sya": "save-your-assets", "roger": "theholyrogercoin", "afc": "anti-fraud-chain", "atfi": "atlantic-finance", "ssl": "sergey-save-link", "gpo": "galaxy-pool-coin", "ltfn": "litecoin-finance", "hpt": "huobi-pool-token", "goi": "goforit", "btrs": "bitball-treasure", "vsd": "value-set-dollar", "fxtc": "fixed-trade-coin", "spot": "cryptospot-token", "tori": "storichain-token", "tcapethdai": "holistic-eth-set", "mof": "molecular-future", "tcapbtcusdc": "holistic-btc-set", "scho": "scholarship-coin", "bbi": "bigboys-industry", "wbb": "wild-beast-block", "fbn": "five-balance", "nye": "newyork-exchange", "biut": "bit-trust-system", "bdigg": "badger-sett-digg", "west": "waves-enterprise", "xep": "electra-protocol", "usdfl": "usdfreeliquidity", "mwc": "mimblewimblecoin", "xlpg": "stellarpayglobal", "plum": "plumcake-finance", "change": "change-our-world", "nnn": "novem-gold-token", "u8d": "universal-dollar", "safedog": "safedog-protocol", "mtnt": "mytracknet-token", "shx": "stronghold-token", "bcs": "business-credit-substitute", "saturn": "saturn-network", "bci": "bitcoin-interest", "degenr": "degenerate-money", "shibaken": "shibaken-finance", "vamp": "vampire-protocol", "cnet": "currency-network", "bhc": "billionhappiness", "yficg": "yfi-credits-group", "aac": "acute-angle-cloud", "itf": "ins3-finance-coin", "bnbbull": "3x-long-bnb-token", "sgc": "secured-gold-coin", "ethusdadl4": "ethusd-adl-4h-set", "stars": "mogul-productions", "meteor": "meteorite-network", "asm": "assemble-protocol", "sicc": "swisscoin-classic", "mkt": "monkey-king-token", "mdza": "medooza-ecosystem", "limex": "limestone-network", "bbkfi": "bitblocks-finance", "foxt": "fox-trading-token", "bvl": "bullswap-protocol", "brain": "nobrainer-finance", "ctf": "cybertime-finance", "sxcc": "southxchange-coin", "tpc": "trading-pool-coin", "nhc": "neo-holistic-coin", "macpo": "macpo", "rvc": "ravencoin-classic", "stnd": "standard-protocol", "stor": "self-storage-coin", "xgt": "xion-global-token", "etnxp": "electronero-pulse", "encx": "enceladus-network", "usdap": "bond-appetite-usd", "twj": "tronweeklyjournal", "trxbull": "3x-long-trx-token", "chow": "chow-chow-finance", "reau": "vira-lata-finance", "mcat20": "wrapped-moon-cats", "ciphc": "cipher-core-token", "ghp": "global-hash-power", "stgz": "stargaze-protocol", "leobull": "3x-long-leo-token", "far": "farmland-protocol", "dcl": "delphi-chain-link", "vbzrx": "vbzrx", "thpt": "helio-power-token", "cnc": "global-china-cash", "eosbull": "3x-long-eos-token", "goldr": "golden-ratio-coin", "opcx": "over-powered-coin", "cbsn": "blockswap-network", "xbtx": "bitcoin-subsidium", "uusdt": "unagii-tether-usd", "xrpbull": "3x-long-xrp-token", "sbf": "steakbank-finance", "yusdc": "yusdc-busd-pool", "mps": "mt-pelerin-shares", "tmcn": "timecoin-protocol", "mcaps": "mango-market-caps", "3cs": "cryptocricketclub", "bctr": "bitcratic-revenue", "ksp": "klayswap-protocol", "okbbull": "3x-long-okb-token", "mee": "mercurity-finance", "ssf": "safe-seafood-coin", "ce": "crypto-excellence", "icp": "internet-computer", "agov": "answer-governance", "spr": "polyvolve-finance", "csto": "capitalsharetoken", "rvp": "revolution-populi", "copter": "helicopter-finance", "cgb": "crypto-global-bank", "okbbear": "3x-short-okb-token", "tan": "taklimakan-network", "afdlt": "afrodex-labs-token", "iop": "internet-of-people", "puml": "puml-better-health", "rtc": "read-this-contract", "yfb2": "yearn-finance-bit2", "xuni": "ultranote-infinity", "cpi": "crypto-price-index", "eqmt": "equus-mining-token", "eosbear": "3x-short-eos-token", "eoshedge": "1x-short-eos-token", "kp3rb": "keep3r-bsc-network", "dzi": "definition-network", "tln": "trustline-network", "mhsp": "melonheadsprotocol", "hbch": "huobi-bitcoin-cash", "bnbhedge": "1x-short-bnb-token", "loom": "loom-network-new", "lmt": "lympo-market-token", "zelda elastic cash": "zelda-elastic-cash", "bbadger": "badger-sett-badger", "hbo": "hash-bridge-oracle", "awc": "atomic-wallet-coin", "brick": "brick", "ang": "aureus-nummus-gold", "kch": "keep-calm", "gbc": "golden-bridge-coin", "dfly": "dragonfly-protocol", "pol": "proof-of-liquidity", "xrphedge": "1x-short-xrp-token", "mco2": "moss-carbon-credit", "pvp": "playervsplayercoin", "okbhedge": "1x-short-okb-token", "wszo": "wrapped-shuttleone", "ght": "global-human-trust", "gsa": "global-smart-asset", "trxhedge": "1x-short-trx-token", "xrpbear": "3x-short-xrp-token", "if": "impossible-finance", "btfc": "bitcoin-flash-cash", "catx": "cat-trade-protocol", "leobear": "3x-short-leo-token", "satx": "satoexchange-token", "axt": "alliance-x-trading", "bnbbear": "3x-short-bnb-token", "yhfi": "yearn-hold-finance", "mpg": "max-property-group", "unit": "universal-currency", "rmc": "russian-miner-coin", "delta rlp": "rebasing-liquidity", "bafi": "bafi-finance-token", "ethmoonx": "eth-moonshot-x-yield-set", "trxbear": "3x-short-trx-token", "fz": "frozencoin-network", "pmt": "playmarket", "abp": "arc-block-protocol", "liqlo": "liquid-lottery-rtc", "\u2728": "sparkleswap-rewards", "emp": "electronic-move-pay", "cana": "cannabis-seed-token", "trdg": "tardigrades-finance", "msc": "monster-slayer-cash", "wxmr": "wrapped-xmr-btse", "wton": "wrapped-ton-crystal", "spy": "satopay-yield-token", "sbyte": "securabyte-protocol", "wmc": "wrapped-marblecards", "gsc": "global-social-chain", "gmc24": "24-genesis-mooncats", "vgo": "virtual-goods-token", "ff1": "two-prime-ff1-token", "wht": "wrapped-huobi-token", "yfie": "yfiexchange-finance", "sxpbull": "3x-long-swipe-token", "mclb": "millenniumclub", "cix100": "cryptoindex-io", "yi12": "yi12-stfinance", "beth": "binance-eth", "dss": "defi-shopping-stake", "hbdc": "happy-birthday-coin", "yfiv": "yearn-finance-value", "ymf20": "yearn20moonfinance", "bbtc": "binance-wrapped-btc", "btcgw": "bitcoin-galaxy-warp", "pnix": "phoenixdefi-finance", "tmh": "trustmarkethub-token", "xtzbull": "3x-long-tezos-token", "zgt": "zg-blockchain-token", "refi": "realfinance-network", "ann": "apexel-natural-nano", "hsn": "hyper-speed-network", "sst": "simba-storage-token", "stoge": "stoner-doge", "maticbull": "3x-long-matic-token", "pxt": "populous-xbrl-token", "gmm": "gold-mining-members", "dola": "dola-usd", "hmng": "hummingbird-finance", "upusd": "universal-us-dollar", "fcd": "future-cash-digital", "pci": "pay-coin", "eoshalf": "0-5x-long-eos-token", "ledu": "education-ecosystem", "bfht": "befasterholdertoken", "wsdoge": "doge-of-woof-street", "xrphalf": "0-5x-long-xrp-token", "coc": "cocktailbar", "yskf": "yearn-shark-finance", "wcusd": "wrapped-celo-dollar", "sushibull": "3x-long-sushi-token", "mkrbull": "3x-long-maker-token", "xspc": "spectresecuritycoin", "ceek": "ceek", "plaas": "plaas-farmers-token", "climb": "climb-token-finance", "vntw": "value-network-token", "ygy": "generation-of-yield", "okbhalf": "0-5x-long-okb-token", "ncp": "newton-coin-project", "mina": "mina-protocol", "vit": "vice-industry-token", "xjp": "exciting-japan-coin", "pnixs": "phoenix-defi-finance", "xtzbear": "3x-short-tezos-token", "sushibear": "3x-short-sushi-token", "sleepy": "sleepy-sloth", "xtzhedge": "1x-short-tezos-token", "wx42": "wrapped-x42-protocol", "thex": "thore-exchange", "forestplus": "the-forbidden-forest", "tgco": "thaler", "mkrbear": "3x-short-maker-token", "gbpx": "etoro-pound-sterling", "fredx": "fred-energy-erc20", "xcmg": "connect-mining-coin", "dollar": "dollar-online", "trybbull": "3x-long-bilira-token", "yfc": "yearn-finance-center", "nut": "native-utility-token", "sxphedge": "1x-short-swipe-token", "deor": "decentralized-oracle", "bvg": "bitcoin-virtual-gold", "teo": "trust-ether-reorigin", "terc": "troneuroperewardcoin", "tmtg": "the-midas-touch-gold", "usc": "ultimate-secure-cash", "aapl": "apple-protocol-token", "matichedge": "1x-short-matic-token", "wis": "experty-wisdom-token", "usdtbull": "3x-long-tether-token", "atombull": "3x-long-cosmos-token", "hpay": "hyper-credit-network", "utt": "united-traders-token", "rrt": "recovery-right-token", "opm": "omega-protocol-money", "sxpbear": "3x-short-swipe-token", "afo": "all-for-one-business", "bnfy": "b-non-fungible-yearn", "amf": "asian-model-festival", "ibeth": "interest-bearing-eth", "hzt": "black-diamond-rating", "uenc": "universalenergychain", "deto": "delta-exchange-token", "scv": "super-coinview-token", "vgt": "vault12", "bdoge": "blue-eyes-white-doge", "idledaiyield": "idle-dai-yield", "kun": "qian-governance-token", "seco": "serum-ecosystem-token", "wct": "waves-community-token", "lbxc": "lux-bio-exchange-coin", "acd": "alliance-cargo-direct", "wows": "wolves-of-wall-street", "sxphalf": "0-5x-long-swipe-token", "efg": "ecoc-financial-growth", "atomhedge": "1x-short-cosmos-token", "julb": "justliquidity-binance", "cts": "chainlink-trading-set", "ducato": "ducato-protocol-token", "linkpt": "link-profit-taker-set", "znt": "zenswap-network-token", "ggt": "gard-governance-token", "vetbull": "3x-long-vechain-token", "ddn": "data-delivery-network", "infinity": "infinity-protocol-bsc", "blo": "based-loans-ownership", "gcc": "thegcccoin", "z502": "502-bad-gateway-token", "ddrst": "digidinar-stabletoken", "usd": "uniswap-state-dollar", "btsc": "beyond-the-scene-coin", "edi": "freight-trust-network", "crs": "cryptorewards", "zomb": "antique-zombie-shards", "xtzhalf": "0-5x-long-tezos-token", "matichalf": "0-5x-long-matic-token", "qtc": "quality-tracing-chain", "idletusdyield": "idle-tusd-yield", "smrat": "secured-moonrat-token", "bsbt": "bit-storage-box-token", "gtf": "globaltrustfund-token", "dca": "decentralized-currency-assets", "idlewbtcyield": "idle-wbtc-yield", "intratio": "intelligent-ratio-set", "incx": "international-cryptox", "knc": "kyber-network-crystal", "cft": "coinbene-future-token", "atombear": "3x-short-cosmos-token", "xbx": "bitex-global", "trybbear": "3x-short-bilira-token", "marc": "market-arbitrage-coin", "adabull": "3x-long-cardano-token", "float": "float-protocol-float", "usdtbear": "3x-short-tether-token", "glob": "global-reserve-system", "htg": "hedge-tech-governance", "xlmbull": "3x-long-stellar-token", "earn": "yearn-classic-finance", "evz": "electric-vehicle-zone", "yfn": "yearn-finance-network", "inteth": "intelligent-eth-set-ii", "mcpc": "mobile-crypto-pay-coin", "dant": "digital-antares-dollar", "ubi": "universal-basic-income", "yfrm": "yearn-finance-red-moon", "atomhalf": "0-5x-long-cosmos-token", "hth": "help-the-homeless-coin", "ltcbull": "3x-long-litecoin-token", "ihf": "invictus-hyprion-fund", "tcat": "the-currency-analytics", "yfp": "yearn-finance-protocol", "gdc": "global-digital-content", "vetbear": "3x-short-vechain-token", "zelda summer nuts cash": "zelda-summer-nuts-cash", "goz": "goztepe-s-k-fan-token", "e2c": "electronic-energy-coin", "ahf": "americanhorror-finance", "gspi": "gspi", "dcd": "digital-currency-daily", "set": "save-environment-token", "dpt": "diamond-platform-token", "bbb": "bullbearbitcoin-set-ii", "zelda spring nuts cash": "zelda-spring-nuts-cash", "ethbull": "3x-long-ethereum-token", "dogebull": "3x-long-dogecoin-token", "bmp": "brother-music-platform", "bed": "bit-ecological-digital", "adabear": "3x-short-cardano-token", "vethedge": "1x-short-vechain-token", "tgct": "tron-game-center-token", "leg": "legia-warsaw-fan-token", "nami": "nami-corporation-token", "call": "global-crypto-alliance", "ecell": "consensus-cell-network", "cvcc": "cryptoverificationcoin", "adahedge": "1x-short-cardano-token", "well": "wellness-token-economy", "balbull": "3x-long-balancer-token", "paxgbull": "3x-long-pax-gold-token", "tgic": "the-global-index-chain", "smnc": "simple-masternode-coin", "algobull": "3x-long-algorand-token", "linkrsico": "link-rsi-crossover-set", "xlmbear": "3x-short-stellar-token", "uwbtc": "unagii-wrapped-bitcoin", "tgcd": "trongamecenterdiamonds", "smoke": "the-smokehouse-finance", "yefi": "yearn-ethereum-finance", "hedge": "1x-short-bitcoin-token", "dogebear": "3x-short-dogecoin-token", "balbear": "3x-short-balancer-token", "bbe": "bullbearethereum-set-ii", "ltchedge": "1x-short-litecoin-token", "twob": "the-whale-of-blockchain", "gator": "alligator-fractal-set", "pwc": "prime-whiterock-company", "yfiec": "yearn-finance-ecosystem", "fnxs": "financex-exchange-token", "linkbull": "3x-long-chainlink-token", "vbnt": "bancor-governance-token", "dogehedge": "1x-short-dogecoin-token", "ems": "ethereum-message-search", "ethbear": "3x-short-ethereum-token", "algohedge": "1x-short-algorand-token", "inex": "internet-exchange-token", "half": "0-5x-long-bitcoin-token", "ltcbear": "3x-short-litecoin-token", "bnkrx": "bankroll-extended-token", "algobear": "3x-short-algorand-token", "tomobull": "3x-long-tomochain-token", "wbcd": "wrapped-bitcoin-diamond", "gve": "globalvillage-ecosystem", "ethrsiapy": "eth-rsi-60-40-yield-set-ii", "idledaisafe": "idle-dai-risk-adjusted", "brz": "brz", "bags": "basis-gold-share-heco", "aipe": "ai-predicting-ecosystem", "sato": "super-algorithmic-token", "mlgc": "marshal-lion-group-coin", "ethhedge": "1x-short-ethereum-token", "paxgbear": "3x-short-pax-gold-token", "adahalf": "0-5x-long-cardano-token", "uwaifu": "unicly-waifu-collection", "sup": "supertx-governance-token", "nyante": "nyantereum", "pec": "proverty-eradication-coin", "rae": "rae-token", "aat": "agricultural-trade-chain", "linkhedge": "1x-short-chainlink-token", "defibull": "3x-long-defi-index-token", "btceth5050": "btc-eth-equal-weight-set", "ass": "australian-safe-shepherd", "p2ps": "p2p-solutions-foundation", "tomohedge": "1x-short-tomochain-token", "idleusdcsafe": "idle-usdc-risk-adjusted", "basd": "binance-agile-set-dollar", "linkbear": "3x-short-chainlink-token", "sxut": "spectre-utility-token", "bhp": "blockchain-of-hash-power", "tomobear": "3x-short-tomochain-token", "cbn": "connect-business-network", "ethhalf": "0-5x-long-ethereum-token", "ethmo": "eth-momentum-trigger-set", "dogehalf": "0-5x-long-dogecoin-token", "best": "bitpanda-ecosystem-token", "algohalf": "0-5x-long-algorand-token", "upt": "universal-protocol-token", "bvol": "1x-long-btc-implied-volatility-token", "idleusdtsafe": "idle-usdt-risk-adjusted", "paxghalf": "0-5x-long-pax-gold-token", "bsvbull": "3x-long-bitcoin-sv-token", "pbtt": "purple-butterfly-trading", "yefim": "yearn-finance-management", "balhalf": "0-5x-long-balancer-token", "brrr": "money-printer-go-brrr-set", "anw": "anchor-neural-world-token", "linkhalf": "0-5x-long-chainlink-token", "lega": "link-eth-growth-alpha-set", "byte": "btc-network-demand-set-ii", "cmid": "creative-media-initiative", "licc": "life-is-camping-community", "fame": "saint-fame", "ulu": "universal-liquidity-union", "cgen": "community-generation", "bsvbear": "3x-short-bitcoin-sv-token", "eth2": "eth2-staking-by-poolx", "sxdt": "spectre-dividend-token", "bptn": "bit-public-talent-network", "xautbull": "3x-long-tether-gold-token", "defihedge": "1x-short-defi-index-token", "defibear": "3x-short-defi-index-token", "wcdc": "world-credit-diamond-coin", "htbull": "3x-long-huobi-token-token", "cmccoin": "cine-media-celebrity-coin", "iqc": "intelligence-quickly-chain", "btmxbull": "3x-long-bitmax-token-token", "xac": "general-attention-currency", "midbull": "3x-long-midcap-index-token", "bchbull": "3x-long-bitcoin-cash-token", "arcc": "asia-reserve-currency-coin", "bsvhalf": "0-5x-long-bitcoin-sv-token", "wgrt": "waykichain-governance-coin", "ethbtc7525": "eth-btc-75-25-weight-set", "sheesh": "sheesh-it-is-bussin-bussin", "cute": "blockchain-cuties-universe", "defihalf": "0-5x-long-defi-index-token", "yfka": "yield-farming-known-as-ash", "drgnbull": "3x-long-dragon-index-token", "sbx": "degenerate-platform", "btceth7525": "btc-eth-75-25-weight-set", "xautbear": "3x-short-tether-gold-token", "chft": "crypto-holding-frank-token", "cva": "crypto-village-accelerator", "dcto": "decentralized-crypto-token", "rsp": "real-estate-sales-platform", "htbear": "3x-short-huobi-token-token", "innbc": "innovative-bioresearch", "btcfund": "btc-fund-active-trading-set", "bchbear": "3x-short-bitcoin-cash-token", "privbull": "3x-long-privacy-index-token", "xauthalf": "0-5x-long-tether-gold-token", "eth50smaco": "eth-50-day-ma-crossover-set", "fact": "fee-active-collateral-token", "kncbull": "3x-long-kyber-network-token", "altbull": "3x-long-altcoin-index-token", "drgnbear": "3x-short-dragon-index-token", "kyte": "kambria-yield-tuning-engine", "midbear": "3x-short-midcap-index-token", "bchhedge": "1x-short-bitcoin-cash-token", "bitn": "bitcoin-company-network", "yfdt": "yearn-finance-diamond-token", "acc": "asian-african-capital-chain", "qdao": "q-dao-governance-token-v1-0", "thetabull": "3x-long-theta-network-token", "court": "optionroom-governance-token", "btcrsiapy": "btc-rsi-crossover-yield-set", "eth20smaco": "eth_20_day_ma_crossover_set", "cusdtbull": "3x-long-compound-usdt-token", "lpnt": "luxurious-pro-network-token", "btmxbear": "3x-short-bitmax-token-token", "ethrsi6040": "eth-rsi-60-40-crossover-set", "drgnhalf": "0-5x-long-dragon-index-token", "compbull": "3x-long-compound-token-token", "uglyph": "unicly-autoglyph-collection", "thetahedge": "1x-short-theta-network-token", "bchhalf": "0-5x-long-bitcoin-cash-token", "etas": "eth-trending-alpha-st-set-ii", "cusdtbear": "3x-short-compound-usdt-token", "privhedge": "1x-short-privacy-index-token", "privbear": "3x-short-privacy-index-token", "mlr": "mega-lottery-services-global", "eth12emaco": "eth-12-day-ema-crossover-set", "thetabear": "3x-short-theta-network-token", "midhalf": "0-5x-long-midcap-index-token", "cusdthedge": "1x-short-compound-usdt-token", "bxa": "blockchain-exchange-alliance", "kncbear": "3x-short-kyber-network-token", "blct": "bloomzed-token", "eth26emaco": "eth-26-day-ema-crossover-set", "innbcl": "innovativebioresearchclassic", "mqss": "set-of-sets-trailblazer-fund", "altbear": "3x-short-altcoin-index-token", "scds": "shrine-cloud-storage-network", "bullshit": "3x-long-shitcoin-index-token", "jpyq": "jpyq-stablecoin-by-q-dao-v1", "ethbtcemaco": "eth-btc-ema-ratio-trading-set", "knchalf": "0-5x-long-kyber-network-token", "bloap": "btc-long-only-alpha-portfolio", "compbear": "3x-short-compound-token-token", "privhalf": "0-5x-long-privacy-index-token", "ethemaapy": "eth-26-ema-crossover-yield-set", "greed": "fear-greed-sentiment-set-ii", "bearshit": "3x-short-shitcoin-index-token", "eloap": "eth-long-only-alpha-portfolio", "ethbtcrsi": "eth-btc-rsi-ratio-trading-set", "tusc": "original-crypto-coin", "althalf": "0-5x-long-altcoin-index-token", "cnyq": "cnyq-stablecoin-by-q-dao-v1", "hedgeshit": "1x-short-shitcoin-index-token", "tip": "technology-innovation-project", "ibp": "innovation-blockchain-payment", "comphedge": "1x-short-compound-token-token", "thetahalf": "0-5x-long-theta-network-token", "bcac": "business-credit-alliance-chain", "etcbull": "3x-long-ethereum-classic-token", "uch": "universidad-de-chile-fan-token", "ustonks-apr21": "ustonks-apr21", "bbra": "boobanker-research-association", "linkethrsi": "link-eth-rsi-ratio-trading-set", "yvboost": "yvboost", "cdsd": "contraction-dynamic-set-dollar", "halfshit": "0-5x-long-shitcoin-index-token", "mayfi": "matic-aave-yfi", "madai": "matic-aave-dai", "bhsc": "blackholeswap-compound-dai-usdc", "epm": "extreme-private-masternode-coin", "ntrump": "no-trump-augur-prediction-token", "etcbear": "3x-short-ethereum-classic-token", "bocbp": "btc-on-chain-beta-portfolio-set", "mauni": "matic-aave-uni", "eth20macoapy": "eth-20-ma-crossover-yield-set-ii", "etchalf": "0-5x-long-ethereum-classic-token", "maaave": "matic-aave-aave", "mausdc": "matic-aave-usdc", "mausdt": "matic-aave-usdt", "malink": "matic-aave-link", "matusd": "matic-aave-tusd", "maweth": "matic-aave-weth", "ethpa": "eth-price-action-candlestick-set", "ibvol": "1x-short-btc-implied-volatility", "usns": "ubiquitous-social-network-service", "bqt": "blockchain-quotations-index-token", "ugas-jan21": "ulabs-synthetic-gas-futures-expiring-1-jan-2021", "ebloap": "eth-btc-long-only-alpha-portfolio", "ylab": "yearn-finance-infrastructure-labs", "pxgold-may2021": "pxgold-synthetic-gold-31-may-2021", "ethmacoapy": "eth-20-day-ma-crossover-yield-set", "leloap": "link-eth-long-only-alpha-portfolio", "gusdt": "gusd-token", "cring": "darwinia-crab-network", "exchbull": "3x-long-exchange-token-index-token", "zjlt": "zjlt-distributed-factoring-network", "apeusd-uni-dec21": "apeusd-uni-synthetic-usd-dec-2021", "exchbear": "3x-short-exchange-token-index-token", "emtrg": "meter-governance-mapped-by-meter-io", "apeusd-snx-dec21": "apeusd-snx-synthetic-usd-dec-2021", "apeusd-uma-dec21": "apeusd-uma-synthetic-usd-dec-2021", "cbe": "cbe", "exchhedge": "1x-short-exchange-token-index-token", "apeusd-link-dec21": "apeusd-link-synthetic-usd-dec-2021", "apeusd-aave-dec21": "apeusd-aave-synthetic-usd-dec-2021", "ddam": "decentralized-data-assets-management", "dvp": "decentralized-vulnerability-platform", "exchhalf": "0-5x-long-echange-token-index-token", "ugas-jun21": "ugas-jun21", "linkethpa": "eth-link-price-action-candlestick-set", "qdefi": "qdefi-rating-governance-token-v2", "realtoken-8342-schaefer-hwy-detroit-mi": "realtoken-8342-schaefer-hwy-detroit-mi", "dml": "decentralized-machine-learning", "realtoken-9336-patton-st-detroit-mi": "realtoken-9336-patton-st-detroit-mi", "pxusd-mar2022": "pxusd-synthetic-usd-expiring-31-mar-2022", "realtoken-20200-lesure-st-detroit-mi": "realtoken-20200-lesure-st-detroit-mi", "cdr": "communication-development-resources-token", "pxusd-mar2021": "pxusd-synthetic-usd-expiring-1-april-2021", "pxgold-mar2022": "pxgold-synthetic-gold-expiring-31-mar-2022", "realtoken-16200-fullerton-ave-detroit-mi": "realtoken-16200-fullerton-avenue-detroit-mi", "realtoken-10024-10028-appoline-st-detroit-mi": "realtoken-10024-10028-appoline-st-detroit-mi", "bchnrbtc-jan-2021": "bchnrbtc-synthetic", "uusdrbtc-dec": "uusdrbtc-synthetic-token-expiring-31-december-2020", "uusdweth-dec": "yusd-synthetic-token-expiring-31-december-2020", "mario-cash-jan-2021": "mario-cash-jan-2021"};

//end
