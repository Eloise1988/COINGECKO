
/*====================================================================================================================================*
  CoinGecko Google Sheet Feed by Eloise1988
  ====================================================================================================================================
  Version:      2.0.4
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
  
  2.0.4  May 31st Added functionality COINGECKO PRIVATE KEY
 *====================================================================================================================================*/
//CACHING TIME  
//Expiration time for caching values, by default caching data last 10min=600sec. This value is a const and can be changed to your needs.
const expirationInSeconds=600;

//COINGECKO PRIVATE KEY 
//Expiration time for caching values, by default caching data last 10min=600sec. This value is a const and can be changed to your needs
const cg_pro_api_key="";


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
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/simple/price?ids=" + coinList + "&vs_currencies=" + versusCoinList+pro_path_key).getContentText());
    
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
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    let tickerList = JSON.parse(UrlFetchApp.fetch("https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList+pro_path_key).getContentText());
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

  pro_path="api"
  pro_path_key=""
  if (cg_pro_api_key != "") {
    pro_path="pro-api"
    pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
  }

  if(by_ticker==true){
    
    try{
    
    url="https://"+ pro_path +".coingecko.com/api/v3/search?locale=fr&img_path_only=1"+pro_path_key;
    
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
    
    
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/"+id_coin+"/history?date="+date_ddmmyyy+"&localization=false"+pro_path_key;
    
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

    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }
    
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/"+id_coin+"/market_chart?vs_currency="+ticker2+"&days="+nb_days+pro_path_key;
    
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

  pro_path="api"
  pro_path_key=""
  if (cg_pro_api_key != "") {
    pro_path="pro-api"
    pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
  }

  if(by_ticker==true){
    
    try{
    
    url="https://"+pro_path+".coingecko.com/api/v3/search?locale=fr&img_path_only=1"+pro_path_key;
    
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

    url="https://"+ pro_path +".coingecko.com/api/v3/coins/"+id_coin+pro_path_key;
    

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

  pro_path="api"
  pro_path_key=""
  if (cg_pro_api_key != "") {
    pro_path="pro-api"
    pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
  }
  
  // Gets a cache that is common to all users of the script.
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }
  try{
    url="https://"+ pro_path +".coingecko.com/api/v3/search?locale=fr&img_path_only=1"+pro_path_key;
    
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
    
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/"+id_coin+"/market_chart?vs_currency="+ticker2+"&days="+nb_days+pro_path_key;
    
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
  pro_path="api"
  pro_path_key=""
  if (cg_pro_api_key != "") {
    pro_path="pro-api"
    pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
  }
  try{
      url="https://"+ pro_path +".coingecko.com/api/v3/search?locale=fr&img_path_only=1"+pro_path_key;
    
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
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + id_coin+pro_path_key;
    
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
  pro_path="api"
  pro_path_key=""
  if (cg_pro_api_key != "") {
    pro_path="pro-api"
    pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
  }
  try{
      
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + id_coin+pro_path_key;
    
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
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }
    
    url="https://"+ pro_path +".coingecko.com/api/v3/simple/price?ids="+id_coin+"&vs_currencies="+currency+pro_path_key;
    
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

    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }
    
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin+pro_path_key;
    
    
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
    
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    url="https://"+ pro_path +".coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin+pro_path_key;
    
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
const CoinList = {"index": "index-cooperative", "btc": "bitcoin", "eth": "ethereum", "usdt": "tether", "ada": "cardano", "bnb": "binancecoin", "xrp": "ripple", "doge": "dogecoin", "usdc": "usd-coin", "dot": "polkadot", "icp": "internet-computer", "uni": "uniswap", "bch": "bitcoin-cash", "link": "chainlink", "matic": "matic-network", "ltc": "litecoin", "xlm": "stellar", "busd": "binance-usd", "etc": "ethereum-classic", "sol": "solana", "vet": "vechain", "wbtc": "wrapped-bitcoin", "theta": "theta-token", "eos": "eos", "trx": "tron", "fil": "filecoin", "xmr": "monero", "dai": "dai", "aave": "aave", "shib": "shiba-inu", "neo": "neo", "okb": "okb", "klay": "klay-token", "ceth": "compound-ether", "cdai": "cdai", "bsv": "bitcoin-cash-sv", "cusdc": "compound-usd-coin", "cel": "celsius-degree-token", "cro": "crypto-com-chain", "atom": "cosmos", "mkr": "maker", "miota": "iota", "rune": "thorchain", "xtz": "tezos", "cake": "pancakeswap-token", "ksm": "kusama", "ftt": "ftx-token", "algo": "algorand", "ht": "huobi-token", "luna": "terra-luna", "btt": "bittorrent-2", "safemoon": "safemoon", "avax": "avalanche-2", "leo": "leo-token", "dcr": "decred", "comp": "compound-governance-token", "ust": "terrausd", "sushi": "sushi", "dash": "dash", "snx": "havven", "hbar": "hedera-hashgraph", "egld": "elrond-erd-2", "tel": "telcoin", "amp": "amp-token", "zec": "zcash", "tfuel": "theta-fuel", "xem": "nem", "hot": "holotoken", "yfi": "yearn-finance", "enj": "enjincoin", "chz": "chiliz", "hnt": "helium", "zil": "zilliqa", "waves": "waves", "tusd": "true-usd", "pax": "paxos-standard", "near": "near", "zen": "zencash", "qtum": "qtum", "hbtc": "huobi-btc", "nexo": "nexo", "steth": "staked-ether", "bat": "basic-attention-token", "mana": "decentraland", "fei": "fei-protocol", "stx": "blockstack", "btg": "bitcoin-gold", "nano": "nano", "one": "harmony", "ont": "ontology", "grt": "the-graph", "dgb": "digibyte", "bnt": "bancor", "omg": "omisego", "husd": "husd", "sc": "siacoin", "xsushi": "xsushi", "zrx": "0x", "uma": "uma", "chsb": "swissborg", "ftm": "fantom", "lusd": "liquity-usd", "ankr": "ankr", "gt": "gatechain-token", "arrr": "pirate-chain", "rvn": "ravencoin", "iost": "iostoken", "xdc": "xdce-crowd-sale", "icx": "icon", "bake": "bakerytoken", "nxm": "nxm", "crv": "curve-dao-token", "ar": "arweave", "cusdt": "compound-usdt", "flow": "flow", "wrx": "wazirx", "xch": "chia", "npxs": "pundi-x", "vgx": "ethos", "kcs": "kucoin-shares", "lpt": "livepeer", "qnt": "quant-network", "feg": "feg-token", "1inch": "1inch", "bcd": "bitcoin-diamond", "lsk": "lisk", "omi": "ecomi", "hbc": "hbtc-token", "skl": "skale", "10set": "tenset", "rsr": "reserve-rights-token", "erg": "ergo", "oxy": "oxygen", "lrc": "loopring", "pundix": "pundi-x-2", "seth": "seth", "xvg": "verge", "ren": "republic-protocol", "win": "wink", "celo": "celo", "ckb": "nervos-network", "snt": "status", "renbtc": "renbtc", "tribe": "tribe-2", "usdn": "neutrino", "dent": "dent", "bcha": "bitcoin-cash-abc-2", "rlc": "iexec-rlc", "reef": "reef-finance", "titan": "titanswap", "asd": "asd", "maid": "maidsafecoin", "vtho": "vethor-token", "mir": "mirror-protocol", "band": "band-protocol", "xvs": "venus", "ewt": "energy-web-token", "cuni": "compound-uniswap", "bal": "balancer", "nmr": "numeraire", "svcs": "givingtoservices", "cfx": "conflux-token", "glm": "golem", "alusd": "alchemix-usd", "axs": "axie-infinity", "mdx": "mdex", "ton": "tokamak-network", "celr": "celer-network", "inj": "injective-protocol", "btcst": "btc-standard-hashrate-token", "gno": "gnosis", "paxg": "pax-gold", "iotx": "iotex", "ocean": "ocean-protocol", "agi": "singularitynet", "prom": "prometeus", "susd": "nusd", "waxp": "wax", "tlm": "alien-worlds", "nkn": "nkn", "rpl": "rocket-pool", "ogn": "origin-protocol", "ray": "raydium", "fun": "funfair", "kava": "kava", "oxt": "orchid-protocol", "alpha": "alpha-finance", "sand": "the-sandbox", "alcx": "alchemix", "srm": "serum", "ampl": "ampleforth", "stmx": "storm", "cvc": "civic", "klv": "klever", "ardr": "ardor", "fet": "fetch-ai", "xprt": "persistence", "med": "medibloc", "poly": "polymath-network", "ctsi": "cartesi", "iq": "everipedia", "steem": "steem", "akt": "akash-network", "dodo": "dodo", "math": "math", "woo": "wootrade-network", "orbs": "orbs", "lend": "ethlend", "vlx": "velas", "orn": "orion-protocol", "kmd": "komodo", "ark": "ark", "audio": "audius", "twt": "trust-wallet-token", "anc": "anchor-protocol", "forth": "ampleforth-governance-token", "zks": "zkswap", "mona": "monacoin", "meta": "metadium", "divi": "divi", "sxp": "swipe", "hxro": "hxro", "uqc": "uquid-coin", "zmt": "zipmex-token", "eps": "ellipsis", "perp": "perpetual-protocol", "xaut": "tether-gold", "kobe": "shabu-shabu", "etn": "electroneum", "ubt": "unibright", "bts": "bitshares", "wan": "wanchain", "hive": "hive", "coti": "coti", "ant": "aragon", "strax": "stratis", "storj": "storj", "xhv": "haven", "nwc": "newscrypto-coin", "kncl": "kyber-network", "rep": "augur", "dpi": "defipulse-index", "uos": "ultra", "ava": "concierge-io", "rif": "rif-token", "wnxm": "wrapped-nxm", "btm": "bytom", "ghx": "gamercoin", "utk": "utrust", "mtl": "metal", "sys": "syscoin", "dnt": "district0x", "quick": "quick", "rfox": "redfox-labs-2", "usdp": "usdp", "loc": "lockchain", "alice": "my-neighbor-alice", "noia": "noia-network", "gusd": "gemini-dollar", "rdd": "reddcoin", "nmx": "nominex", "mx": "mx-token", "rose": "oasis-network", "exrd": "e-radix", "gas": "gas", "c20": "crypto20", "cards": "cardstarter", "tomo": "tomochain", "lyxe": "lukso-token", "evn": "evolution-finance", "tko": "tokocrypto", "frax": "frax", "qkc": "quark-chain", "pac": "paccoin", "mist": "alchemist", "czrx": "compound-0x", "col": "unit-protocol", "elf": "aelf", "pha": "pha", "pols": "polkastarter", "fx": "fx-coin", "dao": "dao-maker", "rndr": "render-token", "powr": "power-ledger", "keep": "keep-network", "tru": "truefi", "trac": "origintrail", "sfp": "safepal", "vra": "verasity", "hydra": "hydra", "scrt": "secret", "hoge": "hoge-finance", "gny": "gny", "snm": "sonm", "badger": "badger-dao", "nu": "nucypher", "aeth": "ankreth", "lina": "linear", "kai": "kardiachain", "sure": "insure", "dag": "constellation-labs", "adx": "adex", "mask": "mask-network", "atri": "atari", "hns": "handshake", "mln": "melon", "vai": "vai", "prq": "parsiq", "auction": "auction", "trb": "tellor", "xcm": "coinmetro", "aion": "aion", "jst": "just", "rook": "rook", "kin": "kin", "elon": "dogelon-mars", "cream": "cream-2", "mft": "mainframe", "lqty": "liquity", "fida": "bonfida", "bcn": "bytecoin", "lamb": "lambda", "firo": "zcoin", "cbat": "compound-basic-attention-token", "duck": "unit-protocol-duck", "cre": "carry", "gala": "gala", "chr": "chromaway", "nrg": "energi", "edg": "edgeware", "iris": "iris-network", "fine": "refinable", "ppt": "populous", "sero": "super-zero", "api3": "api3", "boa": "bosagora", "dia": "dia-data", "ern": "ethernity-chain", "pond": "marlin", "slp": "smooth-love-potion", "pcx": "chainx", "ignis": "ignis", "htr": "hathor", "vrsc": "verus-coin", "alpaca": "alpaca-finance", "ddx": "derivadao", "nbr": "niobio-cash", "super": "superfarm", "rly": "rally-2", "wozx": "wozx", "cru": "crust-network", "yfii": "yfii-finance", "val": "sora-validator-token", "tt": "thunder-token", "lon": "tokenlon", "zai": "zero-collateral-dai", "bond": "barnbridge", "cbk": "cobak-token", "tryb": "bilira", "seur": "seur", "albt": "allianceblock", "grs": "groestlcoin", "rgt": "rari-governance-token", "eco": "ecofi", "mxc": "mxc", "safemars": "safemars", "pnk": "kleros", "ersdl": "unfederalreserve", "bifi": "beefy-finance", "ae": "aeternity", "swap": "trustswap", "paid": "paid-network", "ramp": "ramp", "tlos": "telos", "gtc": "gitcoin", "sbd": "steem-dollars", "peak": "marketpeak", "beam": "beam", "nuls": "nuls", "ela": "elastos", "hegic": "hegic", "znn": "zenon", "nrv": "nerve-finance", "get": "get-token", "kda": "kadena", "bscpad": "bscpad", "loomold": "loom-network", "df": "dforce-token", "pvm": "privateum", "xyo": "xyo-network", "cummies": "cumrocket", "solve": "solve-care", "rfr": "refereum", "req": "request-network", "whale": "whale", "emc2": "einsteinium", "vsp": "vesper-finance", "lbc": "lbry-credits", "knc": "kyber-network-crystal", "blz": "bluzelle", "ctk": "certik", "lit": "litentry", "akro": "akropolis", "data": "streamr-datacoin", "core": "cvault-finance", "wicc": "waykichain", "lto": "lto-network", "ycc": "yuan-chain-coin", "stpt": "stp-network", "apl": "apollo", "gxc": "gxchain", "fsn": "fsn", "ldo": "lido-dao", "maps": "maps", "nsbt": "neutrino-system-base-token", "creth2": "cream-eth2", "vite": "vite", "step": "step-finance", "pivx": "pivx", "bel": "bella-protocol", "btse": "btse-token", "sbtc": "sbtc", "om": "mantra-dao", "shr": "sharering", "xor": "sora", "oxen": "loki-network", "krt": "terra-krw", "stake": "xdai-stake", "drgn": "dragonchain", "ohm": "olympus", "cusd": "celo-dollar", "dsla": "stacktical", "btu": "btu-protocol", "xhdx": "hydradx", "slink": "slink", "mer": "mercurial", "aergo": "aergo", "bar": "fc-barcelona-fan-token", "lgcy": "lgcy-network", "skey": "smartkey", "eth2x-fli": "eth-2x-flexible-leverage-index", "mcb": "mcdex", "nim": "nimiq-2", "nxs": "nexus", "eac": "earthcoin", "occ": "occamfi", "suku": "suku", "lgo": "legolas-exchange", "vsys": "v-systems", "wex": "waultswap", "armor": "armor", "xbase": "eterbase", "aqt": "alpha-quark-token", "sai": "sai", "hez": "hermez-network-token", "dusk": "dusk-network", "velo": "velo", "tvk": "terra-virtua-kolect", "any": "anyswap", "hc": "hshare", "bao": "bao-finance", "bzrx": "bzx-protocol", "dego": "dego-finance", "superbid": "superbid", "pnt": "pnetwork", "burst": "burst", "rari": "rarible", "dgd": "digixdao", "cope": "cope", "bfc": "bifrost", "fio": "fio-protocol", "vtc": "vertcoin", "front": "frontier-token", "nxt": "nxt", "sfi": "saffron-finance", "hard": "hard-protocol", "glch": "glitch-protocol", "cos": "contentos", "pro": "propy", "arpa": "arpa-chain", "ghst": "aavegotchi", "ioc": "iocoin", "trias": "trias-token", "dbc": "deepbrain-chain", "eurs": "stasis-eurs", "met": "metronome", "farm": "harvest-finance", "chain": "chain-games", "zb": "zb-token", "mhc": "metahash", "srk": "sparkpoint", "zano": "zano", "spi": "shopping-io", "vxv": "vectorspace", "dmt": "dmarket", "free": "free-coin", "uft": "unlend-finance", "veri": "veritaseum", "slt": "smartlands", "ppc": "peercoin", "bip": "bip", "hai": "hackenai", "rad": "radicle", "ilv": "illuvium", "fxs": "frax-share", "clo": "callisto", "png": "pangolin", "swth": "switcheo", "id": "everid", "pool": "pooltogether", "root": "rootkit", "auto": "auto", "bondly": "bondly", "dock": "dock", "vid": "videocoin", "upp": "sentinel-protocol", "hopr": "hopr", "fis": "stafi", "mslv": "mirrored-ishares-silver-trust", "edr": "endor", "go": "gochain", "psg": "paris-saint-germain-fan-token", "mbl": "moviebloc", "rcn": "ripio-credit-network", "visr": "visor", "zcn": "0chain", "yld": "yield-app", "torn": "tornado-cash", "usdk": "usdk", "bmi": "bridge-mutual", "kuma": "kuma-inu", "conv": "convergence", "kyl": "kylin-network", "tbtc": "tbtc", "mtsla": "mirrored-tesla", "dcn": "dentacoin", "rai": "rai", "musd": "musd", "dg": "decentral-games", "mgoogl": "mirrored-google", "xsgd": "xsgd", "mqqq": "mirrored-invesco-qqq-trust", "ult": "ultiledger", "mith": "mithril", "dero": "dero", "ast": "airswap", "nest": "nest", "xsn": "stakenet", "moc": "mossland", "wing": "wing-finance", "sky": "skycoin", "fly": "franklin", "cnd": "cindicator", "xrt": "robonomics-network", "idex": "aurora-dao", "hunt": "hunt-token", "kp3r": "keep3rv1", "usdx": "usdx", "sx": "sportx", "cube": "somnium-space-cubes", "phb": "red-pulse", "sntvt": "sentivate", "bax": "babb", "insur": "insurace", "mtwtr": "mirrored-twitter", "zee": "zeroswap", "xdb": "digitalbits", "maapl": "mirrored-apple", "nif": "unifty", "dea": "dea", "mamzn": "mirrored-amazon", "swingby": "swingby", "ban": "banano", "pib": "pibble", "bor": "boringdao", "cvxcrv": "convex-crv", "qsp": "quantstamp", "muso": "mirrored-united-states-oil-fund", "mnflx": "mirrored-netflix", "mmsft": "mirrored-microsoft", "gbyte": "byteball", "aria20": "arianee", "pltc": "platoncoin", "dip": "etherisc", "mbx": "mobiecoin", "snl": "sport-and-leisure", "rdn": "raiden-network", "dext": "idextools", "mbaba": "mirrored-alibaba", "dep": "deapcoin", "route": "route", "cudos": "cudos", "vitae": "vitae", "cxo": "cargox", "nmc": "namecoin", "nex": "neon-exchange", "cas": "cashaa", "vee": "blockv", "soul": "phantasma", "cvp": "concentrated-voting-power", "belt": "belt", "ibbtc": "interest-bearing-bitcoin", "xpr": "proton", "bz": "bit-z-token", "atm": "atletico-madrid", "bmx": "bitmart-token", "mta": "meta", "qash": "qash", "nebl": "neblio", "soc": "all-sports", "revv": "revv", "zoom": "coinzoom-token", "salt": "salt", "mrph": "morpheus-network", "card": "cardstack", "mod": "modefi", "govi": "govi", "helmet": "helmet-insure", "flux": "zelcash", "fxf": "finxflo", "smart": "smartcash", "aleph": "aleph", "cvnt": "content-value-network", "nftx": "nftx", "spnd": "spendcoin", "aioz": "aioz-network", "gero": "gerowallet", "grin": "grin", "juld": "julswap", "gto": "gifto", "upunk": "unicly-cryptopunks-collection", "oly": "olyseum", "unfi": "unifi-protocol-dao", "acs": "acryptos", "sha": "safe-haven", "wtc": "waltonchain", "veth": "vether", "nas": "nebulas", "dfy": "defi-for-you", "bepro": "bet-protocol", "gal": "galatasaray-fan-token", "bft": "bnktothefuture", "tone": "te-food", "wcres": "wrapped-crescofin", "sfund": "seedify-fund", "juv": "juventus-fan-token", "fwt": "freeway-token", "key": "selfkey", "adp": "adappter-token", "vidt": "v-id-blockchain", "zap": "zap", "like": "likecoin", "ujenny": "jenny-metaverse-dao-token", "mix": "mixmarvel", "esd": "empty-set-dollar", "suter": "suterusu", "cocos": "cocos-bcx", "cut": "cutcoin", "htb": "hotbit-token", "opium": "opium", "for": "force-protocol", "sdt": "stake-dao", "cfi": "cyberfi", "dvpn": "sentinel-group", "oxb": "oxbull-tech", "ring": "darwinia-network-native-token", "fst": "futureswap", "nlg": "gulden", "ifc": "infinitecoin", "bytz": "slate", "spell": "spell-token", "nav": "nav-coin", "impulse": "impulse-by-fdr", "mbox": "mobox", "gvt": "genesis-vision", "polydoge": "polydoge", "apy": "apy-finance", "stn": "stone-token", "wow": "wownero", "mdt": "measurable-data-token", "bdi": "basketdao-defi-index", "kan": "kan", "baas": "baasid", "elg": "escoin-token", "frm": "ferrum-network", "fcl": "fractal", "ousd": "origin-dollar", "quai": "quai-dao", "six": "six-network", "safe2": "safe2", "props": "props", "bux": "blockport", "kine": "kine-protocol", "wault": "wault-finance-old", "prob": "probit-exchange", "dexe": "dexe", "media": "media-network", "axel": "axel", "oil": "oiler", "via": "viacoin", "buidl": "dfohub", "cvn": "cvcoin", "dyn": "dynamic", "fts": "footballstars", "yvault-lp-ycurve": "yvault-lp-ycurve", "mph": "88mph", "yve-crvdao": "vecrv-dao-yvault", "axn": "axion", "fic": "filecash", "zt": "ztcoin", "mcash": "midas-cash", "crpt": "crypterium", "strong": "strong", "lmt": "lympo-market-token", "moon": "mooncoin", "dht": "dhedge-dao", "pi": "pchain", "fct": "factom", "ovr": "ovr", "waultx": "wault", "blank": "blank", "aitra": "aitra", "socks": "unisocks", "k21": "k21", "mda": "moeda-loyalty-points", "xed": "exeedme", "bdt": "blackdragon-token", "bank": "float-protocol", "tct": "tokenclub", "pre": "presearch", "troy": "troy", "time": "chronobank", "dora": "dora-factory", "ichi": "ichi-farm", "wxt": "wirex", "digg": "digg", "ones": "oneswap-dao-token", "uncx": "unicrypt-2", "amlt": "coinfirm-amlt", "el": "elysia", "webd": "webdollar", "game": "gamecredits", "inv": "inverse-finance", "ode": "odem", "coin": "coinvest", "cs": "credits", "trtl": "turtlecoin", "qrl": "quantum-resistant-ledger", "polx": "polylastic", "polk": "polkamarkets", "vfox": "vfox", "acm": "ac-milan-fan-token", "brd": "bread", "pbtc35a": "pbtc35a", "pmon": "pocmon", "credit": "credit", "ddim": "duckdaodime", "cbc": "cashbet-coin", "boson": "boson-protocol", "value": "value-liquidity", "zero": "zero-exchange", "idle": "idle", "lcx": "lcx", "ubxt": "upbots", "kex": "kira-network", "filda": "filda", "oce": "oceanex-token", "lym": "lympo", "etp": "metaverse-etp", "cws": "crowns", "dust": "dust-token", "cover": "cover-protocol", "tau": "lamden", "tidal": "tidal-finance", "xdn": "digitalnote", "pnd": "pandacoin", "bbr": "bitberry-token", "cvx": "convex-finance", "spc": "spacechain-erc-20", "pendle": "pendle", "wom": "wom-token", "flx": "reflexer-ungovernance-token", "unc": "unicrypt", "mpl": "maple-finance", "xfund": "xfund", "abt": "arcblock", "mwat": "restart-energy", "xend": "xend-finance", "wabi": "wabi", "pbtc": "ptokens-btc", "mitx": "morpheus-labs", "arch": "archer-dao-governance-token", "mark": "benchmark-protocol", "rbc": "rubic", "orai": "oraichain-token", "rfuel": "rio-defi", "sylo": "sylo", "block": "blocknet", "ask": "permission-coin", "psl": "pastel", "bscx": "bscex", "meth": "mirrored-ether", "cdt": "blox", "woofy": "woofy", "ptf": "powertrade-fuel", "mtv": "multivac", "part": "particl", "ndx": "indexed-finance", "raini": "rainicorn", "lcc": "litecoin-cash", "xava": "avalaunch", "cmt": "cybermiles", "mtlx": "mettalex", "oddz": "oddz", "ltx": "lattice-token", "labs": "labs-group", "mbtc": "mstable-btc", "evx": "everex", "deus": "deus-finance", "ncash": "nucleus-vision", "nct": "polyswarm", "jrt": "jarvis-reward-token", "glq": "graphlinq-protocol", "oax": "openanx", "coval": "circuits-of-value", "dxd": "dxdao", "tips": "fedoracoin", "meme": "degenerator", "slice": "tranche-finance", "iqn": "iqeon", "kono": "konomi-network", "paint": "paint", "ablock": "any-blocknet", "swftc": "swftcoin", "swrv": "swerve-dao", "si": "siren", "mtx": "matryx", "marsh": "unmarshal", "saito": "saito", "xcash": "x-cash", "wpr": "wepower", "ubq": "ubiq", "foam": "foam-protocol", "combo": "furucombo", "cnfi": "connect-financial", "spirit": "spiritswap", "dextf": "dextf", "eosc": "eosforce", "yam": "yam-2", "wgr": "wagerr", "layer": "unilayer", "fund": "unification", "propel": "payrue", "ost": "simple-token", "lpool": "launchpool", "dough": "piedao-dough-v2", "fuel": "fuel-token", "bmxx": "multiplier-bsc", "mobi": "mobius", "ppay": "plasma-finance", "opct": "opacity", "defi5": "defi-top-5-tokens-index", "push": "ethereum-push-notification-service", "adk": "aidos-kuneen", "aoa": "aurora", "sparta": "spartan-protocol-token", "myst": "mysterium", "bunny": "pancake-bunny", "ktn": "kattana", "plu": "pluton", "abyss": "the-abyss", "ngm": "e-money", "abl": "airbloc-protocol", "trade": "unitrade", "udoo": "howdoo", "tnb": "time-new-bank", "unn": "union-protocol-governance-token", "unic": "unicly", "pickle": "pickle-finance", "dtx": "databroker-dao", "bmc": "bountymarketcap", "koge": "bnb48-club-token", "sake": "sake-token", "xcur": "curate", "hget": "hedget", "cnns": "cnns", "boo": "spookyswap", "pkf": "polkafoundry", "bix": "bibox-token", "enq": "enq-enecuum", "plr": "pillar", "poa": "poa-network", "dusd": "defidollar", "appc": "appcoins", "txl": "tixl-new", "hny": "honey", "nfy": "non-fungible-yearn", "cht": "coinhe-token", "kit": "dexkit", "vnla": "vanilla-network", "umb": "umbrella-network", "scc": "stakecube", "exnt": "exnetwork-token", "npx": "napoleon-x", "vrx": "verox", "dec": "decentr", "xmx": "xmax", "shift": "shift", "xpx": "proximax", "rocks": "rocki", "spore": "spore-finance-2", "valor": "smart-valor", "bscs": "bsc-station", "san": "santiment-network-token", "vib": "viberate", "yaxis": "yaxis", "cofi": "cofix", "egg": "goose-finance", "apm": "apm-coin", "cops": "cops-finance", "fnt": "falcon-token", "btcp": "bitcoin-private", "niox": "autonio", "yla": "yearn-lazy-ape", "mxx": "multiplier", "fuse": "fuse-network-token", "hakka": "hakka-finance", "act": "achain", "axpr": "axpire", "muse": "muse-2", "btx": "bitcore", "chi": "chimaera", "nebo": "csp-dao-network", "krl": "kryll", "sdx": "swapdex", "top": "top-network", "anj": "anj", "nec": "nectar-token", "btc2": "bitcoin-2", "nds": "nodeseeds", "uip": "unlimitedip", "sngls": "singulardtv", "naos": "naos-finance", "dmd": "diamond", "dfd": "defidollar-dao", "poolz": "poolz-finance", "euno": "euno", "open": "open-governance-token", "hzn": "horizon-protocol", "brew": "cafeswap-token", "wolf": "moonwolf-io", "start": "bscstarter", "sdefi": "sdefi", "razor": "razor-network", "rio": "realio-network", "ruff": "ruff", "efx": "effect-network", "utnp": "universa", "sense": "sense", "hyve": "hyve", "cate": "catecoin", "xio": "xio", "mth": "monetha", "deri": "deri-protocol", "agve": "agave-token", "spank": "spankchain", "synx": "syndicate", "vex": "vexanium", "tfb": "truefeedbackchain", "cgg": "chain-guardians", "shft": "shyft-network-2", "pay": "tenx", "smt": "smartmesh", "hord": "hord", "must": "must", "dta": "data", "koin": "koinos", "egt": "egretia", "hit": "hitchain", "daofi": "daofi", "gnx": "genaro-network", "eng": "enigma", "ocn": "odyssey", "ice": "ice-token", "pma": "pumapay", "mtrg": "meter", "cwbtc": "compound-wrapped-btc", "qlc": "qlink", "shroom": "shroom-finance", "dos": "dos-network", "bdp": "big-data-protocol", "grid": "grid", "ach": "alchemy-pay", "argon": "argon", "prt": "portion", "bwf": "beowulf", "onion": "deeponion", "rsv": "reserve", "ares": "ares-protocol", "cov": "covesting", "haus": "daohaus", "xmy": "myriadcoin", "og": "og-fan-token", "lix": "lixir-protocol", "shopx": "splyt", "emc": "emercoin", "plot": "plotx", "watch": "yieldwatch", "b21": "b21", "gth": "gather", "iov": "starname", "rendoge": "rendoge", "la": "latoken", "julien": "julien", "l2": "leverj-gluon", "asr": "as-roma-fan-token", "rby": "rubycoin", "awx": "auruscoin", "swag": "swag-finance", "jur": "jur", "reap": "reapchain", "rbase": "rbase-finance", "star": "starbase", "raze": "raze-network", "geo": "geodb", "nix": "nix-platform", "mds": "medishares", "white": "whiteheart", "dhc": "deltahub-community", "dlt": "agrello", "ntk": "neurotoken", "shard": "shard", "satt": "satt", "robot": "robot", "kat": "kambria", "jup": "jupiter", "axis": "axis-defi", "ftc": "feathercoin", "minds": "minds", "apys": "apyswap", "hy": "hybrix", "world": "world-token", "xpat": "pangea", "man": "matrix-ai-network", "sph": "spheroid-universe", "xla": "stellite", "safe": "safe-coin-2", "tkn": "tokencard", "nsure": "nsure-network", "unistake": "unistake", "linka": "linka", "matter": "antimatter", "btc2x-fli": "btc-2x-flexible-leverage-index", "etho": "ether-1", "bitcny": "bitcny", "ong": "ong-social", "dev": "dev-protocol", "crep": "compound-augur", "umx": "unimex-network", "hvn": "hiveterminal", "yf-dai": "yfdai-finance", "mint": "public-mint", "miau": "mirrored-ishares-gold-trust", "itc": "iot-chain", "srn": "sirin-labs-token", "swm": "swarm", "roobee": "roobee", "yop": "yield-optimization-platform", "wdc": "worldcoin", "chp": "coinpoker", "chg": "charg-coin", "neu": "neumark", "ezw": "ezoow", "room": "option-room", "glc": "goldcoin", "rev": "revain", "par": "parachute", "ten": "tokenomy", "int": "internet-node-token", "bskt": "basketcoin", "ads": "adshares", "pros": "prosper", "ghost": "ghost-by-mcafee", "dgtx": "digitex-futures-exchange", "bry": "berry-data", "xtk": "xtoken", "maha": "mahadao", "ele": "eleven-finance", "apw": "apwine", "raven": "raven-protocol", "bac": "basis-cash", "0xbtc": "oxbitcoin", "tera": "tera-smart-money", "zig": "zignaly", "owc": "oduwa-coin", "nft": "nft-protocol", "xcp": "counterparty", "aur": "auroracoin", "its": "iteration-syndicate", "dashd": "dash-diamond", "gxt": "gem-exchange-and-trading", "cntr": "centaur", "urus": "urus-token", "pepecash": "pepecash", "font": "font", "yee": "yee", "rmt": "sureremit", "ixc": "ixcoin", "btcz": "bitcoinz", "nyzo": "nyzo", "eosdt": "equilibrium-eosdt", "asp": "aspire", "dafi": "dafi-protocol", "lien": "lien", "hpb": "high-performance-blockchain", "yfl": "yflink", "1337": "e1337", "boom": "boom-token", "twin": "twinci", "oap": "openalexa-protocol", "dov": "dovu", "onx": "onx-finance", "crbn": "carbon", "you": "you-chain", "octo": "octofi", "gains": "gains", "mork": "mork", "bbc": "tradove", "tky": "thekey", "bxc": "bitcoin-classic", "tra": "trabzonspor-fan-token", "gmee": "gamee", "cv": "carvertical", "ruler": "ruler-protocol", "giv": "givly-coin", "777": "jackpot", "vidya": "vidya", "token": "chainswap", "bcp": "bitcashpay", "idna": "idena", "blt": "bloom", "cti": "clintex-cti", "b20": "b20", "kpad": "kickpad", "phr": "phore", "drc": "digital-reserve-currency", "alias": "spectrecoin", "utu": "utu-coin", "erc20": "erc20", "tern": "ternio", "$anrx": "anrkey-x", "flo": "flo", "cc10": "cryptocurrency-top-10-tokens-index", "zefu": "zenfuse", "geeq": "geeq", "asko": "askobar-network", "oin": "oin-finance", "amb": "amber", "fdr": "french-digital-reserve", "banana": "apeswap-finance", "rnt": "oneroot-network", "wasabi": "wasabix", "hbt": "habitat", "edda": "eddaswap", "ugas": "ultrain", "dyp": "defi-yield-protocol", "lua": "lua-token", "bird": "bird-money", "upi": "pawtocol", "pipt": "power-index-pool-token", "spa": "sperax", "gen": "daostack", "wiz": "crowdwiz", "arth": "arth", "dgx": "digix-gold", "nbx": "netbox-coin", "cloak": "cloakcoin", "yfiii": "dify-finance", "hbd": "hive_dollar", "usf": "unslashed-finance", "uncl": "uncl", "grc": "gridcoin-research", "pla": "plair", "mfb": "mirrored-facebook", "premia": "premia", "wings": "wings", "sale": "dxsale-network", "unifi": "unifi", "phnx": "phoenixdao", "cgt": "cache-gold", "degen": "degen-index", "sync": "sync-network", "pefi": "penguin-finance", "gmt": "gambit", "bpro": "b-protocol", "mic": "mith-cash", "bcdt": "blockchain-certified-data-token", "idea": "ideaology", "ut": "ulord", "xst": "stealthcoin", "alpa": "alpaca", "mabnb": "mirrored-airbnb", "true": "true-chain", "bas": "basis-share", "fsw": "fsw-token", "unidx": "unidex", "tnt": "tierion", "amn": "amon", "prcy": "prcy-coin", "cnn": "cnn", "bkbt": "beekan", "deto": "delta-exchange-token", "aga": "aga-token", "stv": "sint-truidense-voetbalvereniging", "tcap": "total-crypto-market-cap-token", "vbk": "veriblock", "blk": "blackcoin", "klp": "kulupu", "mvi": "metaverse-index", "tcp": "the-crypto-prophecies", "stbu": "stobox-token", "pot": "potcoin", "trtt": "trittium", "auc": "auctus", "bet": "eosbet", "bgov": "bgov", "doki": "doki-doki-finance", "drt": "domraider", "arcx": "arc-governance-old", "bis": "bismuth", "gear": "bitgear", "qun": "qunqun", "shake": "spaceswap-shake", "pry": "prophecy", "can": "canyacoin", "sashimi": "sashimi", "midas": "midas", "gum": "gourmetgalaxy", "sig": "xsigma", "omni": "omni", "mvp": "merculet", "uaxie": "unicly-mystic-axies-collection", "dows": "shadows", "snc": "suncontract", "mtc": "medical-token-currency", "gswap": "gameswap-org", "nord": "nord-finance", "esp": "espers", "aid": "aidcoin", "umask": "unicly-hashmasks-collection", "xlq": "alqo", "surf": "surf-finance", "tad": "tadpole-finance", "instar": "insights-network", "crwny": "crowny-token", "epic": "epic-cash", "defi+l": "piedao-defi-large-cap", "dvg": "daoventures", "uuu": "u-network", "mgs": "mirrored-goldman-sachs", "euler": "euler-tools", "tx": "transfercoin", "olt": "one-ledger", "cmp": "component", "uniq": "uniqly", "inf": "infinitus-token", "gfarm2": "gains-v2", "dmg": "dmm-governance", "dappt": "dapp-com", "wild": "wilder-world", "move": "holyheld-2", "bnsd": "bnsd-finance", "gro": "growth-defi", "efl": "electronicgulden", "xpm": "primecoin", "ccx": "conceal", "mamc": "mirrored-amc-entertainment", "auscm": "auric-network", "urqa": "ureeqa", "let": "linkeye", "xeq": "triton", "dgcl": "digicol-token", "bles": "blind-boxes", "epan": "paypolitan-token", "mfg": "smart-mfg", "sak3": "sak3", "ctx": "cryptex-finance", "skm": "skrumble-network", "snow": "snowswap", "sepa": "secure-pad", "pinkm": "pinkmoon", "dax": "daex", "gleec": "gleec-coin", "play": "herocoin", "$based": "based-money", "hnst": "honest-mining", "sin": "suqa", "pink": "pinkcoin", "toa": "toacoin", "agar": "aga-rewards-2", "xft": "offshift", "comfi": "complifi", "dsd": "dynamic-set-dollar", "acat": "alphacat", "zpae": "zelaapayae", "ess": "essentia", "acxt": "ac-exchange-token", "tcake": "pancaketools", "kebab": "kebab-token", "vvt": "versoview", "pwr": "powercoin", "dime": "dimecoin", "cpc": "cpchain", "stzen": "stakedzen", "smly": "smileycoin", "ixi": "ixicash", "snob": "snowball-token", "avt": "aventus", "qbx": "qiibee", "bitg": "bitcoin-green", "xaur": "xaurum", "uwl": "uniwhales", "spdr": "spiderdao", "dis": "tosdis", "42": "42-coin", "d": "denarius", "lxt": "litex", "daps": "daps-token", "fair": "fairgame", "qrk": "quark", "smg": "smaugs-nft", "exy": "experty", "xpc": "experience-chain", "balpha": "balpha", "exrn": "exrnchain", "veo": "amoveo", "pta": "petrachor", "wish": "mywish", "seen": "seen", "xvix": "xvix", "inxt": "internxt", "put": "putincoin", "pgl": "prospectors-gold", "sumo": "sumokoin", "gcr": "global-coin-research", "milk2": "spaceswap-milk2", "nty": "nexty", "kangal": "kangal", "smartcredit": "smartcredit-token", "punk-basic": "punk-basic", "tube": "bittube", "vsf": "verisafe", "sbf": "steakbank-finance", "eosdac": "eosdac", "zhegic": "zhegic", "yoyow": "yoyow", "hyc": "hycon", "flex": "flex-coin", "nuts": "squirrel-finance", "sta": "statera", "zco": "zebi", "fls": "flits", "xbc": "bitcoin-plus", "cot": "cotrader", "kton": "darwinia-commitment-token", "thc": "hempcoin-thc", "pcnt": "playcent", "lba": "libra-credit", "fwb": "friends-with-benefits-pro", "bart": "bartertrade", "launch": "superlauncher", "jul": "jul", "roya": "royale", "eved": "evedo", "equad": "quadrant-protocol", "qrx": "quiverx", "masq": "masq", "ctxc": "cortex", "lnchx": "launchx", "pnode": "pinknode", "tfl": "trueflip", "fvt": "finance-vote", "etha": "etha-lend", "ok": "okcash", "lotto": "lotto", "bask": "basketdao", "uop": "utopia-genesis-foundation", "azuki": "azuki", "coll": "collateral-pay", "2gt": "2gether-2", "sata": "signata", "nrch": "enreachdao", "zora": "zoracles", "bfly": "butterfly-protocol-2", "ufr": "upfiring", "arte": "ethart", "infs": "infinity-esaham", "gdao": "governor-dao", "yield": "yield-protocol", "sfd": "safe-deal", "chonk": "chonk", "xrc": "bitcoin-rhodium", "mdo": "midas-dollar", "res": "resfinex-token", "mgme": "mirrored-gamestop", "zcl": "zclassic", "becn": "beacon", "assy": "assy-index", "gard": "hashgard", "stack": "stacker-ventures", "mog": "mogwai", "kif": "kittenfinance", "ngc": "naga", "vibe": "vibe", "trio": "tripio", "crw": "crown", "waif": "waifu-token", "csai": "compound-sai", "mfi": "marginswap", "kek": "cryptokek", "mrc": "meritcoins", "th": "team-heretics-fan-token", "doges": "dogeswap", "mthd": "method-fi", "klonx": "klondike-finance-v2", "ddd": "scry-info", "fti": "fanstime", "cure": "curecoin", "mega": "megacryptopolis", "uct": "ucot", "cai": "club-atletico-independiente", "vision": "apy-vision", "flixx": "flixxo", "yeed": "yggdrash", "obot": "obortech", "tret": "tourist-review-token", "mm": "mm-token", "cns": "centric-cash", "bree": "cbdao", "lead": "lead-token", "force": "force-dao", "idrt": "rupiah-token", "hgold": "hollygold", "mtn": "medicalchain", "isp": "ispolink", "bitx": "bitscreener", "gysr": "geyser", "iic": "intelligent-investment-chain", "tpay": "tokenpay", "zer": "zero", "1wo": "1world", "vault": "vault", "sign": "signaturechain", "defi++": "piedao-defi", "pfl": "professional-fighters-league-fan-token", "adb": "adbank", "swfl": "swapfolio", "fdo": "firdaos", "cpay": "cryptopay", "bpt": "blackpool-token", "sxrp": "sxrp", "dat": "datum", "fry": "foundrydao-logistics", "pasc": "pascalcoin", "zip": "zip", "eye": "beholder", "mars": "mars", "veil": "veil", "nlc2": "nolimitcoin", "mue": "monetaryunit", "sfuel": "sparkpoint-fuel", "prare": "polkarare", "sgt": "sharedstake-governance-token", "voice": "nix-bridge-token", "tent": "snowgem", "catt": "catex-token", "pvt": "pivot-token", "web": "webcoin", "polis": "polis", "polc": "polka-city", "stsla": "stsla", "bva": "bavala", "bnkr": "bankroll-network", "corn": "cornichon", "dav": "dav", "ybo": "young-boys-fan-token", "udo": "unido-ep", "ktlyo": "katalyo", "zdex": "zeedex", "pgn": "pigeoncoin", "edn": "edenchain", "ppp": "paypie", "rem": "remme", "flash": "flash-stake", "lkr": "polkalokr", "bob": "bobs_repair", "kko": "kineko", "rel": "release-ico-project", "mcx": "machix", "oro": "oro", "smty": "smoothy", "road": "yellow-road", "2key": "2key", "yec": "ycash", "cur": "curio", "scp": "siaprime-coin", "chads": "chads-vc", "add": "add-xyz-new", "hyn": "hyperion", "yae": "cryptonovae", "dets": "dextrust", "exrt": "exrt-network", "vrc": "vericoin", "mt": "mytoken", "reli": "relite-finance", "nyan-2": "nyan-v2", "frc": "freicoin", "l3p": "lepricon", "opt": "open-predict-token", "ait": "aichain", "n8v": "wearesatoshi", "box": "contentbox", "dmst": "dmst", "coni": "coinbene-token", "ethix": "ethichub", "vips": "vipstarcoin", "fera": "fera", "hush": "hush", "vxt": "virgox-token", "wdgld": "wrapped-dgld", "mgo": "mobilego", "zp": "zen-protocol", "four": "the-4th-pillar", "bitto": "bitto-exchange", "ac": "acoconut", "ptoy": "patientory", "sacks": "sacks", "mvixy": "mirrored-proshares-vix", "bxy": "beaxy-exchange", "ag8": "atromg8", "yeti": "yearn-ecosystem-token-index", "rpd": "rapids", "soar": "soar-2", "mchc": "mch-coin", "nfti": "nft-index", "shdc": "shd-cash", "pgt": "polyient-games-governance-token", "face": "face", "aln": "aluna", "kcal": "phantasma-energy", "pbr": "polkabridge", "pylon": "pylon-finance", "zeit": "zeitcoin", "ldfi": "lendefi", "aux": "auxilium", "idh": "indahash", "pmgt": "perth-mint-gold-token", "sact": "srnartgallery", "cap": "cap", "tap": "tapmydata", "adc": "audiocoin", "hbn": "hobonickels", "mcm": "mochimo", "imx": "impermax", "reec": "renewableelectronicenergycoin", "bnf": "bonfi", "dfsocial": "defisocial", "evt": "everitoken", "bull": "buysell", "pigx": "pigx", "stbz": "stabilize", "ubex": "ubex", "renzec": "renzec", "modic": "modern-investment-coin", "enb": "earnbase", "rws": "robonomics-web-services", "adco": "advertise-coin", "ditto": "ditto", "fin": "definer", "rfi": "reflect-finance", "bti": "bitcoin-instant", "chart": "chartex", "ufo": "ufocoin", "ozc": "ozziecoin", "family": "the-bitcoin-family", "use": "usechain", "ionc": "ionchain-token", "rating": "dprating", "troll": "trollcoin", "bcv": "bcv", "scifi": "scifi-finance", "ibfk": "istanbul-basaksehir-fan-token", "xbtc": "xbtc", "lobs": "lobstex-coin", "uat": "ultralpha", "pirate": "piratecash", "spice": "spice-finance", "crx": "cryptex", "nanj": "nanjcoin", "ucash": "ucash", "chx": "chainium", "sada": "sada", "kgo": "kiwigo", "ugotchi": "unicly-aavegotchi-astronauts-collection", "pie": "defipie", "azr": "aezora", "crdt": "crdt", "adm": "adamant-messenger", "atn": "atn", "emt": "emanate", "edu": "educoin", "defi+s": "piedao-defi-small-cap", "hsc": "hashcoin", "totm": "totemfi", "lyr": "lyra", "tdx": "tidex-token", "n3rdz": "n3rd-finance", "afen": "afen-blockchain", "deflct": "deflect", "donut": "donut", "rac": "rac", "cdzc": "cryptodezirecash", "sota": "sota-finance", "mofi": "mobifi", "build": "build-finance", "dexg": "dextoken-governance", "skull": "skull", "snet": "snetwork", "bc": "bitcoin-confidential", "swise": "stakewise", "edc": "edc-blockchain", "cliq": "deficliq", "odin": "odin-protocol", "dfio": "defi-omega", "vrs": "veros", "dun": "dune", "ogo": "origo", "znz": "zenzo", "astro": "astrotools", "krb": "karbo", "ryo": "ryo", "all": "alliance-fan-token", "dfnd": "dfund", "xas": "asch", "dgvc": "degenvc", "omx": "project-shivom", "rare": "unique-one", "spd": "stipend", "xiot": "xiotri", "hmq": "humaniq", "dotx": "deli-of-thrones", "name": "polkadomain", "pst": "primas", "tft": "the-famous-token", "gex": "globex", "cspn": "crypto-sports", "zxc": "0xcert", "elx": "energy-ledger", "feed": "feed-token", "bcug": "blockchain-cuties-universe-governance", "zipt": "zippie", "aog": "smartofgiving", "cat": "cat-token", "adel": "akropolis-delphi", "bscv": "bscview", "cv2": "colossuscoin-v2", "ss": "sharder-protocol", "warp": "warp-finance", "gmat": "gowithmi", "fdz": "friendz", "ucm": "ucrowdme", "xfi": "xfinance", "taco": "tacos", "imt": "moneytoken", "rage": "rage-fan", "inft": "infinito", "cnus": "coinus", "eko": "echolink", "gyen": "gyen", "red": "red", "zlot": "zlot", "dth": "dether", "reosc": "reosc-ecosystem", "otb": "otcbtc-token", "peg": "pegnet", "stk": "stk", "dogec": "dogecash", "aaa": "app-alliance-association", "sav3": "sav3", "pny": "peony-coin", "bto": "bottos", "dacc": "dacc", "fdd": "frogdao-dime", "ppblz": "pepemon-pepeballs", "hfs": "holderswap", "monk": "monkey-project", "fmg": "fm-gallery", "tao": "taodao", "trst": "wetrust", "cbm": "cryptobonusmiles", "d4rk": "darkpaycoin", "vtx": "vortex-defi", "cor": "coreto", "htre": "hodltree", "excl": "exclusivecoin", "ors": "origin-sport", "toshi": "toshi-token", "ovc": "ovcode", "sub": "substratum", "whirl": "whirl-finance", "xdna": "extradna", "cash": "litecash", "upx": "uplexa", "tos": "thingsoperatingsystem", "evc": "eventchain", "qwc": "qwertycoin", "swg": "swirge", "fyz": "fyooz", "elec": "electrify-asia", "stacy": "stacy", "metric": "metric-exchange", "dit": "inmediate", "fyd": "find-your-developer", "moons": "moontools", "jade": "jade-currency", "spn": "sapien", "ftx": "fintrux", "hac": "hackspace-capital", "banca": "banca", "komet": "komet", "boost": "boosted-finance", "urac": "uranus", "tol": "tolar", "alch": "alchemy-dao", "vig": "vig", "rvf": "rocket-vault-finance", "mnc": "maincoin", "mmaon": "mmaon", "next": "nextexchange", "ladz": "ladz", "vol": "volume-network-token", "moma": "mochi-market", "myx": "myx-network", "xiv": "project-inverse", "exf": "extend-finance", "imo": "imo", "rvx": "rivex-erc20", "xnk": "ink-protocol", "bomb": "bomb", "xmon": "xmon", "nov": "novara-calcio-fan-token", "gse": "gsenetwork", "ptt": "proton-token", "updog": "updog", "malw": "malwarechain", "crea": "creativecoin", "rte": "rate3", "hlc": "halalchain", "iht": "iht-real-estate-protocol", "ncdt": "nuco-cloud", "tac": "traceability-chain", "gfx": "gamyfi-token", "dop": "drops-ownership-power", "zmn": "zmine", "mntis": "mantis-network", "ssp": "smartshare", "vcn": "versacoin", "noahp": "noah-coin", "fjc": "fujicoin", "pis": "polkainsure-finance", "vi": "vid", "error": "484-fund", "dirty": "dirty-finance", "blue": "blue", "plura": "pluracoin", "debase": "debase", "ocp": "omni-consumer-protocol", "ldoge": "litedoge", "unl": "unilock-network", "ttn": "titan-coin", "zut": "zero-utility-token", "foto": "unique-photo", "nftp": "nft-platform-index", "at": "abcc-token", "share": "seigniorage-shares", "eggp": "eggplant-finance", "ysec": "yearn-secure", "snov": "snovio", "sishi": "sishi-finance", "pct": "percent", "sxag": "sxag", "bund": "bundles", "power": "unipower", "ric": "riecoin", "bone": "bone", "psi": "passive-income", "tzc": "trezarcoin", "ukg": "unikoin-gold", "groot": "growth-root", "lot": "lukki-operating-token", "mao": "mao-zedong", "btb": "bitball", "bdg": "bitdegree", "wheat": "wheat-token", "cali": "calicoin", "shnd": "stronghands", "ifund": "unifund", "rox": "robotina", "ion": "ion", "daiq": "daiquilibrium", "meri": "merebel", "gene": "parkgene", "sxau": "sxau", "aidoc": "ai-doctor", "bfi": "bearn-fi", "bsty": "globalboost", "btdx": "bitcloud", "msr": "masari", "mas": "midas-protocol", "base": "base-protocol", "xnv": "nerva", "mmo": "mmocoin", "telos": "telos-coin", "swirl": "swirl-cash", "tns": "transcodium", "portal": "portal", "degov": "degov", "fxt": "fuzex", "egem": "ethergem", "coil": "coil-crypto", "datx": "datx", "buzz": "buzzcoin", "gat": "gatcoin", "ypie": "piedao-yearn-ecosystem-pie", "mdg": "midas-gold", "yeld": "yeld-finance", "ethv": "ethverse", "cova": "covalent-cova", "loot": "nftlootbox", "slm": "solomon-defi", "8pay": "8pay", "zrc": "zrcoin", "spx": "sp8de", "btcs": "bitcoin-scrypt", "ink": "ink", "tff": "tutti-frutti-finance", "sphr": "sphere", "pak": "pakcoin", "crp": "utopia", "zcc": "zccoin", "ipc": "ipchain", "tend": "tendies", "pht": "lightstreams", "pasta": "spaghetti", "xwp": "swap", "trc": "terracoin", "isla": "insula", "udoki": "unicly-doki-doki-collection", "bntx": "bintex-futures", "xgg": "10x-gg", "vox": "vox-finance", "xdex": "xdefi-governance-token", "alv": "allive", "ent": "eternity", "tme": "tama-egg-niftygotchi", "holy": "holy-trinity", "bbp": "biblepay", "msp": "mothership", "mzc": "maza", "toc": "touchcon", "mota": "motacoin", "etz": "etherzero", "qbt": "qbao", "hand": "showhand", "twa": "adventure-token", "axe": "axe", "dds": "dds-store", "onc": "one-cash", "xp": "xp", "tango": "keytango", "trust": "trust", "lqd": "liquidity-network", "dam": "datamine", "lock": "meridian-network", "chnd": "cashhand", "fnx": "finnexus", "bgg": "bgogo", "tnc": "trinity-network-credit", "zusd": "zusd", "grft": "graft-blockchain", "jntr": "jointer", "lnd": "lendingblock", "lcs": "localcoinswap", "nobl": "noblecoin", "mis": "mithril-share", "npxsxem": "pundi-x-nem", "adt": "adtoken", "rom": "rom-token", "tbb": "trade-butler-bot", "emd": "emerald-crypto", "axi": "axioms", "aval": "avaluse", "tico": "topinvestmentcoin", "dct": "decent", "excc": "exchangecoin", "bltg": "bitcoin-lightning", "fxp": "fxpay", "ndr": "noderunners", "cue": "cue-protocol", "dogefi": "dogefi", "zpt": "zeepin", "fff": "future-of-finance-fund", "zsc": "zeusshield", "max": "maxcoin", "ven": "impulseven", "latx": "latiumx", "kennel": "token-kennel", "dvt": "devault", "own": "owndata", "sib": "sibcoin", "ncc": "neurochain", "etg": "ethereum-gold", "yvs": "yvs-finance", "ind": "indorse", "gst2": "gastoken", "thirm": "thirm-protocol", "dpy": "delphy", "dank": "mu-dank", "vdl": "vidulum", "goat": "goatcoin", "gbx": "gobyte", "ethy": "ethereum-yield", "dope": "dopecoin", "swt": "swarm-city", "octi": "oction", "eca": "electra", "vdx": "vodi-x", "ptm": "potentiam", "mwg": "metawhale-gold", "tsuki": "tsuki-dao", "rot": "rotten", "dyt": "dynamite", "grim": "grimcoin", "lx": "lux", "gmc": "gokumarket-credit", "eqt": "equitrader", "bether": "bethereum", "emrals": "emrals", "comb": "combine-finance", "xbp": "blitzpredict", "xlr": "solaris", "cag": "change", "chai": "chai", "sphtx": "sophiatx", "s": "sharpay", "fusii": "fusible", "lun": "lunyr", "snn": "sechain", "cnb": "coinsbit-token", "mib": "mib-coin", "setc": "setc", "hqx": "hoqu", "flot": "fire-lotto", "wand": "wandx", "ctask": "cryptotask-2", "saud": "saud", "jet": "jetcoin", "ely": "elysian", "fire": "fire-protocol", "bloc": "blockcloud", "esbc": "e-sport-betting-coin", "seos": "seos", "pria": "pria", "tcc": "the-champcoin", "semi": "semitoken", "x42": "x42-protocol", "wg0": "wrapped-gen-0-cryptokitties", "revo": "revomon", "depay": "depay", "qch": "qchi", "bir": "birake", "ubeeple": "unicly-beeple-collection", "bbk": "bitblocks-project", "mbn": "membrana-platform", "rmpl": "rmpl", "nor": "bring", "hue": "hue", "ethys": "ethereum-stake", "pipl": "piplcoin", "trvc": "thrivechain", "gofi": "goswapp", "ptc": "pesetacoin", "bkc": "facts", "ggtk": "gg-token", "etm": "en-tan-mo", "ecom": "omnitude", "dft": "defiat", "sxmr": "sxmr", "renbch": "renbch", "alley": "nft-alley", "poe": "poet", "ieth": "ieth", "fast": "fastswap", "sbnb": "sbnb", "lmy": "lunch-money", "fyp": "flypme", "mintme": "webchain", "kolin": "kolin", "horus": "horuspay", "ethbn": "etherbone", "btc++": "piedao-btc", "bos": "boscoin-2", "srh": "srcoin", "gap": "gapcoin", "tsf": "teslafunds", "stop": "satopay", "jamm": "flynnjamm", "scex": "scex", "tdp": "truedeck", "woa": "wrapped-origin-axie", "bsov": "bitcoinsov", "svx": "savix", "dem": "deutsche-emark", "trnd": "trendering", "bitt": "bittoken", "send": "social-send", "senc": "sentinel-chain", "syc": "synchrolife", "plus1": "plusonecoin", "bits": "bitstar", "abx": "arbidex", "img": "imagecoin", "bcpt": "blockmason-credit-protocol", "tie": "ties-network", "2give": "2give", "tmt": "traxia", "pgu": "polyient-games-unity", "deb": "debitum-network", "senpai": "project-senpai", "cbix": "cubiex", "vlu": "valuto", "tit": "titcoin", "zcr": "zcore", "sct": "clash-token", "bez": "bezop", "orcl5": "oracle-top-5", "1mt": "1million-token", "ken": "keysians-network", "kmpl": "kiloample", "alex": "alex", "hgt": "hellogold", "mec": "megacoin", "dws": "dws", "almx": "almace-shards", "rito": "rito", "bcdn": "blockcdn", "chop": "porkchop", "priv": "privcy", "veco": "veco", "swing": "swing", "rvt": "rivetz", "undb": "unibot-cash", "ff": "forefront", "defo": "defhold", "asafe": "allsafe", "genix": "genix", "sds": "alchemint", "myb": "mybit-token", "tcore": "tornadocore", "haut": "hauteclere-shards-2", "dogown": "dog-owner", "yuki": "yuki-coin", "type": "typerium", "amz": "amazonacoin", "xmg": "magi", "pc": "promotionchain", "kobo": "kobocoin", "lync": "lync-network", "eve": "devery", "corx": "corionx", "a": "alpha-platform", "esk": "eska", "tsl": "energo", "fsxu": "flashx-ultra", "scriv": "scriv", "$rope": "rope", "flp": "gameflip", "alt": "alt-estate", "tix": "blocktix", "ptn": "palletone", "brdg": "bridge-protocol", "wqt": "work-quest", "tcash": "tcash", "fud": "fudfinance", "fors": "foresight", "beet": "beetle-coin", "yfte": "yftether", "pho": "photon", "gem": "cargo-gems", "snrg": "synergy", "bth": "bithereum", "ziot": "ziot", "ehrt": "eight-hours", "women": "womencoin", "ecoin": "ecoin-2", "pylnt": "pylon-network", "x8x": "x8-project", "ifex": "interfinex-bills", "wck": "wrapped-cryptokitties", "kerman": "kerman", "netko": "netko", "cheese": "cheese", "ugc": "ugchain", "undg": "unidexgas", "shdw": "shadow-token", "peps": "pepegold", "tch": "tigercash", "kgc": "krypton-token", "mush": "mushroom", "cmct": "crowd-machine", "jem": "jem", "bnty": "bounty0x", "ngot": "ngot", "kndc": "kanadecoin", "quan": "quantis", "nbc": "niobium-coin", "orme": "ormeuscoin", "r3fi": "r3fi-finance", "sins": "safeinsure", "berry": "rentberry", "syn": "synlev", "scb": "spacecowboy", "ipl": "insurepal", "ppdex": "pepedex", "bear": "arcane-bear", "svd": "savedroid", "steep": "steepcoin", "vgw": "vegawallet-token", "kp4r": "keep4r", "tbx": "tokenbox", "first": "harrison-first", "amm": "micromoney", "glox": "glox-finance", "ppy": "peerplays", "arq": "arqma", "topb": "topb", "shrmp": "shrimp-capital", "cxn": "cxn-network", "axiav3": "axia", "bouts": "boutspro", "cbx": "bullion", "pch": "popchain", "hippo": "hippo-finance", "mon": "moneybyte", "gup": "matchpool", "rpc": "ronpaulcoin", "pokelon": "pokelon-finance", "pkg": "pkg-token", "gbcr": "gold-bcr", "wfil": "wrapped-filecoin", "stq": "storiqa", "kfx": "knoxfs", "rpt": "rug-proof", "nfxc": "nfx-coin", "stu": "bitjob", "uunicly": "unicly-genesis-collection", "scap": "safecapital", "fr": "freedom-reserve", "vsx": "vsync", "sergs": "sergs", "lcp": "litecoin-plus", "arnx": "aeron", "prc": "partner", "ntbc": "note-blockchain", "mol": "molten", "wiki": "wiki-token", "swiss": "swiss-finance", "pte": "peet-defi", "reb2": "rebased", "btct": "bitcoin-token", "cato": "catocoin", "insn": "insanecoin", "stak": "straks", "paws": "paws-funds", "mntp": "goldmint", "ore": "oreo", "hndc": "hondaiscoin", "tic": "thingschain", "ntrn": "neutron", "seq": "sequence", "ird": "iridium", "chl": "challengedac", "civ": "civitas", "mwbtc": "metawhale-btc", "1up": "uptrennd", "etgp": "ethereum-gold-project", "plt": "plutus-defi", "wvg0": "wrapped-virgin-gen-0-cryptokitties", "dln": "delion", "arms": "2acoin", "baepay": "baepay", "mash": "masternet", "rehab": "nft-rehab", "crc": "crycash", "tig": "tigereum", "pop": "popularcoin", "got": "gonetwork", "smol": "smol", "swift": "swiftcash", "jan": "coinjanitor", "com": "community-token", "yfbeta": "yfbeta", "ags": "aegis", "ad": "asian-dragon", "tkp": "tokpie", "adi": "aditus", "fota": "fortuna", "yfdot": "yearn-finance-dot", "ecte": "eurocoinpay", "kiwi": "kiwi-token", "bbo": "bigbom-eco", "c2c": "ctc", "evil": "evil-coin", "ccn": "custom-contract-network", "ytn": "yenten", "raise": "hero-token", "quin": "quinads", "cob": "cobinhood", "space": "spacecoin", "croat": "croat", "yfbt": "yearn-finance-bit", "yun": "yunex", "ltb": "litebar", "avs": "algovest", "iut": "mvg-token", "crypt": "cryptcoin", "kubo": "kubocoin", "sove": "soverain", "inve": "intervalue", "thrt": "thrive", "bsd": "bitsend", "cof": "coffeecoin", "skym": "soar", "jump": "jumpcoin", "cen": "coinsuper-ecosystem-network", "jigg": "jiggly-finance", "ablx": "able", "btw": "bitwhite", "kash": "kids-cash", "yffi": "yffi-finance", "shuf": "shuffle-monster", "candy": "skull-candy-shards", "metm": "metamorph", "neva": "nevacoin", "ynk": "yoink", "swagg": "swagg-network", "lkn": "linkcoin-token", "lana": "lanacoin", "yft": "toshify-finance", "skin": "skincoin", "cgi": "coinshares-gold-and-cryptoassets-index-lite", "vls": "veles", "karma": "karma-dao", "hlix": "helix", "wdp": "waterdrop", "bboo": "panda-yield", "ffyi": "fiscus-fyi", "lid": "liquidity-dividends-protocol", "yfd": "yfdfi-finance", "delta": "deltachain", "dex": "alphadex", "bt": "bt-finance", "juice": "moon-juice", "kwatt": "4new", "dcntr": "decentrahub-coin", "adz": "adzcoin", "shmn": "stronghands-masternode", "yfpi": "yearn-finance-passive-income", "cps": "capricoin", "arco": "aquariuscoin", "inx": "inmax", "vsl": "vslice", "opal": "opal", "rex": "rex", "bse": "buy-sell", "kwh": "kwhcoin", "cred": "verify", "kind": "kind-ads-token", "rfctr": "reflector-finance", "yui": "yui-hinata", "etnx": "electronero", "bern": "berncash", "aro": "arionum", "labo": "the-lab-finance", "boli": "bolivarcoin", "mixs": "streamix", "ben": "bitcoen", "tob": "tokens-of-babel", "team": "team-finance", "obee": "obee-network", "xkr": "kryptokrona", "arct": "arbitragect", "scr": "scorum", "aced": "aced", "gcn": "gcn-coin", "esh": "switch", "bznt": "bezant", "martk": "martkist", "crad": "cryptoads-marketplace", "vtd": "variable-time-dollar", "cjt": "connectjob", "wtt": "giga-watt-token", "bgtt": "baguette-token", "rupx": "rupaya", "dfx": "definitex", "lbtc": "litebitcoin", "xjo": "joulecoin", "enol": "ethanol", "ella": "ellaism", "mfc": "mfcoin", "bro": "bitradio", "peng": "penguin", "hur": "hurify", "atb": "atbcoin", "xuez": "xuez", "mcc": "multicoincasino", "tgame": "truegame", "nat": "natmin-pure-escrow", "tri": "trinity-protocol", "xbi": "bitcoin-incognito", "pux": "polypux", "cash2": "cash2", "tok": "tokok", "mcp": "my-crypto-play", "dogy": "dogeyield", "knt": "kora-network", "yamv2": "yam-v2", "audax": "audax", "ig": "igtoken", "dp": "digitalprice", "itl": "italian-lira", "cyl": "crystal-token", "gun": "guncoin", "bonk": "bonk-token", "xta": "italo", "aib": "advanced-internet-block", "mss": "monster-cash-share", "gtm": "gentarium", "naruto2": "naruto-bsc", "nrp": "neural-protocol", "gcg": "gulf-coin-gold", "edrc": "edrcoin", "swipp": "swipp", "ali": "ailink-token", "pgo": "pengolincoin", "abs": "absolute", "eltcoin": "eltcoin", "chc": "chaincoin", "bugs": "starbugs-shards", "bbs": "bbscoin", "bsds": "basis-dollar-share", "pyrk": "pyrk", "medic": "medic-coin", "vlo": "velo-token", "rntb": "bitrent", "datp": "decentralized-asset-trading-platform", "tmn": "ttanslateme-network-token", "cymt": "cybermusic", "xgox": "xgox", "may": "theresa-may-coin", "etgf": "etg-finance", "tds": "tokendesk", "prv": "privacyswap", "sur": "suretly", "prix": "privatix", "sno": "savenode", "drm": "dreamcoin", "kts": "klimatas", "sbs": "staysbase", "mat": "bitsum", "btcn": "bitcoinote", "wrc": "worldcore", "kydc": "know-your-developer", "medibit": "medibit", "prx": "proxynode", "usdq": "usdq", "yfox": "yfox-finance", "sat": "sphere-social", "fsbt": "forty-seven-bank", "chiefs": "kansas-city-chiefs-win-super-bowl", "dtrc": "datarius-cryptobank", "ace": "tokenstars-ace", "mooi": "moonai", "help": "help-token", "sxtz": "sxtz", "bcz": "bitcoin-cz", "anon": "anon", "hb": "heartbout", "dvs": "davies", "bzx": "bitcoin-zero", "deex": "deex", "pomac": "poma", "rigel": "rigel-finance", "imgc": "imagecash", "ecash": "ethereum-cash", "dfs": "digital-fantasy-sports", "xos": "oasis-2", "arepa": "arepacoin", "cpu": "cpuchain", "gic": "giant", "mac": "machinecoin", "nzl": "zealium", "cherry": "cherry", "war": "yieldwars-com", "yffs": "yffs", "lnc": "blocklancer", "arion": "arion", "milf": "milfies", "arc": "arcticcoin", "hqt": "hyperquant", "rugz": "rugz", "genx": "genesis-network", "2x2": "2x2", "vaultz": "vaultz", "horse": "ethorse", "boxx": "boxx", "pkb": "parkbyte", "wlt": "wealth-locks", "wgo": "wavesgo", "zfl": "zedxe", "zzzv2": "zzz-finance-v2", "klks": "kalkulus", "coke": "cocaine-cowboy-shards", "yfsi": "yfscience", "dmb": "digital-money-bits", "imp": "ether-kingdoms-token", "glt": "globaltoken", "yfuel": "yfuel", "kema": "kemacoin", "nrve": "narrative", "cnct": "connect", "seal": "seal-finance", "estx": "oryxcoin", "apr": "apr-coin", "bta": "bata", "gsr": "geysercoin", "duo": "duo", "arm": "armours", "vikky": "vikkytoken", "npc": "npcoin", "cpr": "cipher", "dbet": "decentbet", "gin": "gincoin", "vgr": "voyager", "deep": "deepcloud-ai", "havy": "havy-2", "obr": "obr", "pfarm": "farm-defi", "xco": "xcoin", "actp": "archetypal-network", "pfr": "payfair", "guess": "peerguess", "araw": "araw-token", "swc": "scanetchain", "ctrt": "cryptrust", "boat": "boat", "$noob": "noob-finance", "ethplo": "ethplode", "nice": "nice", "strng": "stronghold", "btcred": "bitcoin-red", "xstar": "starcurve", "trk": "truckcoin", "cdm": "condominium", "dalc": "dalecoin", "pnx": "phantomx", "fess": "fess-chain", "ethm": "ethereum-meta", "rto": "arto", "shb": "skyhub", "mxt": "martexcoin", "gst": "game-stars", "impl": "impleum", "joint": "joint", "gtx": "goaltime-n", "info": "infocoin", "wbt": "whalesburg", "aqua": "aquachain", "reex": "reecore", "note": "dnotes", "joon": "joon", "asa": "asura", "arb": "arbit", "her": "hero-node", "snd": "snodecoin", "care": "carebit", "jiaozi": "jiaozi", "epc": "experiencecoin", "mst": "mustangcoin", "xgcs": "xgalaxy", "yfrb": "yfrb-finance", "lno": "livenodes", "zyon": "bitzyon", "drip": "dripper-finance", "xd": "scroll-token", "ctsc": "cts-coin", "itt": "intelligent-trading-tech", "nyx": "nyxcoin", "cco": "ccore", "sfcp": "sf-capital", "ftxt": "futurax", "sierra": "sierracoin", "bacon": "baconswap", "wtl": "welltrado", "xsr": "sucrecoin", "klon": "klondike-finance", "gxx": "gravitycoin", "bit": "bitmoney", "paxex": "paxex", "aus": "australia-cash", "sinoc": "sinoc", "mftu": "mainstream-for-the-underground", "cou": "couchain", "taj": "tajcoin", "osina": "osina", "exo": "exosis", "noodle": "noodle-finance", "toto": "tourist-token", "tour": "touriva", "mar": "mchain", "infx": "influxcoin", "herb": "herbalist-token", "apc": "alpha-coin", "jmc": "junsonmingchancoin", "yfid": "yfidapp", "znd": "zenad", "stream": "streamit-coin", "ibtc": "ibtc", "mexp": "moji-experience-points", "desh": "decash", "vivid": "vivid", "zoc": "01coin", "bold": "boldman-capital", "bloody": "bloody-token", "hydro": "hydro", "tux": "tuxcoin", "intu": "intucoin", "fntb": "fintab", "cow": "cowry", "jbx": "jboxcoin", "btcb": "bitcoinbrand", "ezy": "eazy", "burn": "blockburn", "ulg": "ultragate", "kgs": "kingscoin", "litb": "lightbit", "bsgs": "basis-gold-share", "rise": "rise-protocol", "nka": "incakoin", "sas": "stand-share", "distx": "distx", "chan": "chancoin", "aet": "aerotoken", "dashg": "dash-green", "wcoinbase-iou": "deus-synthetic-coinbase-iou", "hlx": "hilux", "hodl": "hodlcoin", "bm": "bitcomo", "mnp": "mnpcoin", "rank": "rank-token", "ztc": "zent-cash", "ams": "amsterdamcoin", "xczm": "xavander-coin", "dtc": "datacoin", "aias": "aiascoin", "gfn": "game-fanz", "xap": "apollon", "neet": "neetcoin", "eny": "emergency-coin", "agu": "agouti", "ntr": "netrum", "tsd": "true-seigniorage-dollar", "ucn": "uchain", "house": "toast-finance", "gdr": "guider", "ylc": "yolo-cash", "rle": "rich-lab-token", "nyb": "new-year-bull", "swyftt": "swyft", "uffyi": "unlimited-fiscusfyi", "bul": "bulleon", "sdash": "sdash", "exn": "exchangen", "gali": "galilel", "guard": "guardium", "kkc": "primestone", "braz": "brazio", "wtr": "water-token-2", "cct": "crystal-clear", "polar": "polaris", "btcui": "bitcoin-unicorn", "din": "dinero", "blry": "billarycoin", "eld": "electrum-dark", "dxo": "dextro", "roco": "roiyal-coin", "goss": "gossipcoin", "zzz": "zzz-finance", "sdusd": "sdusd", "abet": "altbet", "abst": "abitshadow-token", "clc": "caluracoin", "lud": "ludos", "labx": "stakinglab", "js": "javascript-token", "kmx": "kimex", "dow": "dowcoin", "crcl": "crowdclassic", "azum": "azuma-coin", "sac": "stand-cash", "spe": "bitcoin-w-spectrum", "cnmc": "cryptonodes", "payx": "paypex", "yieldx": "yieldx", "mynt": "mynt", "exus": "exus-coin", "better": "better-money", "orm": "orium", "mano": "mano-coin", "varius": "varius", "oot": "utrum", "mbgl": "mobit-global", "scsx": "secure-cash", "quot": "quotation-coin", "beverage": "beverage", "bon": "bonpay", "bdcash": "bigdata-cash", "fsd": "freq-set-dollar", "ary": "block-array", "bkx": "bankex", "saros": "saros", "kec": "keyco", "orox": "cointorox", "chtc": "cryptohashtank-coin", "wllo": "willowcoin", "clg": "collegicoin", "faith": "faithcoin", "het": "havethertoken", "lms": "lumos", "kaaso": "kaaso", "dgm": "digimoney", "ssx": "stakeshare", "voise": "voise", "brix": "brixcoin", "nbxc": "nibbleclassic", "ixrp": "ixrp", "kreds": "kreds", "dice": "dice-finance", "idefi": "idefi", "bost": "boostcoin", "sms": "speed-mining-service", "real": "real", "evi": "evimeria", "mek": "meraki", "404": "404", "yffc": "yffc-finance", "aer": "aeryus", "bds": "borderless", "ixtz": "ixtz", "atl": "atlant", "zla": "zilla", "lux": "luxcoin", "ebtc": "ebitcoin", "voco": "provoco", "pirl": "pirl", "idash": "idash", "arg": "argentum", "bze": "bzedge", "smc": "smartcoin", "icex": "icex", "pcn": "peepcoin", "cstl": "cstl", "up": "uptoken", "smoon": "swiftmoon", "xki": "ki", "cc": "cryptocart", "kvi": "kvi", "bgt": "bgt", "die": "die", "wal": "wal", "1ai": "1ai", "rxc": "rxc", "vbt": "vbt", "h3x": "h3x", "mvl": "mass-vehicle-ledger", "day": "chronologic", "dad": "decentralized-advertising", "iab": "iab", "car": "car", "tenfi": "ten", "mex": "mex", "dbx": "dbx-2", "ecc": "ecc", "yas": "yas", "zin": "zin", "zyx": "zyx", "lif": "winding-tree", "eox": "eox", "owl": "owl-token", "idk": "idk", "hdt": "hdt", "yes": "yes", "3xt": "3xt", "tmc": "tmc-niftygotchi", "zom": "zoom-protocol", "gya": "gya", "aos": "aos", "lbk": "legal-block", "yup": "yup", "eft": "eft", "lvx": "level01-derivatives-exchange", "ucx": "ucx-foundation", "hex": "hex", "msn": "msn", "fme": "fme", "mp4": "mp4", "sfb": "sfb", "pop!": "pop", "zos": "zos", "cpt": "cryptaur", "htm": "htm", "ges": "ges", "onot": "ono", "sun": "sun-token", "lcg": "lcg", "ize": "ize", "7up": "7up", "ubu": "ubu-finance", "b26": "b26", "vey": "vey", "p2p": "p2p-network", "olo": "olo", "mox": "mox", "mp3": "revamped-music", "520": "520", "tvt": "tvt", "xtp": "tap", "sov": "sovereign-coin", "mrv": "mrv", "rug": "rug", "bsys": "bsys", "ndau": "ndau", "novo": "novo", "elya": "elya", "gmb": "gamb", "drax": "drax", "tena": "tena", "suni": "suniswap", "sefi": "sefi", "wbx": "wibx", "xdai": "xdai", "ston": "ston", "apix": "apix", "waxe": "waxe", "bu": "bumo", "reth": "reth", "hype": "hype-finance", "rfis": "rfis", "iron": "iron-stablecoin", "koto": "koto", "lbrl": "lbrl", "wise": "wise-token11", "tosc": "t-os", "zpr": "zper", "taxi": "taxi", "sdot": "sdot", "tun": "tune", "s4f": "s4fe", "sbet": "sbet", "pika": "pikachu", "xrune": "rune", "tugz": "tugz", "ieos": "ieos", "xtrm": "xtrm", "nova": "nova", "abbc": "alibabacoin", "teat": "teal", "pofi": "pofi", "afro": "afro", "acdc": "volt", "etor": "etor", "utip": "utip", "fear": "fear", "vidy": "vidy", "miss": "miss", "gasp": "gasp", "weth": "weth", "bora": "bora", "glex": "glex", "cmdx": "cmdx", "vspy": "vspy", "azu": "azus", "sti": "stib-token", "olcf": "olcf", "xank": "xank", "sg20": "sg20", "psrs": "psrs", "whey": "whey", "rccc": "rccc", "maro": "ttc-protocol", "xls": "elis", "bitz": "bitz", "evai": "evai", "vera": "vera", "bnbc": "bnbc", "ng": "ngin", "pick": "pick", "mogx": "mogu", "plex": "plex", "evan": "evan", "pica": "pica", "gold": "dragonereum-gold", "iote": "iote", "arke": "arke", "cez": "cezo", "dogz": "dogz", "arix": "arix", "aly": "ally", "xtrd": "xtrade", "dmme": "dmme-app", "usda": "usda", "soge": "soge", "odop": "odop", "aeon": "aeon", "wav3": "wav3", "donu": "donu", "usdl": "usdl", "aeur": "aeur", "vvsp": "vvsp", "r34p": "r34p", "chbt": "chbt", "obic": "obic", "moac": "moac", "ympl": "ympl", "vybe": "vybe", "thx": "thorenext", "frat": "frat", "mini": "mini", "bare": "bare", "r64x": "r64x", "punk": "punk", "camp": "camp", "iten": "iten", "trbo": "turbostake", "kala": "kala", "benz": "benz", "mass": "mass", "mymn": "mymn", "boid": "boid", "post": "postcoin", "hapi": "hapi", "attn": "attn", "lean": "lean", "n0031": "ntoken0031", "mute": "mute", "idot": "idot", "asta": "asta", "olxa": "olxa", "seer": "seer", "efin": "efin", "sren": "sren", "redi": "redi", "bpop": "bpop", "foin": "foincoin", "bolt": "thunderbolt", "biki": "biki", "dray": "dray", "yfet": "yfet", "roc": "roxe", "cook": "cook", "ibnb": "ibnb", "pryz": "pryz", "arx": "arcs", "qcad": "qcad", "zeon": "zeon", "lze": "lyze", "cspc": "chinese-shopping-platform", "agt": "aisf", "xels": "xels", "exor": "exor", "crow": "crow-token", "lynx": "lynx", "joys": "joys", "ntm": "netm", "peos": "peos", "hope": "hope-token", "amix": "amix", "ruc": "rush", "musk": "musk", "sono": "sonocoin", "dtmi": "dtmi", "gr": "grom", "artx": "artx", "dsys": "dsys", "enx": "enex", "vivo": "vivo", "asla": "asla", "yce": "myce", "oryx": "oryx", "noku": "noku", "bast": "bast", "lucy": "lucy", "qusd": "qusd-stablecoin", "kupp": "kupp", "zinc": "zinc", "vndc": "vndc", "nftb": "nftb", "pway": "pway", "alis": "alis", "lyfe": "lyfe", "amis": "amis", "ioex": "ioex", "fil6": "filecoin-iou", "plg": "pledgecamp", "bcat": "bcat", "zyro": "zyro", "ymax": "ymax", "yfia": "yfia", "b360": "b360", "sltc": "sltc", "420x": "420x", "veed": "veed", "ers": "eros", "scrv": "scrv", "swop": "swop", "ln": "link", "xfii": "xfii", "bidr": "binanceidr", "xfit": "xfit", "prot": "prostarter-token", "g999": "g999", "many": "manyswap", "nilu": "nilu", "basic": "basic", "lexi": "lexit-2", "senso": "senso", "tor": "torchain", "bubo": "budbo", "omb": "ombre", "fo": "fibos", "ean": "eanto", "zlp": "zuplo", "zwx": "ziwax", "emoj": "emoji", "ibank": "ibank", "xen": "xenon-2", "bliss": "bliss-2", "antr": "antra", "claim": "claim", "znko": "zenko", "sop": "sopay", "spt": "spectrum", "lucky": "lucky-2", "tsr": "tesra", "veth2": "veth2", "point": "point", "lgbtq": "pride", "xsp": "xswap", "upbnb": "upbnb", "xtx": "xtock", "gena": "genta", "haz": "hazza", "byron": "bitcoin-cure", "ytusd": "ytusd", "dxiot": "dxiot", "rlx": "relax-protocol", "btr": "bitrue-token", "yummy": "yummy", "topia": "topia", "visio": "visio", "stamp": "stamp", "hplus": "hplus", "bsha3": "bsha3", "twist": "twist", "nftfy": "nftfy", "lc": "lightningcoin", "amon": "amond", "sem": "semux", "xfuel": "xfuel", "xnc": "xenios", "clam": "clams", "ecu": "decurian", "br34p": "br34p", "hdi": "heidi", "bxiot": "bxiot", "atx": "aston", "xfe": "feirm", "myo": "mycro-ico", "modex": "modex", "viper": "viper", "zch": "zilchess", "klt": "klend", "bid": "blockidcoin", "morc": "dynamic-supply", "plut": "pluto", "hve2": "uhive", "dudgx": "dudgx", "mnguz": "mangu", "fma": "flama", "xgm": "defis", "pzm": "prizm", "ehash": "ehash", "flap": "flapp", "xkncb": "xkncb", "lex": "elxis", "qob": "qobit", "blood": "blood", "doggy": "doggy", "vld": "valid", "rkn": "rakon", "jvz": "jiviz", "ifarm": "ifarm", "bulls": "bulls", "xfg": "fango", "samzn": "samzn", "akn": "akoin", "u": "ucoin", "clt": "coinloan", "fx1": "fanzy", "em": "eminer", "vinci": "vinci", "miami": "miami", "cdex": "codex", "az": "azbit", "scomp": "scomp", "gof": "golff", "wco": "winco", "memex": "memex", "cms": "comsa", "ilg": "ilgon", "$aapl": "aapl", "spok": "spock", "sts": "sbank", "eidos": "eidos", "p2pg": "p2pgo", "gig": "gigecoin", "elons": "elons", "vidyx": "vidyx", "ccomp": "ccomp", "atmos": "atmos", "alb": "albos", "vmr": "vomer", "xra": "ratecoin", "acoin": "acoin", "tks": "tokes", "mts": "mtblock", "atd": "atd", "ysr": "ystar", "apn": "apron", "saave": "saave", "cprop": "cprop", "aico": "aicon", "con": "converter-finance", "tools": "tools", "clout": "blockclout", "tup": "tenup", "mvr": "mavro", "ksk": "kskin", "vesta": "vesta", "husky": "husky", "ikomp": "ikomp", "aunit": "aunit", "egold": "egold", "lunes": "lunes", "ct": "communitytoken", "digex": "digex", "ram": "ramifi", "blast": "safeblast", "aloha": "aloha", "slnv2": "slnv2", "xknca": "xknca", "mks": "makes", "snflx": "snflx", "posh": "shill", "ovi": "oviex", "eurxb": "eurxb", "hlo": "helio", "xin": "infinity-economics", "byts": "bytus", "fil12": "fil12", "sar": "saren", "knv": "kanva", "kvnt": "kvant", "merge": "merge", "temco": "temco", "srune": "srune", "tur": "turex", "dby": "dobuy", "mla": "moola", "funjo": "funjo", "tlr": "taler", "april": "april", "alphr": "alphr", "altom": "altcommunity-coin", "gapt": "gaptt", "peach": "peach", "amr": "ammbr", "fleta": "fleta", "ferma": "ferma", "pitch": "pitch", "xazab": "xazab", "earnx": "earnx", "pando": "pando", "manna": "manna", "bud": "buddy", "tower": "tower", "unify": "unify", "keyfi": "keyfi", "vix": "vixco", "defla": "defla", "toz": "tozex", "carat": "carat", "seeds": "seeds", "dlike": "dlike", "vso": "verso", "poker": "poker", "sheng": "sheng", "asimi": "asimi", "libfx": "libfx", "piasa": "piasa", "sls": "salus", "crave": "crave", "ing": "iungo", "ybusd": "ybusd", "grimm": "grimm", "sbe": "sombe", "xax": "artax", "scash": "scash", "krex": "kronn", "nsg": "nasgo", "yusra": "yusra", "keyt": "rebit", "usdex": "usdex-2", "paper": "paper", "rfbtc": "rfbtc", "ptd": "pilot", "cvl": "civil", "cvr": "polkacover", "imbtc": "the-tokenized-bitcoin", "voltz": "voltz", "fla": "fiola", "sklay": "sklay", "vnx": "venox", "kxusd": "kxusd", "cyb": "cybex", "ipfst": "ipfst", "omega": "omega", "steel": "steel", "grain": "grain-token", "xpo": "x-power-chain", "tro": "tro-network", "joy": "joy-coin", "eql": "equal", "seed": "seedswap-token", "acryl": "acryl", "mozox": "mozox", "wolfy": "wolfy", "blurt": "blurt", "stonk": "stonk", "pizza": "pizzaswap", "axl": "axial", "lkk": "lykke", "raku": "rakun", "utrin": "utrin", "trybe": "trybe", "trism": "trism", "qc": "qovar-coin", "imusd": "imusd", "bitsz": "bitsz", "bion": "biido", "xeuro": "xeuro", "sgoog": "sgoog", "leash": "leash", "pazzy": "pazzy", "jwl": "jewel", "seele": "seele", "hatch": "hatch-dao", "myu": "myubi", "swace": "swace", "mri": "mirai", "xnode": "xnode", "rup": "rupee", "oks": "okschain", "ox": "orcax", "xhd": "xrphd", "ifx24": "ifx24", "sld": "safelaunchpad", "burnx": "burnx", "kcash": "kcash", "pgpay": "puregold-token", "atp": "atlas-protocol", "xmark": "xmark", "mooni": "mooni", "franc": "franc", "cod": "codemy", "polyfi": "polyfi", "fpt": "finple", "koduro": "koduro", "ubin": "ubiner", "cby": "cberry", "hbx": "habits", "mct": "master-contract-token", "kam": "bitkam", "mdu": "mdu", "r2r": "citios", "nii": "nahmii", "alg": "bitalgo", "gmr": "gmr-finance", "fzy": "frenzy", "me": "all-me", "zcor": "zrocor", "mimo": "mimosa", "rfx": "reflex", "entone": "entone", "gunthy": "gunthy", "ebk": "ebakus", "was": "wasder", "stri": "strite", "raux": "ercaux", "onit": "onbuff", "scribe": "scribe", "gneiss": "gneiss", "rhegic": "rhegic", "trdx": "trodex", "sfr": "safari", "kicks": "sessia", "strn": "saturn-classic-dao-token", "rnx": "roonex", "sbt": "solbit", "ceds": "cedars", "xaaveb": "xaaveb", "acu": "aitheon", "wgold": "apwars", "bstx": "blastx", "mmon": "mommon", "vsn": "vision-network", "wtm": "waytom", "evr": "everus", "exg": "exgold", "bep": "blucon", "zag": "zigzag", "tyc": "tycoon", "cso": "crespo", "orfano": "orfano", "dxf": "dexfin", "age": "agenor", "fdn": "fundin", "hgro": "helgro", "uno": "unobtanium", "dah": "dirham", "bst": "bitsten-token", "pteria": "pteria", "gsfy": "gasify", "vyn": "vyndao", "ec": "eternal-cash", "xincha": "xincha", "drk": "drakoin", "kiro": "kirobo", "strk": "strike", "zcx": "unizen", "ama": "mrweb-finance", "caps": "coin-capsule", "hdp.\u0444": "hedpay", "dgn": "degen-protocol", "azzr": "azzure", "topcat": "topcat", "bceo": "bitceo", "donk": "donkey", "hd": "hubdao", "byt": "byzbit", "dbt": "datbit", "mor": "morcrypto-coin", "ecob": "ecobit", "heal": "etheal", "uis": "unitus", "xce": "cerium", "nlm": "nuclum", "dcore": "decore", "clx": "celeum", "dfni": "defini", "qmc": "qmcoin", "bdx": "beldex", "whx": "whitex", "pan": "panvala-pan", "cbt": "cryptocurrency-business-token", "sead": "seadex", "octa": "octans", "xym": "symbol", "xsh": "shield", "kabosu": "kabosu", "xaavea": "xaavea", "mag": "maggie", "pixeos": "pixeos", "uzz": "azuras", "lev": "lever-network", "jmt": "jmtime", "dsgn": "design", "brtr": "barter", "nlx": "nullex", "jntr/e": "jntre", "i0c": "i0coin", "dms": "documentchain", "kzc": "kzcash", "fnd": "fundum", "djv": "dejave", "xbtg": "bitgem", "tewken": "tewken", "ebst": "eboost", "clv": "clover-finance", "prkl": "perkle", "coup": "coupit", "erc223": "erc223", "inn": "innova", "xsc": "xscoin", "dusa": "medusa", "bfx": "bitfex", "wok": "webloc", "qoob": "qoober", "zlw": "zelwin", "lib": "banklife", "xditto": "xditto", "hpx": "hupayx", "hfi": "holder-finance", "fit": "financial-investment-token", "uco": "uniris", "trat": "tratok", "ktt": "k-tune", "xinchb": "xinchb", "dess": "dessfi", "bsy": "bestay", "yac": "yacoin", "htmoon": "htmoon", "spg": "super-gold", "skrp": "skraps", "azx": "azeusx", "dctd": "dctdao", "anct": "anchor", "uted": "united-token", "2goshi": "2goshi", "yco": "y-coin", "lcnt": "lucent", "zdc": "zodiac", "ain": "ai-network", "ett": "efficient-transaction-token", "wynaut": "wynaut", "redbux": "redbux", "dogira": "dogira", "xlt": "nexalt", "paa": "palace", "dacs": "dacsee", "ttr": "tetris", "frel": "freela", "upshib": "upshib", "renfil": "renfil", "echt": "e-chat", "wbpc": "buypay", "nbu": "nimbus", "lotdog": "lotdog", "tem": "temtem", "ocul": "oculor", "perl": "perlin", "dtep": "decoin", "oct": "oraclechain", "dmx": "dymmax", "crb": "cribnb", "sfn": "strains", "pcatv3": "pcatv3", "kalm": "kalmar", "moneta": "moneta", "ign": "ignite", "pat": "patron", "jui": "juiice", "nt": "nexdax", "wix": "wixlar", "swamp": "swamp-coin", "mns": "monnos", "yfo": "yfione", "orb": "orbitcoin", "qi": "qi-dao", "cwap": "defire", "incnt": "incent", "apx": "appics", "levelg": "levelg", "ilk": "inlock-token", "usg": "usgold", "in": "incoin", "nux": "peanut", "lhcoin": "lhcoin", "rblx": "rublix", "oft": "orient", "min": "mindol", "xdag": "dagger", "meowth": "meowth", "sprink": "sprink", "kel": "kelvpn", "glf": "gallery-finance", "att": "africa-trading-chain", "xab": "abosom", "rabbit": "rabbit", "xhi": "hicoin", "btp": "bitcoin-pay", "dxr": "dexter", "s8": "super8", "waf": "waffle", "dka": "dkargo", "prstx": "presto", "usd1": "psyche", "ash": "aeneas", "dexm": "dexmex", "aquari": "aquari", "vancat": "vancat", "rno": "snapparazzi", "sconex": "sconex", "sic": "sicash", "bpx": "bispex", "bay": "bitbay", "roz": "rozeus", "mnm": "mineum", "flty": "fluity", "xqr": "qredit", "usnbt": "nubits", "s1inch": "s1inch", "awo": "aiwork", "jll": "jllone", "aapx": "ampnet", "dsr": "desire", "ntvrk": "netvrk", "eauric": "eauric", "arcona": "arcona", "qrn": "qureno", "agol": "algoil", "fai": "fairum", "co2b": "co2bit", "ilc": "ilcoin", "shorty": "shorty", "cntx": "centex", "ras": "raksur", "gxi": "genexi", "zoa": "zotova", "alu": "altura", "vanity": "vanity", "cir": "circleswap", "iqq": "iqoniq", "egcc": "engine", "mgx": "margix", "yooshi": "yooshi", "gfce": "gforce", "zdr": "zloadr", "revt": "revolt", "efk": "refork", "gom": "gomics", "nkc": "nework", "vbswap": "vbswap", "bri": "baroin", "tara": "taraxa", "stm": "stream", "mdm": "medium", "toko": "toko", "a5t": "alpha5", "omm": "omcoin", "gaze": "gazetv", "merl": "merlin", "rpzx": "rapidz", "ame": "amepay", "kue": "kuende", "naft": "nafter", "egx": "eaglex", "sefa": "mesefa", "dns": "bitdns", "ivi": "inoovi", "dhv": "dehive", "melody": "melody", "tofy": "toffee", "str": "staker", "vii": "7chain", "r3t": "rock3t", "degens": "degens", "yoc": "yocoin", "oneeth": "oneeth", "dbnk": "debunk", "ipm": "timers", "pgf7t": "pgf500", "bdk": "bidesk", "ket": "rowket", "uponly": "uponly", "arteon": "arteon", "tlo": "talleo", "aka": "akroma", "lemd": "lemond", "sxi": "safexi", "rich": "richierich-coin", "onebtc": "onebtc", "hamtaro": "hamtaro", "tcgcoin": "tcgcoin", "wntr": "weentar", "news": "cryptonewsnet", "lyra": "scrypta", "ethp": "ethplus", "clu": "clucoin", "some": "mixsome", "torm": "thorium", "mlm": "mktcoin", "dogedao": "dogedao", "bim": "bimcoin", "xf": "xfarmer", "cid": "cryptid", "vspacex": "vspacex", "xiro": "xiropht", "xat": "shareat", "oto": "otocash", "cop": "copiosa", "x-token": "x-token", "cyfm": "cyberfm", "net": "netcoin", "torpedo": "torpedo", "gbt": "gulf-bits-coin", "brat": "brother", "ausc": "auscoin", "btsg": "bitsong", "klee": "kleekai", "exp": "exchange-payment-coin", "dfo": "defiato", "yplt": "yplutus", "sgb": "subgame", "prophet": "prophet", "trl": "trolite", "lar": "linkart", "won": "weblock", "xbg": "bitgrin", "ork": "orakuru", "bool": "boolean", "kal": "kaleido", "c3": "charli3", "baxs": "boxaxis", "vnl": "vanilla", "iti": "iticoin", "vash": "vpncoin", "b2b": "b2bcoin-2", "prvs": "previse", "mimatic": "mimatic", "sola": "solarys", "rap": "rapture", "eag": "ea-coin", "ift": "iftoken", "our": "our-pay", "ntx": "nitroex", "pqt": "prediqt", "pbl": "polkalab-token", "dxh": "daxhund", "ohmc": "ohm-coin", "mttcoin": "mttcoin", "hawk": "hawkdex", "twee": "tweebaa", "vtar": "vantaur", "psy": "psychic", "mouse": "mouse", "bliq": "bliquid", "sjw": "sjwcoin", "xnb": "xeonbit", "pshp": "payship", "boob": "boobank", "rtk": "ruletka", "rzb": "rizubot", "sfm": "sfmoney", "spike": "spiking", "sxc": "simplexchain", "gpt": "grace-period-token", "erotica": "erotica-2", "zwap": "zilswap", "xfyi": "xcredit", "kian": "kianite", "o3": "o3-swap", "ardx": "ardcoin", "888": "octocoin", "ath": "atheios", "bte": "btecoin", "arts": "artista", "crfi": "crossfi", "ibh": "ibithub", "dkyc": "datakyc", "nax": "nextdao", "pgs": "pegasus", "mdtk": "mdtoken", "halv": "halving-coin", "bono": "bonorum-coin", "mnmc": "mnmcoin", "ptr": "payturn", "i9c": "i9-coin", "xgmt": "xgambit", "pcm": "precium", "mapc": "mapcoin", "gsm": "gsmcoin", "rlz": "relianz", "tcfx": "tcbcoin", "ddm": "ddmcoin", "komp": "kompass", "biop": "biopset", "hotdoge": "hot-doge", "lmo": "lumeneo", "bnp": "benepit", "bnode": "beenode", "onewing": "onewing", "shrm": "shrooms", "betxc": "betxoin", "bfic": "bficoin", "caj": "cajutel", "fat": "tronfamily", "addy": "adamant", "aba": "ecoball", "xyz": "universe-xyz", "btcm": "btcmoon", "clb": "clbcoin", "celc": "celcoin", "the": "the-node", "tlc": "tl-coin", "yok": "yokcoin", "mel": "caramelswap", "tkmn": "tokemon", "dswap": "definex", "befx": "belifex", "palg": "palgold", "kyan": "kyanite", "roo": "roocoin", "aby": "artbyte", "bgc": "be-gaming-coin", "vltm": "voltium", "kurt": "kurrent", "bixcpro": "bixcpro", "vro": "veraone", "qtcon": "quiztok", "xcz": "xchainz", "pm": "pomskey", "flexusd": "flex-usd", "tfd": "etf-dao", "psb": "pesobit", "imu": "imusify", "sprts": "sprouts", "ree": "reecoin", "wire": "wire", "cctc": "cctcoin", "ubomb": "unibomb", "tulip": "solfarm", "msb": "magic-e-stock", "fn": "filenet", "ktc": "kitcoin", "fnax": "fnaticx", "bonfire": "bonfire", "cmg": "cmgcoin", "meowcat": "meowcat", "axnt": "axentro", "w3b": "w3bpush", "csp": "caspian", "cuminu": "cuminu", "marks": "bitmark", "vgc": "5g-cash", "aglt": "agrolot", "safebtc": "safebtc", "7e": "7eleven", "mnr": "mineral", "si14": "si14bet", "avn": "avantage", "zum": "zum-token", "bly": "blocery", "thkd": "truehkd", "legends": "legends", "onelink": "onelink", "asy": "asyagro", "btv": "bitvote", "nyex": "nyerium", "dch": "doch-coin", "dion": "dionpay", "swat": "swtcoin", "cnx": "cryptonex", "lhb": "lendhub", "gaj": "polygaj", "v": "version", "peth18c": "peth18c", "trm": "tranium", "ril": "rilcoin", "mpay": "menapay", "pmeer": "qitmeer", "b2c": "b2-coin", "xph": "phantom", "eum": "elitium", "ecp": "ecp-technology", "ebase": "eurbase", "mpt": "metal-packaging-token", "don": "donnie-finance", "fnk": "funkeypay", "vbit": "voltbit", "dmc": "decentralized-mining-exchange", "maxgoat": "maxgoat", "quo": "vulcano", "wfx": "webflix", "bn": "bitnorm", "wcx": "wecoown", "wdx": "wordlex", "onigiri": "onigiri", "zik": "zik-token", "bist": "bistroo", "ix": "x-block", "cura": "curadai", "smdx": "somidax", "scl": "sociall", "htc": "hitcoin", "gaia": "gaiadao", "pyn": "paycent", "enu": "enumivo", "ecell": "celletf", "peer": "unilord", "safesun": "safesun", "sap": "swaap-stablecoin", "ala": "aladiex", "bscb": "bscbond", "bsccrop": "bsccrop", "eeth": "eos-eth", "fml": "formula", "sum": "sumcoin", "ufarm": "unifarm", "locg": "locgame", "hal": "halcyon", "trcl": "treecle", "seko": "sekopay", "wasp": "wanswap", "barmy": "bscarmy", "tat": "tatcoin", "fra": "findora", "zny": "bitzeny", "rrc": "rrspace", "mkey": "medikey", "moochii": "moochii", "ttt": "the-transfer-token", "vana": "nirvana", "lthn": "intensecoin", "xxa": "ixinium", "jdc": "jd-coin", "buz": "buzcoin", "tek": "tekcoin", "jar": "jarvis", "hmr": "homeros", "tty": "trinity", "taud": "trueaud", "poocoin": "poocoin", "ael": "aelysir", "rebound": "rebound", "kfc": "chicken", "digi": "digible", "wsote": "soteria", "czz": "classzz", "pt": "predict", "afrox": "afrodex", "buy": "burency", "rhegic2": "rhegic2", "pit": "pitbull", "trbt": "tribute", "youc": "youcash", "hitx": "hithotx", "mepad": "memepad", "moonpaw": "moonpaw", "xscr": "securus", "bnk": "bankera", "jindoge": "jindoge", "odex": "one-dex", "pusd": "pegsusd", "ape": "apecoin", "sdgo": "sandego", "wenb": "wenburn", "gzro": "gravity", "ube": "ubeswap", "yay": "yayswap", "fnsp": "finswap", "bup": "buildup", "gadoshi": "gadoshi", "land": "new-landbox", "nld": "newland", "tdi": "tedesis", "nug": "nuggets", "ogx": "organix", "laq": "laq-pay", "safeeth": "safeeth", "bdo": "bdollar", "btrm": "betrium", "chrt": "charity", "btkc": "beautyk", "ccxx": "counosx", "ents": "eunomia", "x0z": "zerozed", "linkusd": "linkusd", "cpz": "cashpay", "mb": "microchain", "mndao": "moondao", "bscgold": "bscgold", "sto": "storeum", "chat": "beechat", "mql": "miraqle", "btrn": "biotron", "pamp": "pamp-network", "cha": "chaucha", "rx": "raven-x", "ctl": "citadel", "slds": "solidus", "bni": "betnomi-2", "xemx": "xeniumx", "yot": "payyoda", "mesh": "meshbox", "deq": "dequant", "tgbp": "truegbp", "300": "spartan", "tronish": "tronish", "lkt": "lukutex", "xes": "proxeus", "winr": "justbet", "opc": "op-coin", "m": "m-chain", "bitc": "bitcash", "mora": "meliora", "bin": "binarium", "ekt": "educare", "xmv": "monerov", "sup8eme": "sup8eme", "swin": "swinate", "gems": "safegem", "rech": "rechain", "shroud": "shroud-protocol", "wyx": "woyager", "lc4": "leocoin", "dgmt": "digimax", "wxc": "wiix-coin", "tlw": "tilwiki", "bignite": "bignite", "fey": "feyorra", "tag": "tagcoin-erc20", "bafe": "bafe-io", "ugd": "unigrid", "fk": "fk-coin", "unos": "unoswap", "coi": "coinnec", "xov": "xov", "satoz": "satozhi", "igg": "ig-gold", "pzap": "polyzap", "dvx": "derivex", "onevbtc": "onevbtc", "gps": "triffic", "tshp": "12ships", "kaiinu": "kai-inu", "bark": "barking", "plug": "plgnet", "pkt": "playkey", "kuv": "kuverit", "zdx": "zer-dex", "sam": "samurai", "trop": "interop", "yts": "yetiswap", "safezone": "safezone", "sw": "safewolf", "ndn": "ndn-link", "defx": "definity", "nort": "northern", "moonarch": "moonarch", "xln": "lunarium", "lion": "lion-token", "gfun": "goldfund-ico", "naz": "naz-coin", "rdct": "rdctoken", "100x": "100x-coin", "hl": "hl-chain", "spiz": "space-iz", "ple": "plethori", "dgw": "digiwill", "trn": "tronnodes", "orly": "orlycoin", "nvzn": "invizion", "srnt": "serenity", "lf": "linkflow", "wiz1": "wiz-coin", "npo": "npo-coin", "fren": "frenchie", "kok": "kok-coin", "swsh": "swapship", "windy": "windswap", "azrx": "aave-zrx-v1", "ic": "ignition", "tmed": "mdsquare", "vlm": "valireum", "bizz": "bizzcoin", "glxm": "galaxium", "weed": "weedcash", "polystar": "polystar", "fomp": "fompound", "trp": "tronipay", "sapp": "sappchain", "noa": "noa-play", "dogemoon": "dogemoon", "libertas": "libertas-token", "coom": "coomcoin", "catz": "catzcoin", "ocb": "blockmax", "btcv": "bitcoin-vault", "xrp-bf2": "xrp-bep2", "bwt": "bittwatt", "blvr": "believer", "gom2": "gomoney2", "song": "songcoin", "bigo": "bigo-token", "dfk": "defiking", "bkkg": "biokkoin", "torro": "bittorro", "auop": "opalcoin", "solarite": "solarite", "usdf": "usdf", "enk": "enkronos", "bag": "bondappetit-gov-token", "ubn": "ubricoin", "alp": "alp-coin", "mci": "mci-coin", "mbs": "micro-blood-science", "aknc": "aave-knc-v1", "marx": "marxcoin", "mbonk": "megabonk", "bcx": "bitcoinx", "bpp": "bitpower", "tinv": "tinville", "bucks": "swagbucks", "atmn": "antimony", "gram": "gram", "meet": "coinmeet", "gpu": "gpu-coin", "xind": "indinode", "ntrs": "nosturis", "pact": "packswap", "aht": "ahatoken", "lpl": "linkpool", "rnb": "rentible", "i9x": "i9x-coin", "sme": "safememe", "ddtg": "davecoin", "jrex": "jurasaur", "daft": "daftcoin", "ragna": "ragnarok", "bsc": "bitsonic-token", "bell": "bellcoin", "pswap": "polkaswap", "prs": "pressone", "morph": "morphose", "topc": "topchain", "moov": "dotmoovs", "lvl": "levelapp", "pdex": "polkadex", "aim": "ai-mining", "erowan": "sifchain", "safenami": "safenami", "sym": "symverse", "tpad": "trustpad", "csx": "coinstox", "pos": "pos-coin", "palt": "palchain", "big": "thebigcoin", "trusd": "trustusd", "bee": "bee-coin", "cx": "circleex", "kally": "polkally", "bio": "biocrypt", "bmj": "bmj-master-nodes", "moonshot": "moonshot", "payb": "paybswap", "tar": "tartarus", "qbit": "project-quantum", "hana": "hanacoin", "guss": "guss-one", "bca": "bitcoin-atom", "zpay": "zantepay", "apes": "apehaven", "bln": "blacknet", "chee": "cheecoin", "prtcle": "particle-2", "b2u": "b2u-coin", "kali": "kalicoin", "nsfw": "xxxnifty", "homi": "homihelp", "szc": "zugacoin", "btcx": "bitcoinx-2", "emon": "ethermon", "rush": "rushmoon", "agn": "agricoin", "eti": "etherinc", "lby": "libonomy", "b2g": "bitcoiin", "nvc": "novacoin", "html": "htmlcoin", "ijc": "ijascoin", "stol": "stabinol", "asnx": "aave-snx-v1", "tagr": "tagrcoin", "vn": "vice-network", "bsp": "ballswap", "slc": "support-listing-coin", "riskmoon": "riskmoon", "ayfi": "ayfi", "bcna": "bitcanna", "yep": "yep-coin", "isal": "isalcoin", "wit": "witchain", "gldy": "buzzshow", "ytv": "ytv-coin", "vrap": "veraswap", "tuna": "tunacoin", "rice": "riceswap", "slim": "solanium", "ivn": "investin", "upl": "uploadea", "mrch": "merchdao", "wdf": "wildfire", "ftn": "fountain", "akc": "akikcoin", "0xmr": "0xmonero", "sh": "super-hero", "zuc": "zeuxcoin", "mbbased": "moonbase", "0xc": "0xcharts", "prime": "primedao", "gldx": "goldnero", "hca": "harcomia", "gict": "gictrade", "ebsc": "earlybsc", "hta": "historia", "scol": "scolcoin", "nia": "nia-token", "crox": "croxswap", "xqn": "quotient", "ctt": "cryptotycoon", "swaps": "nftswaps", "zoe": "zoe-cash", "mkcy": "markaccy", "kva": "kevacoin", "nan": "nantrade", "bpcn": "blipcoin", "ri": "ri-token", "pinke": "pinkelon", "pvg": "pilnette", "moto": "motocoin", "vns": "va-na-su", "edgt": "edgecoin-2", "ape$": "ape-punk", "nemo": "nemocoin", "gze": "gazecoin", "lxmt": "luxurium", "nmt": "nftmart-token", "mne": "minereum", "btshk": "bitshark", "job": "jobchain", "plat": "bitguild", "dhd": "dhd-coin", "hdao": "hyperdao", "trex": "trexcoin", "bnana": "banana-token", "timec": "time-coin", "ap3": "ap3-town", "lips": "lipchain", "aya": "aryacoin", "shibapup": "shibapup", "eggplant": "eggplant", "busy": "busy-dao", "club": "clubcoin", "eswa": "easyswap", "zyn": "zynecoin", "gix": "goldfinx", "xgk": "goldkash", "glass": "ourglass", "mig": "migranet", "blowf": "blowfish", "tacocat": "taco-cat", "bfl": "bitflate", "log": "woodcoin", "uty": "unitydao", "meetone": "meetone", "znc": "zioncoin", "uca": "uca", "wpt": "worldpet", "yda": "yadacoin", "fastmoon": "fastmoon", "cim": "coincome", "eva": "eva-coin", "blu": "bluecoin", "nuko": "nekonium", "loge": "lunadoge", "poke": "pokeball", "xblzd": "blizzard", "tatm": "tron-atm", "amo": "amo", "shih": "shih-tzu", "trix": "triumphx", "bshiba": "bscshiba", "alr": "alacrity", "graph": "unigraph", "syl": "xsl-labs", "leaf": "leafcoin", "mojo": "moonjuice", "foge": "fat-doge", "vela": "vela", "art": "maecenas", "starship": "starship", "plbt": "polybius", "bios": "bios", "jobs": "jobscoin", "bela": "belacoin", "ssgt": "safeswap", "owdt": "oduwausd", "wtip": "worktips", "flur": "flurmoon", "teslf": "teslafan", "fraction": "fraction", "tep": "tepleton", "myfi": "myfichain", "pnl": "true-pnl", "moonstar": "moonstar", "abat": "aave-bat-v1", "pure": "puriever", "aquagoat": "aquagoat", "txc": "tenxcoin", "pok": "poker-io", "nsr": "nushares", "elongate": "elongate", "lime": "limeswap", "shit": "shitcoin-token", "bbt": "blockbase", "alh": "allohash", "fch": "fanaticos-cash", "plf": "playfuel", "lst": "lendroid-support-token", "slrm": "solareum", "safecock": "safecock", "foxd": "foxdcoin", "btcl": "btc-lite", "qbz": "queenbee", "path": "pathfund", "kdag": "kdag", "eds": "endorsit", "aren": "aave-ren-v1", "adl": "adelphoi", "mnd": "mindcoin", "pti": "paytomat", "taste": "tastenft", "hdoge": "holydoge", "wenlambo": "wenlambo", "inrt": "inrtoken", "mmda": "pokerain", "ants": "fireants", "bsn": "bastonet", "char": "charitas", "stpc": "starplay", "mbud": "moon-bud", "prdz": "predictz", "nole": "nolecoin", "ecoc": "ecochain", "omniunit": "omniunit", "black": "blackhole-protocol", "sng": "sinergia", "ea": "ea-token", "oxo": "oxo-farm", "runes": "runebase", "adai": "aave-dai-v1", "cross": "crosspad", "ethpy": "etherpay", "dxc": "dex-trade-coin", "brun": "bull-run", "trad": "tradcoin", "airx": "aircoins", "saferune": "saferune", "nicheman": "nicheman", "pine": "pinecoin", "izer": "izeroium", "metamoon": "metamoon", "llt": "lifeline", "xgs": "genesisx", "opnn": "opennity", "snft": "seedswap", "yfr": "youforia", "pxi": "prime-xi", "moonmoon": "moonmoon", "ltg": "litegold", "disk": "darklisk", "mxw": "maxonrow", "goc": "eligma", "koko": "kokoswap", "ixt": "insurex", "ttc": "thetimeschaincoin", "pcl": "peculium", "lvn": "livenpay", "vip": "limitless-vip", "hpot": "hash-pot", "cirq": "cirquity", "ino": "ino-coin", "tv": "ti-value", "aenj": "aave-enj-v1", "yfim": "yfimobi", "cqt": "covalent", "zg": "zg", "safemusk": "safemusk", "gasg": "gasgains", "rvmt": "rivemont", "nss": "nss-coin", "cats": "catscoin", "botx": "botxcoin", "polymoon": "polymoon", "vlk": "vulkania", "izi": "izichain", "ziti": "ziticoin", "xmm": "momentum", "lol": "emogi-network", "wage": "philscurrency", "safebank": "safebank", "sine": "sinelock", "icol": "icolcoin", "hibs": "hiblocks", "guap": "guapcoin", "aswap": "arbiswap", "miro": "mirocana", "dyx": "xcoinpay", "hburn": "hypeburn", "zne": "zonecoin", "cmit": "cmitcoin", "tkm": "thinkium", "gton": "graviton", "mowl": "moon-owl", "aem": "atheneum", "dgl": "dgl-coin", "pxg": "playgame", "treat": "treatdao", "bnw": "nagaswap", "safestar": "safestar", "mo": "morality", "amkr": "aave-mkr-v1", "fll": "feellike", "18c": "block-18", "tnr": "tonestra", "hypebet": "hype-bet", "bith": "bithachi", "defy": "defy-farm", "neex": "neexstar", "svn": "7finance", "xbs": "bitstake", "jrc": "finchain", "ogods": "gotogods", "saga": "sagacoin", "bnv": "benative", "drops": "defidrop", "exmr": "exmr-monero", "nawa": "narwhale", "mes": "meschain", "stash": "bitstash-marketplace", "cadc": "cad-coin", "pye": "creampye", "api": "the-apis", "isr": "insureum", "mntt": "moontrust", "awg": "aurusgold", "okt": "okexchain", "city": "manchester-city-fan-token", "ryiu": "ryi-unity", "dbtc": "decentralized-bitcoin", "pocc": "poc-chain", "rth": "rotharium", "rrb": "renrenbit", "slv": "silverway", "niu": "niubiswap", "etx": "ethereumx", "ume": "ume-token", "asusd": "aave-susd-v1", "cls": "coldstack", "esti": "easticoin", "cpx": "centerprime", "homt": "hom-token", "ausdt": "aave-usdt-v1", "fmt": "finminity", "vt": "vectoraic", "2248": "2-2-4-4-8", "pivxl": "pivx-lite", "asn": "ascension", "bchc": "bitcherry", "panda": "hashpanda", "vbtc": "venus-btc", "limit": "limitswap", "luck": "lady-luck", "corgi": "corgi-inu", "aab": "aax-token", "cbet": "cryptobet", "supdog": "superdoge", "awbtc": "aave-wbtc-v1", "skc": "skinchain", "dappx": "dappstore", "safetesla": "safetesla", "fuzzy": "fuzzy-inu", "mvc": "mileverse", "vusd": "value-usd", "gera": "gera-coin", "pegs": "pegshares", "mch": "meme-cash", "dfgl": "defi-gold", "cnt": "centurion", "twi": "trade-win", "lburst": "loanburst", "maya": "maya-coin", "hxy": "hex-money", "light": "lightning-protocol", "pbs": "pbs-chain", "pxl": "piction-network", "lfc": "linfinity", "bash": "luckchain", "slf": "solarfare", "grg": "rigoblock", "bixb": "bixb-coin", "isdt": "istardust", "gc": "galaxy-wallet", "hgh": "hgh-token", "egc": "ecog9coin", "stb": "starblock", "tree": "tree-defi", "opti": "optitoken", "flunar": "fairlunar", "dynge": "dyngecoin", "gre": "greencoin", "gift": "gift-coin", "mtcn": "multiven", "bun": "bunnycoin", "pgc": "pegascoin", "sendwhale": "sendwhale", "pfid": "pofid-dao", "dna": "metaverse-dualchain-network-architecture", "bnx": "bnx", "stxym": "stakedxym", "moonstorm": "moonstorm", "nar": "nar-token", "bravo": "bravo-coin", "hntc": "hntc-energy-distributed-network", "eost": "eos-trust", "611": "sixeleven", "mnx": "nodetrade", "bak": "baconcoin", "eqz": "equalizer", "yfiig": "yfii-gold", "vnt": "inventoryclub", "sloth": "slothcoin", "sdfi": "stingdefi", "argp": "argenpeso", "safelight": "safelight", "hejj": "hedge4-ai", "dph": "digipharm", "torq": "torq-coin", "cakecrypt": "cakecrypt", "carr": "carnomaly", "eup": "eup-chain", "poll": "clearpoll", "fullsend": "full-send", "lbet": "lemon-bet", "clm": "coinclaim", "fsp": "flashswap", "dfi": "defichain", "crazytime": "crazytime", "hypr": "hyperburn", "rover": "rover-inu", "coshi": "coshi-inu", "drgb": "dragonbit", "gmci": "game-city", "kanda": "telokanda", "bolc": "boliecoin", "trump": "trumpcoin", "sfg": "s-finance", "moontoken": "moontoken", "btcr": "bitcurate", "tls": "tls-token", "ims": "ims-wallet", "sports": "zensports", "fcr": "fromm-car", "fgc": "fantasy-gold", "cock": "shibacock", "vfil": "venus-fil", "bnc": "bnoincoin", "yap": "yap-stone", "akita": "akita-inu", "acsi": "acryptosi", "whl": "whaleroom", "ba": "batorrent", "apet": "ape-token", "pump": "pump-coin", "fex": "fidex-exchange", "hss": "hashshare", "ouro": "ouroboros", "alink": "aave-link-v1", "rew": "rewardiqa", "btnt": "bitnautic", "curry": "curryswap", "mbm": "mbm-token", "lbt": "lbt-chain", "btym": "blocktyme", "andes": "andes-coin", "vdai": "venus-dai", "flc": "flowchaincoin", "nanox": "project-x", "kishu": "kishu-inu", "pazzi": "paparazzi", "bito": "bito-coin", "fsafe": "fair-safe", "ons": "one-share", "polyshiba": "polyshiba", "tbc": "terablock", "$king": "king-swap", "ich": "ideachain", "bgl": "bitgesell", "1gold": "1irstgold", "ltk": "litecoin-token", "wifi": "wifi-coin", "hlp": "help-coin", "gator": "alligator-fractal-set", "inst": "instadapp", "stxem": "stakedxem", "nmst": "nms-token", "vbch": "venus-bch", "vjc": "venjocoin", "xtg": "xtg-world", "rtm": "raptoreum", "zoot": "zoo-token", "yfe": "yfe-money", "skn": "sharkcoin", "xby": "xtrabytes", "ete": "ethercoin-2", "spaz": "swapcoinz", "bitci": "bitcicoin", "hebe": "hebeblock", "eplus": "epluscoin", "wpp": "wpp-token", "vsxp": "venus-sxp", "ank": "apple-network", "xwo": "wooshcoin-io", "boltt": "boltt-coin", "hua": "chihuahua", "ksc": "kstarcoin", "nana": "ape-tools", "c8": "carboneum", "stc": "coinstarter", "dexa": "dexa-coin", "ramen": "ramenswap", "keanu": "keanu-inu", "newos": "newstoken", "fox": "fox-finance", "cach": "cachecoin", "miks": "miks-coin", "ausdc": "aave-usdc-v1", "hotcross": "hot-cross", "darthelon": "darthelon", "bots": "bot-ocean", "zupi": "zupi-coin", "glov": "glovecoin", "safetoken": "safetoken", "omc": "ormeus-cash", "home": "home-coin", "ick": "ick-mask", "ycurve": "curve-fi-ydai-yusdc-yusdt-ytusd", "xtnc": "xtendcash", "ato": "eautocoin", "hurricane": "hurricane", "loto": "lotoblock", "coal": "coalculus", "lland": "lyfe-land", "dic": "daikicoin", "bitb": "bitcoin-bull", "orbi": "orbicular", "mochi": "mochiswap", "ecl": "eclipseum", "jind": "jindo-inu", "xbe": "xbe-token", "pwrb": "powerbalt", "crt": "carr-finance", "mgc": "magnachain", "mw": "mirror-world-token", "agri": "agrinovuscoin", "tea": "tea-token", "mcau": "meld-gold", "naut": "astronaut", "ltz": "litecoinz", "tcr": "tecracoin", "stro": "supertron", "ezpay": "eazypayza", "xmpt": "xiamipool", "odc": "odinycoin", "entrc": "entercoin", "bnz": "bonezyard", "silk": "silkchain", "hfil": "huobi-fil", "rld": "real-land", "lgold": "lyfe-gold", "lv": "lendchain", "happy": "happycoin", "mic3": "mousecoin", "rpepe": "rare-pepe", "safermoon": "safermoon", "bali": "balicoin", "ani": "anime-token", "layerx": "unilayerx", "deal": "idealcash", "solo": "solo-coin", "7add": "holdtowin", "dlx": "dapplinks", "pdao": "panda-dao", "tdps": "tradeplus", "nuvo": "nuvo-cash", "honk": "honk-honk", "abusd": "aave-busd-v1", "krill": "polywhale", "xrge": "rougecoin", "ns": "nodestats", "blfi": "blackfisk", "ship": "shipchain", "au": "aurumcoin", "mzg": "moozicore", "long": "long-coin", "btzc": "beatzcoin", "arnxm": "armor-nxm", "crd": "crd-network", "gsmt": "grafsound", "hpy": "hyper-pay", "hnzo": "hanzo-inu", "vestx": "vestxcoin", "rc20": "robocalls", "idl": "idl-token", "scs": "speedcash", "shpp": "shipitpro", "uba": "unbox-art", "safespace": "safespace", "kick": "kickico", "pton": "foresting", "spk": "sparks", "chibi": "chibi-inu", "ponzi": "ponzicoin", "etit": "etitanium", "xamp": "antiample", "bbx": "ballotbox", "sdao": "singularitydao", "duk+": "dukascoin", "wtn": "waletoken", "vxc": "vinx-coin", "nplc": "plus-coin", "candybox": "candy-box", "eswap": "eswapping", "ctpl": "cultiplan", "payt": "payaccept", "bxh": "bxh", "vgtg": "vgtgtoken", "bxt": "bitfxt-coin", "dgp": "dgpayment", "vlt": "bankroll-vault", "nnb": "nnb-token", "ret": "realtract", "scu": "securypto", "thrn": "thorncoin", "agvc": "agavecoin", "clbk": "cloudbric", "ara": "ara-token", "x2p": "xenon-pay", "zash": "zimbocash", "gdm": "goldmoney", "thr": "thorecoin", "bna": "bananatok", "hint": "hintchain", "fyznft": "fyznft", "hub": "minter-hub", "mbit": "mbitbooks", "tno": "tnos-coin", "lemo": "lemochain", "vany": "vanywhere", "vxvs": "venus-xvs", "cell": "cellframe", "qbc": "quebecoin", "pcb": "451pcbcom", "sec": "smilecoin", "safecomet": "safecomet", "lsh": "leasehold", "crm": "cream", "xpb": "transmute", "eto": "essek-tov", "kpop": "kpop-coin", "gbk": "goldblock", "now": "changenow", "exm": "exmo-coin", "lov": "lovechain", "beast": "beast-dao", "minty": "minty-art", "intx": "intexcoin", "bazt": "baooka-token", "vltc": "venus-ltc", "asac": "asac-coin", "hoo": "hoo-token", "swet": "swe-token", "more": "legends-room", "cbrl": "cryptobrl", "lmch": "latamcash", "hapy": "hapy-coin", "jfin": "jfin-coin", "scurve": "lp-scurve", "starsb": "star-shib", "chess": "chesscoin-0-32", "honey": "honeycomb-2", "nsd": "nasdacoin", "love": "love-coin", "ira": "deligence", "mptc": "mnpostree", "ez": "easyfi", "eubc": "eub-chain", "tkinu": "tsuki-inu", "tco": "tcoin-fun", "mnstp": "moon-stop", "navy": "boatpilot", "creva": "crevacoin", "fomo": "fomo-labs", "laika": "laika-protocol", "mvh": "moviecash", "psix": "propersix", "ecos": "ecodollar", "unft": "ultra-nft", "dsc": "data-saver-coin", "tknt": "tkn-token", "vect": "vectorium", "psk": "pool-of-stake", "hvt": "hirevibes", "vega": "vega-coin", "bmh": "blockmesh-2", "amsk": "nolewater", "qtf": "quantfury", "kong": "kong-defi", "evy": "everycoin", "save": "savetheworld", "4art": "4artechnologies", "ball": "ball-coin", "repo": "repo", "pass": "passport-finance", "mswap": "moneyswap", "kuky": "kuky-star", "fuzz": "fuzzballs", "beers": "moonbeers", "bspay": "brosispay", "eland": "etherland", "vest": "vestchain", "gol": "gogolcoin", "bct": "bitcoin-trust", "curve": "curvehash", "latte": "latteswap", "capp": "crypto-application-token", "it": "idc-token", "koel": "koel-coin", "safepluto": "safepluto", "safelogic": "safelogic", "pdai": "prime-dai", "pbase": "polkabase", "bns": "bns-token", "jdi": "jdi-token", "lama": "llamaswap", "paddy": "paddycoin", "grlc": "garlicoin", "mtp": "multiplay", "dream": "dreamscoin", "newton": "newtonium", "ultra": "ultrasafe", "atusd": "aave-tusd-v1", "xwc": "whitecoin", "betc": "bet-chips", "xscp": "scopecoin", "fastx": "transfast", "mytv": "mytvchain", "amana": "aave-mana-v1", "abc": "abc-chain", "dfc": "defiscale", "kashh": "kashhcoin", "vxrp": "venus-xrp", "vdot": "venus-dot", "spdx": "spender-x", "shibsc": "shiba-bsc", "dkkt": "dkk-token", "toki": "tokyo-inu", "bbank": "blockbank", "bp": "bunnypark", "lbd": "linkbased", "lir": "letitride", "safeorbit": "safeorbit", "pluto": "plutopepe", "iai": "iai-token", "bamboo": "bamboo-token-2", "hmnc": "humancoin-2", "nokn": "nokencoin", "dpc": "dappcents", "erz": "earnzcoin", "cbr": "cybercoin", "cxp": "caixa-pay", "forex": "forexcoin", "sybc": "sybc-coin", "uniusd": "unidollar", "safeearth": "safeearth", "qnc": "qnodecoin", "shd": "shardingdao", "hcs": "help-coins", "yfms": "yfmoonshot", "bnox": "blocknotex", "dnc": "danat-coin", "yfis": "yfiscurity", "pod": "payment-coin", "shark": "polyshark-finance", "lstr": "meetluna", "gp": "goldpieces", "hshiba": "huskyshiba", "argo": "argo", "ebsp": "ebsp-token", "tsx": "tradestars", "kt": "kuaitoken", "when": "when-token", "osc": "oasis-city", "iown": "iown", "cennz": "centrality", "os76": "osmiumcoin", "jic": "joorschain", "jaguar": "jaguarswap", "ypanda": "yieldpanda", "echo": "token-echo", "dscp": "disciplina-project-by-teachmeplease", "lrg": "largo-coin", "btsucn": "btsunicorn", "fotc": "forte-coin", "vsc": "vsportcoin", "sanshu": "sanshu-inu", "crl": "coral-farm", "xno": "xeno-token", "stt": "scatter-cx", "trv": "trustverse", "akm": "cost-coin", "bmt": "bmining-token", "chinu": "chubby-inu", "gpkr": "gold-poker", "saveanimal": "saveanimal", "lbr": "liber-coin", "speed": "speed-coin", "pmp": "pumpy-farm", "eurx": "etoro-euro", "itam": "itam-games", "safecookie": "safecookie", "refraction": "refraction", "xre": "xre-global", "cleanocean": "cleanocean", "noahark": "noah-ark", "kim": "king-money", "stfiro": "stakehound", "wdr": "wider-coin", "tuber": "tokentuber", "sovi": "sovi-token", "gnt": "greentrust", "szo": "shuttleone", "tons": "thisoption", "dandy": "dandy", "mob": "mobilecoin", "c4t": "coin4trade", "jcc": "junca-cash", "levl": "levolution", "rocket": "rocketgame", "scm": "simulacrum", "invc": "investcoin", "cmm": "commercium", "crn": "chronocoin", "cbex": "cryptobexchange", "bcnt": "bincentive", "drep": "drep-new", "cnyt": "cny-tether", "dt3": "dreamteam3", "kxc": "kingxchain", "deva": "deva-token", "enrg": "energycoin", "ykz": "yakuza-dao", "vprc": "vaperscoin", "ltn": "life-token", "bec": "betherchip", "euru": "upper-euro", "milk": "milk-token", "olive": "olivecash", "lvh": "lovehearts", "rview": "reviewbase", "bhiba": "baby-shiba", "ivy": "ivy-mining", "coral": "coral-swap", "vx": "vitex", "usdb": "usd-bancor", "jt": "jubi-token", "zlf": "zillionlife", "soda": "soda-token", "icr": "intercrone", "usdh": "honestcoin", "ntb": "tokenasset", "trib": "contribute", "sos": "solstarter", "dvc": "dragonvein", "tgn": "terragreen", "bab": "basis-bond", "erc": "europecoin", "kfi": "klever-finance", "mongocm": "mongo-coin", "rwn": "rowan-coin", "ktv": "kmushicoin", "ueth": "unagii-eth", "ygoat": "yield-goat", "nxl": "next-level", "yuang": "yuang-coin", "fmta": "fundamenta", "vdoge": "venus-doge", "robet": "robet-coin", "ethsc": "ethereumsc", "tvnt": "travelnote", "phiba": "papa-shiba", "gm": "gmcoin", "lof": "lonelyfans", "soak": "soak-token", "bkk": "bkex-token", "sg": "social-good-project", "rmoon": "rocketmoon", "clr": "color", "quickchart": "quickchart", "vlink": "venus-link", "grw": "growthcoin", "hungry": "hungrybear", "fundx": "funder-one", "hedg": "hedgetrade", "sv7": "7plus-coin", "safeicarus": "safelcarus", "blinky": "blinky-bob", "hum": "humanscape", "comfy": "comfytoken", "jack": "jack-token", "usds": "stableusd", "scorgi": "spacecorgi", "pkoin": "pocketcoin", "las": "alaska-inu", "g-fi": "gorilla-fi", "dogg": "dogg-token", "dapp": "dappercoin", "yfmb": "yfmoonbeam", "grimex": "spacegrime", "mcf": "moon-chain", "cyf": "cy-finance", "doos": "doos-token", "stkr": "staker-dao", "feta": "feta-token", "dac": "davinci-coin", "co2": "collective", "usdg": "usd-gambit", "daa": "double-ace", "kub": "bitkub-coin", "ncat": "nyan-cat", "lnko": "lnko-token", "xpn": "pantheon-x", "qhc": "qchi-chain", "shibm": "shiba-moon", "ltfg": "lightforge", "cron": "cryptocean", "sox": "ethersocks", "fl": "freeliquid", "bkita": "baby-akita", "ogc": "onegetcoin", "beer": "beer-money", "vbeth": "venus-beth", "uze": "uze-token", "kgw": "kawanggawa", "bwx": "blue-whale", "hart": "hara-token", "hyp": "hyperstake", "noiz": "noiz-chain", "elet": "ether-legends", "undo": "undo-token", "zarh": "zarcash", "torj": "torj-world", "cng": "cng-casino", "roul": "roul-token", "elama": "elamachain", "vlc": "valuechain", "dtube": "dtube-coin", "konj": "konjungate", "elt": "elite-swap", "icicb": "icicb-coin", "cl": "coinlancer", "uvu": "ccuniverse", "flt": "fluttercoin", "dogefather": "dogefather", "csm": "consentium", "brze": "breezecoin", "dmagic": "dark-magic", "lowb": "loser-coin", "shico": "shibacorgi", "she": "shinechain", "udai": "unagii-dai", "cfg": "centrifuge", "nac": "nami-trade", "rope": "rope-token", "baby": "baby-token", "basid": "basid-coin", "ping": "cryptoping", "robo": "robo-token", "snoge": "snoop-doge", "zaif": "zaif-token", "soil": "synth-soil", "fuze": "fuze-token", "bynd": "beyondcoin", "zest": "thar-token", "tking": "tiger-king", "evny": "evny-token", "ecpn": "ecpntoken", "oc": "oceanchain", "mgp": "mangochain", "vusdc": "venus-usdc", "micro": "micromines", "mad": "mad-network", "chiba": "cate-shiba", "expo": "online-expo", "nah": "strayacoin", "brcp": "brcp-token", "webn": "web-innovation-ph", "mfy": "mifty-swap", "dmch": "darma-cash", "bnfi": "blaze-defi", "xbrt": "bitrewards", "db": "darkbuild-v2", "tune": "tune-token", "kiz": "kizunacoin", "sswim": "shiba-swim", "chs": "chainsquare", "fscc": "fisco", "pxc": "phoenixcoin", "grn": "dascoin", "usdsp": "usd-sports", "cent": "centercoin", "smoo": "sheeshmoon", "bsocial": "banksocial", "colx": "colossuscoinxt", "chex": "chex-token", "mexc": "mexc-token", "xrd": "raven-dark", "coic": "coic", "bsg": "bitsonic-gas", "carbo": "carbondefi", "espro": "esportspro", "ctcn": "contracoin", "phn": "phillionex", "yta": "yottacoin", "nftl": "nftl-token", "garuda": "garudaswap", "hgc": "higamecoin", "mgpc": "magpiecoin", "cfl": "cryptoflow", "slam": "slam-token", "csc": "casinocoin", "dtop": "dhedge-top-index", "bgo": "bingo-cash", "ski": "skillchain", "tavitt": "tavittcoin", "dain": "dain-token", "jgn": "juggernaut", "aca": "acash-coin", "xpt": "cryptobuyer-token", "harta": "harta-tech", "rzn": "rizen-coin", "spring": "springrole", "strike": "strikecoin", "plc": "platincoin", "sets": "sensitrust", "fto": "futurocoin", "rupee": "hyruleswap", "moonlyfans": "moonlyfans", "gcx": "germancoin", "sugar": "sugarchain", "ctc": "culture-ticket-chain", "soba": "soba-token", "syfi": "soft-yearn", "stlp": "tulip-seed", "jenn": "tokenjenny", "cyt": "cryptokenz", "safegalaxy": "safegalaxy", "cyberd": "cyber-doge", "ybear": "yield-bear", "smartworth": "smartworth", "yea": "yeafinance", "alm": "allium-finance", "sprtz": "spritzcoin", "$g": "gooddollar", "spacedoge": "space-doge", "tiim": "triipmiles", "nva": "neeva-defi", "gb": "goldblocks", "bff": "bitcoffeen", "btcbam": "bitcoinbam", "tokc": "tokyo", "nacho": "nacho-coin", "ggive": "globalgive", "crex": "crex-token", "rcube": "retro-defi", "vegi": "veggiecoin", "qac": "quasarcoin", "ffa": "cryptofifa", "yfi3": "yfi3-money", "willie": "williecoin", "yland": "yearn-land", "gio": "graviocoin", "frmx": "frmx-token", "divo": "divo-token", "hora": "hora", "cp3r": "compounder", "ddr": "digi-dinar", "snowge": "snowgecoin", "spup": "spurt-plus", "vbusd": "venus-busd", "ist": "ishop-token", "tronx": "tronx-coin", "cicc": "caica-coin", "moonpirate": "moonpirate", "bhd": "bitcoin-hd", "sabaka inu": "sabaka-inu", "qtv": "quish-coin", "rain": "rain-network", "grow": "growing-fi", "ucos": "ucos-token", "zcnox": "zcnox-coin", "cntm": "connectome", "brmv": "brmv-token", "vusdt": "venus-usdt", "cerberus": "gocerberus", "mbc": "microbitcoin", "lce": "lance-coin", "beluga": "belugaswap", "roe": "rover-coin", "petal": "bitflowers", "polt": "polkatrain", "mima": "kyc-crypto", "wdt": "voda-token", "bmch": "bmeme-cash", "cosm": "cosmo-coin", "bicas": "bithercash", "escx": "escx-token", "ami": "ammyi-coin", "sdog": "small-doge", "hptf": "heptafranc", "carbon": "carboncoin", "tlnt": "talent-coin", "fgp": "fingerprint", "yoo": "yoo-ecology", "wgp": "w-green-pay", "nyc": "newyorkcoin", "live": "tronbetlive", "dhold": "diamondhold", "spkl": "spoklottery", "lsilver": "lyfe-silver", "jac": "jasper-coin", "party": "money-party", "xchf": "cryptofranc", "trxc": "tronclassic", "ert": "eristica", "hiz": "hiz-finance", "stark": "stark-chain", "ride": "ride-my-car", "trr": "terran-coin", "actn": "action-coin", "carb": "carbon-labs", "polr": "polystarter", "sipc": "simplechain", "stax": "stablexswap", "liq": "liquidity-bot-token", "gl": "green-light", "but": "bitup-token", "gly": "glyph-token", "iog": "playgroundz", "dpet": "my-defi-pet", "qark": "qanplatform", "btcmz": "bitcoinmono", "samo": "samoyedcoin", "hwi": "hawaii-coin", "lnt": "lottonation", "redc": "redchillies", "fbt": "fanbi-token", "bccx": "bitconnectx-genesis", "gdefi": "global-defi", "ssn": "supersonic-finance", "jbp": "jb-protocol", "dragon": "dragon-finance", "pox": "pollux-coin", "hdn": "hidden-coin", "proud": "proud-money", "pig": "pig-finance", "zac": "zac-finance", "dfe": "dfe-finance", "gldr": "golder-coin", "treep": "treep-token", "armx": "armx-unidos", "cfxq": "cfx-quantum", "cbp": "cashbackpro", "xpd": "petrodollar", "lsv": "litecoin-sv", "dcy": "dinastycoin", "hmc": "harmonycoin", "hdac": "hdac", "mcrn": "macaronswap", "808ta": "808ta-token", "f1c": "future1coin", "mc": "monkey-coin", "upb": "upbtc-token", "porte": "porte-token", "tkc": "turkeychain", "bnxx": "bitcoinnexx", "viking": "viking-swap", "aidus": "aidus", "node": "whole-network", "sss": "simple-software-solutions", "rkt": "rocket-fund", "berg": "bergco-coin", "sprx": "sprint-coin", "dtvg": "delta-theta", "etf": "entherfound", "mrx": "linda", "dt": "dcoin-token", "cakita": "chubbyakita", "aqu": "aquarius-fi", "bnbd": "bnb-diamond", "cbucks": "cryptobucks", "kip": "khipu-token", "smile": "smile-token", "brb": "rabbit-coin", "esz": "ethersportz", "$kei": "keisuke-inu", "zbk": "zbank-token", "dili": "d-community", "c2o": "cryptowater", "dgc": "digitalcoin", "mkb": "maker-basic", "dogdefi": "dogdeficoin", "try": "try-finance", "tfg1": "energoncoin", "svr": "sovranocoin", "punk-female": "punk-female", "pekc": "peacockcoin", "xxp": "xx-platform", "env": "env-finance", "papel": "papel", "xrpc": "xrp-classic", "gfnc": "grafenocoin-2", "pint": "pub-finance", "btour": "btour-chain", "ytho": "ytho-online", "bgx": "bitcoingenx", "bdcc": "bitica-coin", "vida": "vidiachange", "md+": "moon-day-plus", "cub": "crypto-user-base", "ddos": "disbalancer", "drg": "dragon-coin", "yff": "yff-finance", "payn": "paynet-coin", "hxn": "havens-nook", "jshiba": "jomon-shiba", "pai": "project-pai", "lxc": "latex-chain", "vollar": "vollar", "mti": "mti-finance", "glxc": "galaxy-coin", "ctat": "cryptassist", "pet": "battle-pets", "crg": "cryptogcoin", "cbs3": "crypto-bits", "yfip": "yfi-paprika", "hg": "hygenercoin", "wleo": "wrapped-leo", "cscj": "csc-jackpot", "q8e20": "q8e20-token", "bcvt": "bitcoinvend", "tsla": "tessla-coin", "aurora": "auroratoken", "mdao": "martian-dao", "burger": "burger-swap", "algop": "algopainter", "shokk": "shikokuaido", "mkoala": "koala-token", "vd": "vindax-coin", "gbpu": "upper-pound", "brilx": "brilliancex", "ecr": "ecredit", "erk": "eureka-coin", "wemix": "wemix-token", "sbgo": "bingo-share", "punk-zombie": "punk-zombie", "grew": "green-world", "kimj": "kimjongmoon", "famous": "famous-coin", "fc": "futurescoin", "medi": "mediconnect", "ucr": "ultra-clear", "remit": "remita-coin", "dbund": "darkbundles", "aries": "aries-chain", "bnj": "binjit-coin", "supra": "supra-token", "coy": "coinanalyst", "hrd": "hrd", "panther": "pantherswap", "pola": "polaris-share", "emoji": "emojis-farm", "scn": "silver-coin", "zombie": "zombie-farm", "orc": "oracle-system", "gnto": "goldenugget", "emax": "ethereummax", "mello": "mello-token", "dltx": "deltaexcoin", "wbnb": "wbnb", "tut": "trust-union", "per": "per-project", "memes": "memes-token", "bolo": "bollo-token", "cbix7": "cbi-index-7", "hyd": "hydra-token", "dwz": "defi-wizard", "cbank": "crypto-bank", "yfarm": "yfarm-token", "clva": "clever-defi", "punk-attr-4": "punk-attr-4", "ghd": "giftedhands", "kp0r": "kp0rnetwork", "blosm": "blossomcoin", "inbox": "inbox-token", "dcnt": "decenturion", "limon": "limon-group", "kili": "kilimanjaro", "skrt": "sekuritance", "svc": "satoshivision-coin", "bobt": "boboo-token", "gpyx": "pyrexcoin", "nst": "newsolution", "xbn": "xbn", "btd": "bolt-true-dollar", "boot": "bootleg-nft", "zln": "zillioncoin", "god": "bitcoin-god", "genes": "genes-chain", "metis": "metis-token", "baw": "wab-network", "solace": "solace-coin", "carom": "carillonium", "mcn": "moneta-verde", "aws": "aurus-silver", "mveda": "medicalveda", "cf": "californium", "dfm": "defi-on-mcw", "punk-attr-5": "punk-attr-5", "mandi": "mandi-token", "minx": "innovaminex", "fyy": "grandpa-fan", "srsb": "sirius-bond", "fred": "fredenergy", "dhx": "datahighway", "$sshiba": "super-shiba", "zeus": "zuescrowdfunding", "jnb": "jinbi-token", "ttm": "tothe-moon", "tbake": "bakerytools", "fed": "fedora-gold", "pkp": "pikto-group", "grwi": "growers-international", "earth": "earth-token", "cca": "counos-coin", "hachiko": "hachiko-inu", "zcrt": "zcore-token", "poodl": "poodle", "navi": "natus-vincere-fan-token", "scoot": "scootercoin", "rugbust": "rug-busters", "codeo": "codeo-token", "orbyt": "orbyt-token", "fetish": "fetish-coin", "hland": "hland-token", "dnd": "dungeonswap", "vcash": "vcash-token", "bih": "bithostcoin", "cdash": "crypto-dash", "ctrfi": "chestercoin", "htdf": "orient-walt", "isle": "island-coin", "tbcc": "tbcc-wallet", "alc": "alrightcoin", "ioox": "ioox-system", "crypl": "cryptolandy", "sarco": "sarcophagus", "bvnd": "binance-vnd", "pbom": "pocket-bomb", "raff": "rafflection", "wusd": "wrapped-usd", "xqc": "quras-token", "wsc": "wesing-coin", "fans": "unique-fans", "idx": "index-chain", "dxy": "dxy-finance", "nc": "nayuta-coin", "bridge": "multibridge", "yo": "yobit-token", "papp": "papp-mobile", "munch": "munch-token", "tom": "tom-finance", "marsm": "marsmission", "hybn": "hey-bitcoin", "pal": "playandlike", "rc": "russell-coin", "tst": "touch-social", "viagra": "viagra-token", "bezoge": "bezoge-earth", "trt": "taurus-chain", "ft1": "fortune1coin", "kper": "kper-network", "wavax": "wrapped-avax", "lnx": "linix", "ymen": "ymen-finance", "wiken": "project-with", "dfyn": "dfyn-network", "lift": "lift-kitchen", "catnip": "catnip-money", "skb": "sakura-bloom", "seol": "seed-of-love", "sdm": "sky-dog-moon", "bia": "bilaxy-token", "cnz": "coinzo-token", "xts": "xaviera-tech", "acr": "acreage-coin", "ine": "intellishare", "map": "marcopolo", "skill": "cryptoblades", "loa": "loa-protocol", "dfn": "difo-network", "vlad": "vlad-finance", "spmk": "space-monkey", "mvt": "the-movement", "zild": "zild-finance", "xgc": "xiglute-coin", "usdu": "upper-dollar", "kft": "knit-finance", "syax": "staked-yaxis", "zuz": "zuz-protocol", "bulk": "bulk-network", "kseed": "kush-finance", "toad": "toad-network", "vena": "vena-network", "lp": "lepard-coin", "yg": "yearn-global", "rckt": "rocket-token", "xdef2": "xdef-finance", "etna": "etna-network", "btap": "bta-protocol", "gogo": "gogo-finance", "1mil": "1million-nfts", "btcu": "bitcoin-ultra", "azt": "az-fundchain", "icnq": "iconiq-lab-token", "load": "load-network", "biot": "biopassport", "fridge": "fridge-token", "zttl": "zettelkasten", "hate": "heavens-gate", "bingus": "bingus-token", "mtr": "meter-stable", "yuno": "yuno-finance", "xlmg": "stellar-gold", "xwin": "xwin-finance", "lpc": "lightpaycoin", "noel": "noel-capital", "grap": "grap-finance", "wbind": "wrapped-bind", "orao": "orao-network", "cet": "coinex-token", "tama": "tama-finance", "phoon": "typhoon-cash", "elyx": "elynet-token", "wec": "wave-edu-coin", "dzar": "digital-rand", "wet": "weshow", "safehamsters": "safehamsters", "orange": "orange-token", "dixt": "dixt-finance", "mcan": "medican-coin", "bic": "bitcrex-coin", "brp": "bor-protocol", "etet": "etet-finance", "chm": "cryptochrome", "yfib": "yfibalancer-finance", "htn": "heartnumber", "yfed": "yfedfinance", "earn$": "earn-network", "btca": "bitcoin-anonymous", "fnb": "finexbox-token", "fcx": "fission-cash", "wxtc": "wechain-coin", "neko": "neko-network", "pyro": "pyro-network", "xcon": "connect-coin", "quam": "quam-network", "zep": "zeppelin-dao", "wick": "wick-finance", "dcb": "digital-coin", "saft": "safe-finance", "exe": "8x8-protocol", "wcc": "wincash-coin", "fkx": "fortknoxter", "ryip": "ryi-platinum", "ebox": "ethbox-token", "ubx": "ubix-network", "vcg": "vipcoin-gold", "btchg": "bitcoinhedge", "neww": "newv-finance", "crts": "cryptotipsfr", "poc": "pangea-cleanup-coin", "eqo": "equos-origin", "mich": "charity-alfa", "ror": "ror-universe", "cord": "cord-defi-eth", "yt": "cherry-token", "yd-btc-mar21": "yd-btc-mar21", "pngn": "spacepenguin", "tndr": "thunder-swap", "lqdr": "liquiddriver", "yfix": "yfix-finance", "mach": "mach", "koda": "koda-finance", "ethbnt": "ethbnt", "yd-btc-jun21": "yd-btc-jun21", "myk": "mykonos-coin", "peri": "peri-finance", "cold": "cold-finance", "emdc": "emerald-coin", "wst": "winsor-token", "cnrg": "cryptoenergy", "bcf": "bitcoin-fast", "onex": "onex-network", "balo": "balloon-coin", "wxdai": "wrapped-xdai", "cla": "candela-coin", "pow": "eos-pow-coin", "epg": "encocoinplus", "uc": "youlive-coin", "btllr": "betller-coin", "yape": "gorillayield", "bbq": "barbecueswap", "emrx": "emirex-token", "yfos": "yfos-finance", "sora": "sorachancoin", "butter": "butter-token", "shibal": "shiba-launch", "blcc": "bullers-coin", "agrs": "agoras", "nxct": "xchain-token", "moar": "moar", "rak": "rake-finance", "hyper": "hyperchain-x", "loon": "loon-network", "deuro": "digital-euro", "svt": "spacevikings", "qm": "quick-mining", "hokk": "hokkaidu-inu", "soga": "soga-project", "yd-eth-jun21": "yd-eth-jun21", "phl": "placeh", "vnxlu": "vnx-exchange", "dff": "defi-firefly", "prqboost": "parsiq-boost", "bcm": "bitcoinmoney", "chihua": "chihua-token", "vers": "versess-coin", "cann": "cannabiscoin", "shibco": "shiba-cosmos", "lsc": "littlesesame", "hogl": "hogl-finance", "tpt": "token-pocket", "modx": "model-x-coin", "kpc": "koloop-basic", "nvt": "nervenetwork", "bbgc": "bigbang-game", "latino": "latino-token", "hugo": "hugo-finance", "fds": "fds", "dragn": "astro-dragon", "fshn": "fashion-coin", "xt": "xtcom-token", "wcelo": "wrapped-celo", "kbtc": "klondike-btc", "allbi": "all-best-ico", "unii": "unii-finance", "tym": "timelockcoin", "jus": "just-network", "ww": "wayawolfcoin", "obtc": "boringdao-btc", "tyt": "tianya-token", "vkt": "vankia-chain", "gcz": "globalchainz", "mok": "mocktailswap", "grpl": "grpl-finance-2", "dcw": "decentralway", "yd-eth-mar21": "yd-eth-mar21", "mhlx": "helixnetwork", "hp": "heartbout-pay", "ivc": "invoice-coin", "dio": "deimos-token", "pube": "pube-finance", "kodx": "king-of-defi", "isikc": "isiklar-coin", "esrc": "echosoracoin", "safemooncash": "safemooncash", "husl": "hustle-token", "haze": "haze-finance", "helth": "health-token", "sd": "smart-dollar", "wxbtc": "wrapped-xbtc", "ttx": "talent-token", "emont": "etheremontoken", "volts": "volts-finance", "wshift": "wrapped-shift", "rbtc": "rootstock", "port": "packageportal", "wzec": "wrapped-zcash", "wpx": "wallet-plus-x", "gnsh": "ganesha-token", "bdog": "bulldog-token", "pmc": "paymastercoin", "awt": "airdrop-world", "dmtc": "dmtc-token", "swipe": "swipe-network", "scat": "sad-cat-token", "umc": "universal-marketing-coin", "bs1": "blocsport-one", "wtp": "web-token-pay", "cust": "custody-token", "diamond": "diamond-token", "yyfi": "yyfi-protocol", "ztnz": "ztranzit-coin", "bhig": "buckhath-coin", "whole": "whitehole-bsc", "wtk": "wadzpay-token", "dscvr": "dscvr-finance", "kombat": "crypto-kombat", "btad": "bitcoin-adult", "lem": "lemur-finance", "ul": "uselink-chain", "ltcb": "litecoin-bep2", "peech": "peach-finance", "yfpro": "yfpro-finance", "hnc": "helleniccoin", "jtt": "joytube-token", "gcbn": "gas-cash-back", "xcf": "cenfura-token", "btnyx": "bitonyx-token", "luc": "play2live", "torocus": "torocus-token", "yrise": "yrise-finance", "btcf": "bitcoin-final", "btf": "btf", "neuro": "neuro-charity", "vdg": "veridocglobal", "sbdo": "bdollar-share", "epk": "epik-protocol", "vancii": "vanci-finance", "ganja": "trees-finance", "yfive": "yfive-finance", "atc": "atlantic-coin", "vacay": "vacay", "vcoin": "tronvegascoin", "froge": "froge-finance", "gmng": "global-gaming", "nfi": "norse-finance", "gng": "gold-and-gold", "iflt": "inflationcoin", "glo": "glosfer-token", "hcut": "healthchainus", "aura": "aura-protocol", "wxtz": "wrapped-tezos", "hx": "hyperexchange", "hyfi": "hyper-finance", "nash": "neoworld-cash", "o-ocean-mar22": "o-ocean-mar22", "ltrbt": "little-rabbit", "brg": "bridge-oracle", "tnet": "title-network", "bundb": "unidexbot-bsc", "payou": "payou-finance", "inb": "insight-chain", "acpt": "crypto-accept", "most": "most-protocol", "anty": "animalitycoin", "zefi": "zcore-finance", "hcc": "holiday-chain", "lunar": "lunar-highway", "qcore": "qcore-finance", "hosp": "hospital-coin", "stbb": "stabilize-bsc", "adf": "ad-flex-token", "prd": "predator-coin", "69c": "6ix9ine-chain", "hc8": "hydrocarbon-8", "invox": "invox-finance", "rhea": "rheaprotocol", "pipi": "pippi-finance", "elcash": "electric-cash", "woop": "woonkly-power", "qwla": "qawalla-token", "btri": "trinity-bsc", "entrp": "hut34-entropy", "dino": "jurassic-farm", "brn": "brainaut-defi", "swusd": "swusd", "bsh": "bitcoin-stash", "mtdr": "matador-token", "nmn": "99masternodes", "mort": "dynamic-supply-tracker", "pyr": "vulcan-forged", "scha": "schain-wallet", "vgd": "vangold-token", "tfc": "treasure-financial-coin", "obsr": "observer-coin", "joos": "joos-protocol", "womi": "wrapped-ecomi", "pfb": "penny-for-bit", "fras": "frasindo-rent", "amio": "amino-network", "gpc": "greenpay-coin", "oac": "one-army-coin", "cdy": "bitcoin-candy", "fam": "yefam-finance", "pand": "panda-finance", "idt": "investdigital", "neal": "neal", "blc": "bullionschain", "ext": "exchain", "b1p": "b-one-payment", "tai": "tai", "chadlink": "chad-link-set", "fork": "gastroadvisor", "gvc": "gemvault-coin", "afin": "afin-coin", "geth": "guarded-ether", "prism": "prism-network", "peppa": "peppa-network", "elite": "ethereum-lite", "fetch": "moonretriever", "gent": "genesis-token", "phtf": "phantom-token", "eyes": "eyes-protocol", "dawn": "dawn-protocol", "aplp": "apple-finance", "dx": "dxchain", "pfi": "protocol-finance", "brap": "brapper-token", "water": "water-finance", "tata": "hakuna-metata", "xsm": "spectrum-cash", "wmatic": "wmatic", "vinx": "vinx-coin-sto", "momo": "momo-protocol", "krypto": "kryptobellion", "xfc": "football-coin", "well": "wellness-token-economy", "gts": "gt-star-token", "crwn": "crown-finance", "pearl": "pearl-finance", "blzn": "blaze-network", "creed": "creed-finance", "nbot": "naka-bodhi-token", "yffii": "yffii-finance", "dark": "darkbuild", "slme": "slime-finance", "nbs": "new-bitshares", "gdoge": "gdoge-finance", "dogen": "dogen-finance", "exnx": "exenox-mobile", "mxf": "mixty-finance", "yeth": "fyeth-finance", "atls": "atlas", "xao": "alloy-project", "ftb": "free-tool-box", "xrm": "refine-medium", "feast": "feast-finance", "soldier": "space-soldier", "onlexpa": "onlexpa-token", "src": "simracer-coin", "xns": "xeonbit-token", "ytsla": "ytsla-finance", "halo": "halo-platform", "bday": "birthday-cake", "labra": "labra-finance", "stakd": "stakd-finance", "molk": "mobilink-coin", "mina": "mina-protocol-iou", "bpc": "backpacker-coin", "tuda": "tutors-diary", "kbond": "klondike-bond", "codex": "codex-finance", "cora": "corra-finance", "lyd": "lydia-finance", "wae": "wave-platform", "yfst": "yfst-protocol", "tiox": "trade-token", "cp": "cryptoprofile", "rasta": "rasta-finance", "l2p": "lung-protocol", "lnk": "link-platform", "xag": "xrpalike-gene", "mngo": "mango-markets", "wnl": "winstars", "uto": "unitopia-token", "ccy": "cryptocurrency", "bog": "bogged-finance", "prdx": "predix-network", "jsb": "jsb-foundation", "inflex": "inflex-finance", "shild": "shield-network", "ubtc": "united-bitcoin", "mayp": "maya-preferred-223", "nfd": "nifdo-protocol", "eveo": "every-original", "buc": "buyucoin-token", "cbd": "greenheart-cbd", "bks": "barkis", "afcash": "africunia-bank", "lncx": "luna-nusa-coin", "esg": "empty-set-gold", "thor": "asgard-finance", "elephant": "elephant-money", "atis": "atlantis-token", "cpte": "crypto-puzzles", "pareto": "pareto-network", "snowball": "snowballtoken", "ucoin": "universal-coin", "guh": "goes-up-higher", "espi": "spider-ecology", "chad": "the-chad-token", "cvt": "civitas-protocol", "erd": "eldorado-token", "snb": "synchrobitcoin", "shld": "shield-finance", "steak": "steaks-finance", "sofi": "social-finance", "rsct": "risecointoken", "mov": "motiv-protocol", "hzd": "horizondollar", "sedo": "sedo-pow-token", "svs": "silver-gateway", "pepr": "pepper-finance", "wtf": "walnut-finance", "elena": "elena-protocol", "xlab": "xceltoken-plus", "lat": "platon-network", "rick": "infinite-ricks", "osm": "options-market", "sho": "showcase-token", "onez": "the-nifty-onez", "perx": "peerex-network", "hltc": "huobi-litecoin", "shrimp": "shrimp-finance", "sahu": "sakhalin-husky", "gvy": "groovy-finance", "mbull": "mad-bull-token", "prtn": "proton-project", "vcco": "vera-cruz-coin", "dart": "dart-insurance", "bbl": "bubble-network", "raptor": "raptor-finance", "katana": "katana-finance", "xpose": "xpose-protocol", "kmw": "kepler-network", "yf4": "yearn4-finance", "mlk": "milk-alliance", "uskita": "american-akita", "2based": "2based-finance", "swfi": "swirge-finance", "ald": "aludra-network", "wanatha": "wrapped-anatha", "amc": "anonymous-coin", "upxau": "universal-gold", "pjm": "pajama-finance", "dgnn": "dragon-network", "miva": "minerva-wallet", "kbc": "karatgold-coin", "lyn": "lynchpin_token", "xuc": "exchange-union", "dwc": "digital-wallet", "roy": "royal-protocol", "wscrt": "secret-erc20", "fsc": "five-star-coin", "metp": "metaprediction", "3crv": "lp-3pool-curve", "kimchi": "kimchi-finance", "rosn": "roseon-finance", "bf": "bitforex", "byn": "beyond-finance", "ctg": "cryptorg-token", "ushiba": "american-shiba", "wac": "warranty-chain", "etr": "electric-token", "cdl": "coindeal-token", "umbr": "umbra-network", "upeur": "universal-euro", "dynmt": "dynamite-token", "bfr": "bridge-finance", "cxc": "capital-x-cell", "aph": "apholding-coin", "ecoreal": "ecoreal-estate", "gjco": "giletjaunecoin", "hdw": "hardware-chain", "deve": "divert-finance", "mcbase": "mcbase-finance", "cbtc": "classicbitcoin", "mzk": "muzika-network", "mtns": "omotenashicoin", "ccake": "cheesecakeswap", "mtm": "momentum-token", "xmc": "monero-classic-xmc", "dpr": "deeper-network", "cad": "candy-protocol", "hnb": "hashnet-biteco", "btrl": "bitcoinregular", "new": "newton-project", "foc": "theforce-trade", "sch": "schillingcoin", "ths": "the-hash-speed", "hdot": "huobi-polkadot", "ica": "icarus-finance", "rgp": "rigel-protocol", "heth": "huobi-ethereum", "recap": "review-capital", "gnc": "galaxy-network", "eer": "ethereum-erush", "dquick": "dragons-quick", "bribe": "bribe-token", "ltcu": "litecoin-ultra", "cavo": "excavo-finance", "ethmny": "ethereum-money", "bcash": "bankcoincash", "zseed": "sowing-network", "owo": "one-world-coin", "polven": "polka-ventures", "redpanda": "redpanda-earth", "tcnx": "tercet-network", "gzil": "governance-zil", "ucap": "unicap-finance", "spex": "sproutsextreme", "es": "era-swap-token", "liquid": "netkoin-liquid", "npw": "new-power-coin", "gs": "genesis-shards", "sifi": "simian-finance", "chord": "chord-protocol", "bsk": "bitcoinstaking", "cspr": "casper-network", "neon": "neonic-finance", "typh": "typhoon-network", "wccx": "wrapped-conceal", "boc": "bitorcash-token", "xbt": "elastic-bitcoin", "ans": "ans-crypto-coin", "rlr": "relayer-network", "ldn": "ludena-protocol", "slrs": "solrise-finance", "spl": "simplicity-coin", "ufc": "union-fair-coin", "fol": "folder-protocol", "wsienna": "sienna-erc20", "rfy": "rfyield-finance", "kmc": "king-maker-coin", "ec2": "employment-coin", "weather": "weather-finance", "gdl": "gondola-finance", "print": "printer-finance", "libref": "librefreelencer", "defit": "defit", "axa": "alldex-alliance", "kimochi": "kimochi-finance", "bttr": "bittracksystems", "craft": "decraft-finance", "bips": "moneybrain-bips", "cifi": "citizen-finance", "aevo": "aevo", "krg": "karaganda-token", "flexethbtc": "flexeth-btc-set", "fico": "french-ico-coin", "wag8": "wrapped-atromg8", "ddrt": "digidinar-token", "fish": "penguin-party-fish", "moonlight": "moonlight-token", "skt": "sealblock-token", "nyan": "yieldnyan-token", "nftpunk": "nftpunk-finance", "mpwr": "empower-network", "chal": "chalice-finance", "ginu": "green-shiba-inu", "yfarmer": "yfarmland-token", "altm": "altmarkets-coin", "dvi": "dvision-network", "edoge": "elon-doge-token", "nftart": "nft-art-finance", "bpakc": "bitpakcointoken", "usdo": "usd-open-dollar", "mg": "minergate-token", "comc": "community-chain", "eoc": "everyonescrypto", "uusdc": "unagii-usd-coin", "xai": "sideshift-token", "nmp": "neuromorphic-io", "gfi": "gravity-finance", "usdj": "just-stablecoin", "trips": "trips-community", "lic": "lightening-cash", "bwb": "bw-token", "hps": "happiness-token", "advc": "advertisingcoin", "ssj": "super-saiya-jin", "udt": "unlock-protocol", "esce": "escroco", "emb": "block-collider", "bashtank": "baby-shark-tank", "aens": "aen-smart-token", "vct": "valuecybertoken", "cnp": "cryptonia-poker", "wmpro": "wm-professional", "bst1": "blueshare-token", "dxts": "destiny-success", "tni": "tunnel-protocol", "sheesha": "sheesha-finance", "bcc": "basis-coin-cash", "snbl": "safenebula", "nos": "nitrous-finance", "moonday": "moonday-finance", "hoodrat": "hoodrat-finance", "m3c": "make-more-money", "shield": "shield-protocol", "tin": "tinfoil-finance", "plst": "philosafe-token", "wsta": "wrapped-statera", "yfild": "yfilend-finance", "bchip": "bluechips-token", "afi": "aries-financial-token", "blink": "blockmason-link", "trdl": "strudel-finance", "pussy": "pussy-financial", "sprkl": "sparkle", "stpl": "stream-protocol", "brzx": "braziliexs-token", "fusion": "fusion-energy-x", "cwv": "cryptoworld-vip", "smpl": "smpl-foundation", "chum": "chumhum-finance", "xyx": "burn-yield-burn", "dimi": "diminutive-coin", "gdt": "globe-derivative-exchange", "renbtccurve": "lp-renbtc-curve", "ringx": "ring-x-platform", "bpriva": "privapp-network", "esn": "escudonavacense", "qcx": "quickx-protocol", "elongd": "elongate-duluxe", "idv": "idavoll-network", "yfiking": "yfiking-finance", "infi": "insured-finance", "fold": "manifold-finance", "hds": "hotdollars-token", "u8d": "universal-dollar", "atfi": "atlantic-finance", "xep": "electra-protocol", "unicrap": "unicrap", "sny": "syntheify-token", "change": "change-our-world", "tori": "storichain-token", "goi": "goforit", "fxtc": "fixed-trade-coin", "west": "waves-enterprise", "ipx": "ipx-token", "supt": "super-trip-chain", "afc": "apiary-fund-coin", "btrs": "bitball-treasure", "mtlmc3": "metal-music-coin", "jfi": "jackpool-finance", "bb": "blackberry-token", "uhp": "ulgen-hash-power", "tcapethdai": "holistic-eth-set", "pld": "pureland-project", "para": "paralink-network", "rtf": "regiment-finance", "idleusdtyield": "idle-usdt-yield", "tomoe": "tomoe", "vsd": "value-set-dollar", "shx": "stronghold-token", "bplc": "blackpearl-chain", "orion": "orion-initiative", "gme": "gamestop-finance", "eurt": "euro-ritva-token", "mwc": "mimblewimblecoin", "sya": "save-your-assets", "ccf": "cerberus", "wsb": "wall-street-bets-dapp", "spot": "cryptospot-token", "qqq": "qqq-token", "cnet": "currency-network", "ssl": "sergey-save-link", "myid": "my-identity-coin", "syfl": "yflink-synthetic", "hcore": "hardcore-finance", "magi": "magikarp-finance", "vamp": "vampire-protocol", "cyc": "cyclone-protocol", "usdfl": "usdfreeliquidity", "bbi": "bigboys-industry", "flm": "flamingo-finance", "tryon": "stellar-invictus", "swl": "swiftlance-token", "rnrc": "rock-n-rain-coin", "cytr": "cyclops-treasure", "whxc": "whitex-community", "bdigg": "badger-sett-digg", "biut": "bit-trust-system", "idlesusdyield": "idle-susd-yield", "bcr": "bankcoin-reserve", "xlpg": "stellarpayglobal", "ltfn": "litecoin-finance", "bhc": "billionhappiness", "pnc": "parellel-network", "tsc": "time-space-chain", "nye": "newyork-exchange", "fbn": "five-balance", "mtnt": "mytracknet-token", "mally": "malamute-finance", "cgc": "cash-global-coin", "pcake": "polycake-finance", "nnn": "novem-gold-token", "gpo": "galaxy-pool-coin", "mil": "military-finance", "bxk": "bitbook-gambling", "plum": "plumcake-finance", "mof": "molecular-future", "kdg": "kingdom-game-4-0", "bci": "bitcoin-interest", "wbb": "wild-beast-block", "shibaken": "shibaken-finance", "bcs": "business-credit-substitute", "idleusdcyield": "idle-usdc-yield", "degenr": "degenerate-money", "scho": "scholarship-coin", "hpt": "huobi-pool-token", "roger": "theholyrogercoin", "tkx": "tokenize-xchange", "safedog": "safedog-protocol", "sensi": "sensible-finance", "tschybrid": "tronsecurehybrid", "tcapbtcusdc": "holistic-btc-set", "hole": "super-black-hole", "ggc": "gg-coin", "xrpbull": "3x-long-xrp-token", "mps": "mt-pelerin-shares", "encx": "enceladus-network", "mee": "mercurity-finance", "usdap": "bond-appetite-usd", "sxcc": "southxchange-coin", "aac": "acute-angle-cloud", "etnxp": "electronero-pulse", "foxt": "fox-trading-token", "dcl": "delphi-chain-link", "opcx": "over-powered-coin", "yficg": "yfi-credits-group", "ionx": "charged-particles", "stgz": "stargaze-protocol", "itf": "ins3-finance-coin", "ce": "crypto-excellence", "thpt": "helio-power-token", "ethusdadl4": "ethusd-adl-4h-set", "agov": "answer-governance", "cbsn": "blockswap-network", "cnc": "global-china-cash", "reau": "vira-lata-finance", "spr": "polyvolve-finance", "stor": "self-storage-coin", "far": "farmland-protocol", "bctr": "bitcratic-revenue", "ciphc": "cipher-core-token", "trxbull": "3x-long-trx-token", "xbtx": "bitcoin-subsidium", "ctf": "cybertime-finance", "sgc": "secured-gold-coin", "leobull": "3x-long-leo-token", "rvp": "revolution-populi", "nhc": "neo-holistic-coin", "ghp": "global-hash-power", "mkt": "monkey-king-token", "kwik": "kwikswap-protocol", "rena": "rena-finance", "stars": "mogul-productions", "macpo": "macpo", "mdza": "medooza-ecosystem", "okbbull": "3x-long-okb-token", "tmcn": "timecoin-protocol", "asm": "assemble-protocol", "mcat20": "wrapped-moon-cats", "wsg": "wall-street-games", "sicc": "swisscoin-classic", "eosbull": "3x-long-eos-token", "twj": "tronweeklyjournal", "bbkfi": "bitblocks-finance", "mcaps": "mango-market-caps", "3cs": "cryptocricketclub", "chow": "chow-chow-finance", "csto": "capitalsharetoken", "knockers": "australian-kelpie", "meteor": "meteorite-network", "bvl": "bullswap-protocol", "uusdt": "unagii-tether-usd", "brain": "nobrainer-finance", "tpc": "trading-pool-coin", "rvc": "ravencoin-classic", "limex": "limestone-network", "goldr": "golden-ratio-coin", "bnbbull": "3x-long-bnb-token", "ksp": "klayswap-protocol", "ssf": "safe-seafood-coin", "yusdc": "yusdc-busd-pool", "stnd": "standard-protocol", "vbzrx": "vbzrx", "awc": "atomic-wallet-coin", "trxhedge": "1x-short-trx-token", "abp": "arc-block-protocol", "unit": "universal-currency", "rtc": "read-this-contract", "brick": "brick", "okbbear": "3x-short-okb-token", "kp3rb": "keep3r-bsc-network", "copter": "helicopter-finance", "bnbbear": "3x-short-bnb-token", "leobear": "3x-short-leo-token", "cgb": "crypto-global-bank", "mpg": "max-property-group", "ght": "global-human-trust", "vrt": "venus-reward-token", "hbo": "hash-bridge-oracle", "btfc": "bitcoin-flash-cash", "pvp": "playervsplayercoin", "eosbear": "3x-short-eos-token", "yhfi": "yearn-hold-finance", "edh": "elon-diamond-hands", "tln": "trustline-network", "trxbear": "3x-short-trx-token", "loom": "loom-network-new", "ang": "aureus-nummus-gold", "axt": "alliance-x-trading", "ethmoonx": "eth-moonshot-x-yield-set", "if": "impossible-finance", "mshld": "moonshield-finance", "cpi": "crypto-price-index", "eqmt": "equus-mining-token", "bnbhedge": "1x-short-bnb-token", "mhsp": "melonheadsprotocol", "bafi": "bafi-finance-token", "liqlo": "liquid-lottery-rtc", "pol": "proof-of-liquidity", "rmc": "russian-miner-coin", "aggt": "aggregator-network", "dzi": "definition-network", "tan": "taklimakan-network", "eoshedge": "1x-short-eos-token", "afdlt": "afrodex-labs-token", "yfb2": "yearn-finance-bit2", "supern": "supernova-protocol", "puml": "puml-better-health", "iop": "internet-of-people", "delta rlp": "rebasing-liquidity", "fz": "frozencoin-network", "mco2": "moss-carbon-credit", "catx": "cat-trade-protocol", "kch": "keep-calm", "xrpbear": "3x-short-xrp-token", "gsa": "global-smart-asset", "okbhedge": "1x-short-okb-token", "zelda elastic cash": "zelda-elastic-cash", "xuni": "ultranote-infinity", "pmt": "playmarket", "wszo": "wrapped-shuttleone", "satx": "satoexchange-token", "xrphedge": "1x-short-xrp-token", "bbadger": "badger-sett-badger", "dfly": "dragonfly-protocol", "soccer": "bakery-soccer-ball", "hbch": "huobi-bitcoin-cash", "gbc": "golden-bridge-coin", "deft": "defi-factory-token", "cix100": "cryptoindex-io", "yfiv": "yearn-finance-value", "yskf": "yearn-shark-finance", "hsn": "hyper-speed-network", "ygy": "generation-of-yield", "fcd": "future-cash-digital", "gsc": "global-social-chain", "hbdc": "happy-birthday-coin", "gmm": "gold-mining-members", "sxpbull": "3x-long-swipe-token", "yi12": "yi12-stfinance", "sst": "simba-storage-token", "vpp": "virtue-poker", "emp": "electronic-move-pay", "\u2728": "sparkleswap-rewards", "pci": "pay-coin", "plaas": "plaas-farmers-token", "stoge": "stoner-doge", "ymf20": "yearn20moonfinance", "tmh": "trustmarkethub-token", "pxt": "populous-xbrl-token", "vgo": "virtual-goods-token", "vit": "vice-industry-token", "yfie": "yfiexchange-finance", "hmng": "hummingbird-finance", "beth": "binance-eth", "okbhalf": "0-5x-long-okb-token", "xjp": "exciting-japan-coin", "gmc24": "24-genesis-mooncats", "sbyte": "securabyte-protocol", "xrphalf": "0-5x-long-xrp-token", "dss": "defi-shopping-stake", "wcusd": "wrapped-celo-dollar", "ff1": "two-prime-ff1-token", "msc": "monster-slayer-cash", "vntw": "value-network-token", "wton": "wrapped-ton-crystal", "sushibull": "3x-long-sushi-token", "wht": "wrapped-huobi-token", "btcgw": "bitcoin-galaxy-warp", "xspc": "spectresecuritycoin", "pnix": "phoenixdefi-finance", "climb": "climb-token-finance", "maticbull": "3x-long-matic-token", "upusd": "universal-us-dollar", "ceek": "ceek", "zgt": "zg-blockchain-token", "bbtc": "binance-wrapped-btc", "xtzbull": "3x-long-tezos-token", "coc": "cocktailbar", "ncp": "newton-coin-project", "subx": "startup-boost-token", "trdg": "tardigrades-finance", "dola": "dola-usd", "ledu": "education-ecosystem", "wmc": "wrapped-marblecards", "wxmr": "wrapped-xmr-btse", "eoshalf": "0-5x-long-eos-token", "mclb": "millenniumclub", "mkrbull": "3x-long-maker-token", "wsdoge": "doge-of-woof-street", "refi": "realfinance-network", "ann": "apexel-natural-nano", "spy": "satopay-yield-token", "cana": "cannabis-seed-token", "tmtg": "the-midas-touch-gold", "aurum": "alchemist-defi-aurum", "sxphedge": "1x-short-swipe-token", "gbpx": "etoro-pound-sterling", "xcmg": "connect-mining-coin", "wx42": "wrapped-x42-protocol", "aapl": "apple-protocol-token", "dollar": "dollar-online", "usc": "ultimate-secure-cash", "terc": "troneuroperewardcoin", "fredx": "fred-energy-erc20", "usdtbull": "3x-long-tether-token", "matichedge": "1x-short-matic-token", "rrt": "recovery-right-token", "hpay": "hyper-credit-network", "sushibear": "3x-short-sushi-token", "xtzbear": "3x-short-tezos-token", "thex": "thore-exchange", "sxpbear": "3x-short-swipe-token", "hzt": "black-diamond-rating", "forestplus": "the-forbidden-forest", "mkrbear": "3x-short-maker-token", "tgco": "thaler", "bdoge": "blue-eyes-white-doge", "trybbull": "3x-long-bilira-token", "frank": "frankenstein-finance", "scv": "super-coinview-token", "afo": "all-for-one-business", "teo": "trust-ether-reorigin", "idledaiyield": "idle-dai-yield", "nut": "native-utility-token", "opm": "omega-protocol-money", "bnfy": "b-non-fungible-yearn", "sleepy": "sleepy-sloth", "moca": "museum-of-crypto-art", "utt": "united-traders-token", "lfbtc": "lift-kitchen-lfbtc", "ibeth": "interest-bearing-eth", "yfc": "yearn-finance-center", "deor": "decentralized-oracle", "atombull": "3x-long-cosmos-token", "pnixs": "phoenix-defi-finance", "vgt": "vault12", "wis": "experty-wisdom-token", "uenc": "universalenergychain", "xtzhedge": "1x-short-tezos-token", "ducato": "ducato-protocol-token", "glob": "global-reserve-system", "adabull": "3x-long-cardano-token", "xlmbull": "3x-long-stellar-token", "btsc": "beyond-the-scene-coin", "gsx": "gold-secured-currency", "float": "float-protocol-float", "infinity": "infinity-protocol-bsc", "efg": "ecoc-financial-growth", "seco": "serum-ecosystem-token", "sxphalf": "0-5x-long-swipe-token", "kun": "qian-governance-token", "intratio": "intelligent-ratio-set", "zomb": "antique-zombie-shards", "acd": "alliance-cargo-direct", "yfn": "yearn-finance-network", "lbxc": "lux-bio-exchange-coin", "linkpt": "link-profit-taker-set", "mlt": "media-licensing-token", "julb": "justliquidity-binance", "atomhedge": "1x-short-cosmos-token", "gcc": "thegcccoin", "drft": "dino-runner-fan-token", "crs": "cryptorewards", "wct": "waves-community-token", "usdtbear": "3x-short-tether-token", "yfx": "yfx", "ddrst": "digidinar-stabletoken", "z502": "502-bad-gateway-token", "smrat": "secured-moonrat-token", "idletusdyield": "idle-tusd-yield", "incx": "international-cryptox", "bsbt": "bit-storage-box-token", "usd": "uniswap-state-dollar", "cts": "chainlink-trading-set", "marc": "market-arbitrage-coin", "atombear": "3x-short-cosmos-token", "dca": "decentralized-currency-assets", "blo": "based-loans-ownership", "gtf": "globaltrustfund-token", "ddn": "data-delivery-network", "jeur": "jarvis-synthetic-euro", "matichalf": "0-5x-long-matic-token", "htg": "hedge-tech-governance", "znt": "zenswap-network-token", "cft": "coinbene-future-token", "wows": "wolves-of-wall-street", "evz": "electric-vehicle-zone", "edi": "freight-trust-network", "vetbull": "3x-long-vechain-token", "earn": "yearn-classic-finance", "trybbear": "3x-short-bilira-token", "ggt": "gard-governance-token", "upak": "unicly-pak-collection", "xbx": "bitex-global", "idlewbtcyield": "idle-wbtc-yield", "xtzhalf": "0-5x-long-tezos-token", "qtc": "quality-tracing-chain", "ort": "omni-real-estate-token", "set": "sustainable-energy-token", "bmp": "brother-music-platform", "vetbear": "3x-short-vechain-token", "tgic": "the-global-index-chain", "algobull": "3x-long-algorand-token", "bed": "bit-ecological-digital", "hedge": "1x-short-bitcoin-token", "e2c": "electronic-energy-coin", "dogebull": "3x-long-dogecoin-token", "adabear": "3x-short-cardano-token", "paxgbull": "3x-long-pax-gold-token", "smnc": "simple-masternode-coin", "xlmbear": "3x-short-stellar-token", "gspi": "gspi", "inteth": "intelligent-eth-set-ii", "call": "global-crypto-alliance", "tgct": "tron-game-center-token", "goz": "goztepe-s-k-fan-token", "zelda spring nuts cash": "zelda-spring-nuts-cash", "smoke": "the-smokehouse-finance", "linkrsico": "link-rsi-crossover-set", "atomhalf": "0-5x-long-cosmos-token", "balbull": "3x-long-balancer-token", "ahf": "americanhorror-finance", "bnd": "doki-doki-chainbinders", "adahedge": "1x-short-cardano-token", "nami": "nami-corporation-token", "dpt": "diamond-platform-token", "tcat": "the-currency-analytics", "yefi": "yearn-ethereum-finance", "zelda summer nuts cash": "zelda-summer-nuts-cash", "gdc": "global-digital-content", "yfp": "yearn-finance-protocol", "ethbull": "3x-long-ethereum-token", "dant": "digital-antares-dollar", "mcpc": "mobile-crypto-pay-coin", "leg": "legia-warsaw-fan-token", "cvcc": "cryptoverificationcoin", "ubi": "universal-basic-income", "bevo": "bevo-digital-art-token", "dcd": "digital-currency-daily", "ihf": "invictus-hyprion-fund", "hth": "help-the-homeless-coin", "vethedge": "1x-short-vechain-token", "tgcd": "trongamecenterdiamonds", "uwbtc": "unagii-wrapped-bitcoin", "yfrm": "yearn-finance-red-moon", "ltcbull": "3x-long-litecoin-token", "bbb": "bullbearbitcoin-set-ii", "mlgc": "marshal-lion-group-coin", "ethbear": "3x-short-ethereum-token", "wbcd": "wrapped-bitcoin-diamond", "algobear": "3x-short-algorand-token", "bags": "basis-gold-share-heco", "bnkrx": "bankroll-extended-token", "gve": "globalvillage-ecosystem", "yfiec": "yearn-finance-ecosystem", "algohedge": "1x-short-algorand-token", "balbear": "3x-short-balancer-token", "half": "0-5x-long-bitcoin-token", "tomobull": "3x-long-tomochain-token", "ltchedge": "1x-short-litecoin-token", "uwaifu": "unicly-waifu-collection", "inex": "internet-exchange-token", "paxgbear": "3x-short-pax-gold-token", "ethrsiapy": "eth-rsi-60-40-yield-set-ii", "idledaisafe": "idle-dai-risk-adjusted", "sato": "super-algorithmic-token", "brz": "brz", "linkbull": "3x-long-chainlink-token", "ethhedge": "1x-short-ethereum-token", "fnxs": "financex-exchange-token", "aipe": "ai-predicting-ecosystem", "dogehedge": "1x-short-dogecoin-token", "vbnt": "bancor-governance-token", "ltcbear": "3x-short-litecoin-token", "adahalf": "0-5x-long-cardano-token", "locc": "low-orbit-crypto-cannon", "ems": "ethereum-message-search", "bbe": "bullbearethereum-set-ii", "dogebear": "3x-short-dogecoin-token", "pwc": "prime-whiterock-company", "bvol": "1x-long-btc-implied-volatility-token", "pec": "proverty-eradication-coin", "best": "bitcoin-and-ethereum-standard-token", "balhalf": "0-5x-long-balancer-token", "aat": "agricultural-trade-chain", "defibull": "3x-long-defi-index-token", "yefim": "yearn-finance-management", "rae": "rae-token", "upt": "universal-protocol-token", "sup": "supertx-governance-token", "linkbear": "3x-short-chainlink-token", "pbtt": "purple-butterfly-trading", "tomohedge": "1x-short-tomochain-token", "idleusdtsafe": "idle-usdt-risk-adjusted", "basd": "binance-agile-set-dollar", "ethmo": "eth-momentum-trigger-set", "btceth5050": "btc-eth-equal-weight-set", "bhp": "blockchain-of-hash-power", "ass": "australian-safe-shepherd", "paxghalf": "0-5x-long-pax-gold-token", "bsvbull": "3x-long-bitcoin-sv-token", "nyante": "nyantereum", "tomobear": "3x-short-tomochain-token", "linkhedge": "1x-short-chainlink-token", "dogehalf": "0-5x-long-dogecoin-token", "idleusdcsafe": "idle-usdc-risk-adjusted", "p2ps": "p2p-solutions-foundation", "cbn": "connect-business-network", "algohalf": "0-5x-long-algorand-token", "sxut": "spectre-utility-token", "ethhalf": "0-5x-long-ethereum-token", "xautbull": "3x-long-tether-gold-token", "licc": "life-is-camping-community", "linkhalf": "0-5x-long-chainlink-token", "sxdt": "spectre-dividend-token", "byte": "btc-network-demand-set-ii", "cmccoin": "cine-media-celebrity-coin", "cgen": "community-generation", "defibear": "3x-short-defi-index-token", "lega": "link-eth-growth-alpha-set", "brrr": "money-printer-go-brrr-set", "anw": "anchor-neural-world-token", "fame": "saint-fame", "htbull": "3x-long-huobi-token-token", "ulu": "universal-liquidity-union", "bptn": "bit-public-talent-network", "eth2": "eth2-staking-by-poolx", "bsvbear": "3x-short-bitcoin-sv-token", "defihedge": "1x-short-defi-index-token", "wcdc": "world-credit-diamond-coin", "yfka": "yield-farming-known-as-ash", "xautbear": "3x-short-tether-gold-token", "arcc": "asia-reserve-currency-coin", "rsp": "real-estate-sales-platform", "btceth7525": "btc-eth-75-25-weight-set", "sbx": "degenerate-platform", "drgnbull": "3x-long-dragon-index-token", "bchbull": "3x-long-bitcoin-cash-token", "sheesh": "sheesh-it-is-bussin-bussin", "umoon": "unicly-mooncats-collection", "wgrt": "waykichain-governance-coin", "dcto": "decentralized-crypto-token", "sih": "salient-investment-holding", "iqc": "intelligence-quickly-chain", "ethbtc7525": "eth-btc-75-25-weight-set", "btmxbull": "3x-long-bitmax-token-token", "defihalf": "0-5x-long-defi-index-token", "cute": "blockchain-cuties-universe", "chft": "crypto-holding-frank-token", "xac": "general-attention-currency", "bsvhalf": "0-5x-long-bitcoin-sv-token", "midbull": "3x-long-midcap-index-token", "cva": "crypto-village-accelerator", "htbear": "3x-short-huobi-token-token", "eth50smaco": "eth-50-day-ma-crossover-set", "bchhedge": "1x-short-bitcoin-cash-token", "privbull": "3x-long-privacy-index-token", "midbear": "3x-short-midcap-index-token", "bitn": "bitcoin-company-network", "yfdt": "yearn-finance-diamond-token", "uartb": "unicly-artblocks-collection", "kncbull": "3x-long-kyber-network-token", "lpnt": "luxurious-pro-network-token", "fact": "fee-active-collateral-token", "eth20smaco": "eth_20_day_ma_crossover_set", "acc": "asian-african-capital-chain", "altbull": "3x-long-altcoin-index-token", "btmxbear": "3x-short-bitmax-token-token", "btcrsiapy": "btc-rsi-crossover-yield-set", "bchbear": "3x-short-bitcoin-cash-token", "cusdtbull": "3x-long-compound-usdt-token", "xauthalf": "0-5x-long-tether-gold-token", "btcfund": "btc-fund-active-trading-set", "thetabull": "3x-long-theta-network-token", "kyte": "kambria-yield-tuning-engine", "innbc": "innovative-bioresearch", "qdao": "q-dao-governance-token-v1-0", "drgnbear": "3x-short-dragon-index-token", "ethrsi6040": "eth-rsi-60-40-crossover-set", "court": "optionroom-governance-token", "drgnhalf": "0-5x-long-dragon-index-token", "privhedge": "1x-short-privacy-index-token", "thetahedge": "1x-short-theta-network-token", "bullshit": "3x-long-shitcoin-index-token", "compbull": "3x-long-compound-token-token", "altbear": "3x-short-altcoin-index-token", "jchf": "jarvis-synthetic-swiss-franc", "thetabear": "3x-short-theta-network-token", "innbcl": "innovativebioresearchclassic", "mlr": "mega-lottery-services-global", "cusdthedge": "1x-short-compound-usdt-token", "privbear": "3x-short-privacy-index-token", "bchhalf": "0-5x-long-bitcoin-cash-token", "cusdtbear": "3x-short-compound-usdt-token", "bxa": "blockchain-exchange-alliance", "kncbear": "3x-short-kyber-network-token", "scds": "shrine-cloud-storage-network", "blct": "bloomzed-token", "uglyph": "unicly-autoglyph-collection", "etas": "eth-trending-alpha-st-set-ii", "eth12emaco": "eth-12-day-ema-crossover-set", "midhalf": "0-5x-long-midcap-index-token", "eth26emaco": "eth-26-day-ema-crossover-set", "mqss": "set-of-sets-trailblazer-fund", "tip": "technology-innovation-project", "ugone": "unicly-gone-studio-collection", "hedgeshit": "1x-short-shitcoin-index-token", "greed": "fear-greed-sentiment-set-ii", "knchalf": "0-5x-long-kyber-network-token", "cnyq": "cnyq-stablecoin-by-q-dao-v1", "tusc": "original-crypto-coin", "ethbtcemaco": "eth-btc-ema-ratio-trading-set", "eloap": "eth-long-only-alpha-portfolio", "ethbtcrsi": "eth-btc-rsi-ratio-trading-set", "althalf": "0-5x-long-altcoin-index-token", "jpyq": "jpyq-stablecoin-by-q-dao-v1", "ibp": "innovation-blockchain-payment", "thetahalf": "0-5x-long-theta-network-token", "privhalf": "0-5x-long-privacy-index-token", "comphedge": "1x-short-compound-token-token", "compbear": "3x-short-compound-token-token", "bearshit": "3x-short-shitcoin-index-token", "bloap": "btc-long-only-alpha-portfolio", "ethemaapy": "eth-26-ema-crossover-yield-set", "etcbull": "3x-long-ethereum-classic-token", "yvboost": "yvboost", "halfshit": "0-5x-long-shitcoin-index-token", "ustonks-apr21": "ustonks-apr21", "bbra": "boobanker-research-association", "urevv": "unicly-formula-revv-collection", "linkethrsi": "link-eth-rsi-ratio-trading-set", "cdsd": "contraction-dynamic-set-dollar", "uch": "universidad-de-chile-fan-token", "jgbp": "jarvis-synthetic-british-pound", "bcac": "business-credit-alliance-chain", "etcbear": "3x-short-ethereum-classic-token", "madai": "matic-aave-dai", "bhsc": "blackholeswap-compound-dai-usdc", "sge": "society-of-galactic-exploration", "mauni": "matic-aave-uni", "bocbp": "btc-on-chain-beta-portfolio-set", "epm": "extreme-private-masternode-coin", "ntrump": "no-trump-augur-prediction-token", "mayfi": "matic-aave-yfi", "mausdc": "matic-aave-usdc", "eth20macoapy": "eth-20-ma-crossover-yield-set-ii", "maaave": "matic-aave-aave", "maweth": "matic-aave-weth", "ethpa": "eth-price-action-candlestick-set", "etchalf": "0-5x-long-ethereum-classic-token", "matusd": "matic-aave-tusd", "mausdt": "matic-aave-usdt", "malink": "matic-aave-link", "ibvol": "1x-short-btc-implied-volatility", "uarc": "unicly-the-day-by-arc-collection", "ebloap": "eth-btc-long-only-alpha-portfolio", "usns": "ubiquitous-social-network-service", "bqt": "blockchain-quotations-index-token", "pxgold-may2021": "pxgold-synthetic-gold-31-may-2021", "ugas-jan21": "ulabs-synthetic-gas-futures-expiring-1-jan-2021", "ethmacoapy": "eth-20-day-ma-crossover-yield-set", "ylab": "yearn-finance-infrastructure-labs", "cring": "darwinia-crab-network", "gusdt": "gusd-token", "exchbull": "3x-long-exchange-token-index-token", "zjlt": "zjlt-distributed-factoring-network", "leloap": "link-eth-long-only-alpha-portfolio", "apeusd-uni-dec21": "apeusd-uni-synthetic-usd-dec-2021", "apeusd-snx-dec21": "apeusd-snx-synthetic-usd-dec-2021", "exchbear": "3x-short-exchange-token-index-token", "apeusd-uma-dec21": "apeusd-uma-synthetic-usd-dec-2021", "cbe": "cbe", "emtrg": "meter-governance-mapped-by-meter-io", "exchhedge": "1x-short-exchange-token-index-token", "ddam": "decentralized-data-assets-management", "apeusd-aave-dec21": "apeusd-aave-synthetic-usd-dec-2021", "exchhalf": "0-5x-long-echange-token-index-token", "dvp": "decentralized-vulnerability-platform", "apeusd-link-dec21": "apeusd-link-synthetic-usd-dec-2021", "ujord": "unicly-air-jordan-1st-drop-collection", "qdefi": "qdefi-rating-governance-token-v2", "ugas-jun21": "ugas-jun21", "linkethpa": "eth-link-price-action-candlestick-set", "realtoken-8342-schaefer-hwy-detroit-mi": "realtoken-8342-schaefer-hwy-detroit-mi", "realtoken-9336-patton-st-detroit-mi": "realtoken-9336-patton-st-detroit-mi", "dml": "decentralized-machine-learning", "pxusd-mar2022": "pxusd-synthetic-usd-expiring-31-mar-2022", "realtoken-20200-lesure-st-detroit-mi": "realtoken-20200-lesure-st-detroit-mi", "cdr": "communication-development-resources-token", "pxusd-mar2021": "pxusd-synthetic-usd-expiring-1-april-2021", "realtoken-16200-fullerton-ave-detroit-mi": "realtoken-16200-fullerton-avenue-detroit-mi", "pxgold-mar2022": "pxgold-synthetic-gold-expiring-31-mar-2022", "realtoken-10024-10028-appoline-st-detroit-mi": "realtoken-10024-10028-appoline-st-detroit-mi", "bchnrbtc-jan-2021": "bchnrbtc-synthetic", "uusdrbtc-dec": "uusdrbtc-synthetic-token-expiring-31-december-2020", "uusdweth-dec": "yusd-synthetic-token-expiring-31-december-2020", "mario-cash-jan-2021": "mario-cash-jan-2021"};

//end
