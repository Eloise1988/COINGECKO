
/*====================================================================================================================================*
  CoinGecko Google Sheet Feed by Eloise1988
  ====================================================================================================================================
  Version:      2.0.3
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
     COINGECKO_ID          For use by end users to get the coin's id in Coingecko


  If ticker isn't functionning please refer to the coin's id you can find in the following JSON pas: https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1

  
  For bug reports see https://github.com/Eloise1988/COINGECKO/issues
  
  
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  2.0.3  New Function COINGECKO_ID + modification of caching time 
 *====================================================================================================================================*/
//CACHING TIME  
//Expiration time for caching values, by default caching data last 10min=600sec. This value is a const and can be changed to your needs.
const expirationInSeconds=600;


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
    cache.put(id_cache,dict,expirationInSeconds);
    
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
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache,pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
    cache.put(id_cache, pairList.map((pair) => pair[0] && (dict[pair[0]] && (dict[pair[0]] || "") || (defaultValueForMissingData !== null ? defaultValueForMissingData : "")) || ""),expirationInSeconds);   
    
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
      cache.put(id_cache, Number(vol_gecko),expirationInSeconds);
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
      cache.put(id_cache, Number(vol_gecko),expirationInSeconds);
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
    
    
    cache.put(id_cache, parsedJSON,expirationInSeconds);
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
      cache.put(id_cache, Number(vol_gecko),expirationInSeconds);
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

    cache.put(id_cache, parsedJSON[0].image,expirationInSeconds);       
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
  
    
    cache.put(id_cache, parsedJSON[0].image,expirationInSeconds);       
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
    cache.put(id_cache, Number(price_gecko),expirationInSeconds);
    
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
      cache.put(id_cache, Number(mkt_gecko),expirationInSeconds);}
      
      else {mkt_gecko=""}}
      
    else 
    { mkt_gecko=parseFloat(parsedJSON[0].market_cap);
      cache.put(id_cache, Number(mkt_gecko),expirationInSeconds);}
      
    
    
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
    cache.put(id_cache, Number(vol_gecko),expirationInSeconds);
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return GECKOVOLUMEBYNAME(id_coin,currency);
  }

}
/** COINGECKO_ID
 * Imports CoinGecko's id_coin of cryptocurrency ticker, which can be found in web address of Coingecko (https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1).
 * For example:
 *
 *   =GCOINGECKO_ID("BTC")
 *               
 * 
 * @param {ticker}                 the ticker of cryptocurrency ticker, only 1 parameter 
 * @customfunction
 *
 * @returns the Coingecko ID
 **/
function COINGECKO_ID(ticker) {
      ticker = ticker.toString().toLowerCase();
      
      return CoinList[ticker] || ticker;
        
  }
function getBase64EncodedMD5(text)
{ 
  return Utilities.base64Encode( Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text));
}
//Coin list of CoinGecko is cached in script to reduce server load and increase performance.
//This list can be updated from the text box that can be found at:
//http://api.charmantadvisory.com/COINGECKOID/json
//Be sure to replace just the part after "=", and keep the ";" at the end for proper syntax.
const CoinList = {"index": "index-cooperative", "btc": "bitcoin", "eth": "ethereum", "usdt": "tether", "ada": "cardano", "bnb": "binancecoin", "doge": "dogecoin", "xrp": "ripple", "usdc": "usd-coin", "dot": "polkadot", "icp": "internet-computer", "bch": "bitcoin-cash", "ltc": "litecoin", "xlm": "stellar", "uni": "uniswap", "link": "chainlink", "busd": "binance-usd", "matic": "matic-network", "sol": "solana", "etc": "ethereum-classic", "wbtc": "wrapped-bitcoin", "vet": "vechain", "theta": "theta-token", "fil": "filecoin", "trx": "tron", "eos": "eos", "dai": "dai", "xmr": "monero", "shib": "shiba-inu", "aave": "aave", "okb": "okb", "ceth": "compound-ether", "neo": "neo", "cusdc": "compound-usd-coin", "klay": "klay-token", "bsv": "bitcoin-cash-sv", "mkr": "maker", "atom": "cosmos", "cdai": "cdai", "algo": "algorand", "miota": "iota", "cro": "crypto-com-chain", "xtz": "tezos", "ftt": "ftx-token", "ksm": "kusama", "cel": "celsius-degree-token", "cake": "pancakeswap-token", "leo": "leo-token", "rune": "thorchain", "ht": "huobi-token", "btt": "bittorrent-2", "avax": "avalanche-2", "safemoon": "safemoon", "hbar": "hedera-hashgraph", "ust": "terrausd", "luna": "terra-luna", "snx": "havven", "comp": "compound-governance-token", "dash": "dash", "sushi": "sushi", "egld": "elrond-erd-2", "waves": "waves", "xem": "nem", "zec": "zcash", "pax": "paxos-standard", "tfuel": "theta-fuel", "dcr": "decred", "tel": "telcoin", "yfi": "yearn-finance", "tusd": "true-usd", "chz": "chiliz", "hot": "holotoken", "hnt": "helium", "hbtc": "huobi-btc", "amp": "amp-token", "zil": "zilliqa", "stx": "blockstack", "near": "near", "husd": "husd", "fei": "fei-protocol", "enj": "enjincoin", "dgb": "digibyte", "one": "harmony", "btg": "bitcoin-gold", "bat": "basic-attention-token", "qtum": "qtum", "zen": "zencash", "steth": "staked-ether", "mana": "decentraland", "grt": "the-graph", "ont": "ontology", "nexo": "nexo", "nano": "nano", "bnt": "bancor", "ftm": "fantom", "sc": "siacoin", "uma": "uma", "zrx": "0x", "ankr": "ankr", "gt": "gatechain-token", "omg": "omisego", "icx": "icon", "xsushi": "xsushi", "arrr": "pirate-chain", "iost": "iostoken", "chsb": "swissborg", "rvn": "ravencoin", "cusdt": "compound-usdt", "ar": "arweave", "xdc": "xdce-crowd-sale", "nxm": "nxm", "crv": "curve-dao-token", "flow": "flow", "npxs": "pundi-x", "kcs": "kucoin-shares", "lsk": "lisk", "lusd": "liquity-usd", "bcd": "bitcoin-diamond", "xch": "chia", "vgx": "ethos", "qnt": "quant-network", "omi": "ecomi", "oxy": "oxygen", "rsr": "reserve-rights-token", "1inch": "1inch", "renbtc": "renbtc", "usdn": "neutrino", "bake": "bakerytoken", "hbc": "hbtc-token", "wrx": "wazirx", "rlc": "iexec-rlc", "lpt": "livepeer", "pundix": "pundi-x-2", "xvg": "verge", "tribe": "tribe-2", "lrc": "loopring", "win": "wink", "ckb": "nervos-network", "ren": "republic-protocol", "snt": "status", "vtho": "vethor-token", "bcha": "bitcoin-cash-abc-2", "iotx": "iotex", "btmx": "asd", "seth": "seth", "akt": "akash-network", "dent": "dent", "celo": "celo", "bal": "balancer", "erg": "ergo", "cfx": "conflux-token", "mdx": "mdex", "xvs": "venus", "reef": "reef-finance", "ewt": "energy-web-token", "feg": "feg-token", "skl": "skale", "titan": "titanswap", "glm": "golem", "band": "band-protocol", "ton": "ton-crystal", "susd": "nusd", "klv": "klever", "svcs": "givingtoservices", "paxg": "pax-gold", "mir": "mirror-protocol", "ocean": "ocean-protocol", "inj": "injective-protocol", "cuni": "compound-uniswap", "gno": "gnosis", "alusd": "alchemix-usd", "srm": "serum", "axs": "axie-infinity", "med": "medibloc", "ardr": "ardor", "fun": "funfair", "kava": "kava", "oxt": "orchid-protocol", "alpha": "alpha-finance", "ctsi": "cartesi", "btcst": "btc-standard-hashrate-token", "stmx": "storm", "steem": "steem", "iq": "everipedia", "nmr": "numeraire", "waxp": "wax", "alcx": "alchemix", "kobe": "shabu-shabu", "sand": "the-sandbox", "celr": "celer-network", "nkn": "nkn", "rpl": "rocket-pool", "cvc": "civic", "math": "math", "ampl": "ampleforth", "agi": "singularitynet", "xprt": "persistence", "vlx": "velas", "woo": "wootrade-network", "tlm": "alien-worlds", "ray": "raydium", "perp": "perpetual-protocol", "orn": "orion-protocol", "uqc": "uquid-coin", "kmd": "komodo", "audio": "audius", "lend": "ethlend", "poly": "polymath-network", "anc": "anchor-protocol", "fet": "fetch-ai", "ubt": "unibright", "zks": "zkswap", "orbs": "orbs", "sxp": "swipe", "cards": "cardstarter", "xaut": "tether-gold", "twt": "trust-wallet-token", "ark": "ark", "prom": "prometeus", "meta": "metadium", "maid": "maidsafecoin", "etn": "electroneum", "hive": "hive", "rep": "augur", "zmt": "zipmex-token", "ghx": "gamercoin", "dodo": "dodo", "strax": "stratis", "rif": "rif-token", "kncl": "kyber-network", "bts": "bitshares", "xhv": "haven", "forth": "ampleforth-governance-token", "storj": "storj", "ava": "concierge-io", "wan": "wanchain", "hoge": "hoge-finance", "gny": "gny", "mtl": "metal", "rfox": "redfox-labs-2", "btm": "bytom", "divi": "divi", "ogn": "origin-protocol", "uos": "ultra", "wnxm": "wrapped-nxm", "ant": "aragon", "mona": "monacoin", "rdd": "reddcoin", "tomo": "tomochain", "dnt": "district0x", "tru": "truefi", "coti": "coti", "utk": "utrust", "kai": "kardiachain", "hxro": "hxro", "nwc": "newscrypto-coin", "nmx": "nominex", "keep": "keep-network", "noia": "noia-network", "pols": "polkastarter", "atri": "atari", "dpi": "defipulse-index", "col": "unit-protocol", "hns": "handshake", "frax": "frax", "gas": "gas", "qkc": "quark-chain", "sure": "insure", "lina": "linear", "evn": "evolution-finance", "czrx": "compound-0x", "elf": "aelf", "exrd": "e-radix", "rook": "rook", "adx": "adex", "eps": "ellipsis", "pac": "paccoin", "pha": "pha", "sys": "syscoin", "elon": "dogelon-mars", "powr": "power-ledger", "quick": "quick", "tko": "tokocrypto", "dao": "dao-maker", "mask": "mask-network", "c20": "crypto20", "nbr": "niobio-cash", "scrt": "secret", "sfp": "safepal", "vai": "vai", "auction": "auction", "usdp": "usdp", "badger": "badger-dao", "alice": "my-neighbor-alice", "loc": "lockchain", "vra": "verasity", "dag": "constellation-labs", "snm": "sonm", "duck": "unit-protocol-duck", "rose": "oasis-network", "mx": "mx-token", "trac": "origintrail", "rndr": "render-token", "aeth": "ankreth", "aion": "aion", "rly": "rally-2", "nu": "nucypher", "jst": "just", "fx": "fx-coin", "gusd": "gemini-dollar", "bcn": "bytecoin", "mft": "mainframe", "lamb": "lambda", "fida": "bonfida", "hydra": "hydra", "xcm": "coinmetro", "nrg": "energi", "seur": "seur", "api3": "api3", "mist": "alchemist", "trb": "tellor", "gala": "gala", "firo": "zcoin", "ppt": "populous", "vrsc": "verus-coin", "dia": "dia-data", "htr": "hathor", "ddx": "derivadao", "cream": "cream-2", "lyxe": "lukso-token", "cbat": "compound-basic-attention-token", "edg": "edgeware", "val": "sora-validator-token", "cbk": "cobak-token", "safemars": "safemars", "zai": "zero-collateral-dai", "tryb": "bilira", "cre": "carry", "fine": "refinable", "kin": "kin", "swap": "trustswap", "grs": "groestlcoin", "iris": "iris-network", "kda": "kadena", "eco": "ecofi", "tt": "thunder-token", "alpaca": "alpaca-finance", "chr": "chromaway", "yfii": "yfii-finance", "mln": "melon", "core": "cvault-finance", "srk": "sparkpoint", "lon": "tokenlon", "ignis": "ignis", "prq": "parsiq", "wozx": "wozx", "solve": "solve-care", "bond": "barnbridge", "loomold": "loom-network", "pnk": "kleros", "ycc": "yuan-chain-coin", "sero": "super-zero", "mxc": "mxc", "shr": "sharering", "znn": "zenon", "pcx": "chainx", "boa": "bosagora", "emc2": "einsteinium", "cummies": "cumrocket", "paid": "paid-network", "rfr": "refereum", "ersdl": "unfederalreserve", "cru": "crust-network", "lbc": "lbry-credits", "ela": "elastos", "ern": "ethernity-chain", "hegic": "hegic", "stpt": "stp-network", "ldo": "lido-dao", "peak": "marketpeak", "beam": "beam", "nuls": "nuls", "wicc": "waykichain", "lto": "lto-network", "akro": "akropolis", "req": "request-network", "whale": "whale", "vite": "vite", "sbtc": "sbtc", "super": "superfarm", "ctk": "certik", "albt": "allianceblock", "lit": "litentry", "ae": "aeternity", "maps": "maps", "bifi": "beefy-finance", "mer": "mercurial", "nrv": "nerve-finance", "pivx": "pivx", "krt": "terra-krw", "om": "mantra-dao", "suku": "suku", "xhdx": "hydradx", "stake": "xdai-stake", "apl": "apollo", "creth2": "cream-eth2", "fsn": "fsn", "cusd": "celo-dollar", "nsbt": "neutrino-system-base-token", "rgt": "rari-governance-token", "vsp": "vesper-finance", "dbc": "deepbrain-chain", "data": "streamr-datacoin", "bar": "fc-barcelona-fan-token", "aergo": "aergo", "nxs": "nexus", "wex": "waultswap", "lgo": "legolas-exchange", "ppc": "peercoin", "btu": "btu-protocol", "pond": "marlin", "xbase": "eterbase", "xor": "sora", "btse": "btse-token", "ohm": "olympus", "bscpad": "bscpad", "zano": "zano", "aqt": "alpha-quark-token", "ramp": "ramp", "gxc": "gxchain", "burst": "burst", "bip": "bip", "hai": "hackenai", "blz": "bluzelle", "oxen": "loki-network", "armor": "armor", "dusk": "dusk-network", "lqty": "liquity", "nif": "unifty", "bel": "bella-protocol", "get": "get-token", "dsla": "stacktical", "nim": "nimiq-2", "hez": "hermez-network-token", "eth2x-fli": "eth-2x-flexible-leverage-index", "slt": "smartlands", "vsys": "v-systems", "any": "anyswap", "xsgd": "xsgd", "skey": "smartkey", "drgn": "dragonchain", "free": "free-coin", "ioc": "iocoin", "eurs": "stasis-eurs", "dgd": "digixdao", "sai": "sai", "front": "frontier-token", "glch": "glitch-protocol", "pnt": "pnetwork", "yld": "yield-app", "dvpn": "sentinel-group", "mcb": "mcdex", "slink": "slink", "bzrx": "bzx-protocol", "ghst": "aavegotchi", "sx": "sportx", "png": "pangolin", "hc": "hshare", "cos": "contentos", "bfc": "bifrost", "spi": "shopping-io", "cope": "cope", "sbd": "steem-dollars", "slp": "smooth-love-potion", "rari": "rarible", "df": "dforce-token", "lgcy": "lgcy-network", "hunt": "hunt-token", "wing": "wing-finance", "mslv": "mirrored-ishares-silver-trust", "arpa": "arpa-chain", "hopr": "hopr", "fis": "stafi", "eac": "earthcoin", "vtc": "vertcoin", "nxt": "nxt", "met": "metronome", "fts": "footballstars", "farm": "harvest-finance", "dmt": "dmarket", "bao": "bao-finance", "zb": "zb-token", "chain": "chain-games", "musd": "musd", "sntvt": "sentivate", "mqqq": "mirrored-invesco-qqq-trust", "psg": "paris-saint-germain-fan-token", "mgoogl": "mirrored-google", "ult": "ultiledger", "hard": "hard-protocol", "tvk": "terra-virtua-kolect", "mamzn": "mirrored-amazon", "maapl": "mirrored-apple", "kyl": "kylin-network", "veri": "veritaseum", "mark": "benchmark-protocol", "bmi": "bridge-mutual", "mmsft": "mirrored-microsoft", "usdk": "usdk", "fio": "fio-protocol", "gbyte": "byteball", "moc": "mossland", "auto": "auto", "swth": "switcheo", "clo": "callisto", "root": "rootkit", "tbtc": "tbtc", "mtsla": "mirrored-tesla", "mbaba": "mirrored-alibaba", "vxv": "vectorspace", "mnflx": "mirrored-netflix", "muso": "mirrored-united-states-oil-fund", "dero": "dero", "insur": "insurace", "edr": "endor", "pro": "propy", "ilv": "illuvium", "mbl": "moviebloc", "rai": "rai", "vitae": "vitae", "dep": "depth-token", "bz": "bit-z-token", "mbx": "mobiecoin", "upp": "sentinel-protocol", "mtwtr": "mirrored-twitter", "atm": "atletico-madrid", "kp3r": "keep3rv1", "prcy": "prcy-coin", "visr": "visor", "rad": "radicle", "swingby": "swingby", "dego": "dego-finance", "go": "gochain", "cube": "somnium-space-cubes", "cxo": "cargox", "xyo": "xyo-network", "nex": "neon-exchange", "rcn": "ripio-credit-network", "mhc": "metahash", "cnd": "cindicator", "pool": "pooltogether", "uft": "unlend-finance", "xrt": "robonomics-network", "velo": "velo", "vid": "videocoin", "pltc": "platoncoin", "phb": "red-pulse", "fxs": "frax-share", "id": "everid", "unfi": "unifi-protocol-dao", "dg": "decentral-games", "salt": "salt", "nest": "nest", "zcn": "0chain", "idex": "aurora-dao", "oly": "olyseum", "ifc": "infinitecoin", "sfi": "saffron-finance", "torn": "tornado-cash", "dfy": "defi-for-you", "xdb": "digitalbits", "ban": "banano", "step": "step-finance", "xsn": "stakenet", "sky": "skycoin", "mrph": "morpheus-network", "dext": "idextools", "card": "cardstack", "aria20": "arianee", "mta": "meta", "rdn": "raiden-network", "dea": "dea", "qsp": "quantstamp", "bondly": "bondly", "zee": "zeroswap", "conv": "convergence", "cudos": "cudos", "smart": "smartcash", "qash": "qash", "dip": "etherisc", "mith": "mithril", "bytz": "slate", "xpr": "proton", "ast": "airswap", "sha": "safe-haven", "cas": "cashaa", "bmx": "bitmart-token", "cvnt": "content-value-network", "baas": "baasid", "upunk": "unicly-cryptopunks-collection", "dock": "dock", "tlos": "telos", "prob": "probit-exchange", "mvixy": "mirrored-proshares-vix", "dcn": "dentacoin", "tone": "te-food", "snl": "sport-and-leisure", "nebl": "neblio", "bepro": "bet-protocol", "digg": "digg", "revv": "revv", "gal": "galatasaray-fan-token", "nftx": "nftx", "axel": "axel", "juld": "julswap", "usdx": "usdx", "govi": "govi", "ring": "darwinia-network-native-token", "wtc": "waltonchain", "bor": "boringdao", "veth": "vether", "apy": "apy-finance", "htb": "hotbit-token", "pib": "pibble", "wow": "wownero", "bax": "babb", "juv": "juventus-fan-token", "nmc": "namecoin", "media": "media-network", "bdt": "blackdragon-token", "occ": "occamfi", "kuma": "kuma-inu", "acs": "acryptos", "grin": "grin", "soul": "phantasma", "ujenny": "jenny-metaverse-dao-token", "like": "likecoin", "route": "route", "key": "selfkey", "fwt": "freeway-token", "fxf": "finxflo", "nlg": "gulden", "zoom": "coinzoom-token", "ibbtc": "interest-bearing-bitcoin", "nas": "nebulas", "lcx": "lcx", "fst": "futureswap", "cut": "cutcoin", "opium": "opium", "impulse": "impulse-by-fdr", "nav": "nav-coin", "frm": "ferrum-network", "belt": "belt", "soc": "all-sports", "mbox": "mobox", "dyn": "dynamic", "miau": "mirrored-ishares-gold-trust", "vidt": "v-id-blockchain", "aioz": "aioz-network", "flux": "zelcash", "cfi": "cyberfi", "suter": "suterusu", "bank": "float-protocol", "mod": "modefi", "boson": "boson-protocol", "ousd": "origin-dollar", "for": "force-protocol", "mdt": "measurable-data-token", "wcres": "wrapped-crescofin", "yvault-lp-ycurve": "yvault-lp-ycurve", "kan": "kan", "esd": "empty-set-dollar", "safe2": "safe2", "zap": "zap", "mix": "mixmarvel", "dexe": "dexe", "bdpi": "interest-bearing-dpi", "sdt": "stake-dao", "helmet": "helmet-insure", "bft": "bnktothefuture", "wxt": "wirex", "fic": "filecash", "oxb": "oxbull-tech", "waultx": "wault", "pre": "presearch", "gto": "gifto", "credit": "credit", "troy": "troy", "anj": "anj", "buidl": "dfohub", "dht": "dhedge-dao", "pbtc35a": "pbtc35a", "pmon": "pocmon", "lcc": "litecoin-cash", "lmt": "lympo-market-token", "via": "viacoin", "mph": "88mph", "amlt": "coinfirm-amlt", "qrl": "quantum-resistant-ledger", "ddim": "duckdaodime", "sparta": "spartan-protocol-token", "el": "elysia", "kine": "kine-protocol", "ovr": "ovr", "gvt": "genesis-vision", "oil": "oiler", "mitx": "morpheus-labs", "acm": "ac-milan-fan-token", "ode": "odem", "xed": "exeedme", "aleph": "aleph", "trtl": "turtlecoin", "blank": "blank", "cocos": "cocos-bcx", "ones": "oneswap-dao-token", "spnd": "spendcoin", "zero": "zero-exchange", "fcl": "fractal", "aitra": "aitra", "cover": "cover-protocol", "six": "six-network", "ubxt": "upbots", "crpt": "crypterium", "uncx": "unicrypt-2", "bux": "blockport", "inv": "inverse-finance", "pi": "pchain", "props": "props", "strong": "strong", "vee": "blockv", "mda": "moeda-loyalty-points", "mwat": "restart-energy", "oce": "oceanex-token", "xend": "xend-finance", "tau": "lamden", "moon": "mooncoin", "kex": "kira-network", "tct": "tokenclub", "axn": "axion", "coin": "coinvest", "adp": "adappter-token", "ichi": "ichi-farm", "superbid": "superbid", "psl": "pastel", "flx": "reflexer-ungovernance-token", "bscx": "bscex", "bunny": "pancake-bunny", "pnd": "pandacoin", "yve-crvdao": "vecrv-dao-yvault", "wault": "wault-finance-old", "fct": "factom", "pbtc": "ptokens-btc", "rfuel": "rio-defi", "jrt": "jarvis-reward-token", "cvp": "concentrated-voting-power", "unc": "unicrypt", "cbc": "cashbet-coin", "ngm": "e-money", "etp": "metaverse-etp", "filda": "filda", "ubq": "ubiq", "bbr": "bitberry-token", "dusd": "defidollar", "layer": "unilayer", "k21": "k21", "meme": "degenerator", "polx": "polylastic", "polk": "polkamarkets", "nebo": "csp-dao-network", "brd": "bread", "polydoge": "polydoge", "tidal": "tidal-finance", "meth": "mirrored-ether", "sylo": "sylo", "spc": "spacechain-erc-20", "cmt": "cybermiles", "xdn": "digitalnote", "socks": "unisocks", "glq": "graphlinq-protocol", "dtx": "databroker-dao", "idle": "idle", "mtv": "multivac", "wom": "wom-token", "combo": "furucombo", "abl": "airbloc-protocol", "iqn": "iqeon", "mtlx": "mettalex", "unn": "union-protocol-governance-token", "yam": "yam-2", "lym": "lympo", "mbtc": "mirrored-bitcoin", "trias": "trias-token", "ablock": "any-blocknet", "eosc": "eosforce", "ask": "permission-coin", "labs": "labs-group", "pendle": "pendle", "lpool": "launchpool", "mpl": "maple-finance", "ptf": "powertrade-fuel", "ltx": "lattice-token", "marsh": "unmarshal", "slice": "tranche-finance", "webd": "webdollar", "cs": "credits", "si": "siren", "mobi": "mobius", "egg": "goose-finance", "part": "particl", "adk": "aidos-kuneen", "kono": "konomi-network", "tips": "fedoracoin", "plu": "pluton", "orai": "oraichain-token", "yla": "yearn-lazy-ape", "wabi": "wabi", "xcur": "curate", "cdt": "blox", "nct": "polyswarm", "woofy": "woofy", "swftc": "swftcoin", "wgr": "wagerr", "cws": "crowns", "deus": "deus-finance", "foam": "foam-protocol", "oax": "openanx", "spore": "spore-finance-2", "myst": "mysterium", "dec": "decentr", "xcash": "x-cash", "wpr": "wepower", "utnp": "universa", "zt": "ztcoin", "ost": "simple-token", "value": "value-liquidity", "ncash": "nucleus-vision", "block": "blocknet", "dxd": "dxdao", "ktn": "kattana", "evx": "everex", "coval": "circuits-of-value", "arch": "archer-dao-governance-token", "abt": "arcblock", "bmc": "bountymarketcap", "saito": "saito", "axpr": "axpire", "txl": "tixl-new", "xfund": "xfund", "ppay": "plasma-finance", "cvx": "convex-finance", "hget": "hedget", "msp": "mothership", "cnfi": "connect-financial", "npx": "napoleon-x", "bix": "bibox-token", "rbc": "rubic", "opct": "opacity", "mtx": "matryx", "udoo": "howdoo", "hakka": "hakka-finance", "btc2": "bitcoin-2", "scc": "stakecube", "dough": "piedao-dough-v2", "razor": "razor-network", "fund": "unification", "shift": "shift", "defi5": "defi-top-5-tokens-index", "oddz": "oddz", "hny": "honey", "quai": "quai-dao", "bmxx": "multiplier-bsc", "vfox": "vfox", "umb": "umbrella-network", "xmx": "xmax", "tnb": "time-new-bank", "dora": "dora-factory", "trade": "unitrade", "rby": "rubycoin", "fuel": "fuel-token", "enq": "enq-enecuum", "agve": "agave-token", "dextf": "dextf", "b21": "b21", "nec": "nectar-token", "stn": "stone-token", "dos": "dos-network", "san": "santiment-network-token", "chi": "chimaera", "xava": "avalaunch", "ndx": "indexed-finance", "xio": "xio", "pickle": "pickle-finance", "koge": "bnb48-club-token", "top": "top-network", "rio": "realio-network", "push": "ethereum-push-notification-service", "poa": "poa-network", "dta": "data", "sake": "sake-token", "sdx": "swapdex", "axis": "axis-defi", "cofi": "cofix", "apm": "apm-coin", "aoa": "aurora", "jul": "jul", "ice": "ice-token", "vrx": "verox", "cov": "covesting", "propel": "payrue", "ocn": "odyssey", "krl": "kryll", "dust": "dust-token", "yf-dai": "yfdai-finance", "nds": "nodeseeds", "fnt": "falcon-token", "cate": "catecoin", "valor": "smart-valor", "sfuel": "sparkpoint-fuel", "synx": "syndicate", "poolz": "poolz-finance", "dmd": "diamond", "mtrg": "meter", "sngls": "singulardtv", "swrv": "swerve-dao", "abyss": "the-abyss", "game": "gamecredits", "lix": "lixir-protocol", "cnns": "cnns", "emc": "emercoin", "shroom": "shroom-finance", "ctx": "cryptex-finance", "mxx": "multiplier", "cht": "coinhe-token", "fuse": "fuse-network-token", "niox": "autonio", "la": "latoken", "cwbtc": "compound-wrapped-btc", "naos": "naos-finance", "appc": "appcoins", "swag": "swag-finance", "safe": "safe-coin-2", "owc": "oduwa-coin", "bdp": "big-data-protocol", "plr": "pillar", "rsv": "reserve", "act": "achain", "bxc": "bitcoin-classic", "exnt": "exnetwork-token", "vex": "vexanium", "muse": "muse-2", "shft": "shyft-network-2", "bwf": "beowulf", "gth": "gather", "ftc": "feathercoin", "nfy": "non-fungible-yearn", "cgg": "chain-guardians", "egt": "egretia", "kit": "dexkit", "qlc": "qlink", "hit": "hitchain", "spank": "spankchain", "onion": "deeponion", "pkf": "polkafoundry", "efx": "effect-network", "awx": "auruscoin", "phr": "phore", "ruff": "ruff", "reap": "reapchain", "xpx": "proximax", "cops": "cops-finance", "uip": "unlimitedip", "xmy": "myriadcoin", "hvn": "hiveterminal", "btx": "bitcore", "hzn": "horizon-protocol", "pay": "tenx", "asr": "as-roma-fan-token", "rocks": "rocki", "mth": "monetha", "crep": "compound-augur", "shopx": "splyt", "og": "og-fan-token", "smt": "smartmesh", "vib": "viberate", "must": "must", "daofi": "daofi", "pma": "pumapay", "time": "chronobank", "rbase": "rbase-finance", "white": "whiteheart", "wdc": "worldcoin", "open": "open-governance-token", "sph": "spheroid-universe", "tfb": "truefeedbackchain", "dfd": "defidollar-dao", "gnx": "genaro-network", "l2": "leverj-gluon", "vnla": "vanilla-network", "yaxis": "yaxis", "geo": "geodb", "hord": "hord", "dhc": "deltahub-community", "hyve": "hyve", "grid": "grid", "koin": "koinos", "euno": "euno", "plot": "plotx", "apys": "apyswap", "mds": "medishares", "dlt": "agrello", "xpat": "pangea", "hy": "hybrix", "btc2x-fli": "btc-2x-flexible-leverage-index", "dev": "dev-protocol", "neu": "neumark", "brew": "cafeswap-token", "wolf": "moonwolf-io", "robot": "robot", "umx": "unimex-network", "gains": "gains", "eng": "enigma", "nyzo": "nyzo", "btcz": "bitcoinz", "boom": "boom-token", "shard": "shard", "ach": "alchemy-pay", "ong": "ong-social", "fdr": "french-digital-reserve", "bac": "basis-cash", "julien": "julien", "unic": "unicly", "upi": "pawtocol", "haus": "daohaus", "dashd": "dash-diamond", "hyc": "hycon", "ixc": "ixcoin", "mint": "public-mint", "twin": "twinci", "maha": "mahadao", "rendoge": "rendoge", "minds": "minds", "ezw": "ezoow", "pros": "prosper", "asp": "aspire", "sense": "sense", "crbn": "carbon", "raini": "rainicorn", "btcp": "bitcoin-private", "urus": "urus-token", "tkn": "tokencard", "unistake": "unistake", "nix": "nix-platform", "rnt": "oneroot-network", "jur": "jur", "dgtx": "digitex-futures-exchange", "itc": "iot-chain", "dov": "dovu", "yop": "yield-optimization-platform", "rev": "revain", "cntr": "centaur", "elg": "escoin-token", "raze": "raze-network", "watch": "yieldwatch", "aur": "auroracoin", "rmt": "sureremit", "chg": "charg-coin", "chp": "coinpoker", "ruler": "ruler-protocol", "hpb": "high-performance-blockchain", "matter": "antimatter", "gxt": "gem-exchange-and-trading", "bry": "berry-data", "you": "you-chain", "ghost": "ghost-by-mcafee", "room": "option-room", "mork": "mork", "flo": "flo", "eosdt": "equilibrium-eosdt", "par": "parachute", "dafi": "dafi-protocol", "srn": "sirin-labs-token", "ten": "tokenomy", "dyp": "defi-yield-protocol", "lien": "lien", "drc": "digital-reserve-currency", "iov": "starname", "bbc": "tradove", "yee": "yee", "swm": "swarm", "nsure": "nsure-network", "mfb": "mirrored-facebook", "xcp": "counterparty", "roobee": "roobee", "jup": "jupiter", "token": "chainswap", "gen": "daostack", "argon": "argon", "onx": "onx-finance", "ads": "adshares", "tra": "trabzonspor-fan-token", "idna": "idena", "alias": "spectrecoin", "start": "bscstarter", "0xbtc": "oxbitcoin", "linka": "linka", "alpa": "alpaca", "oap": "openalexa-protocol", "sdefi": "sdefi", "deri": "deri-protocol", "wings": "wings", "lua": "lua-token", "tky": "thekey", "man": "matrix-ai-network", "777": "jackpot", "xla": "stellite", "raven": "raven-protocol", "its": "iteration-syndicate", "octo": "octofi", "asko": "askobar-network", "erc20": "erc20", "nft": "nft-protocol", "etho": "ether-1", "hbd": "hive_dollar", "yfl": "yflink", "tera": "tera-smart-money", "oin": "oin-finance", "vidya": "vidya", "banana": "apeswap-finance", "bcp": "bitcashpay", "nbx": "netbox-coin", "apw": "apwine", "tx": "transfercoin", "kpad": "kickpad", "int": "internet-node-token", "mgs": "mirrored-goldman-sachs", "gmee": "gamee", "1337": "e1337", "uncl": "uncl", "wiz": "crowdwiz", "cti": "clintex-cti", "blt": "bloom", "xst": "stealthcoin", "$anrx": "anrkey-x", "amb": "amber", "cv": "carvertical", "grc": "gridcoin-research", "bird": "bird-money", "wasabi": "wasabix", "smg": "smaugs-nft", "xtk": "xtoken", "dvg": "daoventures", "amn": "amon", "satt": "satt", "zig": "zignaly", "dgx": "digix-gold", "zefu": "zenfuse", "tern": "ternio", "mabnb": "mirrored-airbnb", "b20": "b20", "prt": "portion", "pla": "plair", "mic": "mith-cash", "crwny": "crowny-token", "paint": "paint", "arth": "arth", "ele": "eleven-finance", "geeq": "geeq", "aid": "aidcoin", "bskt": "basketcoin", "xlq": "alqo", "pipt": "power-index-pool-token", "cgt": "cache-gold", "premia": "premia", "stbu": "stobox-token", "bitg": "bitcoin-green", "bgov": "bgov", "cloak": "cloakcoin", "bas": "basis-share", "cc10": "cryptocurrency-top-10-tokens-index", "spa": "sperax", "bcdt": "blockchain-certified-data-token", "snc": "suncontract", "world": "world-token", "uniq": "uniqly", "pefi": "penguin-finance", "kat": "kambria", "qun": "qunqun", "glc": "goldcoin", "usf": "unslashed-finance", "pta": "petrachor", "nord": "nord-finance", "edda": "eddaswap", "trtt": "trittium", "arcx": "arc-governance-old", "blk": "blackcoin", "tcap": "total-crypto-market-cap-token", "gmt": "gambit", "bitcny": "bitcny", "idea": "ideaology", "fsw": "fsw-token", "true": "true-chain", "snow": "snowswap", "bree": "cbdao", "deto": "delta-exchange-token", "ntk": "neurotoken", "gro": "growth-defi", "instar": "insights-network", "omni": "omni", "vbk": "veriblock", "bkbt": "beekan", "gfarm2": "gains-v2", "urqa": "ureeqa", "efl": "electronicgulden", "midas": "midas", "drt": "domraider", "degen": "degen-index", "doki": "doki-doki-finance", "auc": "auctus", "phnx": "phoenixdao", "mvp": "merculet", "cnn": "cnn", "ugas": "ultrain", "auscm": "auric-network", "ut": "ulord", "uaxie": "unicly-mystic-axies-collection", "sashimi": "sashimi", "xpm": "primecoin", "inf": "infinitus-token", "sync": "sync-network", "bis": "bismuth", "sig": "xsigma", "giv": "givly-coin", "epic": "epic-cash", "xaur": "xaurum", "tnt": "tierion", "unidx": "unidex", "gswap": "gameswap-org", "xft": "offshift", "seen": "seen", "pot": "potcoin", "star": "starbase", "zco": "zebi", "euler": "euler-tools", "can": "canyacoin", "ucash": "ucash", "lnchx": "launchx", "mamc": "mirrored-amc-entertainment", "dows": "shadows", "mtc": "medical-token-currency", "xeq": "triton", "wild": "wilder-world", "balpha": "balpha", "unifi": "unifi", "gum": "gourmetgalaxy", "toa": "toacoin", "surf": "surf-finance", "aga": "aga-token", "defi+l": "piedao-defi-large-cap", "olt": "one-ledger", "cpc": "cpchain", "mfg": "smart-mfg", "uuu": "u-network", "let": "linkeye", "pnode": "pinknode", "tao": "taodao", "stv": "sint-truidense-voetbalvereniging", "dmg": "dmm-governance", "umask": "unicly-hashmasks-collection", "bart": "bartertrade", "mvi": "metaverse-index", "prc": "partner", "avt": "aventus", "pink": "pinkcoin", "spdr": "spiderdao", "cot": "cotrader", "tad": "tadpole-finance", "dis": "tosdis", "vvt": "versoview", "sepa": "secure-pad", "bpro": "b-protocol", "bitx": "bitscreener", "mgme": "mirrored-gamestop", "tcake": "pancaketools", "fls": "flits", "acxt": "ac-exchange-token", "gcr": "global-coin-research", "sumo": "sumokoin", "dsd": "dynamic-set-dollar", "kangal": "kangal", "exy": "experty", "snob": "snowball-token", "dappt": "dapp-com", "pcnt": "playcent", "fair": "fairgame", "yeed": "yggdrash", "42": "42-coin", "ixi": "ixicash", "pry": "prophecy", "thc": "hempcoin-thc", "mdo": "midas-dollar", "comfi": "complifi", "vsf": "verisafe", "veo": "amoveo", "qrk": "quark", "sin": "suqa", "uwl": "uniwhales", "sale": "dxsale-network", "kton": "darwinia-commitment-token", "d": "denarius", "zhegic": "zhegic", "pgl": "prospectors-gold", "gleec": "gleec-coin", "nty": "nexty", "cmp": "component", "imt": "moneytoken", "ccx": "conceal", "roya": "royale", "xpc": "experience-chain", "put": "putincoin", "hbt": "habitat", "smartcredit": "smartcredit-token", "play": "herocoin", "th": "team-heretics-fan-token", "eosdac": "eosdac", "tfl": "trueflip", "xbc": "bitcoin-plus", "klonx": "klondike-finance-v2", "skm": "skrumble-network", "masq": "masq", "xvix": "xvix", "fnx": "finnexus", "rel": "release-ico-project", "nka": "incakoin", "punk-basic": "punk-basic", "bnsd": "bnsd-finance", "lxt": "litex", "chonk": "chonk", "yoyow": "yoyow", "nanj": "nanjcoin", "infs": "infinity-esaham", "scp": "siaprime-coin", "ok": "okcash", "tpay": "tokenpay", "bask": "basketdao", "ctxc": "cortex", "nuts": "squirrel-finance", "xrc": "bitcoin-rhodium", "daps": "daps-token", "sfd": "safe-deal", "epan": "paypolitan-token", "becn": "beacon", "stzen": "stakedzen", "sata": "signata", "2gt": "2gether-2", "etha": "etha-lend", "ngc": "naga", "sign": "signaturechain", "tube": "bittube", "cali": "calicoin", "mm": "mm-token", "emt": "emanate", "pinkm": "pinkmoon", "lotto": "lotto", "ddd": "scry-info", "utu": "utu-coin", "agar": "aga-rewards-2", "sta": "statera", "mrc": "meritcoins", "cure": "curecoin", "exrn": "exrnchain", "fry": "foundrydao-logistics", "eved": "evedo", "ess": "essentia", "flash": "flash-stake", "crw": "crown", "inxt": "internxt", "qrx": "quiverx", "mog": "mogwai", "csai": "compound-sai", "aln": "aluna", "flex": "flex-coin", "acat": "alphacat", "dax": "daex", "dime": "dimecoin", "zcl": "zclassic", "res": "resfinex-token", "chx": "chainium", "$based": "based-money", "crdt": "crdt", "coll": "collateral-pay", "bles": "blind-boxes", "adc": "audiocoin", "stack": "stacker-ventures", "azuki": "azuki", "assy": "assy-index", "fvt": "finance-vote", "nrch": "enreachdao", "arte": "ethart", "klp": "kulupu", "zora": "zoracles", "lba": "libra-credit", "vault": "vault", "zip": "zip", "tent": "snowgem", "catt": "catex-token", "rem": "remme", "trio": "tripio", "tret": "tourist-review-token", "mthd": "method-fi", "force": "force-dao", "dgcl": "digicol-token", "kek": "cryptokek", "yield": "yield-protocol", "mtn": "medicalchain", "idrt": "rupiah-token", "udo": "unido-ep", "eye": "beholder", "waif": "waifu-token", "jade": "jade-currency", "fwb": "friends-with-benefits-pro", "dat": "datum", "uop": "utopia-genesis-foundation", "pgn": "pigeoncoin", "bob": "bobs_repair", "cai": "club-atletico-independiente", "ybo": "young-boys-fan-token", "sgt": "sharedstake-governance-token", "yec": "ycash", "gard": "hashgard", "stsla": "stsla", "kko": "kineko", "frc": "freicoin", "iic": "intelligent-investment-chain", "exrt": "exrt-network", "1wo": "1world", "hgold": "hollygold", "2key": "2key", "dun": "dune", "vibe": "vibe", "kif": "kittenfinance", "gear": "bitgear", "oro": "oro", "zer": "zero", "alch": "alchemy-dao", "uct": "ucot", "wish": "mywish", "lead": "lead-token", "qbx": "qiibee", "bva": "bavala", "cns": "centric-cash", "cur": "curio", "veil": "veil", "isp": "ispolink", "hnst": "honest-mining", "pasc": "pascalcoin", "kndc": "kanadecoin", "pfl": "professional-fighters-league-fan-token", "fti": "fanstime", "ktlyo": "katalyo", "dmst": "dmst", "obot": "obortech", "mars": "mars", "sxrp": "sxrp", "polis": "polis", "reli": "relite-finance", "lyr": "lyra", "chads": "chads-vc", "troll": "trollcoin", "gysr": "geyser", "pbr": "polkabridge", "defi++": "piedao-defi", "equad": "quadrant-protocol", "pst": "primas", "mcx": "machix", "voice": "nix-bridge-token", "ait": "aichain", "corn": "cornichon", "web": "webcoin", "vxt": "virgox-token", "mue": "monetaryunit", "polc": "polka-city", "n8v": "wearesatoshi", "cpay": "cryptopay", "soar": "soar-2", "ufr": "upfiring", "idh": "indahash", "vision": "apy-vision", "vrc": "vericoin", "nlc2": "nolimitcoin", "sphtx": "sophiatx", "pgt": "polyient-games-governance-token", "mt": "mytoken", "lkr": "polkalokr", "four": "the-4th-pillar", "ppp": "paypie", "kebab": "kebab-token", "bnkr": "bankroll-network", "smty": "smoothy", "pvt": "pivot-token", "prare": "polkarare", "ac": "acoconut", "opt": "open-predict-token", "wdgld": "wrapped-dgld", "road": "yellow-road", "esp": "espers", "hyn": "hyperion", "bnf": "bonfi", "mgo": "mobilego", "adb": "adbank", "dets": "dextrust", "yfiii": "dify-finance", "rpd": "rapids", "l3p": "lepricon", "pmgt": "perth-mint-gold-token", "mega": "megacryptopolis", "box": "contentbox", "fera": "fera", "add": "add-xyz-new", "snet": "snetwork", "renzec": "renzec", "vips": "vipstarcoin", "spice": "spice-finance", "swfl": "swapfolio", "bitto": "bitto-exchange", "red": "red", "ethix": "ethichub", "pigx": "pigx", "dexg": "dextoken-governance", "zdex": "zeedex", "dav": "dav", "mfi": "marginswap", "btb": "bitball", "ptoy": "patientory", "aux": "auxilium", "bet": "eosbet", "adm": "adamant-messenger", "mcm": "mochimo", "shdc": "shd-cash", "stbz": "stabilize", "pirate": "piratecash", "qwc": "qwertycoin", "bxy": "beaxy-exchange", "edu": "educoin", "ag8": "atromg8", "modic": "modern-investment-coin", "rating": "dprating", "ldoge": "litedoge", "cap": "cap", "adco": "advertise-coin", "yeti": "yearn-ecosystem-token-index", "fin": "definer", "dfsocial": "defisocial", "lobs": "lobstex-coin", "htre": "hodltree", "bc": "bitcoin-confidential", "nyan-2": "nyan-v2", "enb": "earnbase", "atn": "atn", "edn": "edenchain", "chart": "chartex", "bfly": "butterfly-protocol-2", "dgvc": "degenvc", "tap": "tapmydata", "zeit": "zeitcoin", "bcv": "bcv", "swise": "stakewise", "azr": "aezora", "fdz": "friendz", "pylon": "pylon-finance", "warp": "warp-finance", "xbtc": "xbtc", "bti": "bitcoin-instant", "build": "build-finance", "buzz": "buzzcoin", "bull": "buysell", "zp": "zen-protocol", "ldfi": "lendefi", "snn": "sechain", "coni": "coinbene-token", "n3rdz": "n3rd-finance", "max": "maxcoin", "scifi": "scifi-finance", "rfi": "reflect-finance", "family": "the-bitcoin-family", "ibfk": "istanbul-basaksehir-fan-token", "ozc": "ozziecoin", "imx": "impermax", "pie": "defipie", "znz": "zenzo", "afen": "afen-blockchain", "cdzc": "cryptodezirecash", "reosc": "reosc-ecosystem", "tdx": "tidex-token", "mofi": "mobifi", "deflct": "deflect", "ditto": "ditto", "name": "polkadomain", "snov": "snovio", "feed": "feed-token", "ugotchi": "unicly-aavegotchi-astronauts-collection", "sada": "sada", "hsc": "hashcoin", "sota": "sota-finance", "xdna": "extradna", "evt": "everitoken", "cbm": "cryptobonusmiles", "zxc": "0xcert", "swg": "swirge", "vrs": "veros", "cliq": "deficliq", "kgo": "kiwigo", "dth": "dether", "xas": "asch", "inft": "infinito", "gmat": "gowithmi", "otb": "otcbtc-token", "omx": "project-shivom", "nfti": "nft-index", "rws": "robonomics-web-services", "krb": "karbo", "kcal": "phantasma-energy", "crx": "cryptex", "dotx": "deli-of-thrones", "nobl": "noblecoin", "dit": "inmediate", "hush": "hush", "gex": "globex", "skull": "skull", "donut": "donut", "xfi": "xfinance", "tft": "the-famous-token", "trst": "wetrust", "base": "base-protocol", "defi+s": "piedao-defi-small-cap", "bcug": "blockchain-cuties-universe-governance", "monk": "monkey-project", "odin": "odin-protocol", "hmq": "humaniq", "tzc": "trezarcoin", "ryo": "ryo", "cspn": "crypto-sports", "smly": "smileycoin", "yae": "cryptonovae", "all": "alliance-fan-token", "ogo": "origo", "elx": "energy-ledger", "ors": "origin-sport", "updog": "updog", "fdd": "frogdao-dime", "fmg": "fm-gallery", "cor": "coreto", "gyen": "gyen", "vig": "vig", "elec": "electrify-asia", "ptt": "proton-token", "cnus": "coinus", "sav3": "sav3", "vcn": "versacoin", "ufo": "ufocoin", "flixx": "flixxo", "dogec": "dogecash", "evc": "eventchain", "font": "font", "pis": "polkainsure-finance", "zpae": "zelaapayae", "move": "holyheld-2", "rac": "rac", "fdo": "firdaos", "rvf": "rocket-vault-finance", "excl": "exclusivecoin", "xiot": "xiotri", "astro": "astrotools", "lnd": "lendingblock", "taco": "tacos", "dop": "drops-ownership-power", "bto": "bottos", "use": "usechain", "bomb": "bomb", "mas": "midas-protocol", "vtx": "vortex-defi", "egem": "ethergem", "cash": "litecash", "xnk": "ink-protocol", "ovc": "ovcode", "hfs": "holderswap", "eko": "echolink", "edc": "edc-blockchain", "fyz": "fyooz", "rage": "rage-fan", "cag": "change", "rare": "unique-one", "tos": "thingsoperatingsystem", "psi": "passive-income", "upx": "uplexa", "moons": "moontools", "zipt": "zippie", "gfx": "gamyfi-token", "uat": "ultralpha", "next": "nextexchange", "dfio": "defi-omega", "sub": "substratum", "groot": "growth-root", "whirl": "whirl-finance", "meri": "merebel", "tol": "tolar", "eca": "electra", "mnc": "maincoin", "mmaon": "mmaon", "stacy": "stacy", "reec": "renewableelectronicenergycoin", "pny": "peony-coin", "tme": "tama-egg-niftygotchi", "wlt": "wealth-locks", "cat": "cat-token", "toshi": "toshi-token", "aaa": "app-alliance-association", "banca": "banca", "foto": "unique-photo", "mao": "mao-zedong", "zlot": "zlot", "malw": "malwarechain", "stk": "stk", "metric": "metric-exchange", "ftx": "fintrux", "mmo": "mmocoin", "fyd": "find-your-developer", "gdao": "governor-dao", "mwg": "metawhale-gold", "urac": "uranus", "bbp": "biblepay", "face": "face", "iht": "iht-real-estate-protocol", "mntis": "mantis-network", "eggp": "eggplant-finance", "komet": "komet", "aog": "smartofgiving", "8pay": "8pay", "hlc": "halalchain", "bone": "bone", "zmn": "zmine", "ubex": "ubex", "ttn": "titan-coin", "share": "seigniorage-shares", "ppblz": "pepemon-pepeballs", "jntr": "jointer", "peg": "pegnet", "ncdt": "nuco-cloud", "etz": "etherzero", "bscv": "bscview", "gst2": "gastoken", "unl": "unilock-network", "ladz": "ladz", "boost": "boosted-finance", "lcs": "localcoinswap", "doges": "dogeswap", "ocp": "omni-consumer-protocol", "cv2": "colossuscoin-v2", "xiv": "project-inverse", "power": "unipower", "ssp": "smartshare", "spd": "stipend", "sxag": "sxag", "pasta": "spaghetti", "myx": "myx-network", "adel": "akropolis-delphi", "sact": "srnartgallery", "crea": "creativecoin", "holy": "holyheld", "nov": "novara-calcio-fan-token", "dacc": "dacc", "noahp": "noah-coin", "ysec": "yearn-secure", "hbn": "hobonickels", "ethv": "ethverse", "ric": "riecoin", "spn": "sapien", "excc": "exchangecoin", "her": "hero-node", "rte": "rate3", "error": "484-fund", "bir": "birake", "xp": "xp", "gat": "gatcoin", "msr": "masari", "yeld": "yeld-finance", "vol": "volume-network-token", "loot": "nftlootbox", "tac": "traceability-chain", "portal": "portal", "xnv": "nerva", "wheat": "wheat-token", "zut": "zero-utility-token", "ion": "ion", "totm": "totemfi", "bdg": "bitdegree", "spx": "sp8de", "sxau": "sxau", "ionc": "ionchain-token", "trc": "terracoin", "ecom": "omnitude", "grft": "graft-blockchain", "imo": "imo", "blue": "blue", "d4rk": "darkpaycoin", "ind": "indorse", "gse": "gsenetwork", "btc++": "piedao-btc", "rox": "robotina", "xmon": "xmon", "zpt": "zeepin", "hac": "hackspace-capital", "shnd": "stronghands", "aidoc": "ai-doctor", "bfi": "bearn-fi", "ent": "eternity", "debase": "debase", "ink": "ink", "semi": "semitoken", "zrc": "zrcoin", "tnc": "trinity-network-credit", "xgg": "10x-gg", "exf": "extend-finance", "xdex": "xdefi-governance-token", "bntx": "bintex-futures", "zcc": "zccoin", "lock": "meridian-network", "launch": "superlauncher", "tff": "tutti-frutti-finance", "datx": "datx", "mota": "motacoin", "swirl": "swirl-cash", "ucm": "ucrowdme", "chnd": "cashhand", "nftp": "nft-platform-index", "hand": "showhand", "ss": "sharder-protocol", "sphr": "sphere", "btdx": "bitcloud", "ypie": "piedao-yearn-ecosystem-pie", "fjc": "fujicoin", "alv": "allive", "vox": "vox-finance", "at": "abcc-token", "pct": "percent", "ipc": "ipchain", "bsty": "globalboost", "bltg": "bitcoin-lightning", "tango": "keytango", "mzc": "maza", "dam": "datamine", "slm": "solomon-defi", "btcs": "bitcoin-scrypt", "onc": "one-cash", "axe": "axe", "cova": "covalent-cova", "bos": "boscoin-2", "rvx": "rivex-erc20", "isla": "insula", "latx": "latiumx", "cvn": "cvcoin", "zusd": "zusd", "trust": "trust", "sib": "sibcoin", "dank": "mu-dank", "fire": "fire-protocol", "ccn": "custom-contract-network", "gene": "gene-source-code-token", "axi": "axioms", "dope": "dopecoin", "coil": "coil-crypto", "mush": "mushroom", "ifund": "unifund", "rom": "rom-token", "fxp": "fxpay", "tico": "topinvestmentcoin", "vdx": "vodi-x", "adt": "adtoken", "dct": "decent", "telos": "telos-coin", "toc": "touchcon", "x42": "x42-protocol", "bbk": "bitblocks-project", "bgg": "bgogo", "tns": "transcodium", "crp": "utopia", "npxsxem": "pundi-x-nem", "udoki": "unicly-doki-doki-collection", "hgt": "hellogold", "vdl": "vidulum", "yft": "yield-farming-token", "fusii": "fusible", "bether": "bethereum", "gbx": "gobyte", "abx": "arbidex", "thirm": "thirm-protocol", "pak": "pakcoin", "octi": "oction", "fxt": "fuzex", "plura": "pluracoin", "yvs": "yvs-finance", "ven": "impulseven", "onl": "on-live", "own": "owndata", "woa": "wrapped-origin-axie", "qbt": "qbao", "dogefi": "dogefi", "dds": "dds-store", "grim": "grimcoin", "lx": "lux", "dpy": "delphy", "aval": "avaluse", "bund": "bundles", "pylnt": "pylon-network", "netko": "netko", "stop": "satopay", "twa": "adventure-token", "rot": "rotten", "ptm": "potentiam", "xlr": "solaris", "depay": "depay", "mis": "mithril-share", "tsf": "teslafunds", "xwp": "swap", "milk2": "spaceswap-milk2", "ethy": "ethereum-yield", "hqx": "hoqu", "ncc": "neurochain", "revo": "revomon", "s": "sharpay", "vi": "vid", "fyp": "flypme", "comb": "combine-finance", "cue": "cue-protocol", "dft": "defiat", "cbix": "cubiex", "trvc": "thrivechain", "asafe": "allsafe", "dvt": "devault", "mib": "mib-coin", "poe": "poet", "plus1": "plusonecoin", "ggtk": "gg-token", "zsc": "zeusshield", "stq": "storiqa", "saud": "saud", "send": "social-send", "pht": "lightstreams", "alt": "alt-estate", "lqd": "liquidity-network", "ely": "elysian", "ndr": "noderunners", "gmc": "gokumarket-credit", "goat": "goatcoin", "rmpl": "rmpl", "etm": "en-tan-mo", "ctask": "cryptotask-2", "dyt": "dynamite", "tsuki": "tsuki-dao", "xbp": "blitzpredict", "wand": "wandx", "nor": "bring", "esbc": "e-sport-betting-coin", "degov": "degov", "brdg": "bridge-protocol", "chai": "chai", "cnb": "coinsbit-token", "tend": "tendies", "seos": "seos", "eqt": "equitrader", "jet": "jetcoin", "lmy": "lunch-money", "qch": "qchi", "ubeeple": "unicly-beeple-collection", "tbb": "trade-butler-bot", "srh": "srcoin", "ptc": "pesetacoin", "hue": "hue", "ieth": "ieth", "bcdn": "blockcdn", "gap": "gapcoin", "pgu": "polyient-games-unity", "bkc": "facts", "kolin": "kolin", "kerman": "kerman", "lun": "lunyr", "wg0": "wrapped-gen-0-cryptokitties", "rito": "rito", "ethys": "ethereum-stake", "setc": "setc", "ptn": "palletone", "bsov": "bitcoinsov", "swt": "swarm-city", "xmg": "magi", "etg": "ethereum-gold", "renbch": "renbch", "fast": "fastswap", "emd": "emerald-crypto", "cato": "catocoin", "scex": "scex", "tix": "blocktix", "flot": "fire-lotto", "jamm": "flynnjamm", "beet": "beetle-coin", "svx": "savix", "gofi": "goswapp", "ken": "keysians-network", "pria": "pria", "shake": "spaceswap-shake", "senc": "sentinel-chain", "img": "imagecoin", "mbn": "membrana-platform", "mdg": "midas-gold", "mec": "megacoin", "yuki": "yuki-coin", "ugc": "ugchain", "deb": "debitum-network", "zcr": "zcore", "senpai": "project-senpai", "dws": "dws", "pwr": "powercoin", "trnd": "trendering", "peng": "penguin", "sbnb": "sbnb", "lync": "lync-network", "swing": "swing", "ehrt": "eight-hours", "ethbn": "etherbone", "alex": "alex", "tcc": "the-champcoin", "arq": "arqma", "tmt": "traxia", "bits": "bitstar", "bear": "arcane-bear", "cmct": "crowd-machine", "chop": "porkchop", "almx": "almace-shards", "priv": "privcy", "esk": "eska", "dem": "deutsche-emark", "tch": "tigercash", "tcore": "tornadocore", "kobo": "kobocoin", "kennel": "token-kennel", "sct": "clash-token", "sds": "alchemint", "orcl5": "oracle-top-5", "sishi": "sishi-finance", "pch": "popchain", "eve": "devery", "alley": "nft-alley", "slr": "solarcoin", "haut": "hauteclere-shards-2", "snrg": "synergy", "yfte": "yftether", "defo": "defhold", "wqt": "work-quest", "bez": "bezop", "ecoin": "ecoin-2", "women": "womencoin", "rvt": "rivetz", "wck": "wrapped-cryptokitties", "pipl": "piplcoin", "syc": "synchrolife", "tsl": "energo", "mintme": "webchain", "myb": "mybit-token", "lid": "liquidity-dividends-protocol", "cheese": "cheese", "$rope": "rope", "undg": "unidexgas", "gem": "cargo-gems", "tbx": "tokenbox", "bth": "bithereum", "tcash": "tcash", "fors": "foresight", "1up": "uptrennd", "amm": "micromoney", "pop": "popularcoin", "bitt": "bittoken", "vsl": "vslice", "amz": "amazonacoin", "horus": "horuspay", "flp": "gameflip", "aem": "atheneum", "undb": "unibot-cash", "dogown": "dog-owner", "nbc": "niobium-coin", "pkg": "pkg-token", "ntbc": "note-blockchain", "fsxu": "flashx-ultra", "type": "typerium", "quin": "quinads", "shdw": "shadow-token", "kfx": "knoxfs", "quan": "quantis", "bnty": "bounty0x", "ff": "forefront", "1mt": "1million-token", "ngot": "ngot", "trk": "truckcoin", "a": "alpha-platform", "pc": "promotionchain", "ppdex": "pepedex", "reb2": "rebased", "peps": "pepegold", "gin": "gincoin", "bcpt": "blockmason-credit-protocol", "ziot": "ziot", "vgw": "vegawallet-token", "tdp": "truedeck", "pho": "photon", "wfil": "wrapped-filecoin", "r3fi": "r3fi-finance", "x8x": "x8-project", "ppy": "peerplays", "yfd": "yfdfi-finance", "nfxc": "nfx-coin", "cob": "cobinhood", "mwbtc": "metawhale-btc", "lot": "lukki-operating-token", "bloc": "blockcloud", "kmpl": "kiloample", "mon": "moneybyte", "ifex": "interfinex-bills", "steep": "steepcoin", "candy": "skull-candy-shards", "cbx": "bullion", "kp4r": "keep4r", "orme": "ormeuscoin", "hippo": "hippo-finance", "sins": "safeinsure", "arnx": "aeron", "svd": "savedroid", "rpt": "rug-proof", "mcash": "midas-cash", "swagg": "swagg-network", "fud": "fudfinance", "stu": "bitjob", "swift": "swiftcash", "kgc": "krypton-token", "uunicly": "unicly-genesis-collection", "martk": "martkist", "corx": "corionx", "knt": "kora-network", "ukg": "unikoin-gold", "ore": "oreo", "ntrn": "neutron", "daiq": "daiquilibrium", "cxn": "cxn-network", "sxmr": "sxmr", "topb": "topb", "berry": "rentberry", "cred": "verify", "gbcr": "gold-bcr", "scap": "safecapital", "genix": "genix", "mol": "molten", "metm": "metamorph", "mntp": "goldmint", "insn": "insanecoin", "crc": "crycash", "2give": "2give", "chl": "challengedac", "pte": "peet-defi", "bouts": "boutspro", "glox": "glox-finance", "aced": "aced", "shuf": "shuffle-monster", "wiki": "wiki-token", "shrmp": "shrimp-capital", "smol": "smol", "axiav3": "axia", "hndc": "hondaiscoin", "itl": "italian-lira", "ecte": "eurocoinpay", "neva": "nevacoin", "baepay": "baepay", "civ": "civitas", "adi": "aditus", "vtd": "variable-time-dollar", "swiss": "swiss-finance", "bbo": "bigbom-eco", "sergs": "sergs", "plt": "plutus-defi", "ipl": "insurepal", "avs": "algovest", "thrt": "thrive", "mxt": "martexcoin", "scb": "spacecowboy", "space": "spacecoin", "mash": "masternet", "wtt": "giga-watt-token", "tig": "tigereum", "fr": "freedom-reserve", "bsd": "bitsend", "tie": "ties-network", "evil": "evil-coin", "mss": "monster-cash-share", "skym": "soar", "bon": "bonpay", "yfbeta": "yfbeta", "iut": "mvg-token", "jan": "coinjanitor", "seq": "sequence", "com": "community-token", "btct": "bitcoin-token", "ags": "aegis", "bbs": "bbscoin", "rfctr": "reflector-finance", "syn": "synlev", "lkn": "linkcoin-token", "wvg0": "wrapped-virgin-gen-0-cryptokitties", "pokelon": "pokelon-finance", "scriv": "scriv", "btcv": "bitcoinv", "pyrk": "pyrk", "tit": "titcoin", "labo": "the-lab-finance", "got": "gonetwork", "inve": "intervalue", "first": "harrison-first", "arms": "2acoin", "delta": "deltachain", "vlu": "valuto", "btw": "bitwhite", "rehab": "nft-rehab", "vls": "veles", "yfdot": "yearn-finance-dot", "bgtt": "baguette-token", "crypt": "cryptcoin", "vsx": "vsync", "rex": "rex", "jigg": "jiggly-finance", "ablx": "able", "dex": "alphadex", "lcp": "litecoin-plus", "cgi": "coinshares-gold-and-cryptoassets-index-lite", "yun": "yunex", "kind": "kind-ads-token", "skin": "skincoin", "ytn": "yenten", "mooi": "moonai", "tob": "tokens-of-babel", "wdp": "waterdrop", "yfbt": "yearn-finance-bit", "xbi": "bitcoin-incognito", "ynk": "yoink", "mixs": "streamix", "tic": "thingschain", "opal": "opal", "dln": "delion", "esh": "switch", "scr": "scorum", "croat": "croat", "bboo": "panda-yield", "dcntr": "decentrahub-coin", "karma": "karma-dao", "ad": "asian-dragon", "inx": "inmax", "mchc": "mch-coin", "hlix": "helix", "cen": "coinsuper-ecosystem-network", "anon": "anon", "kwh": "kwhcoin", "horse": "ethorse", "bugs": "starbugs-shards", "wrc": "worldcore", "ffyi": "fiscus-fyi", "bern": "berncash", "veco": "veco", "kash": "kids-cash", "xjo": "joulecoin", "etgp": "ethereum-gold-project", "help": "help-token", "bse": "buy-sell", "bt": "bt-finance", "ali": "ailink-token", "yfox": "yfox-finance", "yui": "yui-hinata", "ecash": "ethereum-cash", "ben": "bitcoen", "atb": "atbcoin", "team": "team-finance", "obee": "obee-network", "cps": "capricoin", "shmn": "stronghands-masternode", "etnx": "electronero", "xta": "italo", "xkr": "kryptokrona", "rpc": "ronpaulcoin", "cyl": "crystal-token", "pgo": "pengolincoin", "jem": "jem", "yffi": "yffi-finance", "mfc": "mfcoin", "cjt": "connectjob", "medibit": "medibit", "aro": "arionum", "yfpi": "yearn-finance-passive-income", "dogy": "dogeyield", "vlo": "velo-token", "gun": "guncoin", "bro": "bitradio", "hur": "hurify", "tgame": "truegame", "kubo": "kubocoin", "smoon": "swiftmoon", "fota": "fortuna", "pux": "polypux", "dfx": "definitex", "mcc": "multicoincasino", "crad": "cryptoads-marketplace", "lana": "lanacoin", "gcn": "gcn-coin", "sbs": "staysbase", "xuez": "xuez", "emrals": "emrals", "mcp": "my-crypto-play", "ltb": "litebar", "c2c": "ctc", "ezy": "eazy", "ird": "iridium", "tkp": "tokpie", "boli": "bolivarcoin", "deep": "deepcloud-ai", "aib": "advanced-internet-block", "tri": "trinity-protocol", "tok": "tokok", "ella": "ellaism", "may": "theresa-may-coin", "btcn": "bitcoinote", "yamv2": "yam-v2", "cymt": "cybermusic", "gup": "matchpool", "edrc": "edrcoin", "cpu": "cpuchain", "raise": "hero-token", "sxtz": "sxtz", "enol": "ethanol", "naruto2": "naruto-bsc", "bonk": "bonk-token", "ig": "igtoken", "abs": "absolute", "chc": "chaincoin", "fess": "fess-chain", "sat": "sphere-social", "eltcoin": "eltcoin", "drm": "dreamcoin", "bznt": "bezant", "vaultz": "vaultz", "imgc": "imagecash", "xco": "xcoin", "gtm": "gentarium", "kiwi": "kiwi-token", "rntb": "bitrent", "juice": "moon-juice", "etgf": "etg-finance", "kts": "klimatas", "fsbt": "forty-seven-bank", "sur": "suretly", "adz": "adzcoin", "bta": "bata", "sno": "savenode", "wgo": "wavesgo", "cherry": "cherry", "medic": "medic-coin", "prix": "privatix", "xgox": "xgox", "nzl": "zealium", "usdq": "usdq", "dvs": "davies", "duo": "duo", "prx": "proxynode", "rigel": "rigel-finance", "npc": "npcoin", "chiefs": "kansas-city-chiefs-win-super-bowl", "gcg": "gulf-coin-gold", "ctrt": "cryptrust", "rugz": "rugz", "ace": "tokenstars-ace", "arion": "arion", "cpr": "cipher", "mst": "mustangcoin", "bzx": "bitcoin-zero", "swipp": "swipp", "boat": "boat", "hqt": "hyperquant", "araw": "araw-token", "hb": "heartbout", "deex": "deex", "$noob": "noob-finance", "pomac": "poma", "xos": "oasis-2", "bcz": "bitcoin-cz", "vikky": "vikkytoken", "dfs": "digital-fantasy-sports", "dtrc": "datarius-cryptobank", "rupx": "rupaya", "tmn": "ttanslateme-network-token", "yffs": "yffs", "lbtc": "litebitcoin", "lnc": "blocklancer", "pfarm": "farm-defi", "zzzv2": "zzz-finance-v2", "taj": "tajcoin", "genx": "genesis-network", "arepa": "arepacoin", "jump": "jumpcoin", "cof": "coffeecoin", "boxx": "boxx", "zfl": "zedxe", "arm": "armours", "gic": "giant", "war": "yieldwars-com", "coke": "cocaine-cowboy-shards", "apr": "apr-coin", "dmb": "digital-money-bits", "glt": "globaltoken", "mar": "mchain", "desh": "decash", "toto": "tourist-token", "yfuel": "yfuel", "datp": "decentralized-asset-trading-platform", "mac": "machinecoin", "strng": "stronghold", "nrve": "narrative", "havy": "havy-2", "cnct": "connect", "seal": "seal-finance", "nice": "nice", "2x2": "2x2", "imp": "ether-kingdoms-token", "bsds": "basis-dollar-share", "btcred": "bitcoin-red", "gsr": "geysercoin", "obr": "obr", "pkb": "parkbyte", "vgr": "voyager", "yfsi": "yfscience", "klks": "kalkulus", "mat": "bitsum", "actp": "archetypal-network", "aqua": "aquachain", "paws": "paws-funds", "dp": "digitalprice", "info": "infocoin", "rto": "arto", "pfr": "payfair", "ethplo": "ethplode", "estx": "oryxcoin", "audax": "audax", "stak": "straks", "note": "dnotes", "drip": "dripper-finance", "noodle": "noodle-finance", "milf": "milfies", "nat": "natmin-pure-escrow", "xstar": "starcurve", "cdm": "condominium", "jiaozi": "jiaozi", "sove": "soverain", "dalc": "dalecoin", "ctsc": "cts-coin", "yfid": "yfidapp", "ftxt": "futurax", "kema": "kemacoin", "tour": "touriva", "xd": "scroll-token", "infx": "influxcoin", "arb": "arbit", "impl": "impleum", "ams": "amsterdamcoin", "gst": "game-stars", "pnx": "phantomx", "arct": "arbitragect", "kydc": "know-your-developer", "kgs": "kingscoin", "dbet": "decentbet", "wbt": "whalesburg", "gtx": "goaltime-n", "cash2": "cash2", "shb": "skyhub", "joon": "joon", "asa": "asura", "snd": "snodecoin", "xgcs": "xgalaxy", "bm": "bitcomo", "aus": "australia-cash", "kwatt": "4new", "care": "carebit", "gxx": "gravitycoin", "sinoc": "sinoc", "nyx": "nyxcoin", "ethm": "ethereum-meta", "yfrb": "yfrb-finance", "joint": "joint", "braz": "brazio", "lno": "livenodes", "dtc": "datacoin", "itt": "intelligent-trading-tech", "burn": "blockburn", "arco": "aquariuscoin", "ntr": "netrum", "sierra": "sierracoin", "epc": "experiencecoin", "bold": "boldman-capital", "lud": "ludos", "wtl": "welltrado", "sas": "stand-share", "paxex": "paxex", "klon": "klondike-finance", "bit": "bitmoney", "nrp": "neural-protocol", "guess": "peerguess", "gdr": "guider", "osina": "osina", "bacon": "baconswap", "sfcp": "sf-capital", "swyftt": "swyft", "dow": "dowcoin", "zoc": "01coin", "exo": "exosis", "jbx": "jboxcoin", "znd": "zenad", "zyon": "bitzyon", "mexp": "moji-experience-points", "cou": "couchain", "cow": "cowry", "tux": "tuxcoin", "ulg": "ultragate", "bloody": "bloody-token", "hydro": "hydro", "herb": "herbalist-token", "stream": "streamit-coin", "uffyi": "unlimited-fiscusfyi", "house": "toast-finance", "litb": "lightbit", "mftu": "mainstream-for-the-underground", "neet": "neetcoin", "rise": "rise-protocol", "bsgs": "basis-gold-share", "chan": "chancoin", "reex": "reecore", "rle": "rich-lab-token", "wcoinbase-iou": "deus-synthetic-coinbase-iou", "xap": "apollon", "distx": "distx", "tsd": "true-seigniorage-dollar", "ztc": "zent-cash", "fntb": "fintab", "kmx": "kimex", "intu": "intucoin", "dashg": "dash-green", "aet": "aerotoken", "mnp": "mnpcoin", "goss": "gossipcoin", "hodl": "hodlcoin", "jmc": "junsonmingchancoin", "eny": "emergency-coin", "xczm": "xavander-coin", "ibtc": "ibtc", "nyb": "new-year-bull", "kkc": "primestone", "xsr": "sucrecoin", "apc": "alpha-coin", "dxo": "dextro", "sdash": "sdash", "tds": "tokendesk", "cct": "crystal-clear", "ucn": "uchain", "exn": "exchangen", "ylc": "yolo-cash", "agu": "agouti", "guard": "guardium", "vivid": "vivid", "rank": "rank-token", "wtr": "water-token-2", "arc": "arcticcoin", "din": "dinero", "blry": "billarycoin", "eld": "electrum-dark", "btcb": "bitcoinbrand", "clc": "caluracoin", "zzz": "zzz-finance", "abet": "altbet", "sdusd": "sdusd", "hlx": "hilux", "scsx": "secure-cash", "labx": "stakinglab", "gali": "galilel", "aias": "aiascoin", "btcui": "bitcoin-unicorn", "roco": "roiyal-coin", "abst": "abitshadow-token", "cco": "ccore", "spe": "bitcoin-w-spectrum", "gfn": "game-fanz", "js": "javascript-token", "sac": "stand-cash", "azum": "azuma-coin", "bul": "bulleon", "payx": "paypex", "yieldx": "yieldx", "mynt": "mynt", "better": "better-money", "cnmc": "cryptonodes", "orm": "orium", "mano": "mano-coin", "kaaso": "kaaso", "oot": "utrum", "varius": "varius", "exus": "exus-coin", "quot": "quotation-coin", "mbgl": "mobit-global", "chtc": "cryptohashtank-coin", "crcl": "crowdclassic", "fsd": "freq-set-dollar", "ary": "block-array", "bkx": "bankex", "beverage": "beverage", "kec": "keyco", "orox": "cointorox", "saros": "saros", "faith": "faithcoin", "het": "havethertoken", "lms": "lumos", "bdcash": "bigdata-cash", "clg": "collegicoin", "dgm": "digimoney", "polar": "polaris", "swc": "scanetchain", "ssx": "stakeshare", "wllo": "willowcoin", "voise": "voise", "brix": "brixcoin", "nbxc": "nibbleclassic", "ixrp": "ixrp", "kreds": "kreds", "dice": "dice-finance", "idefi": "idefi", "bost": "boostcoin", "404": "404", "sms": "speed-mining-service", "real": "real", "evi": "evimeria", "mek": "meraki", "yffc": "yffc-finance", "aer": "aeryus", "bds": "borderless", "ixtz": "ixtz", "atl": "atlant", "zla": "zilla", "lux": "luxcoin", "ebtc": "ebitcoin", "voco": "provoco", "pirl": "pirl", "idash": "idash", "arg": "argentum", "bze": "bzedge", "smc": "smartcoin", "icex": "icex", "pcn": "peepcoin", "cstl": "cstl", "up": "uptoken", "xki": "ki", "cc": "cryptocart", "vbt": "vbt", "p2p": "p2p-network", "mrv": "mrv", "ubu": "ubu-finance", "mp3": "mp3", "h3x": "h3x", "cpt": "cryptaur", "yes": "yes", "zos": "zos", "dbx": "dbx-2", "lif": "winding-tree", "3xt": "3xt", "mox": "mox", "dad": "decentralized-advertising", "7up": "7up", "ucx": "ucx-foundation", "sfb": "sfb", "fme": "fme", "zin": "zin", "tenfi": "ten", "eft": "eft", "htm": "htm", "lbk": "legal-block", "tvt": "tvt", "520": "520", "1ai": "1ai", "hex": "hex", "eox": "eox", "wal": "wal", "b26": "b26", "pop!": "pop", "day": "chronologic", "kvi": "kvi", "mex": "mex", "idk": "idk", "lvx": "level01-derivatives-exchange", "hdt": "hdt", "mvl": "mass-vehicle-ledger", "mp4": "mp4", "owl": "owl-token", "olo": "olo", "xtp": "tap", "aos": "aos", "die": "die", "ize": "ize", "bgt": "bgt", "vey": "vey", "lcg": "lcg", "iab": "iab", "rxc": "rxc", "onot": "ono", "ecc": "ecc", "zyx": "zyx", "sov": "sovereign-coin", "rug": "rug", "ges": "ges", "yas": "yas", "sun": "sun-token", "zom": "zoom-protocol", "gya": "gya", "yup": "yup", "msn": "msn", "tmc": "tmc-niftygotchi", "lbrl": "lbrl", "sti": "stib-token", "bsys": "bsys", "roc": "roxe", "ln": "link", "biki": "biki", "artx": "artx", "zinc": "zinc", "vybe": "vybe", "alis": "alis", "dray": "dray", "pofi": "pofi", "bora": "bora", "apix": "apix", "pick": "pick", "maro": "ttc-protocol", "xels": "xels", "novo": "novo", "n0031": "ntoken0031", "wav3": "wav3", "camp": "camp", "crow": "crow-token", "prot": "prostarter-token", "yfia": "yfia", "xank": "xank", "plg": "pledgecamp", "cook": "cook", "kupp": "kupp", "olcf": "olcf", "lynx": "lynx", "abbc": "alibabacoin", "ympl": "ympl", "weth": "weth", "azu": "azus", "thx": "thorenext", "sren": "sren", "arix": "arix", "gtc": "global-trust-coin", "ieos": "ieos", "lyfe": "lyfe", "asla": "asla", "qcad": "qcad", "enx": "enex", "sefi": "sefi", "vivo": "vivo", "lze": "lyze", "bidr": "binanceidr", "bcat": "bcat", "elya": "elya", "usdl": "usdl", "whey": "whey", "tosc": "t-os", "pica": "pica", "amix": "amix", "teat": "teal", "xtrm": "xtrm", "vndc": "vndc", "sdot": "sdot", "moac": "moac", "gr": "grom", "donu": "donu", "arx": "arcs", "acdc": "volt", "punk": "punk", "xfii": "xfii", "psrs": "psrs", "plex": "plex", "foin": "foincoin", "g999": "g999", "olxa": "olxa", "mogx": "mogu", "mute": "mute", "post": "postcoin", "xrune": "rune", "r64x": "r64x", "efin": "efin", "idot": "idot", "qusd": "qusd-stablecoin", "aeon": "aeon", "asta": "asta", "bitz": "bitz", "nova": "nova", "vidy": "vidy", "waxe": "waxe", "cspc": "chinese-shopping-platform", "trbo": "turbostake", "mini": "mini", "pika": "pikachu", "yfet": "yfet", "gasp": "gasp", "zpr": "zper", "glex": "glex", "dsys": "dsys", "ndau": "ndau", "frat": "frat", "cmdx": "cmdx", "chbt": "chbt", "yce": "myce", "b360": "b360", "sg20": "sg20", "hype": "hype-finance", "pryz": "pryz", "etor": "etor", "ruc": "rush", "suni": "suniswap", "gold": "digital-gold-token", "sbet": "sbet", "s4f": "s4fe", "koto": "koto", "nftb": "nftb", "ioex": "ioex", "fil6": "filecoin-iou", "aly": "ally", "kala": "kala", "vvsp": "vvsp", "hope": "hope-token", "cez": "cezo", "tun": "tune", "sono": "sonocoin", "vspy": "vspy", "iron": "iron-stablecoin", "dogz": "dogz", "ibnb": "ibnb", "xdai": "xdai", "afro": "afro", "bolt": "thunderbolt", "lucy": "lucy", "xls": "elis", "mass": "mass", "nilu": "nilu", "xfit": "xfit", "arke": "arke", "utip": "utip", "gmb": "gamb", "reth": "reth", "bnbc": "bnbc", "zeon": "zeon", "musk": "musk", "hapi": "hapi", "vera": "vera", "bu": "bumo", "ng": "ngin", "bare": "bare", "bpop": "bpop", "bast": "bast", "ers": "eros", "420x": "420x", "mymn": "mymn", "agt": "aisf", "iten": "iten", "redi": "redi", "rfis": "rfis", "peos": "peos", "boid": "boid", "dtmi": "dtmi", "usda": "usda", "many": "manyswap", "tugz": "tugz", "scrv": "scrv", "aeur": "aeur", "ston": "ston", "joys": "joys", "sltc": "sltc", "seer": "seer", "taxi": "taxi", "tena": "tena", "ymax": "ymax", "obic": "obic", "xbnta": "xbnt", "soge": "soge", "pway": "pway", "dmme": "dmme-app", "ntm": "netm", "wbx": "wibx", "noku": "noku", "amis": "amis", "zyro": "zyro", "xtrd": "xtrade", "iote": "iote", "swop": "swop", "exor": "exor", "r34p": "r34p", "miss": "miss", "rccc": "rccc", "attn": "attn", "wise": "wise-token11", "benz": "benz", "oryx": "oryx", "evan": "evan", "lucky": "lucky-2", "myu": "myubi", "mks": "makes", "cvl": "civil", "vix": "vixco", "rfbtc": "rfbtc", "grain": "grain-token", "akn": "akoin", "upbnb": "upbnb", "basic": "basic", "twist": "twist", "vinci": "vinci", "acryl": "acryl", "modex": "modex", "em": "eminer", "tools": "tools", "viper": "viper", "tor": "torchain", "rlx": "relax-protocol", "trybe": "trybe", "seed": "seedswap-token", "rup": "rupee", "point": "point", "slnv2": "slnv2", "byts": "bytus", "pando": "pando", "krex": "kronn", "ing": "iungo", "merge": "merge", "usdex": "usdex-2", "cvr": "polkacover", "tower": "tower", "raku": "rakun", "apn": "apron", "sbe": "sombe", "xknca": "xknca", "posh": "shill", "ybusd": "ybusd", "gena": "genta", "franc": "franc", "hve2": "uhive", "amon": "amond", "xkncb": "xkncb", "ilg": "ilgon", "dlike": "dlike", "dxiot": "dxiot", "blast": "safeblast", "atp": "atlas-protocol", "antr": "antra", "yummy": "yummy", "altom": "altcommunity-coin", "znko": "zenko", "aloha": "aloha", "vmr": "vomer", "plut": "pluto", "vesta": "vesta", "bid": "blockidcoin", "ox": "orcax", "mts": "mtblock", "husky": "husky", "imusd": "imusd", "acoin": "acoin", "defla": "defla", "ibank": "ibank", "mooni": "mooni", "lc": "lightningcoin", "klt": "klend", "emoj": "emoji", "uno": "unobtanium", "sop": "sopay", "seele": "seele", "vso": "verso", "eurxb": "eurxb", "imbtc": "the-tokenized-bitcoin", "zwx": "ziwax", "atmos": "atmos", "fla": "fiola", "ccomp": "ccomp", "ikomp": "ikomp", "fma": "flama", "clt": "coinloan", "xgm": "defis", "bliss": "bliss-2", "ean": "eanto", "fo": "fibos", "gig": "gigecoin", "elons": "elons", "ehash": "ehash", "flap": "flapp", "omega": "omega", "axl": "axial", "hlo": "helio", "sar": "saren", "bion": "biido", "yusra": "yusra", "kcash": "kcash", "aunit": "aunit", "gapt": "gaptt", "omb": "ombre", "p2pg": "p2pgo", "eidos": "eidos", "ram": "ramifi", "blurt": "blurt", "lex": "elxis", "egold": "egold", "myo": "mycro-ico", "lkk": "lykke", "spok": "spock", "$aapl": "aapl", "ptd": "pilot", "hdi": "heidi", "sld": "safelaunchpad", "bud": "buddy", "qob": "qobit", "pitch": "pitch", "cdex": "codex", "vld": "valid", "memex": "memex", "sheng": "sheng", "fil12": "fil12", "carat": "carat", "xazab": "xazab", "temco": "temco", "wco": "winco", "jvz": "jiviz", "gof": "golff", "xin": "infinity-economics", "asimi": "asimi", "grimm": "grimm", "bitsz": "bitsz", "trism": "trism", "stonk": "stonk", "xpo": "x-power-chain", "atd": "atd", "amr": "ammbr", "ysr": "ystar", "scash": "scash", "xax": "artax", "haz": "hazza", "burnx": "burnx", "sts": "sbank", "ecu": "decurian", "xfe": "feirm", "byron": "bitcoin-cure", "ifarm": "ifarm", "alb": "albos", "mri": "mirai", "eql": "equal", "samzn": "samzn", "hplus": "hplus", "btr": "bitrue-token", "voltz": "voltz", "snflx": "snflx", "tks": "tokes", "xen": "xenon-2", "manna": "manna", "ifx24": "ifx24", "fleta": "fleta", "xra": "ratecoin", "sls": "salus", "april": "april", "cyb": "cybex", "mla": "moola", "aico": "aicon", "saave": "saave", "ovi": "oviex", "digex": "digex", "bubo": "budbo", "xtx": "xtock", "ksk": "kskin", "joy": "joy-coin", "cprop": "cprop", "xnc": "xenios", "pizza": "pizzaswap", "zch": "zilchess", "xeuro": "xeuro", "swace": "swace", "clam": "clams", "xnode": "xnode", "zlp": "zuplo", "ytusd": "ytusd", "con": "converter-finance", "xhd": "xrphd", "vidyx": "vidyx", "morc": "dynamic-supply", "knv": "kanva", "qc": "qovar-coin", "br34p": "br34p", "ipfst": "ipfst", "dudgx": "dudgx", "spt": "spectrum", "mnguz": "mangu", "piasa": "piasa", "veth2": "veth2", "earnx": "earnx", "ferma": "ferma", "vnx": "venox", "kxusd": "kxusd", "senso": "senso", "alphr": "alphr", "tur": "turex", "rkn": "rakon", "peach": "peach", "funjo": "funjo", "unify": "unify", "keyt": "rebit", "cms": "comsa", "paper": "paper", "oks": "okschain", "pzm": "prizm", "libfx": "libfx", "topia": "topia", "tsr": "tesra", "srune": "srune", "mozox": "mozox", "mvr": "mavro", "nsg": "nasgo", "sklay": "sklay", "seeds": "seeds", "kvnt": "kvant", "fx1": "fanzy", "tlr": "taler", "xsp": "xswap", "pgpay": "puregold-token", "atx": "aston", "xfuel": "xfuel", "xsnxa": "xsnx", "visio": "visio", "sem": "semux", "clout": "blockclout", "toz": "tozex", "az": "azbit", "dby": "dobuy", "sgoog": "sgoog", "scomp": "scomp", "lunes": "lunes", "tup": "tenup", "xmark": "xmark", "stamp": "stamp", "pazzy": "pazzy", "jwl": "jewel", "bulls": "bulls", "crave": "crave", "utrin": "utrin", "miami": "miami", "bxiot": "bxiot", "lgbtq": "pride", "tro": "tro-network", "xfg": "fango", "blood": "blood", "ct": "communitytoken", "dfnd": "dfund", "hatch": "hatch-dao", "keyfi": "keyfi", "wolfy": "wolfy", "steel": "steel", "bsha3": "bsha3", "u": "ucoin", "revt": "revolt", "renfil": "renfil", "bay": "bitbay", "ivi": "inoovi", "sbt": "solbit", "zag": "zigzag", "sic": "sicash", "zdr": "zloadr", "lev": "lever-network", "ecob": "ecobit", "att": "africa-trading-chain", "10set": "tenset", "ama": "mrweb-finance", "r3t": "rock3t", "me": "all-me", "xaavea": "xaavea", "xab": "abosom", "ilc": "ilcoin", "yfo": "yfione", "cwap": "defire", "yooshi": "yooshi", "polyfi": "polyfi", "qi": "qiswap", "gneiss": "gneiss", "kue": "kuende", "clx": "celeum", "rfx": "reflex", "r2r": "citios", "kam": "bitkam", "pgf7t": "pgf500", "dogira": "dogira", "rich": "richway-finance", "wix": "wixlar", "sanc": "sancoj", "inn": "innova", "erc223": "erc223", "i0c": "i0coin", "uzz": "azuras", "s1inch": "s1inch", "ett": "efficient-transaction-token", "ntvrk": "netvrk", "dgn": "degen-protocol", "mns": "monnos", "zoa": "zotova", "coup": "coupit", "xce": "cerium", "tem": "temtem", "bsy": "bestay", "ubin": "ubiner", "iqq": "iqoniq", "oft": "orient", "nux": "peanut", "scribe": "scribe", "fnd": "fundum", "xincha": "xincha", "jmt": "jmtime", "ebst": "eboost", "kzc": "kzcash", "sprink": "sprink", "hpx": "hupayx", "fai": "fairum", "kabosu": "kabosu", "onit": "onbuff", "cby": "cberry", "roz": "rozeus", "fit": "financial-investment-token", "tofy": "toffee", "stm": "stream", "cir": "circleswap", "bstx": "blastx", "cntx": "centex", "pcatv3": "pcatv3", "jui": "juiice", "dtep": "decoin", "tlo": "talleo", "xsh": "shield", "nlm": "nuclum", "hgro": "helgro", "bst": "bitsten-token", "rno": "snapparazzi", "kiro": "kirobo", "aapx": "ampnet", "vsn": "vision-network", "wtm": "waytom", "xhi": "hicoin", "rhegic": "rhegic", "a5t": "alpha5", "alg": "bitalgo", "mdu": "mdu", "rabbit": "rabbit", "eauric": "eauric", "xlt": "nexalt", "oct": "oraclechain", "ilk": "inlock-token", "sxi": "safexi", "melody": "melody", "ket": "rowket", "xditto": "xditto", "meowth": "meowth", "uponly": "uponly", "xqr": "qredit", "xdag": "dagger", "nbu": "nimbus", "octa": "octans", "cbt": "cryptocurrency-business-token", "whx": "whitex", "naft": "nafter", "wbpc": "buypay", "swamp": "swamp-coin", "gaze": "gazetv", "dhv": "dehive", "bep": "blucon", "donk": "donkey", "hdp.\u0444": "hedpay", "zcx": "unizen", "fdn": "fundin", "ras": "raksur", "alu": "altura", "cso": "crespo", "tara": "taraxa", "rnx": "roonex", "mct": "master-contract-token", "redbux": "redbux", "ktt": "k-tune", "pixeos": "pixeos", "kel": "kelvpn", "orb": "orbitcoin", "kicks": "sessia", "gxi": "genexi", "hbx": "habits", "ceds": "cedars", "dka": "dkargo", "lib": "banklife", "qrn": "qureno", "trdx": "trodex", "ipm": "timers", "azzr": "azzure", "lotdog": "lotdog", "bfx": "bitfex", "htmoon": "htmoon", "gom": "gomics", "awo": "aiwork", "bpx": "bispex", "egcc": "engine", "dexm": "dexmex", "egx": "eaglex", "ame": "amepay", "lemd": "lemond", "jntr/e": "jntre", "str": "staker", "qmc": "qmcoin", "zlw": "zelwin", "usg": "usgold", "pteria": "pteria", "cod": "codemy", "aquari": "aquari", "mmon": "mommon", "sead": "seadex", "mor": "morcrypto-coin", "oneeth": "oneeth", "shorty": "shorty", "aka": "akroma", "exg": "exgold", "djv": "dejave", "sfn": "strains", "perl": "perlin", "ocul": "oculor", "mdm": "medium", "acu": "aitheon", "upshib": "upshib", "incnt": "incent", "azx": "azeusx", "agol": "algoil", "dms": "documentchain", "hd": "hubdao", "mgx": "margix", "co2b": "co2bit", "boo": "spookyswap", "wynaut": "wynaut", "xaaveb": "xaaveb", "yoc": "yocoin", "skrp": "skraps", "mnm": "mineum", "in": "incoin", "dfni": "defini", "rblx": "rublix", "dxf": "dexfin", "toko": "toko", "fpt": "finple", "pat": "patron", "wok": "webloc", "koduro": "koduro", "tewken": "tewken", "qoob": "qoober", "dbt": "datbit", "raux": "ercaux", "2goshi": "2goshi", "trat": "tratok", "strn": "saturn-classic-dao-token", "dusa": "medusa", "arcona": "arcona", "orfano": "orfano", "dcore": "decore", "uted": "united-token", "paa": "palace", "arteon": "arteon", "uis": "unitus", "bdx": "beldex", "uco": "uniris", "echt": "e-chat", "strk": "strike", "dacs": "dacsee", "vyn": "vyndao", "mag": "maggie", "evr": "everus", "yco": "y-coin", "gsfy": "gasify", "ign": "ignite", "xym": "symbol", "ec": "eternal-cash", "ttr": "tetris", "dmx": "dymmax", "anct": "anchor", "ebk": "ebakus", "bdk": "bidesk", "lcnt": "lucent", "vii": "7chain", "omm": "omcoin", "nt": "nexdax", "brtr": "barter", "bri": "baroin", "dxr": "dexter", "zdc": "zodiac", "min": "mindol", "vbswap": "vbswap", "stri": "strite", "dctd": "dctdao", "spg": "super-gold", "efk": "refork", "byt": "byzbit", "merl": "merlin", "xinchb": "xinchb", "vancat": "vancat", "was": "wasder", "levelg": "levelg", "prstx": "presto", "dsr": "desire", "sfr": "safari", "nlx": "nullex", "dsgn": "design", "drk": "drakoin", "gunthy": "gunthy", "apx": "appics", "sefa": "mesefa", "btp": "bitcoin-pay", "rpzx": "rapidz", "prkl": "perkle", "yac": "yacoin", "dns": "bitdns", "zcor": "zrocor", "heal": "etheal", "waf": "waffle", "mimo": "mimosa", "lhcoin": "lhcoin", "nkc": "nework", "usd1": "psyche", "xsc": "xscoin", "nii": "nahmii", "bceo": "bitceo", "crb": "cribnb", "pan": "panvala-pan", "tyc": "tycoon", "entone": "entone", "kk": "kkcoin", "glf": "gallery-finance", "onebtc": "onebtc", "gmr": "gmr-finance", "usnbt": "nubits", "degens": "degens", "moneta": "moneta", "jll": "jllone", "hfi": "hecofi", "sconex": "sconex", "gfce": "gforce", "dbnk": "debunk", "xbtg": "bitgem", "flty": "fluity", "s8": "super8", "fzy": "frenzy", "dess": "dessfi", "clv": "clover-finance", "sgb": "subgame", "quo": "vulcano", "hmr": "homeros", "jindoge": "jindoge", "ohmc": "ohm-coin", "pqt": "prediqt", "rhegic2": "rhegic2", "lthn": "intensecoin", "cid": "cryptid", "tek": "tekcoin", "fml": "formula", "ebase": "eurbase", "vltm": "voltium", "psy": "psychic", "poocoin": "poocoin", "cnx": "cryptonex", "iti": "iticoin", "gpt": "grace-period-token", "xnb": "xeonbit", "xbg": "bitgrin", "ril": "rilcoin", "m": "m-chain", "xyz": "jetmint", "rzb": "rizubot", "hal": "halcyon", "b2c": "b2-coin", "lmo": "lumeneo", "gbt": "gulf-bits-coin", "unos": "unoswap", "bim": "bimcoin", "kyan": "kyanite", "kaiinu": "kai-inu", "betxc": "betxoin", "arts": "artista", "xf": "xfarmer", "tfd": "etf-dao", "safesun": "safesun", "mb": "microchain", "dion": "dionpay", "bnode": "beenode", "v": "version", "vnl": "vanilla", "ork": "orakuru", "pcm": "precium", "pbl": "publica", "asy": "asyagro", "buy": "burency", "dkyc": "datakyc", "mdtk": "mdtoken", "tronish": "tronish", "fra": "findora", "crfi": "crossfi", "mepad": "memepad", "ape": "apecoin", "zik": "zik-token", "bly": "blocery", "bignite": "bignite", "lkt": "lukutex", "pshp": "payship", "rx": "raven-x", "sjw": "sjwcoin", "addy": "adamant", "twee": "tweebaa", "vtar": "vantaur", "vash": "vpncoin", "cpz": "cashpay", "brat": "brother", "ausc": "auscoin", "rlz": "relianz", "land": "new-landbox", "roo": "roocoin", "halv": "halving-coin", "ccxx": "counosx", "vgc": "5g-cash", "fat": "tronfamily", "i9c": "i9-coin", "qtcon": "quiztok", "imu": "imusify", "clb": "clbcoin", "swin": "swinate", "hitx": "hithotx", "moochii": "moochii", "pm": "pomskey", "cha": "chaucha", "mttcoin": "mttcoin", "bitc": "bitcash", "youc": "youcash", "dvx": "derivex", "eeth": "eos-eth", "mnr": "mineral", "scl": "sociall", "yok": "yokcoin", "celc": "celcoin", "lar": "linkart", "vana": "nirvana", "ptr": "payturn", "mkey": "medikey", "kfc": "chicken", "xat": "shareat", "xmv": "monerov", "xxa": "ixinium", "sto": "storeum", "sola": "solarys", "wasp": "wanswap", "x-token": "x-token", "wsote": "soteria", "onevbtc": "onevbtc", "linkusd": "linkusd", "peer": "unilord", "gsm": "gsmcoin", "sfm": "sfmoney", "flexusd": "flex-usd", "kuv": "kuverit", "biop": "biopset", "mimatic": "mimatic", "psb": "pesobit", "zwap": "zilswap", "zny": "bitzeny", "bscb": "bscbond", "wdx": "wordlex", "bnp": "benepit", "onewing": "onewing", "tlw": "tilwiki", "hawk": "hawkdex", "xes": "proxeus", "oto": "otocash", "chrt": "charity", "taud": "trueaud", "onigiri": "onigiri", "dmc": "decentralized-mining-exchange", "mouse": "mouse", "xiro": "xiropht", "igg": "ig-gold", "cura": "curadai", "dch": "doch-coin", "torpedo": "torpedo", "befx": "belifex", "wfx": "webflix", "torm": "thorium", "sxc": "simplexchain", "mak": "makcoin", "gadoshi": "gadoshi", "sap": "swaap-stablecoin", "wyx": "woyager", "baxs": "boxaxis", "pgs": "pegasus", "csp": "caspian", "fn": "filenet", "pamp": "pamp-network", "dogedao": "dogedao", "winr": "justbet", "si14": "si14bet", "tgbp": "truegbp", "news": "cryptonewsnet", "afrox": "afrodex", "maxgoat": "maxgoat", "lyra": "scrypta", "opc": "op-coin", "smdx": "somidax", "ix": "x-block", "bnk": "bankera", "cyfm": "cyberfm", "vbit": "valobit", "eag": "ea-coin", "nyex": "nyerium", "mql": "miraqle", "xov": "xov", "prvs": "previse", "888": "octocoin", "wxc": "wiix-coin", "ala": "aladiex", "xemx": "xeniumx", "ibh": "ibithub", "tat": "tatcoin", "mel": "caramelswap", "tkmn": "tokemon", "pmeer": "qitmeer", "fnax": "fnaticx", "exp": "exchange-payment-coin", "mpay": "menapay", "bgc": "be-gaming-coin", "bonfire": "bonfire", "fk": "fk-coin", "ardx": "ardcoin", "lc4": "leocoin", "pusd": "pegsusd", "sum": "sumcoin", "ethp": "ethplus", "bn": "bitnorm", "xph": "phantom", "trcl": "treecle", "boob": "boobank", "fnsp": "finswap", "mpt": "metal-packaging-token", "btrn": "biotron", "ubomb": "unibomb", "bscgold": "bscgold", "prv": "privacyswap", "clu": "clucoin", "ktc": "kitcoin", "vro": "veraone", "bte": "btecoin", "bup": "buildup", "btkc": "beautyk", "buz": "buzcoin", "wire": "wire", "prophet": "prophet", "laq": "laq-pay", "gems": "safegem", "btcm": "btcmoon", "aby": "artbyte", "seko": "sekopay", "lhb": "lendhub", "palg": "palgold", "mapc": "mapcoin", "rap": "rapture", "aglt": "agrolot", "msb": "magic-e-stock", "7e": "7eleven", "xcz": "xchainz", "tlc": "tl-coin", "meowcat": "meowcat", "dswap": "definex", "fey": "feyorra", "klee": "kleekai", "sup8eme": "sup8eme", "ttt": "the-transfer-token", "digi": "digible", "gzro": "gravity", "eum": "elitium", "the": "the-node", "nug": "nuggets", "thkd": "truehkd", "shrm": "shrooms", "safebtc": "safebtc", "tcfx": "tcbcoin", "bdo": "bdollar", "ecp": "ecp-technology", "bfic": "bficoin", "o3": "o3-swap", "komp": "kompass", "bono": "bonorum-coin", "won": "weblock", "axnt": "axentro", "net": "netcoin", "mora": "meliora", "yot": "payyoda", "cctc": "cctcoin", "mnmc": "mnmcoin", "satoz": "satozhi", "ctl": "citadel", "deq": "dequant", "300": "spartan", "erotica": "erotica-2", "moonpaw": "moonpaw", "bafe": "bafe-io", "c3": "charli3", "tcgcoin": "tcgcoin", "mesh": "meshbox", "zdx": "zer-dex", "bist": "bistroo", "ael": "aelysir", "xscr": "securus", "enu": "enumivo", "ift": "iftoken", "wenb": "wenburn", "caj": "cajutel", "slds": "solidus", "yplt": "yplutus", "shroud": "shroud-protocol", "spike": "spiking", "pt": "predict", "zum": "zum-token", "gaj": "polygaj", "yay": "yayswap", "jdc": "jd-coin", "ntx": "nitroex", "ree": "reecoin", "jar": "jarvis", "tty": "trinity", "wntr": "weentar", "ube": "ubeswap", "ufarm": "unifarm", "pkt": "playkey", "rech": "rechain", "aba": "ecoball", "kurt": "kurrent", "mlm": "mktcoin", "sprts": "sprouts", "rebound": "rebound", "chat": "beechat", "our": "our-pay", "cmg": "cmgcoin", "kian": "kianite", "dfo": "defiato", "kal": "kaleido", "gaia": "gaiadao", "pzap": "polyzap", "dgmt": "digimax", "fnk": "funkeypay", "sdgo": "sandego", "nax": "nextdao", "swat": "swtcoin", "rrc": "rrspace", "safeeth": "safeeth", "htc": "hitcoin", "ogx": "organix", "ents": "eunomia", "bin": "binarium", "x0z": "zerozed", "pyn": "paycent", "w3b": "w3bpush", "bool": "boolean", "ekt": "educare", "cop": "copiosa", "bixcpro": "bixcpro", "mndao": "moondao", "tshp": "12ships", "ugd": "unigrid", "nld": "newland", "gps": "triffic", "coi": "coinnec", "trop": "interop", "xfyi": "xcredit", "don": "donnie-finance", "locg": "locgame", "onelink": "onelink", "ddm": "ddmcoin", "ath": "atheios", "b2b": "b2bcoin-2", "odex": "one-dex", "dxh": "daxhund", "wcx": "wecoown", "bni": "betnomi-2", "avn": "avantage", "btv": "bitvote", "tag": "tagcoin-erc20", "tdi": "tedesis", "trbt": "tribute", "bliq": "bliquid", "marks": "bitmark", "hamtaro": "hamtaro", "rtk": "ruletka", "trm": "tranium", "sam": "samurai", "trl": "trolite", "peth18c": "peth18c", "some": "mixsome", "btsg": "bitsong", "vspacex": "vspacex", "btrm": "betrium", "gfun": "goldfund-ico", "fch": "fanaticos-cash", "omniunit": "omniunit", "spiz": "space-iz", "ctt": "castweet", "tinv": "tinville", "eds": "endorsit", "xmm": "momentum", "pok": "poker-io", "snft": "seedswap", "dgw": "digiwill", "char": "charitas", "ddtg": "davecoin", "big": "thebigcoin", "tuna": "tunacoin", "nole": "nolecoin", "jrex": "jurasaur", "club": "clubcoin", "akc": "akikcoin", "pxi": "prime-xi", "bbt": "blockbase", "ixt": "insurex", "ino": "ino-coin", "dgl": "dgl-coin", "yep": "yep-coin", "mbud": "moon-bud", "nuko": "nekonium", "safemusk": "safemusk", "ytv": "ytv-coin", "vrap": "veraswap", "agn": "agricoin", "amo": "amo", "lby": "libonomy", "polystar": "polystar", "llt": "lifeline", "hana": "hanacoin", "txc": "tenxcoin", "timec": "time-coin", "foxd": "foxdcoin", "lion": "lion-token", "topc": "topchain", "bsc": "bitsonic-token", "mbs": "micro-blood-science", "lvn": "livenpay", "csx": "coinstox", "nsfw": "xxxnifty", "kok": "kok-coin", "poke": "pokeball", "b2g": "bitcoiin", "fraction": "fraction", "vlk": "vulkania", "pti": "paytomat", "scol": "scolcoin", "zuc": "zeuxcoin", "torro": "bittorro", "meet": "coinmeet", "drops": "defidrop", "mkcy": "markaccy", "pxg": "playgame", "glass": "ourglass", "plat": "bitguild", "rvmt": "rivemont", "qbz": "queenbee", "dogemoon": "dogemoon", "isal": "isalcoin", "trex": "trexcoin", "sym": "symverse", "bag": "bondappetit-gov-token", "polymoon": "polymoon", "morph": "morphose", "safenami": "safenami", "slrm": "solareum", "nan": "nantrade", "ntrs": "nosturis", "nsr": "nushares", "blvr": "believer", "lips": "lipchain", "eswa": "easyswap", "kali": "kalicoin", "bsp": "ballswap", "trix": "triumphx", "nia": "nia-token", "homi": "homihelp", "song": "songcoin", "xln": "lunarium", "ivn": "investin", "moonshot": "moonshot", "ap3": "ap3-town", "srnt": "serenity", "eggplant": "eggplant", "loge": "lunadoge", "neex": "neexstar", "alh": "allohash", "bca": "bitcoin-atom", "pnl": "true-pnl", "ea": "ea-token", "fomp": "fompound", "fren": "frenchie", "wpt": "worldpet", "bln": "blacknet", "weed": "weedcash", "ftn": "fountain", "yda": "yadacoin", "tagr": "tagrcoin", "amkr": "aave-mkr-v1", "saferune": "saferune", "elongate": "elongate", "vn": "vice-network", "safebank": "safebank", "dxc": "dex-trade-coin", "cim": "coincome", "ocb": "blockmax", "gasg": "gasgains", "zne": "zonecoin", "bigo": "bigo-token", "tacocat": "taco-cat", "jobs": "jobscoin", "saga": "sagacoin", "fll": "feellike", "riskmoon": "riskmoon", "ple": "plethori", "mne": "minereum", "miro": "mirocana", "btcl": "btc-lite", "nicheman": "nicheman", "metamoon": "metamoon", "cadc": "cad-coin", "pure": "puriever", "shih": "shih-tzu", "nawa": "narwhale", "enk": "enkronos", "goc": "eligma", "lime": "limeswap", "tatm": "tron-atm", "xrp-bf2": "xrp-bep2", "ri": "ri-token", "guap": "guapcoin", "xgk": "goldkash", "leaf": "leafcoin", "daft": "daftcoin", "hdao": "hyperdao", "pos": "pos-coin", "rdct": "rdctoken", "stol": "stabinol", "18c": "block-18", "szc": "zugacoin", "taste": "tastenft", "botx": "botxcoin", "bwt": "bittwatt", "moonstar": "moonstar", "ecoc": "ecochain", "dfk": "defiking", "znc": "zioncoin", "runes": "runebase", "bpp": "bitpower", "mnd": "mindcoin", "wtip": "worktips", "wage": "philscurrency", "mxw": "maxonrow", "job": "jobchain", "tv": "ti-value", "catz": "catzcoin", "cats": "catscoin", "alr": "alacrity", "treat": "treatdao", "mig": "migranet", "lxmt": "luxurium", "pswap": "polkaswap", "bshiba": "bscshiba", "ziti": "ziticoin", "log": "woodcoin", "mmda": "pokerain", "lvl": "levelapp", "bizz": "bizzcoin", "wdf": "wildfire", "bnw": "nagaswap", "hotdoge": "hot-doge", "art": "maecenas", "bela": "belacoin", "bkkg": "biokkoin", "meetone": "meetone", "plf": "playfuel", "swaps": "nftswaps", "bnv": "benative", "dyx": "xcoinpay", "graph": "unigraph", "lst": "lendroid-support-token", "eva": "eva-coin", "icol": "icolcoin", "gze": "gazecoin", "bcna": "bitcanna", "ic": "ignition", "owdt": "oduwausd", "gpu": "gpu-coin", "api": "the-apis", "gict": "gictrade", "tpad": "trustpad", "lol": "emogi-network", "jrc": "finchain", "bnana": "banana-token", "ethpy": "etherpay", "safestar": "safestar", "glxm": "galaxium", "marx": "marxcoin", "usdf": "new-usdf", "mrch": "merchdao", "kva": "kevacoin", "gram": "gram", "bio": "biocrypt", "cross": "crosspad", "mes": "meschain", "vip": "limitless-vip", "lf": "linkflow", "ayfi": "ayfi", "nvc": "novacoin", "vlm": "valireum", "trad": "tradcoin", "bios": "bios", "coom": "coomcoin", "tep": "tepleton", "ltg": "litegold", "0xmr": "0xmonero", "uty": "unitydao", "nmt": "novadefi", "abat": "aave-bat-v1", "bpcn": "blipcoin", "noa": "noa-play", "cmit": "cmitcoin", "hburn": "hypeburn", "pdex": "polkadex", "palt": "palchain", "swsh": "swapship", "chee": "cheecoin", "nemo": "nemocoin", "path": "pathfund", "shit": "shitcoin-token", "sng": "sinergia", "moonmoon": "moonmoon", "rice": "riceswap", "nort": "northern", "bucks": "swagbucks", "sine": "sinelock", "inrt": "inrtoken", "starship": "starship", "aenj": "aave-enj-v1", "hta": "historia", "gldy": "buzzshow", "nvzn": "invizion", "asnx": "aave-snx-v1", "adai": "aave-dai-v1", "edgt": "edgecoin-2", "izi": "izichain", "btcx": "bitcoinx-2", "prdz": "predictz", "stash": "bitstash-marketplace", "xind": "indinode", "hca": "harcomia", "kdag": "kdag", "solarite": "solarite", "bfl": "bitflate", "yfim": "yfimobi", "sapp": "sappchain", "mo": "morality", "aren": "aave-ren-v1", "tarm": "armtoken", "isr": "insureum", "ogods": "gotogods", "ttc": "thetimeschaincoin", "mowl": "moon-owl", "xgs": "genesisx", "oxo": "oxo-farm", "opnn": "opennity", "cirq": "cirquity", "xbs": "bitstake", "vns": "va-na-su", "btshk": "bitshark", "moto": "motocoin", "libertas": "libertas-token", "auop": "opalcoin", "alp": "alp-coin", "sme": "safememe", "zyn": "zynecoin", "i9x": "i9x-coin", "pcl": "peculium", "prime": "primedao", "xqn": "quotient", "shibapup": "shibapup", "xblzd": "blizzard", "dhd": "dhd-coin", "aim": "ai-mining", "tar": "tartarus", "zpay": "zantepay", "eti": "etherinc", "prtcle": "particle-2", "b2u": "b2u-coin", "ijc": "ijascoin", "slc": "support-listing-coin", "aswap": "arbiswap", "sh": "super-hero", "yts": "yetiswap", "ndn": "ndn-link", "moonarch": "moonarch", "stpc": "starplay", "ants": "fireants", "adl": "adelphoi", "myfi": "myfichain", "gton": "graviton", "erowan": "sifchain", "airx": "aircoins", "black": "blackhole-protocol", "wit": "witchain", "tkm": "thinkium", "mojo": "moonjuice", "vela": "vela", "exmr": "exmr-monero", "defy": "defy-farm", "guss": "guss-one", "qbit": "project-quantum", "bith": "bithachi", "payb": "paybswap", "cx": "circleex", "bee": "bee-coin", "apes": "apehaven", "crox": "croxswap", "blowf": "blowfish", "cqt": "covalent", "prs": "pressone", "bell": "bellcoin", "ragna": "ragnarok", "gldx": "goldnero", "koko": "kokoswap", "rnb": "rentible", "lpl": "linkpool", "aht": "ahatoken", "bmj": "bmj-master-nodes", "pact": "packswap", "bcx": "bitcoinx", "mbonk": "megabonk", "aknc": "aave-knc-v1", "ape$": "ape-punk", "mci": "mci-coin", "ubn": "ubricoin", "busy": "busy-dao", "foge": "fat-doge", "aya": "aryacoin", "gom2": "gomoney2", "ebsc": "earlybsc", "mbbased": "moonbase", "fly": "franklin", "fastmoon": "fastmoon", "plbt": "polybius", "wenlambo": "wenlambo", "safecock": "safecock", "azrx": "aave-zrx-v1", "windy": "windswap", "wiz1": "wiz-coin", "yfr": "youforia", "tnr": "tonestra", "pine": "pinecoin", "safezone": "safezone", "orly": "orlycoin", "syl": "xsl-labs", "nss": "nss-coin", "gix": "goldfinx", "pinke": "pinkelon", "hpot": "hash-pot", "trusd": "trustusd", "hl": "hl-chain", "hibs": "hiblocks", "100x": "100x-coin", "naz": "naz-coin", "upl": "uploadea", "disk": "darklisk", "hypebet": "hype-bet", "bsn": "bastonet", "html": "htmlcoin", "zg": "zg", "svn": "7finance", "trp": "tronipay", "uca": "uca", "npo": "npo-coin", "trn": "tronnodes", "pvg": "pilnette", "tmed": "mdsquare", "blu": "bluecoin", "izer": "izeroium", "mvh": "moviecash", "cxp": "caixa-pay", "safelight": "safelight", "amsk": "nolewater", "nmst": "nms-token", "cnt": "centurion", "wpp": "wpp-token", "iai": "iai-token", "nuvo": "nuvo-cash", "dph": "digipharm", "xamp": "antiample", "cbr": "cybercoin", "asn": "ascension", "yfiig": "yfii-gold", "gc": "galaxy-wallet", "tree": "tree-defi", "carr": "carnomaly", "sdao": "singularitydao", "flunar": "fairlunar", "light": "lightning-protocol", "scurve": "lp-scurve", "mbm": "mbm-token", "lbt": "lbt-chain", "611": "sixeleven", "grg": "rigoblock", "dpc": "dappcents", "ons": "one-share", "yap": "yap-stone", "dynge": "dyngecoin", "mnx": "nodetrade", "minty": "minty-art", "bots": "bot-ocean", "pxl": "piction-network", "hmnc": "humancoin-2", "twi": "trade-win", "vxc": "vinx-coin", "pgc": "pegascoin", "glov": "glovecoin", "egc": "ecog9coin", "bun": "bunnycoin", "stb": "starblock", "au": "aurumcoin", "apis": "apis-coin", "starsb": "star-shib", "pwrb": "powerbalt", "lgold": "lyfe-gold", "odc": "odinycoin", "rld": "real-land", "whl": "whaleroom", "ausdc": "aave-usdc-v1", "curry": "curryswap", "orbi": "orbicular", "x2p": "xenon-pay", "corgi": "corgi-inu", "love": "love-coin", "moonstorm": "moonstorm", "safeorbit": "safeorbit", "kashh": "kashhcoin", "newton": "newtonium", "eost": "eos-trust", "uniusd": "unidollar", "dbtc": "decentralized-bitcoin", "safermoon": "safermoon", "gbk": "goldblock", "mcau": "meld-gold", "jind": "jindo-inu", "intx": "intexcoin", "rth": "rutheneum", "swet": "swe-token", "ycurve": "curve-fi-ydai-yusdc-yusdt-ytusd", "ezpay": "eazypayza", "xpb": "transmute", "fullsend": "full-send", "erz": "earnzcoin", "toki": "tokyo-inu", "dfgl": "defi-gold", "mch": "meme-cash", "nokn": "nokencoin", "uba": "unbox-art", "bmh": "blockmesh-2", "ltk": "litecoin-token", "zash": "zimbocash", "fomo": "fomo-labs", "entrc": "entercoin", "mgc": "magnachain", "gera": "gera-coin", "dfc": "deflacash", "vega": "vega-coin", "rtm": "raptoreum", "fcr": "fromm-car", "awbtc": "aave-wbtc-v1", "ba": "batorrent", "lir": "letitride", "apet": "ape-token", "bnz": "bonezyard", "scu": "securypto", "ez": "easyfi", "bbank": "blockbank", "lv": "lendchain", "cock": "shibacock", "shpp": "shipitpro", "laika": "laikacoin", "flc": "flowchaincoin", "vdai": "venus-dai", "bchc": "bitcherry", "silk": "silkchain", "pazzi": "paparazzi", "nanox": "project-x", "lsh": "leasehold", "omc": "ormeus-cash", "eto": "essek-tov", "mytv": "mytvchain", "safecomet": "safecomet", "yfe": "yfe-money", "gdm": "goldmoney", "ani": "anime-token", "safetesla": "safetesla", "ksc": "kstarcoin", "betc": "bet-chips", "etx": "ethereumx", "pbs": "pbs-chain", "dna": "metaverse-dualchain-network-architecture", "atusd": "aave-tusd-v1", "ecos": "ecodollar", "psix": "propersix", "etit": "etitanium", "darthelon": "darthelon", "lburst": "loanburst", "xbe": "xbe-token", "hint": "hintchain", "skc": "skinchain", "mtp": "multiplay", "dream": "dreamscoin", "dlx": "dapplinks", "hfil": "huobi-fil", "pdao": "panda-dao", "vusd": "value-usd", "fyznft": "fyznft", "hxy": "hex-money", "unft": "ultra-nft", "ramen": "ramenswap", "happy": "happycoin", "tls": "tls-token", "coshi": "coshi-inu", "bitci": "bitcicoin", "spaz": "swapcoinz", "btzc": "beatzcoin", "candybox": "candy-box", "safepluto": "safepluto", "dsc": "data-saver-coin", "hurricane": "hurricane", "sdfi": "stingdefi", "lama": "llamaswap", "nter": "nter", "jdi": "jdi-token", "psk": "pool-of-stake", "ete": "ethercoin-2", "bns": "bns-token", "pvm": "privateum", "crt": "carr-finance", "limit": "limitswap", "cell": "cellframe", "hua": "chihuahua", "curve": "curvehash", "pdai": "prime-dai", "pbase": "polkabase", "safeearth": "safeearth", "safelogic": "safelogic", "hntc": "hntc-energy-distributed-network", "pass": "passport-finance", "tbc": "terablock", "kanda": "telokanda", "xwc": "whitecoin", "koel": "koel-coin", "vect": "vectorium", "bxt": "bitfxt-coin", "pivxl": "pivx-lite", "vdot": "venus-dot", "it": "idc-token", "slv": "silverway", "skn": "sharkcoin", "rpepe": "rare-pepe", "chess": "chesscoin-0-32", "thrn": "thorncoin", "hoo": "hoo-token", "beast": "beast-dao", "niu": "niubiswap", "btcr": "bitcurate", "solo": "solo-coin", "tea": "tea-token", "exm": "exmo-coin", "vest": "vestchain", "rew": "rewardiqa", "qtf": "quantfury", "cls": "coldstack", "vsxp": "venus-sxp", "ryiu": "ryi-unity", "now": "changenow-token", "esti": "easticoin", "bash": "luckchain", "gmci": "game-city", "gsmt": "grafsound", "honk": "honk-honk", "save": "savetheworld", "ume": "ume-token", "zoot": "zoo-token", "sendwhale": "sendwhale", "4art": "4artechnologies", "gift": "gift-coin", "bolc": "boliecoin", "opti": "optitoken", "lemo": "lemochain", "ball": "ball-coin", "crm": "cream", "mbit": "mbitbooks", "ret": "realtract", "dexa": "dexa-coin", "cach": "cachecoin", "sfg": "s-finance", "tno": "tnos-coin", "pton": "foresting", "qbc": "quebecoin", "dgp": "dgpayment", "lov": "lovechain", "vany": "vanywhere", "fsp": "flashswap", "ouro": "ouroboros", "clm": "coinclaim", "abc": "abc-chain", "forex": "forexcoin", "fldt": "fairyland", "vlt": "bankroll-vault", "vltc": "venus-ltc", "supdog": "superdoge", "ara": "ara-token", "xby": "xtrabytes", "kick": "kickico", "agvc": "agavecoin", "hnzo": "hanzo-inu", "pegs": "pegshares", "nana": "ape-tools", "safetoken": "safetoken", "vjc": "venjocoin", "bxh": "bxh", "hss": "hashshare", "awg": "aurusgold", "creva": "crevacoin", "grlc": "garlicoin", "c8": "carboneum", "fuzz": "fuzzballs", "fex": "fidex-exchange", "pump": "pump-coin", "nar": "nar-token", "sloth": "slothcoin", "paddy": "paddycoin", "bspay": "brosispay", "bito": "bito-coin", "asusd": "aave-susd-v1", "crd": "cryptaldash", "drgb": "dragonbit", "ich": "ideachain", "lfc": "linfinity", "rover": "rover-inu", "bct": "bitcoin-trust", "tzt": "tanzanite", "gator": "alligator-fractal-set", "hotcross": "hot-cross", "torq": "torq-coin", "mic3": "mousecoin", "krill": "polywhale", "alink": "aave-link-v1", "okt": "okexchain", "gol": "gogolcoin", "ims": "ims-wallet", "pluto": "plutopepe", "cbrl": "cryptobrl", "sybc": "sybc-coin", "duk+": "dukascoin", "bbx": "ballotbox", "gre": "greencoin", "ick": "ick-mask", "newos": "newstoken", "vnt": "inventoryclub", "lbet": "lemon-bet", "asac": "asac-coin", "eubc": "eub-chain", "stxem": "stakedxem", "lmch": "latamcash", "polyshiba": "polyshiba", "mptc": "mnpostree", "ecl": "eclipseum", "1gold": "1irstgold", "bitb": "bitcoin-bull", "repo": "repo", "more": "legends-room", "xtnc": "xtendcash", "dfi": "defichain", "scs": "speedcash", "thr": "thorecoin", "vfil": "venus-fil", "idl": "idl-token", "nnb": "nnb-token", "ank": "apple-network", "abusd": "aave-busd-v1", "coal": "coalculus", "vestx": "vestxcoin", "ponzi": "ponzicoin", "dkkt": "dkk-token", "amana": "aave-mana-v1", "eqz": "equalizer", "bali": "balicoin", "bak": "baconcoin", "agri": "agrinovuscoin", "latte": "latteswap", "mtcn": "multiven", "fsafe": "fair-safe", "vxrp": "venus-xrp", "arnxm": "armor-nxm", "vbch": "venus-bch", "hypr": "hyperburn", "city": "city-coin", "hvt": "hirevibes", "lland": "lyfe-land", "cbet": "cryptobet", "7add": "holdtowin", "xrge": "rougecoin", "tcr": "tecracoin", "sec": "smilecoin", "hejj": "hedge4-ai", "naut": "astronaut", "$king": "king-swap", "bgl": "bitgesell", "ns": "nodestats", "luck": "lady-luck", "dappx": "dappstore", "2248": "2-2-4-4-8", "rc20": "robocalls", "payt": "payaccept", "nsd": "nasdacoin", "layerx": "unilayerx", "miks": "miks-coin", "clbk": "cloudbric", "akita": "akita-inu", "hapy": "hapy-coin", "slf": "solarfare", "ltz": "litecoinz", "mw": "mirror-world-token", "capp": "crypto-application-token", "pocc": "poc-chain", "argp": "argenpeso", "rrb": "renrenbit", "blfi": "blackfisk", "ira": "deligence", "loto": "lotoblock", "tkinu": "tsuki-inu", "bazt": "baooka-token", "mntt": "moontrust", "stxym": "stakedxym", "deal": "idealcash", "hpy": "hyper-pay", "ship": "shipchain", "hgh": "hgh-token", "tknt": "tkn-token", "tco": "tcoin-fun", "mzg": "moozicore", "shd": "shardingdao", "bixb": "bixb-coin", "trump": "trumpcoin", "moontoken": "moontoken", "maya": "maya-coin", "eland": "etherland", "lbd": "linkbased", "bp": "bunnypark", "andes": "andes-coin", "isdt": "istardust", "hebe": "hebeblock", "vgtg": "vgtgtoken", "dic": "daikicoin", "eplus": "epluscoin", "wtn": "waletoken", "eswap": "eswapping", "honey": "honeycomb-2", "ato": "eautocoin", "zupi": "zupi-coin", "qnc": "qnodecoin", "bna": "bananatok", "hlp": "help-coin", "spdx": "spender-x", "kuky": "kuky-star", "cpx": "coinxclub", "hub": "minter-hub", "vxvs": "venus-xvs", "sports": "zensports", "bravo": "bravo-coin", "kong": "kong-defi", "fgc": "fantasy-gold", "kishu": "kishu-inu", "evy": "everycoin", "mochi": "mochiswap", "ausdt": "aave-usdt-v1", "bamboo": "bamboo-token-2", "homt": "hom-token", "pcb": "451pcbcom", "navy": "boatpilot", "nplc": "plus-coin", "vt": "vectoraic", "fmt": "finminity", "stro": "supertron", "btym": "blocktyme", "jfin": "jfin-coin", "vbtc": "venus-btc", "mswap": "moneyswap", "poll": "clearpoll", "bnx": "bnx", "spk": "sparks", "mvc": "mileverse", "bnc": "bnoincoin", "aab": "aax-token", "fastx": "transfast", "xscp": "scopecoin", "xwo": "wooshcoin-io", "acsi": "acryptosi", "xtg": "xtg-world", "fox": "fox-finance", "long": "long-coin", "inst": "instadapp", "eup": "eup-chain", "wifi": "wifi-coin", "ultra": "ultrasafe", "boltt": "boltt-coin", "pfid": "pofid-dao", "tdps": "tradeplus", "stc": "coinstarter", "btnt": "bitnautic", "lce": "lance-coin", "vegi": "veggiecoin", "bmch": "bmeme-cash", "tgn": "terragreen", "fundx": "funder-one", "bab": "basis-bond", "c4t": "coin4trade", "vdoge": "venus-doge", "rope": "rope-token", "phiba": "papa-shiba", "fuze": "fuze-token", "mad": "mad-network", "ogc": "onegetcoin", "bff": "bitcoffeen", "ybear": "yield-bear", "gp": "goldpieces", "kfi": "klever-finance", "nxl": "next-level", "yea": "yeafinance", "crl": "coral-farm", "dvc": "dragonvein", "pod": "payment-coin", "cyberd": "cyber-doge", "sprtz": "spritzcoin", "plc": "platincoin", "wdt": "voda-token", "jt": "jubi-token", "tokc": "tokyo", "blinky": "blinky-bob", "bynd": "beyondcoin", "lnko": "lnko-token", "beer": "beer-money", "uze": "uze-token", "jic": "joorschain", "sovi": "sovi-token", "bwx": "blue-whale", "cennz": "centrality", "gpkr": "gold-poker", "bmt": "bmchain-token", "rwn": "rowan-coin", "ivy": "ivy-mining", "lbr": "liber-coin", "bec": "betherchip", "phn": "phillionex", "ebsp": "ebsp-token", "robet": "robet-coin", "flt": "fluttercoin", "deva": "deva-token", "ping": "cryptoping", "snoge": "snoop-doge", "szo": "shuttleone", "hum": "humanscape", "kim": "king-money", "g-fi": "gorilla-fi", "bnox": "blocknotex", "micro": "micromines", "bkita": "baby-akita", "doos": "doos-token", "echo": "token-echo", "yta": "yottacoin", "garuda": "garudaswap", "fto": "futurocoin", "sets": "sensitrust", "qtv": "quish-coin", "stfiro": "stakehound", "moonpirate": "moonpirate", "dtube": "dtube-coin", "nac": "nami-trade", "noahark": "noah-ark", "pmp": "pumpy-farm", "stlp": "tulip-seed", "undo": "undo-token", "noiz": "noiz-chain", "kt": "kuaitoken", "hora": "hora", "btsucn": "btsunicorn", "invc": "investcoin", "spup": "spurt-plus", "bhiba": "baby-shiba", "dnc": "danat-coin", "cbex": "cryptobexchange", "cp3r": "compounder", "gero": "gerowallet", "konj": "konjungate", "grn": "dascoin", "rview": "reviewbase", "dscp": "disciplina-project-by-teachmeplease", "oc": "oceanchain", "las": "alaska-inu", "gcx": "germancoin", "trv": "trustverse", "evny": "evny-token", "ggive": "globalgive", "pxc": "phoenixcoin", "ethsc": "ethereumsc", "vlc": "valuechain", "chs": "chainsquare", "eurx": "etoro-euro", "bhd": "bitcoin-hd", "hedg": "hedgetrade", "smoo": "sheeshmoon", "safecookie": "safecookie", "soba": "soba-token", "arcee": "arcee-coin", "gnt": "greentrust", "bsg": "bitsonic-gas", "baby": "baby-token", "kiz": "kizunacoin", "smartworth": "smartworth", "shibm": "shiba-moon", "fl": "freeliquid", "ncat": "nyan-cat", "petal": "bitflowers", "dandy": "dandy", "hgc": "higamecoin", "rupee": "hyruleswap", "coic": "coic", "lof": "lonelyfans", "espro": "esportspro", "mob": "mobilecoin", "when": "when-token", "kub": "bitkub-coin", "vsc": "vsportcoin", "spirit": "spiritswap", "hart": "hara-token", "levl": "levolution", "zcnox": "zcnox-coin", "osc": "oasis-city", "yfis": "yfiscurity", "lvh": "lovehearts", "rocket": "rocketgame", "xpt": "cryptobuyer-token", "colx": "colossuscoinxt", "stkr": "staker-dao", "bcnt": "bincentive", "brze": "breezecoin", "mima": "kyc-crypto", "mbc": "microbitcoin", "feta": "feta-token", "uvu": "ccuniverse", "bgo": "bingo-cash", "cyf": "cy-finance", "milk": "score-milk", "yfmb": "yfmoonbeam", "ctc": "culture-ticket-chain", "tuber": "tokentuber", "usds": "stableusd", "expo": "online-expo", "vbusd": "venus-busd", "rcube": "retro-defi", "ain": "ai-network", "olive": "olivecash", "vusdc": "venus-usdc", "ltfg": "lightforge", "dtop": "dhedge-top-index", "crex": "crex-token", "gm": "gmcoin", "gb": "goldblocks", "vusdt": "venus-usdt", "vprc": "vaperscoin", "she": "shinechain", "erc": "europecoin", "safegalaxy": "safegalaxy", "stt": "scatter-cx", "spacedoge": "space-doge", "mexc": "mexc-token", "hungry": "hungrybear", "soda": "soda-token", "hcs": "help-coins", "argo": "argo", "rmoon": "rocketmoon", "icr": "intercrone", "cosm": "cosmo-coin", "sox": "ethersocks", "cntm": "connectome", "shark": "polyshark-finance", "zlf": "zillionlife", "rzn": "rizen-coin", "fmta": "fundamenta", "ykz": "yakuza-dao", "ecpn": "ecpntoken", "drep": "drep-new", "ist": "ishop-token", "carbo": "carbondefi", "nftl": "nftl-token", "mcf": "moon-chain", "ski": "skillchain", "cnyt": "cny-tether", "nva": "neeva-defi", "slam": "slam-token", "mfy": "mifty-swap", "spring": "springrole", "chex": "chex-token", "dmch": "darma-cash", "cfl": "cryptoflow", "udai": "unagii-dai", "escx": "escx-token", "csm": "consentium", "xbrt": "bitrewards", "cng": "cng-casino", "fscc": "fisco", "enrg": "energycoin", "soil": "synth-soil", "sswim": "shiba-swim", "crn": "chronocoin", "speed": "speed-coin", "jack": "jack-token", "cvxcrv": "convex-crv", "cron": "cryptocean", "ltn": "life-token", "mongocm": "mongo-coin", "ffa": "cryptofifa", "kgw": "kawanggawa", "divo": "divo-token", "harta": "harta-tech", "scorgi": "spacecorgi", "alm": "allium-finance", "rain": "rain-network", "gio": "graviocoin", "hyp": "hyperstake", "qhc": "qchi-chain", "comfy": "comfytoken", "itam": "itam-games", "icicb": "icicb-coin", "iown": "iown", "fotc": "forte-coin", "refraction": "refraction", "sabaka inu": "sabaka-inu", "wdr": "wider-coin", "sg": "social-good-project", "dogg": "dogg-token", "xpn": "pantheon-x", "grow": "growing-fi", "elama": "elamachain", "csc": "casinocoin", "db": "darkbuild-v2", "jaguar": "jaguarswap", "daa": "double-ace", "willie": "williecoin", "ntb": "tokenasset", "zest": "thar-token", "lrg": "largo-coin", "usdh": "honestcoin", "tsx": "tradestars", "tons": "thisoption", "akm": "cost-coin", "roe": "rover-coin", "ctcn": "contracoin", "snowge": "snowgecoin", "lstr": "meetluna", "ktv": "kmushicoin", "brcp": "brcp-token", "zaif": "zaif-token", "elet": "ether-legends", "elt": "elite-swap", "tronx": "tronx-coin", "euru": "upper-euro", "ueth": "unagii-eth", "tune": "tune-token", "cent": "centercoin", "ygoat": "yield-goat", "usdb": "usd-bancor", "lowb": "loser-coin", "yfms": "yfmoonshot", "brmv": "brmv-token", "aca": "acash-coin", "co2": "collective", "vx": "vitex", "webn": "web-innovation-ph", "dapp": "dapp", "safeicarus": "safelcarus", "sv7": "7plus-coin", "grw": "growthcoin", "cmm": "commercium", "dac": "davinci-coin", "scm": "simulacrum", "carbon": "carboncoin", "cl": "coinlancer", "robo": "robo-token", "nacho": "nacho-coin", "pkoin": "pocketcoin", "ddr": "digi-dinar", "kxc": "kingxchain", "sanshu": "sanshu-inu", "mgp": "mangochain", "cicc": "caica-coin", "os76": "osmiumcoin", "dogefather": "dogefather", "trib": "contribute", "bsocial": "banksocial", "sos": "solstarter", "chiba": "cate-shiba", "nah": "strayacoin", "hshiba": "huskyshiba", "jgn": "juggernaut", "hptf": "heptafranc", "xrd": "raven-dark", "shico": "shibacorgi", "syfi": "soft-yearn", "clr": "color", "xno": "xeno-token", "torj": "torj-world", "zarh": "zarcash", "tavitt": "tavittcoin", "soak": "soak-token", "sugar": "sugarchain", "quickchart": "quickchart", "basid": "basid-coin", "tiim": "triipmiles", "$g": "gooddollar", "beluga": "belugaswap", "bkk": "bkex-token", "ucos": "ucos-token", "polt": "polkatrain", "ami": "ammyi-coin", "btcbam": "bitcoinbam", "qac": "quasarcoin", "yland": "yearn-land", "bicas": "bithercash", "sdog": "small-doge", "coral": "coral-swap", "cleanocean": "cleanocean", "usdsp": "usd-sports", "bnfi": "blaze-defi", "jcc": "junca-cash", "cyt": "cryptokenz", "frmx": "frmx-token", "vbeth": "venus-beth", "tvnt": "travelnote", "dt3": "dreamteam3", "roul": "roul-token", "tking": "tiger-king", "dain": "dain-token", "vlink": "venus-link", "ypanda": "yieldpanda", "yfi3": "yfi3-money", "dili": "d-community", "jshiba": "jomon-shiba", "zeus": "zuescrowdfunding", "gly": "glyph-token", "party": "money-party", "dltx": "deltaexcoin", "dragon": "dragon-finance", "mandi": "mandi-token", "raff": "rafflection", "pox": "pollux-coin", "f1c": "future1coin", "hdn": "hidden-coin", "yfarm": "yfarm-token", "scn": "silver-coin", "mello": "mello-token", "bnj": "binjit-coin", "xqc": "quras-token", "dhold": "diamondhold", "c2o": "cryptowater", "tlnt": "talent-coin", "env": "env-finance", "xxp": "xx-platform", "svr": "sovranocoin", "gfnc": "grafenocoin-2", "pint": "pub-finance", "dxy": "dxy-finance", "bdcc": "bitica-coin", "wemix": "wemix-token", "yff": "yff-finance", "pai": "project-pai", "trr": "terran-coin", "crg": "cryptogcoin", "hxn": "havens-nook", "porte": "porte-token", "hiz": "hiz-finance", "inbox": "inbox-token", "zln": "zillioncoin", "pal": "playandlike", "lnt": "lottonation", "vida": "vidiachange", "md+": "moon-day-plus", "aurora": "auroratoken", "qark": "qanplatform", "marsm": "marsmission", "ghd": "giftedhands", "mc": "monkey-coin", "xpd": "petrodollar", "vd": "vindax-coin", "navi": "natus-vincere-fan-token", "btour": "btour-chain", "burger": "burger-swap", "tbcc": "tbcc-wallet", "emoji": "emojis-farm", "dogdefi": "dogdeficoin", "dnd": "dungeonswap", "memes": "memes-token", "nc": "nayuta-coin", "aries": "aries-chain", "mdao": "martian-dao", "hmc": "harmonycoin", "fed": "fedora-gold", "rc": "russell-coin", "dpet": "my-defi-pet", "gldr": "golder-coin", "gbpu": "upper-pound", "wgp": "w-green-pay", "cakita": "chubbyakita", "berg": "bergco-coin", "mveda": "medicalveda", "remit": "remita-coin", "pola": "polaris-share", "fgp": "fingerprint", "gpyx": "pyrexcoin", "yo": "yobit-token", "ioox": "ioox-system", "hland": "hland-token", "fetish": "fetish-coin", "brb": "rabbit-coin", "btd": "bolt-true-dollar", "payn": "paynet-coin", "bridge": "multibridge", "papp": "papp-mobile", "bobt": "boboo-token", "bcvt": "bitcoinvend", "try": "try-finance", "liq": "liquidity-bot-token", "ctat": "cryptassist", "bgx": "bitcoingenx", "ecr": "ecredit", "cscj": "csc-jackpot", "hg": "hygenercoin", "fred": "fredenergy", "kip": "khipu-token", "wleo": "wrapped-leo", "yfip": "yfi-paprika", "papel": "papel", "brilx": "brilliancex", "pig": "pig-finance", "lxc": "latex-chain", "erk": "eureka-coin", "bscs": "bsc-station", "fbt": "fanbi-token", "orc": "oracle-system", "cbucks": "cryptobucks", "sipc": "simplechain", "stax": "stablexswap", "hachiko": "hachiko-inu", "cbs3": "crypto-bits", "pbom": "pocket-bomb", "alc": "alrightcoin", "bolo": "bollo-token", "sbgo": "bingo-share", "tbake": "bakerytools", "xbn": "xbn", "dhx": "datahighway", "hdac": "hdac", "skrt": "sekuritance", "kimj": "kimjongmoon", "coy": "coinanalyst", "poodl": "poodle", "grwi": "growers-international", "delta.theta": "delta-theta", "yoo": "yoo-ecology", "bnbd": "bnb-diamond", "dcnt": "decenturion", "metis": "metis-token", "ride": "ride-my-car", "svc": "satoshivision-coin", "idx": "index-chain", "wbnb": "wbnb", "vollar": "vollar", "bih": "bithostcoin", "zac": "zac-finance", "dfm": "defi-on-mcw", "earth": "earth-token", "hrd": "hrd", "pekc": "peacockcoin", "kili": "kilimanjaro", "fc": "futurescoin", "tkc": "turkeychain", "etf": "entherfound", "glxc": "galaxy-coin", "dcy": "dinastycoin", "baw": "wab-network", "aidus": "aidus", "iog": "playgroundz", "ctrfi": "chestercoin", "jnb": "jinbi-token", "orbyt": "orbyt-token", "drg": "dragon-coin", "xchf": "cryptofranc", "mcn": "moneta-verde", "carb": "carbon-labs", "panther": "pantherswap", "munch": "munch-token", "vcash": "vcash-token", "stark": "stark-chain", "bccx": "bitconnectx-genesis", "dbund": "darkbundles", "ddos": "disbalancer", "zcrt": "zcore-token", "kp0r": "kp0rnetwork", "pet": "battle-pets", "punk-zombie": "punk-zombie", "punk-female": "punk-female", "btcmz": "bitcoinmono", "cf": "californium", "tulip": "tulip-token", "hwi": "hawaii-coin", "mkb": "maker-basic", "cbix7": "cbi-index-7", "but": "bitup-token", "nst": "newsolution", "hybn": "hey-bitcoin", "esz": "ethersportz", "ttm": "tothe-moon", "algop": "algopainter", "lvt": "lives-token", "grew": "green-world", "spkl": "spoklottery", "treep": "treep-token", "lsilver": "lyfe-silver", "blosm": "blossomcoin", "carom": "carillonium", "ssn": "supersonic-finance", "trxc": "tronclassic", "tom": "tom-finance", "emax": "ethereummax", "nyc": "newyorkcoin", "bvnd": "binance-vnd", "medi": "mediconnect", "fyy": "grandpa-fan", "crypl": "cryptolandy", "q8e20": "q8e20-token", "jbp": "jb-protocol", "wusd": "wrapped-usd", "minx": "innovaminex", "fans": "unique-fans", "famous": "famous-coin", "rkt": "rocket-fund", "dt": "dcoin-token", "boot": "bootleg-nft", "tut": "trust-union", "ucr": "ultra-clear", "node": "whole-network", "upb": "upbtc-token", "wsc": "wesing-coin", "clva": "clever-defi", "jac": "jasper-coin", "proud": "proud-money", "cbank": "crypto-bank", "actn": "action-coin", "dgc": "digitalcoin", "per": "per-project", "codeo": "codeo-token", "god": "bitcoin-god", "xrpc": "xrp-classic", "cbp": "cashbackpro", "lsv": "litecoin-sv", "mrx": "linda", "sarco": "sarcophagus", "cub": "crypto-user-base", "sss": "simple-software-solutions", "gnto": "goldenugget", "hyd": "hydra-token", "punk-attr-4": "punk-attr-4", "bnxx": "bitcoinnexx", "dwz": "defi-wizard", "rugbust": "rug-busters", "shokk": "shikokuaido", "live": "tronbetlive", "mti": "mti-finance", "smile": "smile-token", "gl": "green-light", "armx": "armx-unidos", "viking": "viking-swap", "ert": "eristica", "pkp": "pikto-group", "cfxq": "cfx-quantum", "dfe": "dfe-finance", "ytho": "ytho-online", "aws": "aurus-silver", "genes": "genes-chain", "zbk": "zbank-token", "808ta": "808ta-token", "htdf": "orient-walt", "tsla": "tessla-coin", "punk-attr-5": "punk-attr-5", "cdash": "crypto-dash", "gdefi": "global-defi", "redc": "redchillies", "mcrn": "macaronswap", "supra": "supra-token", "sprx": "sprint-coin", "solace": "solace-coin", "tfg1": "energoncoin", "cca": "counos-coin", "samo": "samoyedcoin", "kassiahome": "kassia-home", "lift": "lift-kitchen", "onex": "onex-network", "zttl": "zettelkasten", "gogo": "gogo-finance", "azt": "az-fundchain", "viagra": "viagra-token", "rak": "rake-finance", "ryip": "ryi-platinum", "exe": "8x8-protocol", "pyro": "pyro-network", "tama": "tama-finance", "fnb": "finexbox-token", "neko": "neko-network", "ft1": "fortune1coin", "earn$": "earn-network", "acr": "acreage-coin", "ttx": "talent-token", "phoon": "typhoon-cash", "lpc": "lightpaycoin", "cla": "candela-coin", "tyt": "tianya-token", "latino": "latino-token", "vnxlu": "vnx-exchange", "yuno": "yuno-finance", "wcc": "wincash-coin", "koda": "koda-finance", "bbgc": "bigbang-game", "wxbtc": "wrapped-xbtc", "kpc": "koloop-basic", "yfix": "yfix-finance", "nxct": "xchain-token", "wst": "winsor-token", "xt": "xtcom-token", "xgc": "xiglute-coin", "yd-btc-jun21": "yd-btc-jun21", "tpt": "token-pocket", "vcg": "vipcoin-gold", "wxdai": "wrapped-xdai", "yfed": "yfedfinance", "mcan": "medican-coin", "epg": "encocoinplus", "btchg": "bitcoinhedge", "yfos": "yfos-finance", "loa": "loa-protocol", "hokk": "hokkaidu-inu", "moar": "moar", "toad": "toad-network", "helth": "health-token", "rckt": "rocket-token", "eqo": "equos-origin", "load": "load-network", "hate": "heavens-gate", "ww": "wayawolfcoin", "mtr": "meter-stable", "shibco": "shiba-cosmos", "pow": "eos-pow-coin", "biot": "biopassport", "balo": "balloon-coin", "yape": "gorillayield", "vlad": "vlad-finance", "skb": "sakura-bloom", "btca": "bitcoin-anonymous", "pngn": "spacepenguin", "xdef2": "xdef-finance", "unii": "unii-finance", "kodx": "king-of-defi", "butter": "butter-token", "chihua": "chihua-token", "syax": "staked-yaxis", "sdm": "sky-dog-moon", "chm": "cryptochrome", "fridge": "fridge-token", "xlmg": "stellar-gold", "ine": "intellishare", "tst": "touch-social", "mhlx": "helixnetwork", "mok": "mocktailswap", "lp": "lepard-coin", "obtc": "boringdao-btc", "crts": "cryptotipsfr", "elyx": "elynet-token", "seol": "seed-of-love", "xts": "xaviera-tech", "yd-eth-mar21": "yd-eth-mar21", "allbi": "all-best-ico", "dzar": "digital-rand", "etna": "etna-network", "dixt": "dixt-finance", "lsc": "littlesesame", "quam": "quam-network", "haze": "haze-finance", "noel": "noel-capital", "yd-eth-jun21": "yd-eth-jun21", "prqboost": "parsiq-boost", "fcx": "fission-cash", "hugo": "hugo-finance", "cnz": "coinzo-token", "fds": "fds", "dfyn": "dfyn-network", "safemooncash": "safemooncash", "phl": "placeh", "cold": "cold-finance", "zuz": "zuz-protocol", "trt": "taurus-chain", "ccrb": "cryptocarbon", "dcb": "digital-coin", "wcelo": "wrapped-celo", "peri": "peri-finance", "pube": "pube-finance", "bia": "bilaxy-token", "wavax": "wrapped-avax", "ymen": "ymen-finance", "usdu": "upper-dollar", "wick": "wick-finance", "xcon": "connect-coin", "wec": "wave-edu-coin", "xwin": "xwin-finance", "vena": "vena-network", "mvt": "the-movement", "cnrg": "cryptoenergy", "poc": "pangea-cleanup-coin", "btap": "bta-protocol", "ivc": "invoice-coin", "sora": "sorachancoin", "vkt": "vankia-chain", "yd-btc-mar21": "yd-btc-mar21", "fshn": "fashion-coin", "zild": "zild-finance", "myk": "mykonos-coin", "brp": "bor-protocol", "sd": "smart-dollar", "hyper": "hyperchain-x", "neww": "newv-finance", "isikc": "isiklar-coin", "modx": "model-x-coin", "yg": "yearn-global", "dff": "defi-firefly", "bbq": "barbecueswap", "tndr": "thunder-swap", "dio": "deimos-token", "kbtc": "klondike-btc", "loon": "loon-network", "ebox": "ethbox-token", "kft": "knit-finance", "spmk": "space-monkey", "cet": "coinex-token", "dragn": "astro-dragon", "kseed": "kush-finance", "bulk": "bulk-network", "gcz": "globalchainz", "mach": "mach", "yt": "cherry-token", "shibal": "shiba-launch", "dfn": "difo-network", "bic": "bitcrex-coin", "htn": "heartnumber", "uc": "youlive-coin", "catnip": "catnip-money", "kper": "kper-network", "dcw": "decentralway", "hp": "heartbout-pay", "wxtc": "wechain-coin", "grap": "grap-finance", "emdc": "emerald-coin", "skill": "cryptoblades", "orange": "orange-token", "ror": "ror-universe", "bcm": "bitcoinmoney", "icnq": "iconiq-lab-token", "wiken": "project-with", "ethbnt": "ethbnt", "orao": "orao-network", "bingus": "bingus-token", "tym": "timelockcoin", "blcc": "bullers-coin", "lnx": "linix", "wet": "weshow", "zep": "zeppelin-dao", "ubx": "ubix-network", "sfund": "seedify-fund", "bcf": "bitcoin-fast", "cord": "cord-defi-eth", "mich": "charity-alfa", "btllr": "betller-coin", "moma": "mochi-market", "yfib": "yfibalancer-finance", "bezoge": "bezoge-earth", "1mil": "1million-nfts", "wbind": "wrapped-bind", "btcu": "bitcoin-ultra", "agrs": "agoras", "cann": "cannabiscoin", "grpl": "grpl-finance-2", "fkx": "fortknoxter", "etet": "etet-finance", "vers": "versess-coin", "nvt": "nervenetwork", "esrc": "echosoracoin", "map": "marcopolo", "husl": "hustle-token", "soga": "soga-project", "deuro": "digital-euro", "jus": "just-network", "saft": "safe-finance", "hogl": "hogl-finance", "emrx": "emirex-token", "cdy": "bitcoin-candy", "aplp": "apple-finance", "69c": "6ix9ine-chain", "fras": "frasindo-rent", "brn": "brainaut-defi", "atc": "atlantic-coin", "cust": "custody-token", "elite": "ethereum-lite", "dark": "darkbuild", "qcore": "qcore-finance", "blc": "bullionschain", "bundb": "unidexbot-bsc", "anty": "animalitycoin", "dmtc": "dmtc-token", "inb": "insight-chain", "tnet": "title-network", "peech": "peach-finance", "elcash": "electric-cash", "acpt": "crypto-accept", "rbtc": "rootstock", "zefi": "zcore-finance", "payou": "payou-finance", "gng": "gold-and-gold", "bdog": "bulldog-token", "nfi": "norse-finance", "gcbn": "gas-cash-back", "btnyx": "bitonyx-token", "ltcb": "litecoin-bep2", "water": "water-finance", "vancii": "vanci-finance", "xsm": "spectrum-cash", "xrm": "refine-medium", "aura": "aura-protocol", "hnc": "helleniccoin", "b1p": "b-one-payment", "l2p": "lung-protocol", "fam": "yefam-finance", "xag": "xrpalike-gene", "yfpro": "yfpro-finance", "brap": "brapper-token", "pfi": "protocol-finance", "adf": "ad-flex-token", "dscvr": "dscvr-finance", "hc8": "hydrocarbon-8", "yffii": "yffii-finance", "wxtz": "wrapped-tezos", "eyes": "eyes-protocol", "hx": "hyperexchange", "hcut": "healthchainus", "emont": "etheremontoken", "most": "most-protocol", "hyfi": "hyper-finance", "vgd": "vangold-token", "wae": "wave-platform", "amio": "amino-network", "tai": "tai", "neal": "neal", "dino": "jurassic-farm", "bhig": "buckhath-coin", "xcf": "cenfura-token", "volts": "volts-finance", "gts": "gt-star-token", "fetch": "moonretriever", "lyd": "lydia-finance", "pearl": "pearl-finance", "btad": "bitcoin-adult", "dawn": "dawn-protocol", "idon": "idoneus-token", "vinx": "vinx-coin-sto", "port": "packageportal", "lnk": "link-platform", "tiox": "trade-token", "stakd": "stakd-finance", "nash": "neoworld-cash", "bsh": "bitcoin-stash", "nbs": "new-bitshares", "molk": "mobilink-coin", "wtk": "wadzpay-token", "crwn": "crown-finance", "hcc": "holiday-chain", "lunar": "lunar-highway", "umc": "universal-marketing-coin", "afin": "afin-coin", "whole": "whitehole-bsc", "btri": "trinity-bsc", "awt": "airdrop-world", "gent": "genesis-token", "diamond": "diamond-token", "invox": "invox-finance", "bday": "birthday-cake", "labra": "labra-finance", "peppa": "peppa-network", "yyfi": "yyfi-protocol", "lem": "lemur-finance", "ltrbt": "little-rabbit", "scat": "sad-cat-token", "mxf": "mixty-finance", "nmn": "99masternodes", "pmc": "paymastercoin", "brg": "bridge-oracle", "oac": "one-army-coin", "joos": "joos-protocol", "glo": "glosfer-token", "nbot": "naka-bodhi-token", "yfive": "yfive-finance", "vcoin": "tronvegascoin", "onlexpa": "onlexpa-token", "gmng": "global-gaming", "yfst": "yfst-protocol", "exnx": "exenox-mobile", "tcp": "the-crypto-prophecies", "tuda": "tutors-diary", "cp": "cryptoprofile", "iflt": "inflationcoin", "mngo": "mango-markets", "wnl": "winstars", "xao": "alloy-project", "ares": "ares-protocol", "src": "simracer-coin", "fork": "gastroadvisor", "kbond": "klondike-bond", "gvc": "gemvault-coin", "ftb": "free-tool-box", "swipe": "swipe-network", "gnsh": "ganesha-token", "wzec": "wrapped-zcash", "xns": "xeonbit-token", "atls": "atlas", "yeth": "fyeth-finance", "jtt": "joytube-token", "ganja": "trees-finance", "creed": "creed-finance", "epk": "epik-protocol", "rasta": "rasta-finance", "dx": "dxchain", "hosp": "hospital-coin", "stbb": "stabilize-bsc", "wpx": "wallet-plus-x", "tata": "hakuna-metata", "pipi": "pippi-finance", "woop": "woonkly-power", "wtp": "web-token-pay", "entrp": "hut34-entropy", "gpc": "greenpay-coin", "slme": "slime-finance", "momo": "momo-protocol", "froge": "froge-finance", "prd": "predator-coin", "pfb": "penny-for-bit", "pyr": "vulcan-forged", "phtf": "phantom-token", "neuro": "neuro-charity", "scha": "schain-wallet", "geth": "guarded-ether", "prism": "prism-network", "gdoge": "gdoge-finance", "dogen": "dogen-finance", "luc": "play2live", "tfc": "treasure-financial-coin", "obsr": "observer-coin", "halo": "halo-platform", "btcf": "bitcoin-final", "btf": "btf", "bpc": "backpacker-coin", "womi": "wrapped-ecomi", "dirty": "dirty-finance", "sbdo": "bdollar-share", "soldier": "space-soldier", "ztnz": "ztranzit-coin", "rhea": "rheaprotocol", "wmatic": "wmatic", "pand": "panda-finance", "chadlink": "chad-link-set", "codex": "codex-finance", "idt": "investdigital", "o-ocean-mar22": "o-ocean-mar22", "vdg": "veridocglobal", "qwla": "qawalla-token", "blzn": "blaze-network", "ul": "uselink-chain", "cora": "corra-finance", "ext": "exchain", "swusd": "swusd", "bs1": "blocsport-one", "krypto": "kryptobellion", "mina": "mina-protocol-iou", "mort": "dynamic-supply-tracker", "kombat": "crypto-kombat", "torocus": "torocus-token", "yrise": "yrise-finance", "xfc": "football-coin", "ytsla": "ytsla-finance", "mayp": "maya-preferred-223", "ccy": "cryptocurrency", "cspr": "casper-network", "shrimp": "shrimp-finance", "gvy": "groovy-finance", "owo": "one-world-coin", "mbull": "mad-bull-token", "mcbase": "mcbase-finance", "miva": "minerva-wallet", "snb": "synchrobitcoin", "hzd": "horizondollar", "kimchi": "kimchi-finance", "gnc": "galaxy-network", "foc": "theforce-trade", "dart": "dart-insurance", "recap": "review-capital", "afcash": "africunia-bank", "rick": "infinite-ricks", "cbd": "greenheart-cbd", "ctg": "cryptorg-token", "erd": "eldorado-token", "dynmt": "dynamite-token", "redpanda": "redpanda-earth", "metp": "metaprediction", "cvt": "civitas-protocol", "bcash": "bankcoincash", "yf4": "yearn4-finance", "fsc": "five-star-coin", "sifi": "simian-finance", "guh": "goes-up-higher", "xuc": "exchange-union", "2based": "2based-finance", "bbl": "bubble-network", "sch": "schillingcoin", "lncx": "luna-nusa-coin", "dquick": "dragons-quick", "espi": "spider-ecology", "katana": "katana-finance", "kbc": "karatgold-coin", "swfi": "swirge-finance", "dbix": "dubaicoin-dbix", "pjm": "pajama-finance", "bribe": "bribe-token", "bf": "bitforex", "etr": "electric-token", "sedo": "sedo-pow-token", "nfd": "nifdo-protocol", "bsk": "bitcoinstaking", "byn": "beyond-finance", "rsct": "risecointoken", "bnsg": "bns-governance", "bog": "bogged-finance", "spex": "sproutsextreme", "cpte": "crypto-puzzles", "rosn": "roseon-finance", "prdx": "predix-network", "sofi": "social-finance", "tcnx": "tercet-network", "bfr": "bridge-finance", "snowball": "snowballtoken", "evo": "dapp-evolution", "mtns": "omotenashicoin", "ica": "icarus-finance", "ltcu": "litecoin-ultra", "eer": "ethereum-erush", "xpose": "xpose-protocol", "ecoreal": "ecoreal-estate", "ths": "the-hash-speed", "onez": "the-nifty-onez", "cbtc": "classicbitcoin", "amc": "anonymous-coin", "esg": "empty-set-gold", "elephant": "elephant-money", "perx": "peerex-network", "cavo": "excavo-finance", "liquid": "netkoin-liquid", "npw": "new-power-coin", "es": "era-swap-token", "wscrt": "secret-erc20", "roy": "royal-protocol", "cad": "candy-protocol", "vcco": "vera-cruz-coin", "aph": "apholding-coin", "lyn": "lynchpin_token", "osm": "options-market", "bpt": "bitplayer-token", "gs": "genesis-shards", "mlk": "milk-alliance", "fff": "future-of-finance-fund", "shild": "shield-network", "bks": "barkis", "buc": "buyucoin-token", "prtn": "proton-project", "lat": "platon-network", "hdot": "huobi-polkadot", "btrl": "bitcoinregular", "hltc": "huobi-litecoin", "kmw": "kepler-network", "upeur": "universal-euro", "gjco": "giletjaunecoin", "polven": "polka-ventures", "wac": "warranty-chain", "mov": "motiv-protocol", "chord": "chord-protocol", "zseed": "sowing-network", "cdl": "coindeal-token", "umbr": "umbra-network", "deve": "divert-finance", "mtm": "momentum-token", "dwc": "digital-wallet", "hnb": "hashnet-biteco", "chad": "the-chad-token", "dgnn": "dragon-network", "mzk": "muzika-network", "ccake": "cheesecakeswap", "xlab": "xceltoken-plus", "sho": "showcase-token", "steak": "steaks-finance", "xdt": "xwc-dice-token", "pareto": "pareto-network", "hdw": "hardware-chain", "jsb": "jsb-foundation", "raptor": "raptor-finance", "gzil": "governance-zil", "heth": "huobi-ethereum", "cxc": "capital-x-cell", "ald": "aludra-network", "ubtc": "united-bitcoin", "wanatha": "wrapped-anatha", "ucap": "unicap-finance", "atis": "atlantis-token", "thor": "asgard-finance", "xmc": "monero-classic-xmc", "ethmny": "ethereum-money", "ushiba": "american-shiba", "uskita": "american-akita", "uto": "unitopia-token", "3crv": "lp-3pool-curve", "wtf": "walnut-finance", "inflex": "inflex-finance", "elena": "elena-protocol", "pepr": "pepper-finance", "svs": "silver-gateway", "neon": "neonic-finance", "new": "newton-project", "sahu": "sakhalin-husky", "dpr": "deeper-network", "ucoin": "universal-coin", "eveo": "every-original", "upxau": "universal-gold", "boc": "bitorcash-token", "elongd": "elongate-duluxe", "ufc": "union-fair-coin", "bpriva": "privapp-network", "nos": "nitrous-finance", "advc": "advertisingcoin", "fish": "penguin-party-fish", "bcc": "basis-coin-cash", "nyan": "yieldnyan-token", "tni": "tunnel-protocol", "aevo": "aevo", "wsienna": "sienna-erc20", "comc": "community-chain", "bpakc": "bitpakcointoken", "ans": "ans-crypto-coin", "flexethbtc": "flexeth-btc-set", "ssj": "super-saiya-jin", "chal": "chalice-finance", "wmpro": "wm-professional", "nftart": "nft-art-finance", "print": "printer-finance", "esn": "escudonavacense", "bttr": "bittracksystems", "slrs": "solrise-finance", "cnp": "cryptonia-poker", "weather": "weather-finance", "yfild": "yfilend-finance", "axa": "alldex-alliance", "altm": "altmarkets-coin", "yfarmer": "yfarmland-token", "esce": "escroco", "brzx": "braziliexs-token", "wsta": "wrapped-statera", "wccx": "wrapped-conceal", "infi": "insured-finance", "trips": "trips-community", "ldn": "ludena-protocol", "chum": "chumhum-finance", "craft": "decraft-finance", "ginu": "green-shiba-inu", "typh": "typhoon-network", "yfiking": "yfiking-finance", "sheesha": "sheesha-finance", "mg": "minergate-token", "mpwr": "empower-network", "nftpunk": "nftpunk-finance", "gdl": "gondala-finance", "bwb": "bw-token", "xai": "sideshift-token", "stpl": "stream-protocol", "fusion": "fusion-energy-x", "qcx": "quickx-protocol", "eoc": "everyonescrypto", "hps": "happiness-token", "bips": "moneybrain-bips", "tin": "tinfoil-finance", "fol": "folder-protocol", "sprkl": "sparkle", "ringx": "ring-x-platform", "aens": "aen-smart-token", "uusdc": "unagii-usd-coin", "fico": "french-ico-coin", "krg": "karaganda-token", "snbl": "safenebula", "trdl": "strudel-finance", "udt": "unlock-protocol", "rlr": "relayer-network", "lic": "lightening-cash", "cwv": "cryptoworld-vip", "smpl": "smpl-foundation", "usdj": "just-stablecoin", "rfy": "rfyield-finance", "pussy": "pussy-financial", "nmp": "neuromorphic-io", "dvi": "dvision-network", "vct": "valuecybertoken", "dimi": "diminutive-coin", "bst1": "blueshare-token", "plst": "philosafe-token", "spl": "simplicity-coin", "blink": "blockmason-link", "defit": "defit", "dxts": "destiny-success", "bashtank": "baby-shark-tank", "xyx": "burn-yield-burn", "m3c": "make-more-money", "libref": "librefreelencer", "kimochi": "kimochi-finance", "bchip": "bluechips-token", "shield": "shield-protocol", "skt": "sealblock-token", "emb": "block-collider", "afi": "aries-financial-token", "ddrt": "digidinar-token", "gdt": "globe-derivative-exchange", "usdo": "usd-open-dollar", "ec2": "employment-coin", "xbt": "elastic-bitcoin", "wag8": "wrapped-atromg8", "kmc": "king-maker-coin", "renbtccurve": "lp-renbtc-curve", "moonday": "moonday-finance", "idv": "idavoll-network", "hoodrat": "hoodrat-finance", "ipx": "ipx-token", "mally": "malamute-finance", "wsb": "wall-street-bets-dapp", "bxk": "bitbook-gambling", "change": "change-our-world", "spot": "cryptospot-token", "supt": "super-trip-chain", "hcore": "hardcore-finance", "idleusdcyield": "idle-usdc-yield", "idleusdtyield": "idle-usdt-yield", "eurt": "euro-ritva-token", "ltfn": "litecoin-finance", "sya": "save-your-assets", "btrs": "bitball-treasure", "west": "waves-enterprise", "fxtc": "fixed-trade-coin", "mwc": "mimblewimblecoin", "bb": "blackberry-token", "cyc": "cyclone-protocol", "vsd": "value-set-dollar", "swl": "swiftlance-token", "tkx": "tokenize-xchange", "tcapethdai": "holistic-eth-set", "pld": "pureland-project", "atfi": "atlantic-finance", "pnc": "parellel-network", "kdg": "kingdom-game-4-0", "fbn": "five-balance", "ggc": "gg-coin", "mof": "molecular-future", "bcr": "bankcoin-reserve", "jfi": "jackpool-finance", "mtnt": "mytracknet-token", "tschybrid": "tronsecurehybrid", "xlpg": "stellarpayglobal", "shx": "stronghold-token", "syfl": "yflink-synthetic", "tomoe": "tomoe", "mtlmc3": "metal-music-coin", "usdfl": "usdfreeliquidity", "tori": "storichain-token", "qqq": "qqq-token", "hole": "super-black-hole", "ccf": "cerberus", "bci": "bitcoin-interest", "degenr": "degenerate-money", "safedog": "safedog-protocol", "nye": "newyork-exchange", "cnet": "currency-network", "shibaken": "shibaken-finance", "sensi": "sensible-finance", "magi": "magikarp-finance", "u8d": "universal-dollar", "uhp": "ulgen-hash-power", "afc": "apiary-fund-coin", "xep": "electra-protocol", "sny": "syntheify-token", "whxc": "whitex-community", "hpt": "huobi-pool-token", "rtf": "regiment-finance", "ssl": "sergey-save-link", "vamp": "vampire-protocol", "idlesusdyield": "idle-susd-yield", "myid": "my-identity-coin", "orion": "orion-initiative", "saturn": "saturn-network", "scho": "scholarship-coin", "bhc": "billionhappiness", "biut": "bit-trust-system", "bplc": "blackpearl-chain", "goi": "goforit", "unicrap": "unicrap", "plum": "plumcake-finance", "bcs": "business-credit-substitute", "cgc": "cash-global-coin", "bdigg": "badger-sett-digg", "rnrc": "rock-n-rain-coin", "nnn": "novem-gold-token", "hds": "hotdollars-token", "flm": "flamingo-finance", "cytr": "cyclops-treasure", "gme": "gamestop-finance", "wbb": "wild-beast-block", "bbi": "bigboys-industry", "tcapbtcusdc": "holistic-btc-set", "tryon": "stellar-invictus", "tsc": "time-space-chain", "gpo": "galaxy-pool-coin", "roger": "theholyrogercoin", "sbf": "steakbank-finance", "tpc": "trading-pool-coin", "goldr": "golden-ratio-coin", "stgz": "stargaze-protocol", "limex": "limestone-network", "ssf": "safe-seafood-coin", "etnxp": "electronero-pulse", "okbbull": "3x-long-okb-token", "asm": "assemble-protocol", "ethusdadl4": "ethusd-adl-4h-set", "sgc": "secured-gold-coin", "mps": "mt-pelerin-shares", "mcat20": "wrapped-moon-cats", "ctf": "cybertime-finance", "rvc": "ravencoin-classic", "rvp": "revolution-populi", "ciphc": "cipher-core-token", "bvl": "bullswap-protocol", "opcx": "over-powered-coin", "stars": "mogul-productions", "bctr": "bitcratic-revenue", "eosbull": "3x-long-eos-token", "sicc": "swisscoin-classic", "cbsn": "blockswap-network", "bbkfi": "bitblocks-finance", "leobull": "3x-long-leo-token", "mee": "mercurity-finance", "agov": "answer-governance", "mkt": "monkey-king-token", "thpt": "helio-power-token", "trxbull": "3x-long-trx-token", "far": "farmland-protocol", "chow": "chow-chow-finance", "ce": "crypto-excellence", "stnd": "standard-protocol", "xgt": "xion-global-token", "mcaps": "mango-market-caps", "rena": "rena-finance", "itf": "ins3-finance-coin", "twj": "tronweeklyjournal", "meteor": "meteorite-network", "macpo": "macpo", "cnc": "global-china-cash", "brain": "nobrainer-finance", "yusdc": "yusdc-busd-pool", "uusdt": "unagii-tether-usd", "nhc": "neo-holistic-coin", "stor": "self-storage-coin", "vbzrx": "vbzrx", "knockers": "australian-kelpie", "reau": "vira-lata-finance", "xbtx": "bitcoin-subsidium", "dcl": "delphi-chain-link", "sxcc": "southxchange-coin", "spr": "polyvolve-finance", "foxt": "fox-trading-token", "bnbbull": "3x-long-bnb-token", "3cs": "cryptocricketclub", "aac": "acute-angle-cloud", "usdap": "bond-appetite-usd", "mdza": "medooza-ecosystem", "xrpbull": "3x-long-xrp-token", "encx": "enceladus-network", "csto": "capitalsharetoken", "ghp": "global-hash-power", "ksp": "klayswap-protocol", "yficg": "yfi-credits-group", "tmcn": "timecoin-protocol", "eosbear": "3x-short-eos-token", "kp3rb": "keep3r-bsc-network", "pol": "proof-of-liquidity", "ethmoonx": "eth-moonshot-x-yield-set", "hbo": "hash-bridge-oracle", "fz": "frozencoin-network", "gbc": "golden-bridge-coin", "awc": "atomic-wallet-coin", "eqmt": "equus-mining-token", "ang": "aureus-nummus-gold", "leobear": "3x-short-leo-token", "vrt": "venus-reward-token", "bbadger": "badger-sett-badger", "xuni": "ultranote-infinity", "ght": "global-human-trust", "pmt": "playmarket", "supern": "supernova-protocol", "okbhedge": "1x-short-okb-token", "satx": "satoexchange-token", "rtc": "read-this-contract", "liqlo": "liquid-lottery-rtc", "abp": "arc-block-protocol", "trxhedge": "1x-short-trx-token", "if": "impossible-finance", "hbch": "huobi-bitcoin-cash", "zelda elastic cash": "zelda-elastic-cash", "bafi": "bafi-finance-token", "axt": "alliance-x-trading", "okbbear": "3x-short-okb-token", "bnbhedge": "1x-short-bnb-token", "dfly": "dragonfly-protocol", "catx": "cat-trade-protocol", "puml": "puml-better-health", "bnbbear": "3x-short-bnb-token", "copter": "helicopter-finance", "yfb2": "yearn-finance-bit2", "aggt": "aggregator-network", "rmc": "russian-miner-coin", "iop": "internet-of-people", "delta rlp": "rebasing-liquidity", "eoshedge": "1x-short-eos-token", "tan": "taklimakan-network", "trxbear": "3x-short-trx-token", "loom": "loom-network-new", "brick": "brick", "dzi": "definition-network", "mpg": "max-property-group", "unit": "universal-currency", "xrphedge": "1x-short-xrp-token", "afdlt": "afrodex-labs-token", "wszo": "wrapped-shuttleone", "cpi": "crypto-price-index", "btfc": "bitcoin-flash-cash", "gsa": "global-smart-asset", "yhfi": "yearn-hold-finance", "pvp": "playervsplayercoin", "cgb": "crypto-global-bank", "mco2": "moss-carbon-credit", "xrpbear": "3x-short-xrp-token", "kch": "keep-calm", "tln": "trustline-network", "mhsp": "melonheadsprotocol", "ff1": "two-prime-ff1-token", "dola": "dola-usd", "trdg": "tardigrades-finance", "hbdc": "happy-birthday-coin", "wht": "wrapped-huobi-token", "ymf20": "yearn20moonfinance", "xrphalf": "0-5x-long-xrp-token", "hsn": "hyper-speed-network", "maticbull": "3x-long-matic-token", "sst": "simba-storage-token", "tmh": "trustmarkethub-token", "mclb": "millenniumclub", "vgo": "virtual-goods-token", "fcd": "future-cash-digital", "\u2728": "sparkleswap-rewards", "ygy": "generation-of-yield", "cana": "cannabis-seed-token", "vit": "vice-industry-token", "dss": "defi-shopping-stake", "bbtc": "binance-wrapped-btc", "beth": "binance-eth", "subx": "startup-boost-token", "wsdoge": "doge-of-woof-street", "climb": "climb-token-finance", "emp": "electronic-move-pay", "btcgw": "bitcoin-galaxy-warp", "xtzbull": "3x-long-tezos-token", "yfie": "yfiexchange-finance", "eoshalf": "0-5x-long-eos-token", "vntw": "value-network-token", "msc": "monster-slayer-cash", "xspc": "spectresecuritycoin", "sushibull": "3x-long-sushi-token", "wmc": "wrapped-marblecards", "okbhalf": "0-5x-long-okb-token", "refi": "realfinance-network", "stoge": "stoner-doge", "wton": "wrapped-ton-crystal", "plaas": "plaas-farmers-token", "gsc": "global-social-chain", "upusd": "universal-us-dollar", "spy": "satopay-yield-token", "yskf": "yearn-shark-finance", "yfiv": "yearn-finance-value", "gmm": "gold-mining-members", "ann": "apexel-natural-nano", "pci": "pay-coin", "wxmr": "wrapped-xmr-btse", "zgt": "zg-blockchain-token", "pxt": "populous-xbrl-token", "coc": "cocktailbar", "ledu": "education-ecosystem", "pnix": "phoenixdefi-finance", "xjp": "exciting-japan-coin", "gmc24": "24-genesis-mooncats", "yi12": "yi12-stfinance", "mkrbull": "3x-long-maker-token", "ceek": "ceek", "sxpbull": "3x-long-swipe-token", "hmng": "hummingbird-finance", "bfht": "befasterholdertoken", "sbyte": "securabyte-protocol", "cix100": "cryptoindex-io", "ncp": "newton-coin-project", "wcusd": "wrapped-celo-dollar", "xtzhedge": "1x-short-tezos-token", "bvg": "bitcoin-virtual-gold", "terc": "troneuroperewardcoin", "forestplus": "the-forbidden-forest", "tgco": "thaler", "aurum": "alchemist-defi-aurum", "wx42": "wrapped-x42-protocol", "idledaiyield": "idle-dai-yield", "xtzbear": "3x-short-tezos-token", "usdtbull": "3x-long-tether-token", "dollar": "dollar-online", "teo": "trust-ether-reorigin", "sxpbear": "3x-short-swipe-token", "usc": "ultimate-secure-cash", "trybbull": "3x-long-bilira-token", "wis": "experty-wisdom-token", "afo": "all-for-one-business", "hzt": "black-diamond-rating", "yfc": "yearn-finance-center", "sxphedge": "1x-short-swipe-token", "bdoge": "blue-eyes-white-doge", "scv": "super-coinview-token", "opm": "omega-protocol-money", "nut": "native-utility-token", "gbpx": "etoro-pound-sterling", "sleepy": "sleepy-sloth", "lfbtc": "lift-kitchen-lfbtc", "utt": "united-traders-token", "thex": "thore-exchange", "uenc": "universalenergychain", "xcmg": "connect-mining-coin", "ibeth": "interest-bearing-eth", "fredx": "fred-energy-erc20", "bnfy": "b-non-fungible-yearn", "mkrbear": "3x-short-maker-token", "matichedge": "1x-short-matic-token", "atombull": "3x-long-cosmos-token", "vgt": "vault12", "deor": "decentralized-oracle", "aapl": "apple-protocol-token", "tmtg": "the-midas-touch-gold", "rrt": "recovery-right-token", "sushibear": "3x-short-sushi-token", "pnixs": "phoenix-defi-finance", "hpay": "hyper-credit-network", "xbx": "bitex-global", "gtf": "globaltrustfund-token", "knc": "kyber-network-crystal", "julb": "justliquidity-binance", "yfn": "yearn-finance-network", "sxphalf": "0-5x-long-swipe-token", "efg": "ecoc-financial-growth", "kun": "qian-governance-token", "atomhedge": "1x-short-cosmos-token", "usd": "uniswap-state-dollar", "marc": "market-arbitrage-coin", "trybbear": "3x-short-bilira-token", "z502": "502-bad-gateway-token", "znt": "zenswap-network-token", "vetbull": "3x-long-vechain-token", "float": "float-protocol-float", "mlt": "media-licensing-token", "wows": "wolves-of-wall-street", "ducato": "ducato-protocol-token", "xlmbull": "3x-long-stellar-token", "glob": "global-reserve-system", "smrat": "secured-moonrat-token", "matichalf": "0-5x-long-matic-token", "acd": "alliance-cargo-direct", "intratio": "intelligent-ratio-set", "incx": "international-cryptox", "ddrst": "digidinar-stabletoken", "wct": "waves-community-token", "bsbt": "bit-storage-box-token", "upak": "unicly-pak-collection", "lbxc": "lux-bio-exchange-coin", "idlewbtcyield": "idle-wbtc-yield", "qtc": "quality-tracing-chain", "zomb": "antique-zombie-shards", "evz": "electric-vehicle-zone", "linkpt": "link-profit-taker-set", "earn": "yearn-classic-finance", "idletusdyield": "idle-tusd-yield", "atombear": "3x-short-cosmos-token", "cts": "chainlink-trading-set", "edi": "freight-trust-network", "htg": "hedge-tech-governance", "xtzhalf": "0-5x-long-tezos-token", "adabull": "3x-long-cardano-token", "infinity": "infinity-protocol-bsc", "gcc": "thegcccoin", "yfx": "yfx", "crs": "cryptorewards", "seco": "serum-ecosystem-token", "usdtbear": "3x-short-tether-token", "cft": "coinbene-future-token", "jeur": "jarvis-synthetic-euro", "btsc": "beyond-the-scene-coin", "dca": "decentralized-currency-assets", "ddn": "data-delivery-network", "ggt": "gard-governance-token", "blo": "based-loans-ownership", "bnd": "doki-doki-chainbinders", "tgcd": "trongamecenterdiamonds", "dpt": "diamond-platform-token", "well": "wellness-token-economy", "yfp": "yearn-finance-protocol", "vetbear": "3x-short-vechain-token", "hth": "help-the-homeless-coin", "adahedge": "1x-short-cardano-token", "cvcc": "cryptoverificationcoin", "set": "sustainable-energy-token", "ahf": "americanhorror-finance", "inteth": "intelligent-eth-set-ii", "bbb": "bullbearbitcoin-set-ii", "bevo": "bevo-digital-art-token", "paxgbull": "3x-long-pax-gold-token", "gspi": "gspi", "zelda spring nuts cash": "zelda-spring-nuts-cash", "balbull": "3x-long-balancer-token", "nami": "nami-corporation-token", "ubi": "universal-basic-income", "ort": "omni-real-estate-token", "linkrsico": "link-rsi-crossover-set", "e2c": "electronic-energy-coin", "vethedge": "1x-short-vechain-token", "algobull": "3x-long-algorand-token", "dcd": "digital-currency-daily", "ihf": "invictus-hyprion-fund", "smnc": "simple-masternode-coin", "hedge": "1x-short-bitcoin-token", "adabear": "3x-short-cardano-token", "tgct": "tron-game-center-token", "ltcbull": "3x-long-litecoin-token", "ethbull": "3x-long-ethereum-token", "yefi": "yearn-ethereum-finance", "mcpc": "mobile-crypto-pay-coin", "bmp": "brother-music-platform", "zelda summer nuts cash": "zelda-summer-nuts-cash", "yfrm": "yearn-finance-red-moon", "atomhalf": "0-5x-long-cosmos-token", "smoke": "the-smokehouse-finance", "leg": "legia-warsaw-fan-token", "gdc": "global-digital-content", "tgic": "the-global-index-chain", "xlmbear": "3x-short-stellar-token", "call": "global-crypto-alliance", "uwbtc": "unagii-wrapped-bitcoin", "bed": "bit-ecological-digital", "ecell": "consensus-cell-network", "dant": "digital-antares-dollar", "tcat": "the-currency-analytics", "dogebull": "3x-long-dogecoin-token", "goz": "goztepe-s-k-fan-token", "paxgbear": "3x-short-pax-gold-token", "balbear": "3x-short-balancer-token", "sato": "super-algorithmic-token", "uwaifu": "unicly-waifu-collection", "linkbull": "3x-long-chainlink-token", "bbe": "bullbearethereum-set-ii", "bags": "basis-gold-share-heco", "brz": "brz", "ltchedge": "1x-short-litecoin-token", "mlgc": "marshal-lion-group-coin", "ems": "ethereum-message-search", "wbcd": "wrapped-bitcoin-diamond", "fnxs": "financex-exchange-token", "idledaisafe": "idle-dai-risk-adjusted", "ethhedge": "1x-short-ethereum-token", "half": "0-5x-long-bitcoin-token", "algohedge": "1x-short-algorand-token", "ethrsiapy": "eth-rsi-60-40-yield-set-ii", "gve": "globalvillage-ecosystem", "ethbear": "3x-short-ethereum-token", "adahalf": "0-5x-long-cardano-token", "tomobull": "3x-long-tomochain-token", "pwc": "prime-whiterock-company", "aipe": "ai-predicting-ecosystem", "inex": "internet-exchange-token", "dogebear": "3x-short-dogecoin-token", "ltcbear": "3x-short-litecoin-token", "vbnt": "bancor-governance-token", "yfiec": "yearn-finance-ecosystem", "algobear": "3x-short-algorand-token", "dogehedge": "1x-short-dogecoin-token", "bnkrx": "bankroll-extended-token", "ethhalf": "0-5x-long-ethereum-token", "bhp": "blockchain-of-hash-power", "linkhedge": "1x-short-chainlink-token", "idleusdcsafe": "idle-usdc-risk-adjusted", "aat": "agricultural-trade-chain", "nyante": "nyantereum", "pec": "proverty-eradication-coin", "bvol": "1x-long-btc-implied-volatility-token", "tomobear": "3x-short-tomochain-token", "cbn": "connect-business-network", "defibull": "3x-long-defi-index-token", "best": "bitpanda-ecosystem-token", "tomohedge": "1x-short-tomochain-token", "pbtt": "purple-butterfly-trading", "bsvbull": "3x-long-bitcoin-sv-token", "balhalf": "0-5x-long-balancer-token", "dogehalf": "0-5x-long-dogecoin-token", "sxut": "spectre-utility-token", "idleusdtsafe": "idle-usdt-risk-adjusted", "p2ps": "p2p-solutions-foundation", "yefim": "yearn-finance-management", "btceth5050": "btc-eth-equal-weight-set", "algohalf": "0-5x-long-algorand-token", "ethmo": "eth-momentum-trigger-set", "ass": "australian-safe-shepherd", "upt": "universal-protocol-token", "rae": "rae-token", "linkbear": "3x-short-chainlink-token", "basd": "binance-agile-set-dollar", "sup": "supertx-governance-token", "paxghalf": "0-5x-long-pax-gold-token", "anw": "anchor-neural-world-token", "licc": "life-is-camping-community", "fame": "saint-fame", "wcdc": "world-credit-diamond-coin", "sxdt": "spectre-dividend-token", "eth2": "eth2-staking-by-poolx", "cmccoin": "cine-media-celebrity-coin", "byte": "btc-network-demand-set-ii", "lega": "link-eth-growth-alpha-set", "bptn": "bit-public-talent-network", "brrr": "money-printer-go-brrr-set", "linkhalf": "0-5x-long-chainlink-token", "cmid": "creative-media-initiative", "defihedge": "1x-short-defi-index-token", "htbull": "3x-long-huobi-token-token", "bsvbear": "3x-short-bitcoin-sv-token", "ulu": "universal-liquidity-union", "cgen": "community-generation", "defibear": "3x-short-defi-index-token", "xautbull": "3x-long-tether-gold-token", "bchbull": "3x-long-bitcoin-cash-token", "cute": "blockchain-cuties-universe", "chft": "crypto-holding-frank-token", "htbear": "3x-short-huobi-token-token", "drgnbull": "3x-long-dragon-index-token", "wgrt": "waykichain-governance-coin", "xac": "general-attention-currency", "btceth7525": "btc-eth-75-25-weight-set", "defihalf": "0-5x-long-defi-index-token", "iqc": "intelligence-quickly-chain", "btmxbull": "3x-long-bitmax-token-token", "umoon": "unicly-mooncats-collection", "sheesh": "sheesh-it-is-bussin-bussin", "dcto": "decentralized-crypto-token", "rsp": "real-estate-sales-platform", "ethbtc7525": "eth-btc-75-25-weight-set", "bsvhalf": "0-5x-long-bitcoin-sv-token", "yfka": "yield-farming-known-as-ash", "xautbear": "3x-short-tether-gold-token", "midbull": "3x-long-midcap-index-token", "arcc": "asia-reserve-currency-coin", "sbx": "degenerate-platform", "cva": "crypto-village-accelerator", "fact": "fee-active-collateral-token", "bchbear": "3x-short-bitcoin-cash-token", "thetabull": "3x-long-theta-network-token", "btmxbear": "3x-short-bitmax-token-token", "innbc": "innovative-bioresearch", "eth20smaco": "eth_20_day_ma_crossover_set", "btcrsiapy": "btc-rsi-crossover-yield-set", "acc": "asian-african-capital-chain", "uartb": "unicly-artblocks-collection", "eth50smaco": "eth-50-day-ma-crossover-set", "bitn": "bitcoin-company-network", "kyte": "kambria-yield-tuning-engine", "btcfund": "btc-fund-active-trading-set", "lpnt": "luxurious-pro-network-token", "altbull": "3x-long-altcoin-index-token", "privbull": "3x-long-privacy-index-token", "ethrsi6040": "eth-rsi-60-40-crossover-set", "qdao": "q-dao-governance-token-v1-0", "bchhedge": "1x-short-bitcoin-cash-token", "court": "optionroom-governance-token", "midbear": "3x-short-midcap-index-token", "kncbull": "3x-long-kyber-network-token", "yfdt": "yearn-finance-diamond-token", "drgnbear": "3x-short-dragon-index-token", "xauthalf": "0-5x-long-tether-gold-token", "cusdtbull": "3x-long-compound-usdt-token", "eth26emaco": "eth-26-day-ema-crossover-set", "privhedge": "1x-short-privacy-index-token", "eth12emaco": "eth-12-day-ema-crossover-set", "blct": "bloomzed-token", "privbear": "3x-short-privacy-index-token", "bchhalf": "0-5x-long-bitcoin-cash-token", "bxa": "blockchain-exchange-alliance", "kncbear": "3x-short-kyber-network-token", "innbcl": "innovativebioresearchclassic", "jchf": "jarvis-synthetic-swiss-franc", "cusdthedge": "1x-short-compound-usdt-token", "drgnhalf": "0-5x-long-dragon-index-token", "bullshit": "3x-long-shitcoin-index-token", "compbull": "3x-long-compound-token-token", "altbear": "3x-short-altcoin-index-token", "thetahedge": "1x-short-theta-network-token", "etas": "eth-trending-alpha-st-set-ii", "cusdtbear": "3x-short-compound-usdt-token", "mqss": "set-of-sets-trailblazer-fund", "scds": "shrine-cloud-storage-network", "thetabear": "3x-short-theta-network-token", "mlr": "mega-lottery-services-global", "uglyph": "unicly-autoglyph-collection", "midhalf": "0-5x-long-midcap-index-token", "eloap": "eth-long-only-alpha-portfolio", "althalf": "0-5x-long-altcoin-index-token", "bloap": "btc-long-only-alpha-portfolio", "ibp": "innovation-blockchain-payment", "tusc": "original-crypto-coin", "jpyq": "jpyq-stablecoin-by-q-dao-v1", "greed": "fear-greed-sentiment-set-ii", "hedgeshit": "1x-short-shitcoin-index-token", "ethbtcemaco": "eth-btc-ema-ratio-trading-set", "ugone": "unicly-gone-studio-collection", "privhalf": "0-5x-long-privacy-index-token", "bearshit": "3x-short-shitcoin-index-token", "thetahalf": "0-5x-long-theta-network-token", "compbear": "3x-short-compound-token-token", "cnyq": "cnyq-stablecoin-by-q-dao-v1", "tip": "technology-innovation-project", "ethbtcrsi": "eth-btc-rsi-ratio-trading-set", "knchalf": "0-5x-long-kyber-network-token", "comphedge": "1x-short-compound-token-token", "ethemaapy": "eth-26-ema-crossover-yield-set", "urevv": "unicly-formula-revv-collection", "jgbp": "jarvis-synthetic-british-pound", "linkethrsi": "link-eth-rsi-ratio-trading-set", "cdsd": "contraction-dynamic-set-dollar", "halfshit": "0-5x-long-shitcoin-index-token", "bcac": "business-credit-alliance-chain", "etcbull": "3x-long-ethereum-classic-token", "uch": "universidad-de-chile-fan-token", "ustonks-apr21": "ustonks-apr21", "yvboost": "yvboost", "bbra": "boobanker-research-association", "epm": "extreme-private-masternode-coin", "bocbp": "btc-on-chain-beta-portfolio-set", "ntrump": "no-trump-augur-prediction-token", "mayfi": "matic-aave-yfi", "mauni": "matic-aave-uni", "madai": "matic-aave-dai", "etcbear": "3x-short-ethereum-classic-token", "bhsc": "blackholeswap-compound-dai-usdc", "eth20macoapy": "eth-20-ma-crossover-yield-set-ii", "matusd": "matic-aave-tusd", "ethpa": "eth-price-action-candlestick-set", "uarc": "unicly-the-day-by-arc-collection", "maweth": "matic-aave-weth", "mausdc": "matic-aave-usdc", "etchalf": "0-5x-long-ethereum-classic-token", "maaave": "matic-aave-aave", "mausdt": "matic-aave-usdt", "malink": "matic-aave-link", "ibvol": "1x-short-btc-implied-volatility", "ugas-jan21": "ulabs-synthetic-gas-futures-expiring-1-jan-2021", "ebloap": "eth-btc-long-only-alpha-portfolio", "ethmacoapy": "eth-20-day-ma-crossover-yield-set", "bqt": "blockchain-quotations-index-token", "pxgold-may2021": "pxgold-synthetic-gold-31-may-2021", "usns": "ubiquitous-social-network-service", "ylab": "yearn-finance-infrastructure-labs", "gusdt": "gusd-token", "zjlt": "zjlt-distributed-factoring-network", "exchbull": "3x-long-exchange-token-index-token", "leloap": "link-eth-long-only-alpha-portfolio", "cring": "darwinia-crab-network", "apeusd-uma-dec21": "apeusd-uma-synthetic-usd-dec-2021", "exchhedge": "1x-short-exchange-token-index-token", "emtrg": "meter-governance-mapped-by-meter-io", "apeusd-snx-dec21": "apeusd-snx-synthetic-usd-dec-2021", "exchbear": "3x-short-exchange-token-index-token", "cbe": "cbe", "apeusd-uni-dec21": "apeusd-uni-synthetic-usd-dec-2021", "apeusd-aave-dec21": "apeusd-aave-synthetic-usd-dec-2021", "apeusd-link-dec21": "apeusd-link-synthetic-usd-dec-2021", "exchhalf": "0-5x-long-echange-token-index-token", "dvp": "decentralized-vulnerability-platform", "ddam": "decentralized-data-assets-management", "qdefi": "qdefi-rating-governance-token-v2", "ugas-jun21": "ugas-jun21", "ujord": "unicly-air-jordan-1st-drop-collection", "linkethpa": "eth-link-price-action-candlestick-set", "realtoken-8342-schaefer-hwy-detroit-mi": "realtoken-8342-schaefer-hwy-detroit-mi", "realtoken-9336-patton-st-detroit-mi": "realtoken-9336-patton-st-detroit-mi", "dml": "decentralized-machine-learning", "realtoken-20200-lesure-st-detroit-mi": "realtoken-20200-lesure-st-detroit-mi", "pxusd-mar2022": "pxusd-synthetic-usd-expiring-31-mar-2022", "pxusd-mar2021": "pxusd-synthetic-usd-expiring-1-april-2021", "cdr": "communication-development-resources-token", "pxgold-mar2022": "pxgold-synthetic-gold-expiring-31-mar-2022", "realtoken-16200-fullerton-ave-detroit-mi": "realtoken-16200-fullerton-avenue-detroit-mi", "realtoken-10024-10028-appoline-st-detroit-mi": "realtoken-10024-10028-appoline-st-detroit-mi", "bchnrbtc-jan-2021": "bchnrbtc-synthetic", "uusdweth-dec": "yusd-synthetic-token-expiring-31-december-2020", "uusdrbtc-dec": "uusdrbtc-synthetic-token-expiring-31-december-2020", "mario-cash-jan-2021": "mario-cash-jan-2021"};

//end
