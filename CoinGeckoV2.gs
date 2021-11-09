/**
 * @OnlyCurrentDoc
 */

/*====================================================================================================================================*
  CoinGecko Google Sheet Feed by Eloise1988
  ====================================================================================================================================
  Version:      2.0.7
  Project Page: https://github.com/Eloise1988/COINGECKO
  Copyright:    (c) 2021 by Eloise1988
                
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  
  The following code helped me a lot in optimizing: https://gist.github.com/hesido/c04bab6b8dc9d802e14e53aeb996d4b2
  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing CoinGecko's price, volume & market cap feeds into Google spreadsheets. Functions include:

     GECKOPRICE            For use by end users to get cryptocurrency prices 
     GECKOVOLUME           For use by end users to get cryptocurrency 24h volumes
     GECKOCAP              For use by end users to get cryptocurrency total market caps
     GECKOCAPDILUTED       For use by end users to get cryptocurrency total diluted market caps
     GECKOPRICEBYNAME      For use by end users to get cryptocurrency prices by id, one input only
     GECKOVOLUMEBYNAME     For use by end users to get cryptocurrency 24h volumes by id, one input only
     GECKOCAPBYNAME        For use by end users to get cryptocurrency total market caps by id, one input only
     GECKOCHANGE           For use by end users to get cryptocurrency % change price, volume, mkt
     GECKOCHANGEBYNAME     For use by end users to get cryptocurrency % change price, volume, mkt using the ticker's id
     GECKOCHART            For use by end users to get cryptocurrency price history for plotting
     GECKOHIST             For use by end users to get cryptocurrency historical prices, volumes, mkt
     GECKOHISTBYDAY        For use by end users to get cryptocurrency historical prices, volumes, mkt by day
     GECKOATH              For use by end users to get cryptocurrency All Time High Prices
     GECKOATL              For use by end users to get cryptocurrency All Time Low Prices
     GECKO24HIGH           For use by end users to get cryptocurrency 24H Low Price
     GECKO24LOW            For use by end users to get cryptocurrency 24H High Price
     GECKO24HPRICECHANGE   For use by end users to get cryptocurrency 24h % Price change 
     GECKO_ID_DATA         For use by end users to get cryptocurrency data end points
     GECKOLOGO             For use by end users to get cryptocurrency Logos by ticker
     GECKOLOGOBYNAME       For use by end users to get cryptocurrency Logos by id
     COINGECKO_ID          For use by end users to get the coin's id in Coingecko
     GECKO_RANK            For use by end users to get the coin's ranking by market cap


  If ticker isn't functionning please refer to the coin's id you can find in the following JSON pas: https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1

  
  For bug reports see https://github.com/Eloise1988/COINGECKO/issues
  
  
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  2.0.4  May 31st Added functionality COINGECKO PRIVATE KEY
  2.0.5  Sept 30th Improved code description + uploaded new Coingecko ticker IDs + added OnlyCurrentDoc Google macro security
  2.0.6  GECKOHIST Function that gets cryptocurrency historical array of prices, volumes, mkt  
  2.0.7  Restored old version of GECKOHIST Function into GECKOHISTBYDAY    *====================================================================================================================================*/

//CACHING TIME  
//Expiration time for caching values, by default caching data last 10min=600sec. This value is a const and can be changed to your needs.
const expirationInSeconds=600;

//COINGECKO PRIVATE KEY 
//For unlimited calls to Coingecko's API, please provide your private Key in the brackets
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
 * Imports CoinGecko's cryptocurrency historical prices, volumes and market caps. 
 * For example:
 *
 *   =GECKOHIST("ethereum","usd","price",datevalue("12-31-2020"),datevalue("08-31-2021"))
 *   =GECKOHIST("btc","usd","volume",datevalue(a1),datevalue(a2))
 *   =GECKOHIST("btc","eth","marketcap",datevalue(a1),datevalue(a2))
 *               
 * @param {ticker}                 the cryptocurrency ticker, only 1 parameter 
 * @param {defaultVersusCoin}      usd, btc, eth etc..
 * @param {type}                   price,volume, or marketcap
 * @param {startdate_mmddyyy}      the start date in datevalue format, depending on sheet timezone dd-mm-yyy or mm-dd-yyyy
 * @param {enddate_mmddyyy}        the end date in datevalue format, depending on sheet timezone dd-mm-yyy or mm-dd-yyyy
 * @param {parseOptions}           an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a 2-dimensional array containing the historical prices, volumes, market-caps
 * 
 **/

async function GECKOHIST(ticker,defaultVersusCoin,type, startdate_mmddyyy,enddate_mmddyyy){
  Utilities.sleep(Math.random() * 100)
  pairExtractRegex = /(.*)[/](.*)/, coinSet = new Set(), versusCoinSet = new Set(), pairList = [];
  
  defaultValueForMissingData = null;
  if(typeof defaultVersusCoin === 'undefined') defaultVersusCoin = "usd";
  defaultVersusCoin=defaultVersusCoin.toLowerCase();
  if(ticker.map) ticker.map(pairExtract);
  else pairExtract(ticker);

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
    }

  let coinList = [...coinSet].join("%2C");
  let versusCoinList = [...versusCoinSet].join("%2C");
  id_cache=getBase64EncodedMD5(coinList+versusCoinList+type+startdate_mmddyyy.toString()+enddate_mmddyyy.toString()+'history');
  
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    result=JSON.parse(cached);
    return result; 
  }
 
    pro_path="api"
    pro_path_key=""
    if (cg_pro_api_key != "") {
      pro_path="pro-api"
      pro_path_key="&x_cg_pro_api_key="+cg_pro_api_key
    }

    url= "https://"+ pro_path +".coingecko.com/api/v3/coins/" + coinList + "/market_chart/range?vs_currency=" + versusCoinList+'&from='+(startdate_mmddyyy-25569)*86400+'&to='+(enddate_mmddyyy-25569)*86400+pro_path_key;
  
   var res = await UrlFetchApp.fetch(url);
   var content = res.getContentText();
   var parsedJSON = JSON.parse(content);
   
    var data=[]
    if (type=="price"){
      for (var i = parsedJSON['prices'].length - 1; i >= 0; i--) {
        data.push([toDateNum(parsedJSON['prices'][i][0]),parsedJSON['prices'][i][1]]);
        };}
    else if (type=="volume")
    { for (var i = parsedJSON['total_volumes'].length - 1; i >= 0; i--) {
        data.push([toDateNum(parsedJSON['total_volumes'][i][0]),parsedJSON['total_volumes'][i][1]]);
        };}
    else if (type=="marketcap")
    { for (var i = parsedJSON['market_caps'].length - 1; i >= 0; i--) {
        data.push([toDateNum(parsedJSON['market_caps'][i][0]),parsedJSON['market_caps'][i][1]]);
        };}
    else 
    { data="Error";}
    
    if (data!="Error")
      cache.put(id_cache, JSON.stringify(data),expirationInSeconds);
    return data;
  
  }  

function toDateNum(string) {
  //convert unix timestamp to milliseconds rather than seconds
  var d = new Date(string);

  //get timezone of spreadsheet
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

  //format date to readable format
  var date = Utilities.formatDate(d, tz, 'MM-dd-yyyy hh:mm:ss');

  return date;
}

/** GECKOHISTBYDAY
 * Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
 * For example:
 *
 *   =GECKOHISTBYDAY("BTC","LTC","price", "31-12-2020")
 *   =GECKOHISTBYDAY("ethereum","USD","volume", "01-01-2021",false)
 *   =GECKOHISTBYDAY("YFI","EUR","marketcap","06-06-2020",true)
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
async function GECKOHISTBYDAY(ticker,ticker2,type, date_ddmmyyy,by_ticker=true){
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
      return GECKOHISTBYDAY(ticker,ticker2,type, date_ddmmyyy,by_ticker=true);
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
    return err;
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
/** GECKOCHART
 * Imports array of CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets.
 * For example:
 *
 *   =GECKOCHART("BTC","LTC","price", 7)
 *   =GECKOCHART("ETH","USD","volume", 1)
 *   =GECKOCHART("YFI","EUR","marketcap",365)
 *           
 * Feed into sparkline as:
 * 
 *   =SPARKLINE(GECKOCHART("BTC","USD","price",7))     
 * 
 * @param {ticker}                 the cryptocurrency ticker, only 1 parameter 
 * @param {ticker2}                the cryptocurrency ticker against which you want the %chaNge, only 1 parameter
 * @param {price,volume, or marketcap}     the type of change you are looking for
 * @param {nb_days}                 the number of days you are looking for the price change, 365days=1year price change
 * @param {str_freq}           frequency of data, possible value: daily 
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the price/volume/cap to be fed into sparkline
 **/
async function GECKOCHART(ticker,ticker2,type, nb_days,str_freq="daily"){
  Utilities.sleep(Math.random() * 100)
  ticker=ticker.toUpperCase()
  ticker2=ticker2.toLowerCase()
  type=type.toLowerCase()
  nb_days=nb_days.toString()
  id_cache=ticker+ticker2+type+nb_days+'chart'

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
    
    url="https://"+ pro_path +".coingecko.com/api/v3/coins/"+id_coin+"/market_chart?vs_currency="+ticker2+"&days="+nb_days+"&interval="+str_freq+pro_path_key;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    if (type=="price")
    { vol_gecko=parsedJSON.prices.map(function(tuple){return tuple[1];})}
    else if (type=="volume")
    { vol_gecko=parsedJSON.total_volumes.map(function(tuple){return tuple[1];})}
    else if (type=="marketcap")
    { vol_gecko=parsedJSON.market_caps.map(function(tuple){return tuple[1];})}
    else 
    { vol_gecko="Wrong parameter, either price, volume or marketcap";}
    
    if (vol_gecko!="Wrong parameter, either price, volume or marketcap")
      cache.put(id_cache, vol_gecko,expirationInSeconds);
    return (vol_gecko);
  }
  
  catch(err){
    return GECKOCHART(ticker,ticker2,type, nb_days);
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
 *   =COINGECKO_ID("BTC")
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
const CoinList = {"index":"index-cooperative","btc":"bitcoin","eth":"ethereum","bnb":"binancecoin","sol":"solana","usdt":"tether","ada":"cardano","xrp":"ripple","dot":"polkadot","doge":"dogecoin","usdc":"usd-coin","shib":"shiba-inu","luna":"terra-luna","avax":"avalanche-2","ltc":"litecoin","link":"chainlink","wbtc":"wrapped-bitcoin","uni":"uniswap","busd":"binance-usd","matic":"matic-network","bch":"bitcoin-cash","algo":"algorand","vet":"vechain","atom":"cosmos","axs":"axie-infinity","icp":"internet-computer","xlm":"stellar","cro":"crypto-com-chain","ftt":"ftx-token","theta":"theta-token","dai":"dai","trx":"tron","okb":"okb","etc":"ethereum-classic","fil":"filecoin","ftm":"fantom","ceth":"compound-ether","steth":"staked-ether","hbar":"hedera-hashgraph","egld":"elrond-erd-2","grt":"the-graph","near":"near","xtz":"tezos","hnt":"helium","eos":"eos","xmr":"monero","cake":"pancakeswap-token","aave":"aave","cdai":"cdai","flow":"flow","ksm":"kusama","klay":"klay-token","rune":"thorchain","miota":"iota","ohm":"olympus","xec":"ecash","ar":"arweave","cusdc":"compound-usd-coin","neo":"neo","qnt":"quant-network","mana":"decentraland","bsv":"bitcoin-cash-sv","one":"harmony","leo":"leo-token","bcha":"bitcoin-cash-abc-2","amp":"amp-token","ust":"terrausd","mkr":"maker","enj":"enjincoin","lrc":"loopring","kda":"kadena","btt":"bittorrent-2","hbtc":"huobi-btc","hot":"holotoken","waves":"waves","mim":"magic-internet-money","chz":"chiliz","dash":"dash","stx":"blockstack","sushi":"sushi","safemoon":"safemoon","omg":"omisego","celo":"celo","comp":"compound-governance-token","sand":"the-sandbox","zec":"zcash","tfuel":"theta-fuel","snx":"havven","cel":"celsius-degree-token","crv":"curve-dao-token","spell":"spell-token","nexo":"nexo","xem":"nem","bat":"basic-attention-token","time":"wonderland","lpt":"livepeer","qtum":"qtum","kcs":"kucoin-shares","ht":"huobi-token","omi":"ecomi","icx":"icon","osmo":"osmosis","dcr":"decred","zil":"zilliqa","scrt":"secret","rvn":"ravencoin","audio":"audius","tel":"telcoin","nxm":"nxm","mina":"mina-protocol","yfi":"yearn-finance","tusd":"true-usd","btg":"bitcoin-gold","iost":"iostoken","gt":"gatechain-token","zen":"zencash","renbtc":"renbtc","xdc":"xdce-crowd-sale","zrx":"0x","bnt":"bancor","ln":"link","dydx":"dydx","sc":"siacoin","ankr":"ankr","perp":"perpetual-protocol","jasmy":"jasmycoin","srm":"serum","usdp":"paxos-standard","uma":"uma","elon":"dogelon-mars","ont":"ontology","xsushi":"xsushi","ren":"republic-protocol","iotx":"iotex","cvx":"convex-finance","waxp":"wax","rpl":"rocket-pool","raca":"radio-caca","ray":"raydium","movr":"moonriver","skl":"skale","fxs":"frax-share","klima":"klima-dao","dgb":"digibyte","1inch":"1inch","gno":"gnosis","deso":"bitclout","nano":"nano","ilv":"illuvium","trac":"origintrail","cusdt":"compound-usdt","vlx":"velas","frax":"frax","mdx":"mdex","woo":"woo-network","lusd":"liquity-usd","c98":"coin98","ufo":"ufo-gaming","ckb":"nervos-network","wrx":"wazirx","gala":"gala","dent":"dent","xyo":"xyo-network","celr":"celer-network","cvxcrv":"convex-crv","xdb":"digitalbits","fei":"fei-usd","fet":"fetch-ai","anc":"anchor-protocol","chsb":"swissborg","poly":"polymath","rsr":"reserve-rights-token","kava":"kava","inj":"injective-protocol","hero":"metahero","dag":"constellation-labs","win":"wink","usdn":"neutrino","babydoge":"baby-doge-coin","ygg":"yield-guild-games","nu":"nucypher","glm":"golem","alpha":"alpha-finance","reef":"reef-finance","lyxe":"lukso-token","tribe":"tribe-2","samo":"samoyedcoin","lsk":"lisk","vtho":"vethor-token","fx":"fx-coin","super":"superfarm","rly":"rally-2","sxp":"swipe","rgt":"rari-governance-token","xprt":"persistence","ens":"ethereum-name-service","coti":"coti","titan":"titanswap","dgat":"doge-army-token","oxy":"oxygen","fida":"bonfida","vra":"verasity","erg":"ergo","vxv":"vectorspace","exrd":"e-radix","toke":"tokemak","asd":"asd","chr":"chromaway","znn":"zenon","ampl":"ampleforth","syn":"synapse-2","dodo":"dodo","ice":"ice-token","mngo":"mango-markets","ocean":"ocean-protocol","bcd":"bitcoin-diamond","mask":"mask-network","xvg":"verge","seth":"seth","ogn":"origin-protocol","pundix":"pundi-x-2","alcx":"alchemix","starl":"starlink","bake":"bakerytoken","twt":"trust-wallet-token","sapp":"sapphire","keep":"keep-network","quack":"richquack","atlas":"star-atlas","med":"medibloc","ctsi":"cartesi","band":"band-protocol","ewt":"energy-web-token","snt":"status","arrr":"pirate-chain","cfx":"conflux-token","nkn":"nkn","xch":"chia","feg":"feg-token","orbs":"orbs","pyr":"vulcan-forged","badger":"badger-dao","ton":"tokamak-network","tlm":"alien-worlds","rlc":"iexec-rlc","dpx":"dopex","albt":"allianceblock","oxt":"orchid-protocol","ubt":"unibright","ardr":"ardor","ach":"alchemy-pay","joe":"joe","npxs":"pundi-x","pla":"playdapp","mbox":"mobox","paxg":"pax-gold","akt":"akash-network","kai":"kardiachain","rose":"oasis-network","cvc":"civic","etn":"electroneum","xvs":"venus","sbtc":"sbtc","cspr":"casper-network","agix":"singularitynet","ark":"ark","rndr":"render-token","prom":"prometeus","alusd":"alchemix-usd","uos":"ultra","xms":"mars-ecosystem-token","stmx":"storm","cate":"catecoin","htr":"hathor","taboo":"taboo-token","hive":"hive","orn":"orion-protocol","mir":"mirror-protocol","flux":"zelcash","wild":"wilder-world","btcst":"btc-standard-hashrate-token","bal":"balancer","strax":"stratis","dvi":"dvision-network","auction":"auction","eps":"ellipsis","mc":"merit-circle","alice":"my-neighbor-alice","beta":"beta-finance","nmr":"numeraire","elf":"aelf","pols":"polkastarter","husd":"husd","tru":"truefi","eden":"eden","clv":"clover-finance","kub":"bitkub-coin","sys":"syscoin","stsol":"lido-staked-sol","peak":"marketpeak","xpr":"proton","maid":"maidsafecoin","rad":"radicle","dawn":"dawn-protocol","eth2x-fli":"eth-2x-flexible-leverage-index","bfc":"bifrost","xrune":"thorstarter","steem":"steem","aethc":"ankreth","rare":"superrare","wcfg":"wrapped-centrifuge","ldo":"lido-dao","tomo":"tomochain","storj":"storj","rif":"rif-token","klv":"klever","lcx":"lcx","dao":"dao-maker","mtl":"metal","dpi":"defipulse-index","tlos":"telos","gmx":"gmx","api3":"api3","cuni":"compound-uniswap","dero":"dero","fun":"funfair","agld":"adventure-gold","lina":"linear","elg":"escoin-token","noia":"noia-network","jewel":"defi-kingdoms","bdx":"beldex","slp":"smooth-love-potion","aury":"aurory","uqc":"uquid-coin","hoge":"hoge-finance","knc":"kyber-network-crystal","sdn":"shiden","pro":"propy","any":"anyswap","orca":"orca","ata":"automata","axc":"axia-coin","ant":"aragon","flex":"flex-coin","utk":"utrust","plex":"plex","c20":"crypto20","mln":"melon","qkc":"quark-chain","alu":"altura","polis":"star-atlas-dao","meta":"metadium","wan":"wanchain","sfund":"seedify-fund","bscpad":"bscpad","arpa":"arpa-chain","mx":"mx-token","dvpn":"sentinel","sun":"sun-token","hns":"handshake","ern":"ethernity-chain","boo":"spookyswap","sfp":"safepal","iq":"everipedia","kncl":"kyber-network","qrdo":"qredo","czrx":"compound-0x","kin":"kin","lat":"platon-network","divi":"divi","rep":"augur","dg":"decentral-games","rfox":"redfox-labs-2","hi":"hi-dollar","soul":"phantasma","atri":"atari","pswap":"polkaswap","rook":"rook","step":"step-finance","powr":"power-ledger","lend":"ethlend","req":"request-network","stpt":"stp-network","lqty":"liquity","strk":"strike","bond":"barnbridge","xhv":"haven","boson":"boson-protocol","yfii":"yfii-finance","lgcy":"lgcy-network","wnxm":"wrapped-nxm","musd":"musd","cube":"somnium-space-cubes","hxro":"hxro","gusd":"gemini-dollar","xaut":"tether-gold","kobe":"shabu-shabu","ddx":"derivadao","tvk":"terra-virtua-kolect","idex":"aurora-dao","ava":"concierge-io","quick":"quick","gods":"gods-unchained","tko":"tokocrypto","math":"math","iris":"iris-network","forth":"ampleforth-governance-token","gtc":"gitcoin","usdx":"usdx","hai":"hackenai","monsta":"cake-monster","cbat":"compound-basic-attention-token","zcx":"unizen","banana":"apeswap-finance","ghst":"aavegotchi","bts":"bitshares","kp3r":"keep3rv1","crts":"cratos","xcm":"coinmetro","koge":"bnb48-club-token","xcad":"xcad-network","idia":"idia","qi":"benqi","cqt":"covalent","lit":"litentry","pha":"pha","strong":"strong","nwc":"newscrypto-coin","metis":"metis-token","dnt":"district0x","susd":"nusd","alpaca":"alpaca-finance","trb":"tellor","whale":"whale","hydra":"hydra","kmd":"komodo","kar":"karura","bzrx":"bzx-protocol","rmrk":"rmrk","urus":"urus-token","mnw":"morpheus-network","xsgd":"xsgd","derc":"derace","rari":"rarible","bel":"bella-protocol","jst":"just","seth2":"seth2","gas":"gas","ethbull":"3x-long-ethereum-token","vlxpad":"velaspad","suku":"suku","edg":"edgeware","mxc":"mxc","mft":"mainframe","stake":"xdai-stake","cusd":"celo-dollar","slim":"solanium","shft":"shyft-network-2","ctk":"certik","glch":"glitch-protocol","zks":"zkswap","kiro":"kirobo","chess":"tranchess","pbtc":"ptokens-btc","cdt":"blox","msol":"msol","tronpad":"tronpad","trias":"trias-token","10set":"tenset","mimo":"mimo-parallel-governance-token","krl":"kryll","prq":"parsiq","artr":"artery","png":"pangolin","vai":"vai","bifi":"beefy-finance","fodl":"fodl-finance","mcb":"mcdex","pbr":"polkabridge","tt":"thunder-token","akro":"akropolis","ramp":"ramp","firo":"zcoin","aqua":"planet-finance","tpt":"token-pocket","adx":"adex","cre":"carry","bezoge":"bezoge-earth","eurs":"stasis-eurs","hard":"kava-lend","xdata":"streamr-xdata","mist":"alchemist","cudos":"cudos","farm":"harvest-finance","ela":"elastos","dusk":"dusk-network","pre":"presearch","bepro":"bepro-network","vite":"vite","jet":"jet","occ":"occamfi","woop":"woonkly-power","aqt":"alpha-quark-token","btm":"bytom","gzone":"gamezone","adapad":"adapad","raini":"rainicorn","sps":"splinterlands","seur":"seur","swap":"trustswap","ooe":"openocean","xor":"sora","kyl":"kylin-network","hez":"hermez-network-token","coc":"coin-of-the-champions","lto":"lto-network","aion":"aion","xava":"avalaunch","rvp":"revolution-populi","loomold":"loom-network","om":"mantra-dao","dia":"dia-data","polk":"polkamarkets","saito":"saito","spirit":"spiritswap","vee":"blockv","hegic":"hegic","nft":"apenft","rai":"rai","hunt":"hunt-token","mine":"pylon-protocol","mtv":"multivac","core":"cvault-finance","blz":"bluzelle","sure":"insure","btse":"btse-token","creth2":"cream-eth2","aergo":"aergo","grs":"groestlcoin","obtc":"boringdao-btc","velo":"velo","opul":"opulous","rfr":"refereum","umb":"umbrella-network","rdd":"reddcoin","inst":"instadapp","wozx":"wozx","pond":"marlin","torn":"tornado-cash","cru":"crust-network","nim":"nimiq-2","ersdl":"unfederalreserve","rbn":"ribbon-finance","nrg":"energi","cbk":"cobak-token","koin":"koinos","cards":"cardstarter","ast":"airswap","mbx":"mobiecoin","pac":"paccoin","nrv":"nerve-finance","geist":"geist-finance","cos":"contentos","dgd":"digixdao","met":"metronome","zai":"zero-collateral-dai","maps":"maps","cream":"cream-2","sai":"sai","vrsc":"verus-coin","dog":"the-doge-nft","beam":"beam","doe":"dogsofelon","orion":"orion-money","dock":"dock","starship":"starship","sbd":"steem-dollars","astro":"astroswap","shr":"sharering","front":"frontier-token","ibeur":"iron-bank-euro","cgg":"chain-guardians","aleph":"aleph","pnk":"kleros","pcx":"chainx","veri":"veritaseum","mtrg":"meter","tcr":"tracer-dao","luffy":"luffy-inu","fio":"fio-protocol","sdao":"singularitydao","rise":"everrise","drgn":"dragonchain","upp":"sentinel-protocol","kccpad":"kccpad","gny":"gny","civ":"civilization","ctx":"cryptex-finance","slnd":"solend","ae":"aeternity","rail":"railgun","sbr":"saber","polydoge":"polydoge","boa":"bosagora","erowan":"sifchain","psg":"paris-saint-germain-fan-token","fwb":"friends-with-benefits-pro","swp":"kava-swap","dehub":"dehub","wag":"wagyuswap","paid":"paid-network","loc":"lockchain","dep":"deapcoin","fst":"futureswap","nif":"unifty","flx":"reflexer-ungovernance-token","uft":"unlend-finance","vemp":"vempire-ddao","xed":"exeedme","mpl":"maple","chain":"chain-games","sx":"sx-network","sdt":"stake-dao","dext":"dextools","ovr":"ovr","btu":"btu-protocol","df":"dforce-token","vid":"videocoin","bmx":"bitmart-token","nbs":"new-bitshares","inv":"inverse-finance","solve":"solve-care","conv":"convergence","bpay":"bnbpay","pilot":"unipilot","ion":"ion","snl":"sport-and-leisure","bns":"bns-token","unfi":"unifi-protocol-dao","bcn":"bytecoin","pdex":"polkadex","qash":"qash","ghx":"gamercoin","stax":"stablexswap","cope":"cope","vsys":"v-systems","epik":"epik-prime","visr":"visor","nftx":"nftx","stt":"starterra","nuls":"nuls","he":"heroes-empires","bit":"biconomy-exchange-token","nsbt":"neutrino-system-base-token","tulip":"solfarm","mimatic":"mimatic","vgx":"ethos","card":"cardstack","klee":"kleekai","tbtc":"tbtc","bor":"boringdao-[old]","lon":"tokenlon","pebble":"etherrock-72","cummies":"cumrocket","city":"manchester-city-fan-token","sku":"sakura","nftb":"nftb","apl":"apollo","fox":"shapeshift-fox-token","zpay":"zoid-pay","dego":"dego-finance","aioz":"aioz-network","like":"likecoin","pivx":"pivx","dsla":"stacktical","dobo":"dogebonk","fara":"faraland","o3":"o3-swap","moc":"mossland","hotcross":"hot-cross","srk":"sparkpoint","mix":"mixmarvel","slink":"slink","nmx":"nominex","erc20":"erc20","yldy":"yieldly","xcp":"counterparty","for":"force-protocol","xhdx":"hydradx","pkf":"polkafoundry","mlt":"media-licensing-token","phb":"red-pulse","koda":"koda-finance","gzil":"governance-zil","gxc":"gxchain","yel":"yel-finance","ring":"darwinia-network-native-token","ceur":"celo-euro","get":"get-token","htb":"hotbit-token","nxs":"nexus","naos":"naos-finance","apy":"apy-finance","ltx":"lattice-token","deri":"deri-protocol","mvi":"metaverse-index","fis":"stafi","rbc":"rubic","oxen":"loki-network","xcur":"curate","cut":"cutcoin","led":"ledgis","vidt":"v-id-blockchain","gmr":"gmr-finance","wing":"wing-finance","yld":"yield-app","adax":"adax","eurt":"tether-eurt","sero":"super-zero","revv":"revv","vkr":"valkyrie-protocol","bpt":"blackpool-token","skey":"skey-network","go":"gochain","zano":"zano","cvp":"concentrated-voting-power","safemars":"safemars","sfi":"saffron-finance","hoo":"hoo-token","slt":"smartlands","dexe":"dexe","kuma":"kuma-inu","premia":"premia","qsp":"quantstamp","fsn":"fsn","bytz":"bytz","axn":"axion","bar":"fc-barcelona-fan-token","posi":"position-token","hibs":"hiblocks","dora":"dora-factory","aria20":"arianee","bmc":"bountymarketcap","vtc":"vertcoin","vsp":"vesper-finance","pmon":"polychain-monsters","usdk":"usdk","gmee":"gamee","boring":"boringdao","fcl":"fractal","ads":"adshares","qanx":"qanplatform","snow":"snowblossom","spi":"shopping-io","shx":"stronghold-token","map":"marcopolo","stack":"stackos","ctxc":"cortex","wsg":"wall-street-games","dxd":"dxdao","veth":"vether","evn":"evolution-finance","rin":"aldrin","k21":"k21","pika":"pikachu","auto":"auto","sha":"safe-haven","grin":"grin","cpool":"clearpool","pbx":"paribus","slrs":"solrise-finance","poolz":"poolz-finance","olt":"one-ledger","nsfw":"xxxnifty","tone":"te-food","push":"ethereum-push-notification-service","pnt":"pnetwork","cvn":"cvcoin","id":"everid","hopr":"hopr","zee":"zeroswap","wicc":"waykichain","hc":"hshare","gyro":"gyro","krt":"terra-krw","ban":"banano","zoom":"coinzoom-token","nftart":"nft-art-finance","cnd":"cindicator","snm":"sonm","mbl":"moviebloc","san":"santiment-network-token","sparta":"spartan-protocol-token","gro":"gro-dao-token","rdn":"raiden-network","hapi":"hapi","talk":"talken","bcmc":"blockchain-monster-hunt","gfarm2":"gains-farm","cap":"cap","ycc":"yuan-chain-coin","mta":"meta","kingshib":"king-shiba","epic":"epic-cash","dogegf":"dogegf","sienna":"sienna","pawth":"pawthereum","sefi":"secret-finance","pendle":"pendle","smi":"safemoon-inu","eac":"earthcoin","frm":"ferrum-network","key":"selfkey","cxo":"cargox","pltc":"platoncoin","xep":"electra-protocol","fuse":"fuse-network-token","veed":"veed","val":"radium","mhc":"metahash","juv":"juventus-fan-token","tau":"lamden","shroom":"shroom-finance","bux":"blockport","socks":"unisocks","root":"rootkit","armor":"armor","ask":"permission-coin","gto":"gifto","ppt":"populous","lss":"lossless","fine":"refinable","ibbtc":"interest-bearing-bitcoin","kine":"kine-protocol","bios":"bios","route":"route","mith":"mithril","gswap":"gameswap-org","buy":"burency","dxl":"dexlab","lz":"launchzone","chi":"chimaera","cocos":"cocos-bcx","bas":"block-ape-scissors","yfl":"yflink","labs":"labs-group","deto":"delta-exchange-token","myst":"mysterium","fiwa":"defi-warrior","oxb":"oxbull-tech","mute":"mute","orai":"oraichain-token","nav":"nav-coin","solar":"solarbeam","caps":"coin-capsule","pool":"pooltogether","lith":"lithium-finance","xido":"xido-finance","lbc":"lbry-credits","cws":"crowns","swingby":"swingby","bitorb":"bitorbit","liq":"liq-protocol","wtc":"waltonchain","thoreum":"thoreum","mork":"mork","rdpx":"dopex-rebate-token","gbyte":"byteball","gcr":"global-coin-research","nftl":"nftlaunch","anj":"anj","dfy":"defi-for-you","verse":"shibaverse","fold":"manifold-finance","ngm":"e-money","betu":"betu","mdt":"measurable-data-token","dfyn":"dfyn-network","dafi":"dafi-protocol","troy":"troy","leag":"leaguedao-governance-token","spa":"sperax","nest":"nest","crpt":"crypterium","zinu":"zombie-inu","cell":"cellframe","mass":"mass","bmi":"bridge-mutual","thn":"throne","atm":"atletico-madrid","pad":"nearpad","mint":"mint-club","nebl":"neblio","dpet":"my-defi-pet","adp":"adappter-token","zcn":"0chain","vvsp":"vvsp","wom":"wom-token","pnode":"pinknode","matter":"antimatter","ube":"ubeswap","ddim":"duckdaodime","dashd":"dash-diamond","mitx":"morpheus-labs","svs":"givingtoservices-svs","xyz":"universe-xyz","stars":"mogul-productions","foam":"foam-protocol","upunk":"unicly-cryptopunks-collection","paper":"dope-wars-paper","cys":"cyclos","ngc":"naga","bank":"bankless-dao","ousd":"origin-dollar","belt":"belt","pny":"peony-coin","bmon":"binamon","klo":"kalao","wpp":"wpp-token","arv":"ariva","ppc":"peercoin","arnx":"aeron","marsh":"unmarshal","mars4":"mars4","insur":"insurace","sale":"dxsale-network","etp":"metaverse-etp","yve-crvdao":"vecrv-dao-yvault","moni":"monsta-infinite","tidal":"tidal-finance","mph":"88mph","uncx":"unicrypt-2","zoo":"zookeeper","trubgr":"trubadger","tryb":"bilira","xrt":"robonomics-network","mtsla":"mirrored-tesla","mqqq":"mirrored-invesco-qqq-trust","mgoogl":"mirrored-google","amb":"amber","lamb":"lambda","egg":"waves-ducks","dvf":"dvf","mm":"million","mmsft":"mirrored-microsoft","superbid":"superbid","avt":"aventus","pkr":"polker","gal":"galatasaray-fan-token","oddz":"oddz","sny":"synthetify-token","btc2":"bitcoin-2","port":"port-finance","gains":"gains","fwt":"freeway-token","xsn":"stakenet","ara":"adora-token","suter":"suterusu","bao":"bao-finance","govi":"govi","kono":"konomi-network","maapl":"mirrored-apple","opct":"opacity","don":"don-key","afin":"afin-coin","bean":"bean","cvnt":"content-value-network","pbtc35a":"pbtc35a","mamzn":"mirrored-amazon","mslv":"mirrored-ishares-silver-trust","santa":"santa-coin-2","col":"unit-protocol","gero":"gerowallet","xeq":"triton","unic":"unicly","mer":"mercurial","hbc":"hbtc-token","dbc":"deepbrain-chain","shi":"shirtum","useless":"useless","el":"elysia","btc2x-fli":"btc-2x-flexible-leverage-index","pepecash":"pepecash","mnflx":"mirrored-netflix","adk":"aidos-kuneen","vfox":"vfox","fxf":"finxflo","kdc":"fandom-chain","jup":"jupiter","ult":"ultiledger","bax":"babb","aoa":"aurora","nas":"nebulas","muso":"mirrored-united-states-oil-fund","isp":"ispolink","pussy":"pussy-financial","tht":"thought","ethpad":"ethpad","signa":"signum","stnd":"standard-protocol","qrl":"quantum-resistant-ledger","enq":"enq-enecuum","bscx":"bscex","zb":"zb-token","urqa":"ureeqa","tct":"tokenclub","pefi":"penguin-finance","relay":"relay-token","abt":"arcblock","xmon":"xmon","bz":"bit-z-token","maki":"makiswap","steamx":"steam-exchange","sntvt":"sentivate","salt":"salt","robot":"robot","part":"particl","kan":"kan","pnd":"pandacoin","ifc":"infinitecoin","c3":"charli3","bip":"bip","fevr":"realfevr","coval":"circuits-of-value","six":"six-network","mod":"modefi","nxt":"nxt","raze":"raze-network","sylo":"sylo","gyen":"gyen","cyce":"crypto-carbon-energy","quartz":"sandclock","cas":"cashaa","dcn":"dentacoin","mtwtr":"mirrored-twitter","mfg":"smart-mfg","lpool":"launchpool","ichi":"ichi-farm","ignis":"ignis","dht":"dhedge-dao","slice":"tranche-finance","nfd":"feisty-doge-nft","xfund":"xfund","rfuel":"rio-defi","bondly":"bondly","mbaba":"mirrored-alibaba","minidoge":"minidoge","ujenny":"jenny-metaverse-dao-token","exod":"exodia","axel":"axel","grid":"grid","zmt":"zipmex-token","brkl":"brokoli","moov":"dotmoovs","tower":"tower","pib":"pibble","if":"impossible-finance","arcona":"arcona","nct":"polyswarm","kex":"kira-network","layer":"unilayer","nec":"nectar-token","cwt":"crosswallet","stos":"stratos","pi":"pchain","fab":"fabric","geeq":"geeq","eqx":"eqifi","drk":"draken","udo":"unido-ep","nex":"neon-exchange","polc":"polka-city","free":"free-coin","opium":"opium","eqz":"equalizer","duck":"dlp-duck-token","shibx":"shibavax","hanu":"hanu-yokia","digg":"digg","exnt":"exnetwork-token","brd":"bread","ipad":"infinity-pad","dip":"etherisc","palla":"pallapay","iqn":"iqeon","rsv":"reserve","idv":"idavoll-network","fct":"factom","bpro":"b-protocol","mas":"midas-protocol","botto":"botto","nebo":"csp-dao-network","ppay":"plasma-finance","prob":"probit-exchange","zig":"zignaly","bscs":"bsc-station","oax":"openanx","bdt":"blackdragon-token","minds":"minds","oly":"olyseum","muse":"muse-2","fear":"fear","swop":"swop","xend":"xend-finance","es":"era-swap-token","hit":"hitchain","epk":"epik-protocol","hord":"hord","acm":"ac-milan-fan-token","lmt":"lympo-market-token","acs":"acryptos","juld":"julswap","fkx":"fortknoxter","cxpad":"coinxpad","ann":"annex","tarot":"tarot","zt":"ztcoin","degen":"degen-index","cnfi":"connect-financial","hyve":"hyve","kawa":"kawakami-inu","gth":"gather","pacoca":"pacoca","cone":"coinone-token","sin":"sin-city","shopx":"splyt","apw":"apwine","combo":"furucombo","dec":"decentr","ace":"acent","mng":"moon-nation-game","naft":"nafter","blank":"blank","bog":"bogged-finance","revo":"revomon","wxt":"wirex","polx":"polylastic","lua":"lua-token","kick":"kick-io","lcc":"litecoin-cash","txl":"tixl-new","dyp":"defi-yield-protocol","mola":"moonlana","cfi":"cyberfi","dfx":"dfx-finance","ktn":"kattana","saud":"saud","reap":"reapchain","razor":"razor-network","gel":"gelato","evx":"everex","ubxt":"upbots","tcp":"the-crypto-prophecies","jrt":"jarvis-reward-token","mda":"moeda-loyalty-points","mbtc":"mstable-btc","evc":"eco-value-coin","rtm":"raptoreum","dino":"dinoswap","rpg":"revolve-games","stn":"stone-token","mat":"my-master-war","husky":"husky-avax","spnd":"spendcoin","smart":"smartcash","thales":"thales","si":"siren","lix":"lixir-protocol","cpo":"cryptopolis","ttk":"the-three-kingdoms","asr":"as-roma-fan-token","move":"marketmove","must":"must","oap":"openalexa-protocol","shih":"shih-tzu","dough":"piedao-dough-v2","bhc":"billionhappiness","1-up":"1-up","cmk":"credmark","gft":"game-fantasy-token","xft":"offshift","tnt":"tierion","lym":"lympo","diver":"divergence-protocol","redpanda":"redpanda-earth","mth":"monetha","rae":"rae-token","wow":"wownero","rdt":"ridotto","cola":"cola-token","stak":"jigstack","dop":"drops-ownership-power","rvf":"rocket-vault-rocketx","dmd":"diamond","wasp":"wanswap","yla":"yearn-lazy-ape","media":"media-network","scp":"siaprime-coin","fair":"fairgame","arcx":"arc-governance","scc":"stakecube","apm":"apm-coin","man":"matrix-ai-network","brush":"paint-swap","euno":"euno","euler":"euler-tools","swftc":"swftcoin","wabi":"wabi","hvn":"hiveterminal","yee":"yee","pvu":"plant-vs-undead-token","ald":"aladdin-dao","nord":"nord-finance","abr":"allbridge","strp":"strips-finance","spank":"spankchain","plu":"pluton","spec":"spectrum-token","maha":"mahadao","clu":"clucoin","xtk":"xtoken","ioi":"ioi-token","imx":"impermax","valor":"smart-valor","wheat":"wheat-token","cbc":"cashbet-coin","cops":"cops-finance","zwap":"zilswap","drace":"deathroad","rcn":"ripio-credit-network","dtx":"databroker-dao","ubq":"ubiq","amlt":"coinfirm-amlt","glq":"graphlinq-protocol","emc2":"einsteinium","zoon":"cryptozoon","trava":"trava-finance","dps":"deepspace","tkn":"tokencard","scream":"scream","haka":"tribeone","fly":"franklin","tfl":"trueflip","warp":"warp-finance","tch":"tigercash","arc":"arcticcoin","meme":"degenerator","meth":"mirrored-ether","cifi":"citizen-finance","inari":"inari","vidya":"vidya","cvr":"covercompared","mona":"monavale","pickle":"pickle-finance","poa":"poa-network","sph":"spheroid-universe","vnla":"vanilla-network","bird":"bird-money","pay":"tenx","filda":"filda","btcp":"bitcoin-pro","locg":"locgame","ixs":"ix-swap","mobi":"mobius","yam":"yam-2","trtl":"turtlecoin","xtm":"torum","ncash":"nucleus-vision","ones":"oneswap-dao-token","mnst":"moonstarter","start":"bscstarter","idea":"ideaology","wault":"wault-finance-old","pvm":"privateum","c0":"carboneco","grim":"grimtoken","kus":"kuswap","tcap":"total-crypto-market-cap-token","rhythm":"rhythm","xai":"sideshift-token","swrv":"swerve-dao","pwar":"polkawar","eeur":"e-money-eur","appc":"appcoins","spc":"spacechain-erc-20","soc":"all-sports","$anrx":"anrkey-x","baas":"baasid","pye":"creampye","xdn":"digitalnote","block":"blocknet","toon":"pontoon","vib":"viberate","stf":"structure-finance","owc":"oduwa-coin","feed":"feeder-finance","kian":"porta","int":"internet-node-token","zmn":"zmine","uwl":"uniwhales","ablock":"any-blocknet","tnb":"time-new-bank","leos":"leonicorn-swap","plr":"pillar","zap":"zap","hakka":"hakka-finance","tkp":"tokpie","pros":"prosper","og":"og-fan-token","gspi":"gspi","dust":"dust-token","bbank":"blockbank","gnx":"genaro-network","cs":"credits","etho":"ether-1","radar":"radar","slx":"solex-finance","palg":"palgold","cnns":"cnns","instar":"insights-network","helmet":"helmet-insure","qlc":"qlink","chng":"chainge-finance","cswap":"crossswap","kalm":"kalmar","roobee":"roobee","cov":"covesting","ocn":"odyssey","raven":"raven-protocol","wdc":"worldcoin","elk":"elk-finance","avxl":"avaxlauncher","top":"top-network","xpx":"proximax","xmx":"xmax","mofi":"mobifi","tips":"fedoracoin","nlg":"gulden","xpm":"primecoin","kcal":"phantasma-energy","os":"ethereans","bix":"bibox-token","eqo":"equos-origin","jur":"jur","tra":"trabzonspor-fan-token","vab":"vabble","niox":"autonio","rosn":"roseon-finance","bigsb":"bigshortbets","egt":"egretia","cns":"centric-cash","tech":"cryptomeda","dows":"shadows","vnt":"inventoryclub","swise":"stakewise","ten":"tokenomy","koromaru":"koromaru","hget":"hedget","idna":"idena","cmt":"cybermiles","ooks":"onooks","abl":"airbloc-protocol","vrx":"verox","hart":"hara-token","gton":"graviton","edoge":"elon-doge-token","eng":"enigma","arch":"archer-dao-governance-token","act":"achain","hzn":"horizon-protocol","cwbtc":"compound-wrapped-btc","satt":"satt","unidx":"unidex","snob":"snowball-token","cpc":"cpchain","crp":"cropperfinance","kat":"kambria","bsk":"bitcoinstaking","voice":"nix-bridge-token","cor":"coreto","ut":"ulord","dnxc":"dinox","oil":"oiler","spore":"spore","dusd":"defidollar","mtlx":"mettalex","obot":"obortech","heroegg":"herofi","miau":"mirrored-ishares-gold-trust","hodl":"hodl-token","cphr":"polkacipher","umi":"umi-digital","pop":"pop-chest-token","bcdt":"blockchain-certified-data-token","byg":"black-eye-galaxy","prare":"polkarare","julien":"julien","yec":"ycash","rev":"revain","sky":"skycoin","smt":"smartmesh","uncl":"uncl","dappt":"dapp-com","efx":"effect-network","xio":"xio","uip":"unlimitedip","haus":"daohaus","awx":"auruscoin","itc":"iot-chain","hdp.\u0444":"hedpay","idrt":"rupiah-token","fuel":"fuel-token","tac":"taichi","cato":"cato","cheems":"cheems","pct":"percent","cv":"carvertical","value":"value-liquidity","eosc":"eosforce","onx":"onx-finance","nvt":"nervenetwork","xmy":"myriadcoin","tky":"thekey","zone":"gridzone","dose":"dose-token","treat":"treatdao","grey":"grey-token","abyss":"the-abyss","ptf":"powertrade-fuel","cti":"clintex-cti","gdao":"governor-dao","ncr":"neos-credits","1337":"e1337","chp":"coinpoker","xeta":"xeta-reality","axpr":"axpire","uniq":"uniqly","psl":"pastel","b20":"b20","swapz":"swapz-app","vex":"vexanium","grg":"rigoblock","midas":"midas","wex":"waultswap","la":"latoken","idle":"idle","oin":"oin-finance","crep":"compound-augur","dov":"dovu","coin":"coin","mchc":"mch-coin","bdp":"big-data-protocol","fin":"definer","yup":"yup","yfiii":"dify-finance","nsure":"nsure-network","fnt":"falcon-token","srn":"sirin-labs-token","ndx":"indexed-finance","xcash":"x-cash","sata":"signata","efl":"electronicgulden","unn":"union-protocol-governance-token","bitcny":"bitcny","oce":"oceanex-token","ionx":"charged-particles","sunny":"sunny-aggregator","smartcredit":"smartcredit-token","gvt":"genesis-vision","corgi":"corgicoin","uape":"unicly-bored-ape-yacht-club-collection","gpool":"genesis-pool","777":"jackpot","bft":"bnktothefuture","mds":"medishares","agve":"agave-token","nfti":"nft-index","yop":"yield-optimization-platform","vntw":"value-network-token","wgr":"wagerr","npx":"napoleon-x","crwny":"crowny-token","asko":"askobar-network","pin":"public-index-network","iov":"starname","ork":"orakuru","fvt":"finance-vote","btcz":"bitcoinz","blt":"bloom","beach":"beach-token","auscm":"auric-network","floof":"floof","bnpl":"bnpl-pay","crbn":"carbon","lkr":"polkalokr","ivn":"investin","cntr":"centaur","spwn":"bitspawn","jade":"jade-currency","cgt":"cache-gold","bdi":"basketdao-defi-index","ccx":"conceal","toa":"toacoin","$crdn":"cardence","uaxie":"unicly-mystic-axies-collection","bir":"birake","idh":"indahash","ftc":"feathercoin","atl":"atlantis-loans","hpb":"high-performance-blockchain","wasabi":"wasabix","sail":"sail","ufewo":"unicly-fewocious-collection","nyzo":"nyzo","gof":"golff","mwat":"restart-energy","dgtx":"digitex-futures-exchange","ghost":"ghost-by-mcafee","woofy":"woofy","hgold":"hollygold","rbt":"robust-token","cub":"cub-finance","put":"putincoin","42":"42-coin","vsf":"verisafe","bed":"bankless-bed-index","merge":"merge","phnx":"phoenixdao","umx":"unimex-network","elx":"energy-ledger","happy":"happyfans","wspp":"wolfsafepoorpeople","neu":"neumark","glc":"goldcoin","nrch":"enreachdao","xvix":"xvix","pot":"potcoin","ruff":"ruff","umask":"unicly-hashmasks-collection","reva":"revault-network","sfd":"safe-deal","upi":"pawtocol","vso":"verso","octa":"octans","sdx":"swapdex","udoo":"howdoo","bwf":"beowulf","argon":"argon","rendoge":"rendoge","reth2":"reth2","cnft":"communifty","zefu":"zenfuse","1flr":"flare-token","slam":"slam-token","cat":"cat-token","tad":"tadpole-finance","lhc":"lightcoin","moon":"mooncoin","bcube":"b-cube-ai","dex":"newdex-token","sry":"serey-coin","sta":"statera","gxt":"gem-exchange-and-trading","white":"whiteheart","btx":"bitcore","buidl":"dfohub","kit":"dexkit","name":"polkadomain","pma":"pumapay","oogi":"oogi","swth":"switcheo","crwd":"crowdhero","cls":"coldstack","dinu":"dogey-inu","bry":"berry-data","fast":"fastswap-bsc","ode":"odem","dta":"data","mooned":"moonedge","minikishu":"minikishu","stbu":"stobox-token","kainet":"kainet","trade":"unitrade","itgr":"integral","pchf":"peachfolio","eosdt":"equilibrium-eosdt","dev":"dev-protocol","inxt":"internxt","airx":"aircoins","prcy":"prcy-coin","kek":"cryptokek","node":"dappnode","dacxi":"dacxi","vibe":"vibe","equad":"quadrant-protocol","mfb":"mirrored-facebook","sco":"score-token","afr":"afreum","mtgy":"moontography","vbk":"veriblock","chg":"charg-coin","xwin":"xwin-finance","b8":"binance8","wusd":"wault-usd","pta":"petrachor","spn":"sapien","catbread":"catbread","play":"herocoin","paint":"paint","lnd":"lendingblock","onion":"deeponion","xct":"citadel-one","fts":"footballstars","rocki":"rocki","nds":"nodeseeds","tyc":"tycoon","ceres":"ceres","vision":"apy-vision","usf":"unslashed-finance","milk":"milkshakeswap","float":"float-protocol-float","gdoge":"golden-doge","ares":"ares-protocol","smg":"smaugs-nft","sdefi":"sdefi","altrucoin":"altrucoin","oja":"ojamu","adb":"adbank","teddy":"teddy","hy":"hybrix","qbx":"qiibee","ddos":"disbalancer","prxy":"proxy","snc":"suncontract","lgo":"legolas-exchange","emon":"ethermon","ppoll":"pancakepoll","yvault-lp-ycurve":"yvault-lp-ycurve","cook":"cook","dextf":"dextf","rat":"the-rare-antiquities-token","cpay":"cryptopay","cover":"cover-protocol","true":"true-chain","&#127760;":"qao","sig":"xsigma","alpa":"alpaca","argo":"argo","kwt":"kawaii-islands","hnd":"hundred-finance","plot":"plotx","hunny":"pancake-hunny","fyd":"fydcoin","mtx":"matryx","emt":"emanate","rabbit":"rabbit-finance","bet":"eosbet","acsi":"acryptosi","naxar":"naxar","thc":"hempcoin-thc","sumo":"sumokoin","yoyow":"yoyow","ggtk":"gg-token","saf":"safcoin","twd":"terra-world-token","pslip":"pinkslip-finance","sak3":"sak3","vdv":"vdv-token","kton":"darwinia-commitment-token","mark":"benchmark-protocol","rsun":"risingsun","let":"linkeye","cofi":"cofix","ixi":"ixicash","blk":"blackcoin","mabnb":"mirrored-airbnb","gleec":"gleec-coin","aur":"auroracoin","utu":"utu-coin","stpl":"stream-protocol","grc":"gridcoin-research","8pay":"8pay","dgcl":"digicol-token","mega":"megacryptopolis","dhv":"dehive","ost":"simple-token","pink":"pinkcoin","butt":"buttcoin-2","gfx":"gamyfi-token","eye":"beholder","unistake":"unistake","exrn":"exrnchain","mvp":"merculet","gnt":"greentrust","b21":"b21","tern":"ternio","vips":"vipstarcoin","oto":"otocash","blvr":"believer","ess":"essentia","bid":"topbidder","bcp":"piedao-balanced-crypto-pie","husl":"the-husl","dax":"daex","tendie":"tendieswap","oms":"open-monetary-system","bis":"bismuth","ntk":"neurotoken","ethix":"ethichub","uct":"ucot","launch":"superlauncher","polp":"polkaparty","epan":"paypolitan-token","yf-dai":"yfdai-finance","csai":"compound-sai","ccs":"cloutcontracts","sense":"sense","vvt":"versoview","vault":"vault","forex":"handle-fi","ixc":"ixcoin","nux":"peanut","ele":"eleven-finance","own":"owndata","ff":"forefront","sold":"solanax","mvixy":"mirrored-proshares-vix","pipt":"power-index-pool-token","sync":"sync-network","swfl":"swapfolio","defi+l":"piedao-defi-large-cap","zero":"zero-exchange","1wo":"1world","lln":"lunaland","pmd":"promodio","xla":"stellite","bnsd":"bnsd-finance","apys":"apyswap","bitx":"bitscreener","dun":"dune","mgs":"mirrored-goldman-sachs","ait":"aichain","corgib":"the-corgi-of-polkabridge","dcb":"decubate","lnchx":"launchx","masq":"masq","dgx":"digix-gold","yield":"yield-protocol","yeed":"yggdrash","tab":"tabank","crusader":"crusaders-of-crypto","mgme":"mirrored-gamestop","stv":"sint-truidense-voetbalvereniging","you":"you-chain","tiki":"tiki-token","aln":"aluna","yaxis":"yaxis","$based":"based-money","sake":"sake-token","pkex":"polkaex","blox":"blox-token","wpr":"wepower","blkc":"blackhat-coin","l2":"leverj-gluon","dis":"tosdis","mfi":"marginswap","add":"add-xyz-new","swag":"swag-finance","peri":"peri-finance","esd":"empty-set-dollar","gfi":"gravity-finance","angel":"polylauncher","dos":"dos-network","phtr":"phuture","props":"props","uuu":"u-network","land":"landshare","msp":"mothership","keyfi":"keyfi","infp":"infinitypad","waif":"waifu-token","ufr":"upfiring","snet":"snetwork","d":"denarius","milk2":"spaceswap-milk2","adc":"audiocoin","emc":"emercoin","dmg":"dmm-governance","pxlc":"pixl-coin-2","gen":"daostack","mamc":"mirrored-amc-entertainment","spdr":"spiderdao","celt":"celestial","zora":"zoracles","kif":"kittenfinance","hnst":"honest-mining","octo":"octofi","unifi":"unifi","cw":"cardwallet","rel":"relevant","ind":"indorse","kangal":"kangal","rvl":"revival","qrk":"quark","ugas":"ultrain","xfi":"xfinance","pcnt":"playcent","drc":"dracula-token","ufarm":"unifarm","cloak":"cloakcoin","surf":"surf-finance","wings":"wings","metadoge":"meta-doge","skrt":"sekuritance","babi":"babylons","bles":"blind-boxes","doki":"doki-doki-finance","lead":"lead-token","lba":"libra-credit","seen":"seen","vires":"vires-finance","world":"world-token","l3p":"lepricon","ohminu":"olympus-inu-dao","odin":"odin-protocol","swm":"swarm","cure":"curecoin","vi":"vid","grbe":"green-beli","lxt":"litex","veo":"amoveo","gat":"game-ace-token","asap":"chainswap","momento":"momento","boom":"boom-token","roya":"royale","ort":"omni-real-estate-token","moma":"mochi-market","ido":"idexo-token","kampay":"kampay","ssgt":"safeswap","linka":"linka","par":"par-stablecoin","kom":"kommunitas","sola":"sola-token","ddd":"scry-info","its":"iteration-syndicate","qrx":"quiverx","sarco":"sarcophagus","gysr":"geyser","ppp":"paypie","chx":"chainium","crd":"crd-network","klp":"kulupu","less":"less-network","mdf":"matrixetf","xeus":"xeus","tkx":"token-tkx","chads":"chads-vc","bcpay":"bcpay-fintech","xtp":"tap","cwap":"defire","bwi":"bitwin24","open":"open-governance-token","renzec":"renzec","fsw":"fsw-token","nlife":"night-life-crypto","yae":"cryptonovae","tranq":"tranquil-finance","bgld":"based-gold","axis":"axis-defi","airi":"airight","pet":"battle-pets","safemooncash":"safemooncash","dime":"dimecoin","brew":"cafeswap-token","giv":"givly-coin","dets":"dextrust","auc":"auctus","res":"resfinex-token","inft":"infinito","adm":"adamant-messenger","lev":"lever-network","ktlyo":"katalyo","skull":"skull","ditto":"ditto","geo":"geodb","ong":"somee-social-old","bpriva":"privapp-network","cnn":"cnn","ppblz":"pepemon-pepeballs","otb":"otcbtc-token","yard":"solyard-finance","tera":"tera-smart-money","kuro":"kurobi","zpae":"zelaapayae","unv":"unvest","kally":"polkally","four":"the-4th-pillar","skm":"skrumble-network","data":"data-economy-index","ftx":"fintrux","bac":"basis-cash","rage":"rage-fan","lord":"overlord","road":"yellow-road","watch":"yieldwatch","mcx":"machix","gsail":"solanasail-governance-token","holy":"holy-trinity","ebox":"ethbox-token","adco":"advertise-coin","cliq":"deficliq","chonk":"chonk","ptoy":"patientory","tap":"tapmydata","wtf":"waterfall-governance-token","krw":"krown","rnb":"rentible","aga":"aga-token","ryo":"ryo","amn":"amon","aid":"aidcoin","fti":"fanstime","oswap":"openswap","sashimi":"sashimi","earnx":"earnx","at":"abcc-token","hmq":"humaniq","face":"face","defi++":"piedao-defi","bxx":"baanx","mcrn":"macaronswap","sub":"subme","kdg":"kingdom-game-4-0","next":"nextexchange","omni":"omni","comfi":"complifi","hbt":"habitat","rope":"rope-token","ogo":"origo","ok":"okcash","nfy":"non-fungible-yearn","sphri":"spherium","tipinu":"tipinu","ptm":"potentiam","waultx":"wault","somee":"somee-social","reli":"relite-finance","bskt":"basketcoin","ecte":"eurocoinpay","nfts":"nft-stars","nfta":"nfta","quai":"quai-dao","2gt":"2gether-2","exrt":"exrt-network","cbt":"cryptobulls-token","trio":"tripio","moca":"museum-of-crypto-art","akamaru":"akamaru-inu","dlt":"agrello","vinci":"davinci-token","bison":"bishares","vrc":"vericoin","phr":"phore","prt":"portion","assy":"assy-index","xbc":"bitcoin-plus","scifi":"scifi-index","almx":"almace-shards","rox":"robotina","dfd":"defidollar-dao","bob":"bobs_repair","rnbw":"rainbow-token","ldfi":"lendefi","gum":"gourmetgalaxy","edda":"eddaswap","wish":"mywish","obt":"obtoken","corn":"cornichon","mtc":"medical-token-currency","azr":"aezora","cycle":"cycle-token","ubex":"ubex","zer":"zero","metric":"metric-exchange","nlc2":"nolimitcoin","mcm":"mochimo","bkbt":"beekan","ethv":"ethverse","phx":"phoenix-token","nuts":"squirrel-finance","rmt":"sureremit","tao":"taodao","edr":"endor","cot":"cotrader","lyr":"lyra","nanj":"nanjcoin","asp":"aspire","skyrim":"skyrim-finance","defi+s":"piedao-defi-small-cap","propel":"payrue","mrfi":"morphie","folo":"follow-token","crw":"crown","ops":"octopus-protocol","veil":"veil","tol":"tolar","dexf":"dexfolio","sphr":"sphere","wexpoly":"waultswap-polygon","chart":"chartex","poli":"polinate","sign":"signaturechain","arte":"ethart","pxc":"phoenixcoin","imt":"moneytoken","ash":"ashera","yolov":"yoloverse","xkawa":"xkawa","defi5":"defi-top-5-tokens-index","trdg":"tardigrades-finance","eosdac":"eosdac","shld":"shield-finance","mtn":"medicalchain","use":"usechain","stzen":"stakedzen","gard":"hashgard","room":"option-room","bright":"bright-union","rating":"dprating","papel":"papel","wdgld":"wrapped-dgld","loot":"nftlootbox","pera":"pera-finance","eland":"etherland","excc":"exchangecoin","sfuel":"sparkpoint-fuel","nftp":"nft-platform-index","dav":"dav","nabox":"nabox","swpr":"swapr","totm":"totemfi","unt":"unity-network","bcvt":"bitcoinvend","azuki":"azuki","zcl":"zclassic","pvt":"pivot-token","kitty":"kittycoin","myx":"myx-network","aog":"smartofgiving","bsl":"bsclaunch","zusd":"zusd","tube":"bittube","isla":"defiville-island","edn":"edenchain","pmgt":"perth-mint-gold-token","mue":"monetaryunit","depo":"depo","bcug":"blockchain-cuties-universe-governance","rem":"remme","mxx":"multiplier","eved":"evedo","zipt":"zippie","bunny":"pancake-bunny","pgt":"polyient-games-governance-token","kko":"kineko","fyp":"flypme","dmagic":"dark-magic","lien":"lien","dit":"inmediate","bull":"bull-coin","agar":"aga-rewards-2","yfbtc":"yfbitcoin","sav3":"sav3","x8x":"x8-project","wfair":"wallfair","egem":"ethergem","xrc":"bitcoin-rhodium","enb":"earnbase","lotto":"lotto","ucash":"ucash","bag":"bondappetit-gov-token","lana":"lanacoin","build":"build-finance","avs":"algovest","fls":"flits","sstx":"silverstonks","sysl":"ysl-io","cave":"cave","xaur":"xaurum","axiav3":"axia","luchow":"lunachow","sg":"social-good-project","tico":"topinvestmentcoin","moar":"moar","coll":"collateral-pay","dfio":"defi-omega","bfly":"butterfly-protocol-2","etha":"etha-lend","tsx":"tradestars","esbc":"e-sport-betting-coin","dopx":"dopple-exchange-token","rogue":"rogue-west","tango":"keytango","hsc":"hashcoin","smly":"smileycoin","nbx":"netbox-coin","gear":"bitgear","bomb":"bomb","donut":"donut","krb":"karbo","pst":"primas","dsd":"dynamic-set-dollar","nyan-2":"nyan-v2","cphx":"crypto-phoenix","mars":"mars","alv":"allive","bgov":"bgov","dac":"degen-arts","cheese":"cheesefry","rws":"robonomics-web-services","urac":"uranus","twin":"twinci","catt":"catex-token","gems":"carbon-gems","mpad":"multipad","ybo":"young-boys-fan-token","cash":"litecash","woa":"wrapped-origin-axie","flurry":"flurry","2key":"2key","afen":"afen-blockchain","flixx":"flixxo","btb":"bitball","bitto":"bitto-exchange","zip":"zip","ndr":"noderunners","crx":"cryptex","mzc":"maza","blue":"blue","uedc":"united-emirate-decentralized-coin","cow":"cashcow","pnl":"true-pnl","tcc":"the-champcoin","pear":"pear","pacific":"pacific-defi","mgo":"mobilego","syc":"synchrolife","spice":"spice-finance","ag8":"atromg8","box":"box-token","ugotchi":"unicly-aavegotchi-astronauts-collection","vox":"vox-finance","dpy":"delphy","ubsn":"silent-notary","alphr":"alphr","ors":"origin-sport","buzz":"buzzcoin","pfl":"professional-fighters-league-fan-token","n1":"nftify","bnkr":"bankroll-network","sat":"somee-advertising-token","rvrs":"reverse","bls":"blocsport-one","olive":"olivecash","can":"canyacoin","gse":"gsenetwork","dctd":"dctdao","moonx":"moonx-2","vgw":"vegawallet-token","htz":"hertz-network","arq":"arqma","bltg":"bitcoin-lightning","apein":"ape-in","font":"font","imo":"imo","dwz":"defi-wizard","cali":"calicoin","ave":"avaware","factory":"memecoin-factory","daps":"daps-token","tbc":"terablock","moons":"moontools","sada":"sada","tdx":"tidex-token","mintme":"webchain","avxt":"avaxtars-token","acxt":"ac-exchange-token","ird":"iridium","$manga":"manga-token","ocp":"omni-consumer-protocol","bitg":"bitcoin-green","dvd":"daoventures","deflct":"deflect","bart":"bartertrade","xiot":"xiotri","pirate":"piratecash","bsty":"globalboost","wg0":"wrapped-gen-0-cryptokitties","ccn":"custom-contract-network","snn":"sechain","prism":"prism-network","dmt":"dmarket","vdx":"vodi-x","lcs":"localcoinswap","tig":"tigereum","bgg":"bgogo","banca":"banca","iic":"intelligent-investment-chain","frc":"freicoin","bether":"bethereum","bntx":"bintex-futures","rac":"rac","rmx":"remex","ctt":"cryptotycoon","sepa":"secure-pad","babyusdt":"babyusdt","kpad":"kickpad","mmaon":"mmaon","all":"alliance-fan-token","icap":"invictus-capital-token","bnf":"bonfi","nka":"incakoin","nix":"nix-platform","adel":"akropolis-delphi","edu":"educoin","dyt":"dynamite","grft":"graft-blockchain","qwc":"qwertycoin","vtx":"vortex-defi","candy":"skull-candy-shards","rc":"reward-cycle","fera":"fera","family":"the-bitcoin-family","base":"base-protocol","bone":"bone","bto":"bottos","axi":"axioms","fries":"soltato-fries","zco":"zebi","fdo":"firdaos","toshi":"toshi-token","shield":"shield-protocol","ethy":"ethereum-yield","bree":"cbdao","ptt":"potent-coin","gmat":"gowithmi","mt":"mytoken","zxc":"0xcert","uat":"ultralpha","ss":"sharder-protocol","defit":"defit","slm":"solomon-defi","bite":"dragonbite","pylnt":"pylon-network","ric":"riecoin","aaa":"app-alliance-association","usdap":"bondappetite-usd","star":"starbase","defx":"definity","zdex":"zeedex","znz":"zenzo","zlot":"zlot","elec":"electrify-asia","komet":"komet","balpha":"balpha","updog":"updog","uop":"utopia-genesis-foundation","zeit":"zeitcoin","spd":"stipend","drt":"domraider","tox":"trollbox","msr":"masari","matpad":"maticpad","hydro":"hydro","pinkm":"pinkmoon","doges":"dogeswap","yeti":"yearn-ecosystem-token-index","rnt":"oneroot-network","hlc":"halalchain","oks":"oikos","tnc":"trinity-network-credit","hugo":"hugo-finance","cnt":"cryption-network","perry":"swaperry","iht":"iht-real-estate-protocol","tour":"touriva","ama":"mrweb-finance","mwg":"metawhale-gold","cai":"club-atletico-independiente","ac":"acoconut","peps":"pepegold","klonx":"klondike-finance-v2","modic":"modern-investment-coin","rfi":"reflect-finance","typh":"typhoon-network","arth":"arth","mnc":"maincoin","ladz":"ladz","gio":"graviocoin","chai":"chai","xlr":"solaris","pipl":"piplcoin","gaj":"gaj","dth":"dether","ncc":"neurochain","vdl":"vidulum","oro":"oro","mate":"mate","vxt":"virgox-token","bpet":"binapet","web":"webcoin","dfnd":"dfund","mfo":"moonfarm-finance","pylon":"pylon-finance","kgo":"kiwigo","bdg":"bitdegree","xbp":"blitzpredict","ibfk":"istanbul-basaksehir-fan-token","kmpl":"kiloample","dds":"dds-store","bez":"bezop","troll":"trollcoin","tcake":"pancaketools","smty":"smoothy","pasc":"pascalcoin","kwik":"kwikswap-protocol","qch":"qchi","roge":"roge","dacc":"dacc","wqt":"work-quest","c4g3":"cage","bobo":"bobo-cash","bcv":"bcv","pry":"prophecy","htre":"hodltree","fuku":"furukuru","wenlambo":"wenlambo","btc++":"piedao-btc","kerman":"kerman","cbm":"cryptobonusmiles","bnbch":"bnb-cash","tent":"snowgem","vig":"vig","baepay":"baepay","fdz":"friendz","sacks":"sacks","soar":"soar-2","smug":"smugdoge","crdt":"crdt","bmxx":"multiplier-bsc","tenfi":"ten","red":"red","sib":"sibcoin","cc":"cryptocart","ctask":"cryptotask-2","2lc":"2local-2","crea":"creativecoin","ink":"ink","bitt":"bittoken","tos":"thingsoperatingsystem","ucm":"ucrowdme","fry":"foundrydao-logistics","air":"aircoin-2","pis":"polkainsure-finance","sota":"sota-finance","adat":"adadex-tools","tns":"transcodium","ibfr":"ibuffer-token","dat":"datum","artex":"artex","zrc":"zrcoin","qbt":"qbao","etm":"en-tan-mo","zhegic":"zhegic","alex":"alex","whirl":"polywhirl","ionc":"ionchain-token","sfshld":"safe-shield","acat":"alphacat","defo":"defhold","ptn":"palletone","zut":"zero-utility-token","prv":"privacyswap","slb":"solberg","subx":"startup-boost-token","mon":"moneybyte","trst":"wetrust","pie":"defipie","d4rk":"darkpaycoin","twx":"twindex","hac":"hackspace-capital","zsc":"zeusshield","xwp":"swap","fyz":"fyooz","monk":"monk","xiv":"project-inverse","th":"team-heretics-fan-token","dgvc":"degenvc","rte":"rate3","einstein":"polkadog-v2-0","rei":"zerogoki","omx":"project-shivom","swagg":"swagg-network","shnd":"stronghands","pht":"lightstreams","trc":"terracoin","quin":"quinads","yeld":"yeld-finance","dotx":"deli-of-thrones","genix":"genix","zpt":"zeepin","multi":"multigame","ecom":"omnitude","share":"seigniorage-shares","hqx":"hoqu","portal":"portal","pkg":"pkg-token","mota":"motacoin","mrch":"merchdao","hue":"hue","quan":"quantis","foxx":"star-foxx","flp":"gameflip","dfs":"digital-fantasy-sports","deb":"debitum-network","adt":"adtoken","upx":"uplexa","atn":"atn","edc":"edc-blockchain","pak":"pakcoin","wck":"wrapped-cryptokitties","vusd":"vesper-vdollar","wfil":"wrapped-filecoin","ethm":"ethereum-meta","reec":"renewableelectronicenergycoin","mdg":"midas-gold","cur":"curio","comb":"combine-finance","ely":"elysian","poe":"poet","ssp":"smartshare","eco":"ormeus-ecosystem","senc":"sentinel-chain","latx":"latiumx","eko":"echolink","datx":"datx","unl":"unilock-network","dam":"datamine","npxsxem":"pundi-x-nem","fufu":"fufu","fxp":"fxpay","riskmoon":"riskmoon","s":"sharpay","wvg0":"wrapped-virgin-gen-0-cryptokitties","green":"greeneum-network","xnk":"ink-protocol","rito":"rito","ysl":"ysl","svx":"savix","xas":"asch","snov":"snovio","aitra":"aitra","ethys":"ethereum-stake","nbc":"niobium-coin","cnb":"coinsbit-token","exf":"extend-finance","tdp":"truedeck","mdoge":"miss-doge","kobo":"kobocoin","wander":"wanderlust","dvt":"devault","bund":"bundles","twa":"adventure-token","tcore":"tornadocore","pcn":"peepcoin","dfi":"amun-defi-index","ysec":"yearn-secure","swing":"swing","fmt":"finminity","obc":"oblichain","aux":"auxilium","bkc":"facts","lun":"lunyr","fmg":"fm-gallery","shake":"spaceswap-shake","mis":"mithril-share","nobl":"noblecoin","n3rdz":"n3rd-finance","etg":"ethereum-gold","undb":"unibot-cash","hgt":"hellogold","alch":"alchemy-dao","onc":"one-cash","meri":"merebel","cspn":"crypto-sports","cue":"cue-protocol","stk":"stk","cou":"couchain","mthd":"method-fi","noahp":"noah-coin","vikky":"vikkytoken","bcpt":"blockmason-credit-protocol","foto":"uniqueone-photo","bask":"basketdao","dogec":"dogecash","miva":"minerva-wallet","nrp":"neural-protocol","stop":"satopay","tmt":"traxia","tzc":"trezarcoin","2x2":"2x2","swt":"swarm-city","cmp":"component","cherry":"cherrypick","artx":"artx","xp":"xp","lqt":"liquidifty","bcdn":"blockcdn","boost":"boosted-finance","rvt":"rivetz","cova":"covalent-cova","dead":"party-of-the-living-dead","jamm":"flynnjamm","better":"better-money","tik":"chronobase","berry":"rentberry","lud":"ludos","stacy":"stacy","yetu":"yetucoin","fxt":"fuzex","havy":"havy-2","1mt":"1million-token","mmo":"mmocoin","flot":"fire-lotto","sishi":"sishi-finance","aidoc":"ai-doctor","fire":"fire-protocol","myb":"mybit-token","delta":"deltachain","rvx":"rivex-erc20","gem":"nftmall","nov":"novara-calcio-fan-token","sxag":"sxag","ken":"keysians-network","cag":"change","brick":"brick-token","ppdex":"pepedex","impact":"alpha-impact","hndc":"hondaiscoin","kp4r":"keep4r","topb":"topb","taco":"tacos","alley":"nft-alley","ferma":"ferma","amm":"micromoney","ifund":"unifund","tie":"ties-network","ecoin":"ecoin-2","bnty":"bounty0x","ncdt":"nuco-cloud","whey":"whey","$rope":"rope","mntp":"goldmint","tend":"tendies","octi":"oction","rot":"rotten","hand":"showhand","lqd":"liquidity-network","lync":"lync-network","wtt":"giga-watt-token","udoki":"unicly-doki-doki-collection","sconex":"sconex","meeb":"meeb-master","esh":"switch","dogown":"dog-owner","dmx":"amun-defi-momentum-index","rocks":"social-rocket","kgc":"krypton-token","kombat":"crypto-kombat","morph":"morphose","xgt":"xion-finance","x42":"x42-protocol","i7":"impulseven","pigx":"pigx","shdw":"shadow-token","wwc":"werewolf-coin","type":"typerium","hyn":"hyperion","tbb":"trade-butler-bot","ctrt":"cryptrust","abx":"arbidex","btw":"bitwhite","renbch":"renbch","debase":"debase","pho":"photon","etgp":"ethereum-gold-project","sxau":"sxau","actp":"archetypal-network","bpx":"black-phoenix","dft":"defiat","degov":"degov","myth":"myth-token","polr":"polystarter","music":"nftmusic","yco":"y-coin","ifex":"interfinex-bills","fors":"foresight","pgu":"polyient-games-unity","etz":"etherzero","kfx":"knoxfs","asafe":"allsafe","lid":"liquidity-dividends-protocol","mec":"megacoin","ipl":"insurepal","ziot":"ziot","peg":"pegnet","moonpirate":"moonpirate","trnd":"trendering","lama":"llamaswap","srh":"srcoin","ypie":"piedao-yearn-ecosystem-pie","yfte":"yftether","swift":"swiftcash","wiki":"wiki-token","fdd":"frogdao-dime","cpoo":"cockapoo","bscv":"bscview","sergs":"sergs","dogefi":"dogefi","cmct":"crowd-machine","swiss":"swiss-finance","sbf":"steakbank-finance","stq":"storiqa","opt":"opus","redc":"redchillies","tff":"tutti-frutti-finance","zet":"zetacoin","baby":"babyswap","lpk":"l-pesa","coil":"coil-crypto","lmy":"lunch-money","kennel":"token-kennel","arthx":"arthx","shmn":"stronghands-masternode","pgo":"pengolincoin","gap":"gapcoin","suv":"suvereno","bear":"arcane-bear","trust":"trust","cbix":"cubiex","eve":"devery","sct":"clash-token","inve":"intervalue","ukg":"unikoin-gold","plura":"pluracoin","lock":"meridian-network","brdg":"bridge-protocol","sngls":"singulardtv","tbx":"tokenbox","alt":"alt-estate","aro":"arionum","axe":"axe","fota":"fortuna","tsuki":"tsuki-dao","semi":"semitoken","ubu":"ubu-finance","skin":"skincoin","polar":"polaris","mdo":"midas-dollar","swirl":"swirl-cash","tsl":"energo","ali":"ailink-token","april":"april","chl":"challengedac","gmt":"gambit","proge":"protector-roge","scr":"scorum","yvs":"yvs-finance","mol":"molten","scex":"scex","xuez":"xuez","orcl5":"oracle-top-5","myfarmpet":"my-farm-pet","bking":"king-arthur","thrt":"thrive","proto":"proto-gold-fuel","insn":"insanecoin","bakecoin":"bake-coin","cxn":"cxn-network","bsov":"bitcoinsov","pc":"promotionchain","ica":"icarus-finance","gene":"parkgene","goat":"goatcoin","arms":"2acoin","mwbtc":"metawhale-btc","ags":"aegis","yfox":"yfox-finance","mshld":"moonshield-finance","cnj":"conjure","cred":"verify","evil":"evil-coin","dogy":"dogeyield","horus":"horuspay","sista":"srnartgallery-tokenized-arts","metm":"metamorph","gst2":"gastoken","bta":"bata","shdc":"shd-cash","levin":"levin","pasta":"spaghetti","ltb":"litebar","corx":"corionx","ora":"coin-oracle","ecash":"ethereum-cash","bro":"bitradio","mash":"masternet","img":"imagecoin","khc":"koho-chain","ig":"igtoken","itl":"italian-lira","rpt":"rug-proof","deep":"deepcloud-ai","scriv":"scriv","sbnb":"sbnb","jntr":"jointer","nfxc":"nfx-coin","yffi":"yffi-finance","sact":"srnartgallery","fff":"future-of-finance-fund","mbn":"membrana-platform","adi":"aditus","force":"force-dao","bbo":"bigbom-eco","tob":"tokens-of-babel","mib":"mib-coin","imm":"imm","2give":"2give","got":"gonetwork","cyl":"crystal-token","lulz":"lulz","fsxu":"flashx-ultra","fsbt":"forty-seven-bank","crc":"crycash","sing":"sing-token","karma":"karma-dao","yfdot":"yearn-finance-dot","tgame":"truegame","sins":"safeinsure","melo":"melo-token","pria":"pria","dexg":"dextoken-governance","inx":"inmax","plus1":"plusonecoin","dirty":"dirty-finance","max":"maxcoin","enol":"ethanol","ehrt":"eight-hours","glox":"glox-finance","yfbeta":"yfbeta","sxmr":"sxmr","lcp":"litecoin-plus","nor":"bring","orme":"ormeuscoin","tix":"blocktix","gup":"matchpool","iut":"mvg-token","rgp":"rigel-protocol","hlix":"helix","bouts":"boutspro","uunicly":"unicly-genesis-collection","prx":"proxynode","arm":"armours","gofi":"goswapp","oros":"oros-finance","bgtt":"baguette-token","mgames":"meme-games","kind":"kind-ads-token","ethplo":"ethplode","ubeeple":"unicly-beeple-collection","rfctr":"reflector-finance","bse":"buy-sell","aval":"avaluse","lkn":"linkcoin-token","mss":"monster-cash-share","sno":"savenode","r3fi":"recharge-finance","undg":"unidexgas","gtm":"gentarium","sxtz":"sxtz","bugs":"starbugs-shards","gic":"giant","wand":"wandx","kash":"kids-cash","arco":"aquariuscoin","vls":"veles","vsx":"vsync","mush":"mushroom","scap":"safecapital","smol":"smol","tcash":"tcash","btdx":"bitcloud","covidtoken":"covid-token","dbet":"decentbet","boli":"bolivarcoin","atb":"atbcoin","bonk":"bonk-token","wrc":"worldcore","boxx":"boxx","cymt":"cybermusic","mar":"mchain","dmb":"digital-money-bits","mooi":"moonai","bpunks":"babypunks","mntis":"mantis-network","help":"help-token","tic":"thingschain","ruler":"ruler-protocol","cen":"coinsuper-ecosystem-network","arion":"arion","cpu":"cpuchain","bfi":"bearn-fi","cbx":"bullion","rex":"rex","scam":"simple-cool-automatic-money","yfbt":"yearn-finance-bit","reign":"sovreign-governance-token","dcntr":"decentrahub-coin","ucn":"uchain","xta":"italo","yamv2":"yam-v2","ffyi":"fiscus-fyi","pokelon":"pokelon-finance","wdp":"waterdrop","tmn":"ttanslateme-network-token","bt":"bt-finance","cash2":"cash2","tft":"the-famous-token","team":"team-finance","xfg":"fango","juice":"moon-juice","bev":"binance-ecosystem-value","sur":"suretly","sets":"sensitrust","coke":"cocaine-cowboy-shards","xjo":"joulecoin","cakebank":"cake-bank","impl":"impleum","gcg":"gulf-coin-gold","first":"harrison-first","ynk":"yoink","araw":"araw-token","coni":"coinbene-token","prix":"privatix","nat":"natmin-pure-escrow","gun":"guncoin","sfcp":"sf-capital","1up":"uptrennd","stu":"bitjob","usdq":"usdq","abs":"absolute","vaultz":"vaultz","swgb":"swirge","hb":"heartbout","edao":"elondoge-dao","kiwi":"kiwi-token","long":"longdrink-finance","gulag":"gulag-token","sbs":"staysbase","eltcoin":"eltcoin","vrs":"veros","zzzv2":"zzz-finance-v2","shrmp":"shrimp-capital","btcred":"bitcoin-red","apc":"alpha-coin","imp":"ether-kingdoms-token","boat":"boat","hur":"hurify","joint":"joint","yfd":"yfdfi-finance","horse":"ethorse","payx":"paypex","biop":"biopset","pfr":"payfair","beet":"beetle-coin","fusii":"fusible","bacon":"baconswap","shb":"skyhub","cpr":"cipher","yft":"yield-farming-token","senpai":"project-senpai","martk":"martkist","fess":"fess-chain","ddoge":"daughter-doge","bznt":"bezant","kydc":"know-your-developer","hfi":"holder-finance","kwatt":"4new","scho":"scholarship-coin","yfuel":"yfuel","medibit":"medibit","duo":"duo","hqt":"hyperquant","ctsc":"cts-coin","fr":"freedom-reserve","50c":"50cent","swipp":"swipp","apr":"apr-coin","nzl":"zealium","osina":"osina","rntb":"bitrent","bsd":"basis-dollar","loox":"safepe","lot":"lukki-operating-token","infx":"influxcoin","jem":"jem","wgo":"wavesgo","aer":"aeryus","chop":"porkchop","raijin":"raijin","ethbn":"etherbone","toto":"tourist-token","tux":"tuxcoin","ylc":"yolo-cash","ptd":"peseta-digital","vgr":"voyager","xsr":"sucrecoin","obee":"obee-network","trvc":"thrivechain","mxt":"martexcoin","c2c":"ctc","roco":"roiyal-coin","taj":"tajcoin","datp":"decentralized-asset-trading-platform","clc":"caluracoin","yfsi":"yfscience","war":"yieldwars-com","tds":"tokendesk","raise":"hero-token","error":"484-fund","azum":"azuma-coin","xd":"scroll-token","etgf":"etg-finance","gtx":"goaltime-n","nice":"nice","dmst":"dmst","cco":"ccore","yfrb":"yfrb-finance","tme":"tama-egg-niftygotchi","pux":"polypux","epc":"experiencecoin","bold":"boldman-capital","kema":"kemacoin","gsr":"geysercoin","cof":"coffeecoin","bboo":"panda-yield","distx":"distx","jmc":"junsonmingchancoin","tata":"hakuna-metata","cjt":"connectjob","noodle":"noodle-finance","mixs":"streamix","ntbc":"note-blockchain","obs":"openbisea","paws":"paws-funds","ztc":"zent-cash","intu":"intucoin","bth":"bithereum","cc10":"cryptocurrency-top-10-tokens-index","bsds":"basis-dollar-share","npc":"npcoin","beverage":"beverage","swyftt":"swyft","lno":"livenodes","herb":"herbalist-token","yun":"yunex","dalc":"dalecoin","shrew":"shrew","mok":"mocktailswap","joon":"joon","memex":"memex","ipc":"ipchain","yfpi":"yearn-finance-passive-income","yfid":"yfidapp","fntb":"fintab","eggp":"eggplant-finance","guess":"peerguess","cct":"crystal-clear","eld":"electrum-dark","klks":"kalkulus","znd":"zenad","rigel":"rigel-finance","labo":"the-lab-finance","gst":"game-stars","fruit":"fruit","gdr":"guider","kmx":"kimex","bm":"bitcomo","exn":"exchangen","jiaozi":"jiaozi","sas":"stand-share","js":"javascript-token","btcb":"bitcoinbrand","gfn":"game-fanz","rank":"rank-token","bdl":"bundle-dao","hfs":"holderswap","mftu":"mainstream-for-the-underground","house":"toast-finance","zzz":"zzz-finance","wtl":"welltrado","qnc":"qnodecoin","tsd":"true-seigniorage-dollar","btcs":"bitcoin-scrypt","rle":"rich-lab-token","btcui":"bitcoin-unicorn","abst":"abitshadow-token","hippo":"hippo-finance","kermit":"kermit","aet":"aerotoken","jbx":"jboxcoin","swc":"scanetchain","neet":"neetcoin","sac":"stand-cash","ftxt":"futurax","yffs":"yffs","clg":"collegicoin","orox":"cointorox","hlx":"hilux","faith":"faithcoin","brtr":"barter","orm":"orium","dow":"dowcoin","nyb":"new-year-bull","kec":"keyco","l1q":"layer-1-quality-index","scsx":"secure-cash","yieldx":"yieldx","exzo":"exzocoin","strng":"stronghold","bkx":"bankex","ary":"block-array","voise":"voise","setc":"setc","fud":"fudfinance","bdcash":"bigdata-cash","bul":"bulleon","mcp":"my-crypto-play","power":"unipower","rugz":"rugz","fsd":"freq-set-dollar","$noob":"noob-finance","myfriends":"myfriends","sms":"speed-mining-service","uffyi":"unlimited-fiscusfyi","a":"alpha-platform","gbcr":"gold-bcr","milf":"milf-finance","zla":"zilla","bds":"borderless","404":"404","voco":"provoco","dice":"dice-finance","pinke":"pinkelon","yffc":"yffc-finance","crad":"cryptoads-marketplace","sxrp":"sxrp","burn":"blockburn","up":"uptoken","cht":"chronic-token","xpat":"pangea","kndc":"kanadecoin","fyznft":"fyznft","x":"gibx-swap","m2":"m2","g\u00fc":"gu","xki":"ki","x2":"x2","lcg":"lcg","olo":"olo","mp3":"revamped-music","mex":"mex","yfc":"yearn-finance-center","iab":"iab","tmc":"tmc-niftygotchi","zom":"zoom-protocol","yes":"yes","vbt":"vbt","car":"car","mox":"mox","msn":"maison-capital","zin":"zomainfinity","eox":"eox","ucx":"ucx","kvi":"kvi","dbx":"dbx-2","ize":"ize","zos":"zos","xbx":"bitex-global","bgt":"bgt","lvx":"level01-derivatives-exchange","h3x":"h3x","dad":"decentralized-advertising","p2p":"p2p","867":"867","pop!":"pop","mvl":"mass-vehicle-ledger","520":"520","fme":"fme","x22":"x22","txa":"txa","idk":"idk","ecc":"ecc","bae":"bae","owl":"owl-token","vow":"vow","hex":"hex","sov":"store-of-value-token","zyx":"zyx","rug":"rug","aos":"aos","tvt":"tvt","die":"die","htm":"htm","eft":"eft","yas":"yas","mrv":"mrv","b26":"b26","rxc":"rxc","mp4":"mp4","onot":"ono","7up":"7up","lif":"winding-tree","lbk":"legal-block","afro":"afrostar","sti":"stib-token","weyu":"weyu","dona":"dona","yuan":"yuan","nilu":"nilu","maro":"ttc-protocol","saja":"saja","arke":"arke","xfit":"xfit","lcms":"lcms","xbt":"elastic-bitcoin","tomi":"tomi","amix":"amix","yfet":"yfet","weth":"weth","amis":"amis","pako":"pako","lucy":"lucy-inu","pica":"pica","pusd":"pynths-pusd","lyfe":"lyfe","lean":"lean","fan8":"fan8","wiva":"wiva","cspc":"cspc","musk":"muskswap","meso":"meso","tbcc":"tbcc","wise":"wise-token11","wbx":"wibx","frat":"frat","ibnb":"ibnb-2","ausd":"ausd","xc":"xcom","teat":"teal","kiba":"kiba-inu-bsc","xysl":"xysl","n0031":"ntoken0031","vidy":"vidy","dsys":"dsys","koto":"koto","pyrk":"pyrk","nova":"shibanova","boid":"boid","apix":"apix","elya":"elya","cez":"cezo","voyrme":"voyr","tomb":"tomb","avme":"avme","ng":"ngin","asta":"asta","bora":"bora","xolo":"xolo","edge":"edge","glex":"glex","vera":"vera-exchange","rusd":"rusd","thx":"thorenext","tena":"tena","n1ce":"n1ce","dojo":"dojofarm-finance","soge":"soge","ibex":"ibex","waxe":"waxe","etor":"etor","aly":"ally","pryz":"pryz","cmkr":"compound-maker","utip":"utip","pasv":"pasv","hype":"hype-finance","zpr":"zper","door":"door","arix":"arix","marx":"marxcoin","1nft":"1nft","bitz":"bitz","xtrd":"xtrade","xels":"xels","vain":"vain","hush":"hush","ekta":"ekta","frog":"frog","sg20":"sg20","mogx":"mogu","tahu":"tahu","ioex":"ioex","kupp":"kupp","joys":"joys","enx":"enex","redi":"redi","moac":"moac","pirl":"pirl","scrv":"scrv","usdl":"usdl","attn":"attn","vybe":"vybe","cyfi":"compound-yearn-finance","rfis":"rfis","reth":"reth","bnbc":"bnbc","g999":"g999","chbt":"chbt","taxi":"taxi","lynx":"lynx","efin":"efin","bidr":"binanceidr","roc":"rocket-raccoon","sono":"sonocoin","dtmi":"dtmi","tosc":"t-os","pgov":"pgov","rccc":"rccc","pofi":"pofi","azu":"azus","zuna":"zuna","obic":"obic","anji":"anji","mymn":"mymn","tun":"tune","bu":"bumo","sbet":"sbet","kala":"kalata","r34p":"r34p","biki":"biki","abbc":"alibabacoin","gr":"grom","foin":"foincoin","bast":"bast","pick":"pick","sdot":"safedot","sren":"sren","hudi":"hudi","$godl":"godl","olcf":"olcf","idot":"idot","odop":"odop","xtrm":"xtrm","drax":"drax","psrs":"psrs","arx":"arcs","crow":"crow-token","evai":"evai","nton":"nton","suni":"starbaseuniverse","acdc":"volt","safe":"safe-coin-2","plg":"pledgecamp","agt":"aisf","yfia":"yfia","peos":"peos","torg":"torg","dao1":"dao1","xls":"elis","dina":"dina","mini":"mini","aeon":"aeon","ruc":"rush","xank":"xank","lbrl":"lbrl","koji":"koji","aeur":"aeur","420x":"420x","s4f":"s4fe","rkt":"rocket-fund","birb":"birb","alis":"alis","gasp":"gasp","ympl":"ympl","yce":"myce","dmme":"dmme-app","donu":"donu","bork":"bork","esk":"eska","ndau":"ndau","vndc":"vndc","oryx":"oryx","jojo":"jojo-inu","yefi":"yearn-ethereum-finance","seer":"seer","hdac":"hdac","bare":"bare","o2ox":"o2ox","olxa":"olxa","nomy":"nomy","ston":"ston","wula":"wula","iron":"iron-bsc","texo":"texo","anon":"anonymous-bsc","logs":"logs","ntm":"netm","agpc":"agpc","boss":"boss","gmb":"gamb","exor":"exor","veco":"veco","aced":"aced","r64x":"r64x","xdai":"xdai","zort":"zort","dogz":"dogz","ymax":"ymax","bolt":"bolt","zyro":"zyro","weld":"weld","gold":"cyberdragon-gold","vivo":"vivo","kodi":"kodiak","usdm":"usdm","vspy":"vspy","divs":"divs","bcat":"bcat","ers":"eros","page":"page","cuex":"cuex","bpop":"bpop","usda":"usda","camp":"camp","bsys":"bsys","iten":"iten","miss":"miss","post":"postcoin","ovi":"oviex","acryl":"acryl","touch":"touch","unify":"unify","xfuel":"xfuel","bitsz":"bitsz","omb":"ombre","axl":"axial","vck":"28vck","viper":"viper","mts":"mtblock","klt":"klend","taiyo":"taiyo","snap":"snap-token","visio":"visio","flame":"firestarter","xen":"xenon-2","fo":"fibos","nosta":"nosta","clt":"clientelecoin","ox":"orcax","miami":"miami","stonk":"stonk","nafty":"nafty","ecu":"decurian","dunes":"dunes","lucky":"lucky-token","fma":"fullmetal-inu","alias":"spectrecoin","meals":"meals","ysr":"ystar","voltz":"voltz","pizza":"pizzaswap","hve2":"uhive","ivory":"ivory","burnx":"burnx","f7":"five7","apn":"apron","amon":"amond","carat":"carat","cprop":"cprop","kxusd":"kxusd","drf":"drife","posh":"shill","az":"azbit","spt":"spectrum","ori":"orica","xdoge":"xdoge","aunit":"aunit","xvc":"vcash","bliss":"bliss-2","qc":"qcash","vrn":"varen","em":"eminer","haz":"hazza","kcash":"kcash","penky":"penky","chpz":"chipz","stemx":"stemx","1doge":"1doge","vdr":"vodra","afx":"afrix","modex":"modex","sao":"sator","bau":"bitau","paras":"paras","odi":"odius","ytofu":"ytofu","ing":"iungo","bubo":"budbo","ifarm":"ifarm","lkk":"lykke","omega":"omega","blurt":"blurt","amas":"amasa","egi":"egame","antr":"antra","sklay":"sklay","lrk":"lekan","bzz":"swarm-bzz","amr":"ammbr","stamp":"stamp","lc":"lightningcoin","xnv":"nerva","ovo":"ovato","croat":"croat","tools":"tools","btr":"bitrue-token","ksk":"karsiyaka-taraftar-token","$shibx":"shibx","solum":"solum","bdefi":"bdefi","bust":"busta","raku":"rakun","con":"converter-finance","seeds":"seeds","quidd":"quidd","qob":"qobit","dlike":"dlike","digex":"digex","xazab":"xazab","tube2":"tube2","eth3s":"eth3s","aico":"aicon","tails":"tails","dxiot":"dxiot","kbn":"kbn","xmn":"xmine","xrd":"raven-dark","cdex":"codex","sls":"salus","vgo":"virtual-goods-token","mri":"mirai","tsr":"tesra","dre":"doren","egold":"egold","bxbtc":"bxbtc","pgpay":"puregold-token","tlr":"taler","gamma":"polygamma","zfarm":"zfarm","doggy":"doggy","fx1":"fanzy","vaivox":"vaivo","bud":"buddy","$greed":"greed","octax":"octax","altom":"altcommunity-coin","tur":"turex","sar":"saren","eidos":"eidos","rlx":"relex","xpo":"x-power-chain","alix":"alinx","coban":"coban","msa":"my-shiba-academia","yusra":"yusra","vmr":"vomer","l":"l-inu","scomp":"scomp","znko":"zenko","topia":"topia","bukh":"bukh","seed":"seedswap-token","gotem":"gotem","fil12":"fil12","yummy":"yummy","mla":"moola","hny":"honey","swace":"swace","pzm":"prizm","geg":"gegem","pazzy":"pazzy","rup":"rupee","daovc":"daovc","rkn":"rakon","grimm":"grimm","elons":"elons","ping":"cryptoping","realm":"realm","vnx":"venox","regen":"regen","purge":"purge","lex":"elxis","atx":"aston","wliti":"wliti","cyb":"cybex","veth2":"veth2","water":"water","zwx":"ziwax","tanks":"tanks","tor":"torchain","sheng":"sheng","sts":"sbank","gig":"gigecoin","claim":"claim","ipfst":"ipfst","zlp":"zilpay-wallet","iag":"iagon","jwl":"jewel","piasa":"piasa","myu":"myubi","tengu":"tengu","ioeth":"ioeth","ibank":"ibank","xax":"artax","flash":"flash-token","vidyx":"vidyx","wolfy":"wolfy","fleta":"fleta","atd":"atd","franc":"franc","sld":"safelaunchpad","kubic":"kubic","bxiot":"bxiot","tia":"tican","chn":"chain","ccomp":"ccomp","sbe":"sombe","dfl":"defily","mooni":"mooni","myo":"mycro-ico","magic":"cosmic-universe-magic-token","lunes":"lunes","clam":"otter-clam","vacay":"vacay","swash":"swash","ari10":"ari10","piggy":"piggy-bank-token","upbnb":"upbnb","vld":"valid","story":"story","srx":"storx","pando":"pando","kappa":"kappa","myobu":"myobu","trism":"trism","ikomp":"ikomp","spok":"spock","pitch":"pitch","scash":"scash","tok":"tokenplace","tdoge":"tdoge","theos":"theos","wwbtc":"wwbtc","xri":"xroad","akira":"akira","$aapl":"aapl","ram":"ramifi","mks":"makes","eurxb":"eurxb","xsp":"xswap","bulls":"bulls","sop":"sopay","senso":"senso","cff":"coffe-1-st-round","u":"ucoin","steel":"steel","niifi":"niifi","larix":"larix","shk":"shrek","acoin":"acoin","dogus":"dogus","atmos":"atmos","xra":"ratecoin","ezx":"ezdex","xkncb":"xkncb","ifx24":"ifx24","basic":"basic","seele":"seele","twist":"twist","hplus":"hplus","vix":"vixco","bitup":"bitup","syf":"syfin","caave":"caave","lexi":"lexit-2","celeb":"celeb","crave":"crave","lps":"lapis","trybe":"trybe","toz":"tozex","xmark":"xmark","gena":"genta","yinbi":"yinbi","tro":"trodl","xgm":"defis","xeuro":"xeuro","eject":"eject","utrin":"utrin","depay":"depay","wco":"winco","nhbtc":"nhbtc","xin":"infinity-economics","arata":"arata","ape-x":"ape-x","ct":"communitytoken","gapt":"gaptt","vesta":"vesta","arank":"arank","ehash":"ehash","zch":"zilchess","krex":"kronn","srune":"srune","eloin":"eloin","tup":"tenup","nftfy":"nftfy","daf":"dafin","pid":"pidao","bsha3":"bsha3","plut":"plutos-network","uncle":"uncle","emoj":"emoji","omnis":"omnis","party":"money-party","tzbtc":"tzbtc","tks":"tokes","perra":"perra","funjo":"funjo","grain":"grain","se7en":"se7en-2","env":"env-finance","1swap":"1swap","ageur":"ageur","audax":"audax","slnv2":"slnv2","prntr":"prntr","brnk":"brank","yukon":"yukon","ron":"rise-of-nebula","saave":"saave","cirus":"cirus","xnode":"xnode","aloha":"aloha","hlo":"helio","xfe":"feirm","iouni":"iouni","weiup":"weiup","kau":"kinesis-2","mozox":"mozox","cms":"cryptomoonshots","xbn":"xbn","arw":"arowana-token","temco":"temco","smx":"somax","keyt":"rebit","hyc":"hycon","akn":"akoin","libfx":"libfx","asimi":"asimi","snk":"snake-token","moz":"mozik","blast":"blastoise-inu","ethup":"ethup","xnc":"xenios","atc":"aster","nfs":"ninja-fantasy-token","angle":"angle-protocol","poker":"poker","reeth":"reeth","peach":"peach","manna":"manna","zcr":"zcore","byts":"bytus","rey":"rey","xos":"oasis-2","eql":"equal","xknca":"xknca","pxt":"populous-xbrl-token","sem":"semux","hop":"hoppy","byron":"bitcoin-cure","atp":"atlas-protocol","punch":"punch","exg":"exgold","xce":"cerium","usd1":"psyche","sead":"seadog-finance","redbux":"redbux","agu":"agouti","newinu":"newinu","waifer":"waifer","din":"dinero","amc":"amc-fight-night","esp":"espers","ilc":"ilcoin","zcor":"zrocor","$up":"onlyup","pea":"pea-farm","sfr":"safari","rblx":"rublix","heal":"etheal","waf":"waffle","pzs":"payzus","xhi":"hicoin","bst":"beshare-token","frts":"fruits","dtep":"decoin","riseup":"riseup","pdx":"pokedx","levelg":"levelg","kue":"kuende","vny":"vanity","bstx":"blastx","ket":"rowket","degens":"degens","ytn":"yenten","cocoin":"cocoin","fai":"fairum","pspace":"pspace","glk":"glouki","tara":"taraxa","frel":"freela","nii":"nahmii","x3s":"x3swap","scribe":"scribe","crb":"crb-coin","xincha":"xincha","gom":"gomics","egcc":"engine","xinchb":"xinchb","rnx":"roonex","doogee":"doogee","lib":"banklife","xrdoge":"xrdoge","vancat":"vancat","mmon":"mommon","revt":"revolt","skrp":"skraps","merl":"merlin","hbx":"habits","xaavea":"xaavea","xqr":"qredit","edux":"edufex","vyn":"vyndao","kabosu":"kabosu","premio":"premio","yooshi":"yooshi","zoc":"01coin","sprink":"sprink","was":"wasder","awo":"aiwork","uno":"unobtanium-tezos","csushi":"compound-sushi","echt":"e-chat","pcatv3":"pcatv3","dusa":"medusa","defido":"defido","sen":"sleepearn-finance","swamp":"swamp-coin","gooreo":"gooreo","onebtc":"onebtc","uco":"uniris","stri":"strite","yplx":"yoplex","2goshi":"2goshi","bte":"btecoin","turtle":"turtle","blx":"bullex","nip":"catnip","d11":"defi11","s8":"super8","lito":"lituni","bceo":"bitceo","nbr":"niobio-cash","anct":"anchor","dxo":"deepspace-token","str":"staker","onit":"onbuff","oct":"octopus-network","vndt":"vendit","gbx":"gobyte","adaboy":"adaboy","dsr":"desire","xsh":"shield","glf":"glufco","lcnt":"lucent","sft":"safety","pappay":"pappay","nftpad":"nftpad","ebst":"eboost","bnbeer":"bnbeer","smbr":"sombra-network","kusd-t":"kusd-t","inubis":"inubis","zdr":"zloadr","ivi":"inoovi","evr":"everus","dox":"doxxed","sefa":"mesefa","app":"dappsy","qiq":"qoiniq","me":"all-me","agrs":"agoras","urub":"urubit","fesbnb":"fesbnb","rno":"snapparazzi","hpx":"hupayx","potato":"potato","orio":"boorio","rpd":"rapids","ocul":"oculor","ame":"amepay","whx":"whitex","yarl":"yarloo","pat":"patron","yo":"yobit-token","pli":"plugin","trat":"tratok","raux":"ercaux","shokky":"shokky","bzzone":"bzzone","yoc":"yocoin","ufi":"purefi","trgo":"trgold","zlw":"zelwin","dfni":"defini","gunthy":"gunthy","fzy":"frenzy","lhcoin":"lhcoin","bchain":"bchain","dmlg":"demole","beck":"macoin","tits":"tits-token","shibgf":"shibgf","diginu":"diginu","cx":"circleex","ntvrk":"netvrk","dms":"documentchain","$blow":"blowup","qdx":"quidax","xdag":"dagger","kel":"kelvpn","priv":"privcy","usnbt":"nubits","gmcoin":"gmcoin-2","mka":"moonka","prkl":"perkle","kudo":"kudoge","gafi":"gamefi","ipm":"timers","ett":"efficient-transaction-token","bump":"babypumpkin-finance","cyclub":"mci-coin","noone":"no-one","tem":"temtem","pixeos":"pixeos","forint":"forint","jmt":"jmtime","wraith":"wraith-protocol","akuaku":"akuaku","cby":"cberry","dka":"dkargo","donk":"donkey","lotdog":"lotdog","i0c":"i0coin","dln":"delion","mnm":"mineum","picipo":"picipo","rupx":"rupaya","thanos":"thanos-2","nkc":"nework","djv":"dejave","slth":"slothi","ape":"apecoin","maggot":"maggot","gxi":"genexi","rich":"richway-finance","co2b":"co2bit","csct":"corsac","zfai":"zafira","moneta":"moneta","uis":"unitus","zcc":"zccoin","bze":"bzedge","ecob":"ecobit","xaaveb":"xaaveb","inn":"innova","min":"mindol","shorty":"shorty","alg":"bitalgo","iousdc":"iousdc","att":"africa-trading-chain","aka":"akroma","avak":"avakus","zdc":"zodiacs","cir":"circleswap","rfx":"reflex","aquari":"aquari","redfeg":"redfeg","pteria":"pteria","gfce":"gforce","rena":"rena-finance","qmc":"qmcoin","dacs":"dacsee","becn":"beacon","in":"incoin","yac":"yacoin","bdk":"bidesk","nbu":"nimbus","eta":"ethera-2","ceds":"cedars","mct":"master-contract-token","bsw":"biswap","dgn":"degen-protocol","gsfy":"gasify","mdm":"medium","cakeup":"cakeup","ubin":"ubiner","sic":"sicash","tc":"ttcoin","nt":"nextype-finance","aapx":"ampnet","vlu":"valuto","wix":"wixlar","mns":"monnos","dbt":"disco-burn-token","rpzx":"rapidz","kicks":"sessia","strn":"strain","fdn":"fundin","iqcoin":"iqcoin","erc223":"erc223","uzz":"azuras","cso":"crespo","jui":"juiice","usg":"usgold","xbtg":"bitgem","ec":"echoin","zag":"zigzag","barrel":"barrel","paa":"palace","clx":"celeum","bsy":"bestay","kzc":"kzcash","sbt":"solbit","zoa":"zotova","oft":"orient","mdu":"mdu","dxf":"dexfin","tewken":"tewken","efk":"refork","hgro":"helgro","jntr/e":"jntre","czf":"czfarm","hd":"hubdao","eauric":"eauric","renfil":"renfil","xlt":"nexalt","incnt":"incent","yfo":"yfione","mrvl":"marvel","acu":"acuity-token","spg":"super-gold","zam":"zam-io","a5t":"alpha5","r3t":"rock3t","vbswap":"vbswap","ktt":"k-tune","dexm":"dexmex","tlo":"talleo","sherpa":"sherpa","wbpc":"buypay","xym":"symbol","anatha":"anatha","fnd":"fundum","musubi":"musubi","wad":"warden","iqq":"iqoniq","lemd":"lemond","fit":"financial-investment-token","wgold":"apwars","wtm":"waytom","dess":"dessfi","gaze":"gazetv","pup":"polypup","arteon":"arteon","toko":"toko","azx":"azeusx","flty":"fluity","htmoon":"htmoon","polyfi":"polyfi","sxi":"safexi","melody":"melody","uponly":"uponly","upshib":"upshib","upcoin":"upcoin","tofy":"toffee","ain":"ai-network","topcat":"topcat","byco":"bycoin","rndm":"random","age":"agenor","dek":"dekbox","dah":"dirham","dogira":"dogira","jigsaw":"jigsaw","synd":"syndex","enviro":"enviro","nevada":"nevada","bab":"basis-bond","ilk":"inlock-token","nickel":"nickel","uted":"united-token","oyt":"oxy-dev","hoop":"hoopoe","marmaj":"marmaj","shoe":"shoefy","cnr":"canary","apx":"appics","zooshi":"zooshi","anb":"angryb","ftr":"future","simple":"simple","oml":"omlira","maru":"hamaru","$ads":"alkimi","bumn":"bumoon","ivg":"ivogel","dfa":"define","zkt":"zktube","cuminu":"cuminu","drdoge":"drdoge","emrals":"emrals","ntr":"nether","ilayer":"ilayer","iowbtc":"iowbtc","upps":"uppsme","apad":"anypad","daw":"deswap","fbe":"foobee","sensei":"sensei","dana":"ardana","syp":"sypool","heartk":"heartk","lyk":"luyuka","armd":"armada","trl":"trolite","pan":"panvala-pan","b2m":"bit2me","utopia":"utopia-2","upc":"upcake","hk":"helkin","ldx":"londex","bitant":"bitant","pqbert":"pqbert","iobusd":"iobusd","swd":"sw-dao","fid":"fidira","iousdt":"iousdt","nfteez":"nfteez","usdtz":"usdtez","xfl":"florin","ethtz":"ethtez","abic":"arabic","blocks":"blocks","dxb":"defixbet","leafty":"leafty","ifv":"infliv","gnnx":"gennix","kyan":"kyanite","sap":"sapchain","ozg":"ozagold","pqt":"prediqt","dra":"drachma","sup8eme":"sup8eme","idoscan":"idoscan","pots":"moonpot","crypt":"the-crypt-space","7e":"7eleven","xiro":"xiropht","kaiinu":"kai-inu","afrox":"afrodex","altb":"altbase","fnsp":"finswap","xnb":"xeonbit","sto":"storeum","chaos":"zkchaos","mnry":"moonery","bdot":"babydot","qtcon":"quiztok","tape":"toolape","bigeth":"big-eth","babyegg":"babyegg","pamp":"pamp-network","fate":"fate-token","888":"888-infinity","bup":"buildup","cashdog":"cashdog","mapc":"mapcoin","prophet":"prophet","tdg":"toydoge","fatcake":"fantom-cake","yuct":"yucreat","hesh":"hesh-fi","dkyc":"dont-kyc","gly":"glitchy","aby":"artbyte","lar":"linkart","ratoken":"ratoken","bono":"bonorum-coin","dmtr":"dimitra","$bakeup":"bake-up","bark":"bored-ark","csp":"caspian","pfy":"portify","qzk":"qzkcoin","cpac":"compact","plug":"plgnet","vash":"vpncoin","poo":"poomoon","algopad":"algopad","scl":"sociall","mttcoin":"mttcoin","sum":"sumswap","moonbar":"moonbar","psb":"planet-sandbox","ebase":"eurbase","nil":"nil-dao","yok":"yokcoin","pt":"predict","xgmt":"xgambit","mch":"meme-cash","rest":"restore","betxc":"betxoin","enu":"enumivo","ecell":"celletf","dvx":"derivex","bstbl":"bstable","xya":"freyala","shibosu":"shibosu","glx":"galaxer","canu":"cannumo","dfch":"defi-ch","bchk":"oec-bch","bscb":"bscbond","tcgcoin":"tcgcoin","vbit":"valobit","olp":"olympia","zedxion":"zedxion","wcx":"wecoown","bist":"bistroo","ntx":"nitroex","foot":"bigfoot","prvs":"previse","piratep":"piratep","xov":"xov","fnk":"fnkcom","onemoon":"onemoon","xlon":"excelon","ole":"olecoin","onefuse":"onefuse","btsg":"bitsong","$dpace":"defpace","dogebtc":"dogebtc","caj":"cajutel","si14":"si14bet","ibh":"ibithub","cyo":"calypso","mkey":"medikey","epstein":"epstein","rapdoge":"rapdoge","tgdy":"tegridy","bonfire":"bonfire","attr":"attrace","dyn":"dynasty-global-investments-ag","lobs":"lobstex-coin","wntr":"weentar","dotk":"oec-dot","baxs":"boxaxis","nms":"nemesis","orare":"onerare","rx":"raven-x","bbs":"baby-shark-finance","maxgoat":"maxgoat","tfd":"etf-dao","tty":"trinity","taud":"trueaud","ift":"iftoken","def":"deffect","rwd":"rewards","gps":"triffic","arts":"artista","odex":"one-dex","befx":"belifex","kuka":"kukachu","bscgold":"bscgold","evry":"evrynet","shrm":"shrooms","moonpaw":"moonpaw","halv":"halving-coin","torpedo":"torpedo","avn":"avnrich","swin":"swinate","bsccrop":"bsccrop","fat":"tronfamily","exo":"exohood","yplt":"yplutus","brise":"bitrise-token","i9c":"i9-coin","swat":"swtcoin","v":"version","thun":"thunder","youc":"youcash","slds":"solidus","winr":"justbet","ddc":"duxdoge","bin":"binarium","fhm":"fantohm","peth18c":"peth18c","sunc":"sunrise","ogx":"organix","gofx":"goosefx","ree":"reecoin","grx":"gravitx","mel":"caramelswap","metx":"metanyx","hood":"hoodler","pshp":"payship","lkt":"locklet","our":"our-pay","e8":"energy8","lfg":"low-float-gem","far":"farmland-protocol","xst":"stealthcoin","peanuts":"peanuts","tlw":"tilwiki","coi":"coinnec","eum":"elitium","wxc":"wiix-coin","bern":"bernard","xf":"xfarmer","zdx":"zer-dex","algb":"algebra","pokerfi":"pokerfi","dxg":"dexigas","komp":"kompass","mb":"minebee","fdm":"freedom","oneperl":"oneperl","bnx":"bnx","yot":"payyoda","rock":"bedrock","polaris":"polaris-2","myak":"miniyak","pdox":"paradox","btck":"oec-btc","ptr":"payturn","pugl":"puglife","ath":"aetherv2","pgs":"pegasus","dxh":"daxhund","exp":"game-x-change","cava":"cavapoo","roo":"roocoin","fees":"unifees","lty":"ledgity","lorc":"landorc","mpt":"metal-packaging-token","babyeth":"babyeth","bly":"blocery","two":"2gather","mnr":"mineral","bn":"bitnorm","eag":"ea-coin","foxgirl":"foxgirl","sdoge":"soldoge","mojov2":"mojo-v2","ironman":"ironman","ecp":"ecp-technology","moochii":"moochii","bdo":"bdollar","sxc":"simplexchain","song":"songcoin","vnl":"vanilla","kae":"kanpeki","reddoge":"reddoge","crfi":"crossfi","buz":"buzcoin","jindoge":"jindoge","hrd":"hrd","htc":"hitcoin","symbull":"symbull","iby":"ibetyou","nyex":"nyerium","fk":"fk-coin","lil":"lillion","skyborn":"skyborn","opus":"opusbeat","mndao":"moondao","axnt":"axentro","mlm":"mktcoin","filk":"oec-fil","vltm":"voltium","ccxx":"counosx","wdx":"wordlex","oioc":"oiocoin","mouse":"mouse","sclp":"scallop","elv":"e-leven","legends":"legends","vention":"vention","xht":"hollaex-token","jed":"jedstar","wsote":"soteria","knt":"knekted","pyn":"paycent","pit":"pitbull","kurt":"kurrent","flexusd":"flex-usd","aglt":"agrolot","nftd":"nftrade","ctl":"citadel","news":"publish","lux":"lux-expression","bfic":"bficoin","sushiba":"sushiba","tshp":"12ships","ldf":"lil-doge-floki-token","gbt":"gamebetcoin","ents":"eunomia","rtk":"ruletka","daik":"oec-dai","kol":"kollect","dvdx":"derived","guccinu":"guccinu","addy":"adamant","via":"viacoin","boob":"boobank","hmr":"homeros","lthn":"lethean","pcm":"precium","meebits20":"meebits","gate":"gatenet","crunch":"crunchy-network","dogedao":"dogedao","bnp":"benepit","dxct":"dnaxcat","dank":"mu-dank","msb":"misbloc","dgman":"dogeman","gnft":"gamenft","mmui":"metamui","lhb":"lendhub","mql":"miraqle","zksk":"oec-zks","wyx":"woyager","ella":"ellaism","meow":"meowswap","hawk":"hawkdex","esw":"emiswap","dogepot":"dogepot","1trc":"1tronic","afn":"altafin","eeth":"eos-eth","evereth":"evereth","thkd":"truehkd","wfx":"webflix","bext":"bytedex","lildoge":"lildoge","fn":"filenet","ktc":"kitcoin","ala":"alanyaspor-fan-token","igg":"ig-gold","xes":"proxeus","jar":"jarvis","trcl":"treecle","muzz":"muzible","sgb":"songbird","onewing":"onewing","nax":"nextdao","btrn":"bitroncoin","etck":"oec-etc","mbet":"moonbet","onevbtc":"onevbtc","zik":"zik-token","sfgk":"oec-sfg","net":"netcoin","mma":"mmacoin","oktp":"oktplay","mowa":"moniwar","c":"c-token","strx":"strikecoin","sjw":"sjwcoin","asy":"asyagro","peer":"unilord","chat":"beechat","ardx":"ardcoin","digi":"digible","fml":"formula","mdtk":"mdtoken","falcx":"falconx","yay":"yay-games","bafe":"bafe-io","xmv":"monerov","twee":"tweebaa","arb":"arbiter","nada":"nothing","tag":"tagcoin","ethk":"oec-eth","babyuni":"babyuni","efi":"efinity","btrm":"betrium","kuv":"kuverit","zny":"bitzeny","bzn":"benzene","nug":"nuggets","org":"ogcnode","vro":"veraone","smdx":"somidax","bitc":"bitcash","pkt":"playkey","vana":"nirvana","rebound":"rebound","vita":"vitality","hbit":"hashbit","300":"spartan","dch":"doch-coin","xemx":"xeniumx","gpt":"grace-period-token","mora":"meliora","cid":"cryptid","ril":"rilcoin","lime":"limeswap","hitx":"hithotx","dnft":"darenft","tgbp":"truegbp","did":"didcoin","lithium":"lithium-2","kenu":"ken-inu","erotica":"erotica-2","bbt":"blockbase","tat":"tatcoin","won":"weblock","pm":"pomskey","rzrv":"rezerve","x-token":"x-token","celc":"celcoin","x0z":"zerozed","bool":"boolean","omic":"omicron","k9":"k-9-inu","the":"the-node","unos":"unoswap","capt":"captain","mesh":"meshbox","vspacex":"vspacex","gzro":"gravity","pzap":"polyzap","solr":"solrazr","zwall":"zilwall","ael":"aelysir","nucleus":"nucleus","zyon":"bitzyon","safeeth":"safeeth","boocake":"boocake","fan":"fanadise","ham":"hamster","4stc":"4-stock","vtar":"vantaur","buoc":"buocoin","hal":"halcyon","hld":"holdefi","xdo":"xdollar","ix":"x-block","safeass":"safeass","pswamp":"pswampy","treeb":"treeb","crystal":"crystal","pci":"pay-coin","fig":"flowcom","trop":"interop","iti":"iticoin","zum":"zum-token","barmy":"babyarmy","gadoshi":"gadoshi","babybnb":"babybnb","ethdown":"ethdown","dion":"dionpay","btv":"bitvote","tronish":"tronish","hotdoge":"hot-doge","ekt":"educare","lota":"loterra","xcz":"xchainz","tek":"tekcoin","leopard":"leopard","alia":"xanalia","sdby":"sadbaby","gif":"gif-dao","hada":"hodlada","cpz":"cashpay","opc":"op-coin","ets":"etheros","bbsc":"babybsc","volt":"voltage","rech":"rechain","metacat":"metacat","bnk":"bankera","lpi":"lpi-dao","anyan":"avanyan","ttt":"the-transfer-token","kfc":"chicken","del":"decimal","dzoo":"dogezoo","ddm":"ddmcoin","banketh":"banketh","mpay":"menapay","sandman":"sandman","marks":"bitmark","bgc":"bigcash","btcm":"btcmoon","bim":"bimcoin","gsm":"gsmcoin","safesun":"safesun","jdc":"jd-coin","fra":"findora","bgr":"bitgrit","dyna":"dynamix","pmeer":"qitmeer","checoin":"checoin","safewin":"safewin","glms":"glimpse","ardn":"ariadne","meowcat":"meowcat","shiboki":"shiboki","lyra":"scrypta","bbfeg":"babyfeg","bixcpro":"bixcpro","trbt":"tribute","czz":"classzz","ydr":"ydragon","deq":"dequant","sdgo":"sandego","myne":"itsmyne","eut":"eutaria","bnode":"beenode","mnmc":"mnmcoin","ltck":"oec-ltc","minibnb":"minibnb","btkc":"beautyk","pog":"pogged-finance","unik":"oec-uni","ebtc":"eos-btc","brain":"nobrainer-finance","spike":"spiking","bzp":"bitzipp","rhegic2":"rhegic2","kmo":"koinomo","cnx":"cryptonex","gamebox":"gamebox","wenb":"wenburn","poocoin":"poocoin","eca":"electra","adacash":"adacash","bbyxrp":"babyxrp","jam":"tune-fm","nino":"ninneko","fey":"feyorra","sam":"samsunspor-fan-token","b2b":"b2bcoin-2","sfn":"strains","sfm":"sfmoney","sprts":"sprouts","jrit":"jeritex","psy":"psychic","bins":"bsocial","stfi":"startfi","tkmn":"tokemon","ethp":"ethplus","xxa":"ixinium","onigiri":"onigiri","nsi":"nsights","satoz":"satozhi","some":"mixsome","dgmt":"digimax","cop":"copiosa","xlshiba":"xlshiba","buck":"arbucks","tinu":"tom-inu","everape":"everape","jch":"jobcash","ohmc":"ohm-coin","babysun":"babysun","catgirl":"catgirl","mepad":"memepad","cp":"cryptoprofile","babyboo":"babyboo","assg":"assgard","mspc":"monspac","cyfm":"cyberfm","xat":"shareat","mes":"meschain","usdf":"new-usdf","york":"polyyork","lion":"lion-token","blowf":"blowfish","tpad":"trustpad","sbfc":"sbf-coin","bkr":"balkari-token","epichero":"epichero","hup":"huplife","nawa":"narwhale","syl":"xsl-labs","html":"htmlcoin","knx":"knoxedge","babycare":"babycare","flur":"flurmoon","blu":"bluecoin","wiseavax":"wiseavax","icol":"icolcoin","mfund":"memefund","club":"clubcoin","bwt":"babywhitetiger","csx":"coinstox","elongate":"elongate","dxc":"dex-trade-coin","mbby":"minibaby","edgt":"edgecoin-2","alh":"allohash","goon":"goonrich","mojo":"moonjuice","guss":"guss-one","btcl":"btc-lite","rivrdoge":"rivrdoge","wheel":"wheelers","rdct":"rdctoken","kawaii":"kawaiinu","hnc":"helleniccoin","lvlup":"levelup-gaming","tpay":"tetra-pay","mkcy":"markaccy","dmod":"demodyfi","ethvault":"ethvault","metastar":"metastar","knuckles":"knuckles","mnt":"meownaut","azrx":"aave-zrx-v1","mbird":"moonbird","ucd":"unicandy","sage":"polysage","nsr":"nushares","safenami":"safenami","noid":"tokenoid","pure":"puriever","whis":"whis-inu","doge0":"dogezero","shibchu":"shibachu","foxd":"foxdcoin","bitbucks":"bitbucks","aang":"aang-inu","redzilla":"redzilla","nole":"nolecoin","bpp":"bitpower","xil":"projectx","solberry":"solberry","sh":"super-hero","bkkg":"biokkoin","gld":"goldario","ccm":"car-coin","shit":"shitcoin","nss":"nss-coin","cetf":"cetf","idtt":"identity","txc":"tenxcoin","jfm":"justfarm","deku":"deku-inu","wagmi":"euphoria-2","trip":"tripedia","scix":"scientix","fjc":"fujicoin","trusd":"trustusd","vga":"vegaswap","kekw":"kekwcoin","ioc":"iocoin","bsn":"bastonet","art":"around-network","shibk":"oec-shib","pxg":"playgame","stpc":"starplay","gorgeous":"gorgeous","sb":"snowbank","honey":"honey-pot-beekeepers","vice":"vicewrld","dfk":"defiking","dogecola":"dogecola","$yo":"yorocket","babybusd":"babybusd","vn":"vn-token","kva":"kevacoin","turncoin":"turncoin","jpyc":"jpyc","mxw":"maxonrow","okfly":"okex-fly","vip":"limitless-vip","rcg":"recharge","ixt":"insurex","nyan":"arbinyan","safestar":"safestar","burndoge":"burndoge","swan":"blackswan","foho":"fohocoin","qbz":"queenbee","soak":"soak-token","oneusd":"1-dollar","drac":"dracarys","richduck":"richduck","dogemoon":"dogemoon","shibapup":"shibapup","nifty":"niftynft","gom2":"gomoney2","slc":"selenium","lpl":"linkpool","xrpape":"xrp-apes","ainu":"ainu-token","babybilz":"babybilz","safu":"ceezee-safu","mewn":"mewn-inu","sltn":"skylight","pxp":"pointpay","gasg":"gasgains","cmit":"cmitcoin","aidi":"aidi-finance","0xmr":"0xmonero","elm":"elements-2","thor":"asgard-finance","nmt":"nftmart-token","urx":"uraniumx","kogecoin":"kogecoin","adoge":"arbidoge","$maid":"maidcoin","gldy":"buzzshow","papacake":"papacake","hdao":"hic-et-nunc-dao","0xc":"0xcharts","pvn":"pavecoin","jacy":"jacywaya","okboomer":"okboomer","yct":"youclout","fxl":"fxwallet","$ryzeinu":"ryze-inu","scol":"scolcoin","tar":"tartarus","boomc":"boomcoin","wifedoge":"wifedoge","arno":"art-nano","snft":"spain-national-fan-token","vns":"va-na-su","terra":"avaterra","ayfi":"ayfi-v1","anv":"aniverse","getdoge":"get-doge","pinu":"piccolo-inu","hina":"hina-inu","crush":"bitcrush","shfl":"shuffle","enk":"enkronos","nami":"nami-corporation-token","bfl":"bitflate","ultgg":"ultimogg","babyelon":"babyelon","pepe":"pepemoon","investel":"investel","bitgatti":"biitgatti","drops":"defidrop","moonmoon":"moonmoon","lf":"linkflow","izi":"izichain","yda":"yadacoin","aren":"aave-ren-v1","affinity":"safeaffinity","hta":"historia","fastmoon":"fastmoon","disk":"darklisk","toc":"touchcon","etch":"elontech","coge":"cogecoin","bfg":"bfg-token","leaf":"seeder-finance","aswap":"arbiswap","wit":"witchain","trp":"tronipay","ever":"everswap","acrv":"aave-crv","dgw":"digiwill","chee":"cheecoin","babybake":"baby-bake","bscake":"bunscake","gbts":"gembites","minishib":"minishib-token","mwar":"moon-warriors","perl":"perlin","hfire":"hellfire","sharpei":"shar-pei","pampther":"pampther","gens":"genshiro","arai":"aave-rai","mem":"memecoin","buni":"bunicorn","abal":"aave-bal","2chainlinks":"2-chains","ogods":"gotogods","pti":"paytomat","megacosm":"megacosm","boge":"bogecoin","ytv":"ytv-coin","xln":"lunarium","gfun":"goldfund-ico","mltpx":"moonlift","gpu":"gpu-coin","ziti":"ziticoin","safedoge":"safedoge-token","bsp":"ballswap","smax":"shibamax","dcat":"donutcat","tagr":"tagrcoin","cross":"crosspad","urg":"urgaming","gamesafe":"gamesafe","mnd":"mound-token","path":"path-vault-nftx","yfr":"youforia","lunapad":"luna-pad","18c":"block-18","xmm":"momentum","chim":"chimeras","bca":"bitcoin-atom","xrp-bf2":"xrp-bep2","dtc":"datacoin","zoro":"zoro-inu","rice":"rice-wallet","roll":"polyroll","b2u":"b2u-coin","bsc":"bitsonic-token","scoin":"shincoin","swsh":"swapship","winlambo":"winlambo","lanc":"lanceria","pos":"pos-coin","xqn":"quotient","npo":"npo-coin","moonwalk":"moonwalk","diva":"mulierum","maskdoge":"maskdoge","elonpeg":"elon-peg","yfim":"yfimobi","babyada":"baby-ada","polystar":"polystar","sw":"safewolf","teslf":"teslafan","atmn":"antimony","lazy":"lazymint","cirq":"cirquity","exmr":"exmr-monero","gict":"gictrade","prime":"primedao","ssx":"somesing","eds":"endorsit","loge":"lunadoge","tnglv3":"tangle","jpaw":"jpaw-inu","vcc":"victorum","bucks":"swagbucks","mowl":"moon-owl","vrap":"veraswap","catz":"catzcoin","tinv":"tinville","gabecoin":"gabecoin","zyn":"zynecoin","gix":"goldfinx","moonarch":"moonarch","hdoge":"holydoge","mne":"minereum","msh":"crir-msh","trn":"tronnodes","safebank":"safebank","brun":"bull-run","bshiba":"bscshiba","dark":"dark-frontiers","aem":"atheneum","bnana":"banana-token","meliodas":"meliodas","astax":"ape-stax","swaps":"nftswaps","wage":"philscurrency","pact":"packswap","xgk":"goldkash","payns":"paynshop","dogerise":"dogerise","amz":"amazonacoin","nftt":"nft-tech","100x":"100x-coin","aim":"ai-mining","plbt":"polybius","lby":"libonomy","vlm":"valireum","amo":"amo","kkc":"primestone","inf":"infbundle","chubbies20":"chubbies","hypebet":"hype-bet","ax":"athletex","miniusdc":"miniusdc","moondash":"moondash","gram":"gram","aenj":"aave-enj-v1","qbu":"quannabu","gms":"gemstones","bio":"biocrypt","trxk":"oec-tron","quid":"quid-ika","glass":"ourglass","kdoge":"koreadoge","instinct":"instinct","mplay":"metaplay","safemusk":"safemusk","tv":"ti-value","taste":"tastenft","lava":"lavacake-finance","log":"woodcoin","sme":"safememe","appa":"appa-inu","homi":"homihelp","bugg":"bugg-finance","admonkey":"admonkey","gain":"gain-protocol","same":"samecoin","smd":"smd-coin","isal":"isalcoin","ftb":"fit-beat","mbonk":"megabonk","mbbased":"moonbase","tep":"tepleton","black":"blackhole-protocol","afarm":"arbifarm","mnde":"marinade","jrex":"jurasaur","bee":"honeybee","bith":"bithachi","wcs":"weecoins","chnd":"cashhand","glxm":"galaxium","goku":"goku-inu","polymoon":"polymoon","mcontent":"mcontent","xblzd":"blizzard","cex":"catena-x","bnu":"bytenext","evm":"evermars","bln":"baby-lion","megarise":"megarise","kok":"kok-coin","bankr":"bankroll","buda":"budacoin","qfi":"qfinance","owdt":"oduwausd","meme20":"meme-ltd","orly":"orlycoin","ple":"plethori","atyne":"aerotyne","mms":"minimals","ntrs":"nosturis","meetone":"meetone","saitax":"saitamax","ezy":"ezystayz","bricks":"mybricks","xgs":"genesisx","kinek":"oec-kine","pax":"payperex","nvc":"novacoin","mcash":"monsoon-finance","guap":"guapcoin","moonshot":"moonshot","bnw":"nagaswap","zuc":"zeuxcoin","ea":"ea-token","mmsc":"mms-coin","cdtc":"decredit","lazydoge":"lazydoge","tmed":"mdsquare","bblink":"babylink","btcv":"bitcoin-volatility-index-token","rajainu":"raja-inu","dyz":"dyztoken","daft":"daftcoin","oxo":"oxo-farm","agn":"agrinoble","fraction":"fraction","char":"charitas","defy":"defycoinv2","nuko":"nekonium","sine":"sinelock","xi":"xi-token","inuyasha":"inuyasha","ftn":"fountain","i9x":"i9x-coin","spark":"sparklab","knb":"kronobit","mig":"migranet","nbl":"nobility","tut":"tutellus","dane":"danecoin","nan":"nantrade","trtt":"trittium","llt":"lifeline","stopelon":"stopelon","kube":"kubecoin","wars":"metawars","cpt":"cryptaur","negg":"nest-egg","metamoon":"metamoon","ragna":"ragnarok","mo":"morality","safecity":"safecity","vlk":"vulkania","uca":"uca","wdf":"wildfire","astra":"astra-protocol","inrt":"inrtoken","lol":"emogi-network","spiz":"space-iz","pump":"pump-coin","busy":"busy-dao","abat":"aave-bat-v1","solarite":"solarite","bigo":"bigo-token","herodoge":"herodoge","ruuf":"homecoin","adai":"aave-dai-v1","xviper":"viperpit","kami":"kamiland","slrm":"solareum","srp":"starpunk","fish":"penguin-party-fish","mamadoge":"mamadoge","miro":"mirocana","trex":"tyrannosaurus-rex","pok":"pokmonsters","ants":"fireants","zeno":"zeno-inu","calcifer":"calcifer","wcn":"widecoin","eva":"evanesco-network","adaflect":"adaflect","yts":"yetiswap","plf":"playfuel","aknc":"aave-knc-v1","seachain":"seachain","mgt":"megatech","ltg":"litegold","lst":"lendroid-support-token","hmoon":"hellmoon","aya":"aryacoin","noa":"noa-play","bmars":"binamars","ansr":"answerly","bnv":"benative","tkm":"thinkium","meda":"medacoin","mmda":"pokerain","soku":"sokuswap","fren":"frenchie","ow":"owgaming","alr":"alacrity","bcna":"bitcanna","lvn":"livenpay","sticky":"flypaper","swg":"swgtoken","fll":"feellike","dhd":"dhd-coin","many":"manyswap","metainu":"meta-inu","goc":"eligma","inu":"hachikoinu","ape$":"ape-punk","ecoc":"ecochain","babyx":"babyxape","tnr":"tonestra","ocb":"blockmax","ldoge":"litedoge","coom":"coomcoin","surfmoon":"surfmoon","flokiz":"flokizap","tokau":"tokyo-au","burp":"coinburp","seq":"sequence","ebusd":"earnbusd","arcadium":"arcadium","bizz":"bizzcoin","bala":"shambala","trix":"triumphx","ofi":"ofi-cash","wrk":"blockwrk","eti":"etherinc","smgm":"smegmars","kalam":"kalamint","nftstyle":"nftstyle","entr":"enterdao","tatm":"tron-atm","payb":"paybswap","polo":"polkaplay","firu":"firulais","plat":"bitguild","hzm":"hzm-coin","pawg":"pawgcoin","fairlife":"fairlife","meet":"coinmeet","xbond":"bitacium","mgoat":"mgoat","tetoinu":"teto-inu","bait":"baitcoin","moonrise":"moonrise","dcash":"dappatoz","pxi":"prime-xi","fave":"favecoin","chefcake":"chefcake","ttc":"thetimeschaincoin","moto":"motocoin","nftbs":"nftbooks","freemoon":"freemoon","kdag":"kdag","stol":"stabinol","poof":"poofcash","ethpy":"etherpay","trad":"tradcoin","pw":"petworld","srnt":"serenity","wtip":"worktips","evermusk":"evermusk","safehold":"safehold","nftascii":"nftascii","libertas":"libertas-token","gabr":"gaberise","safebull":"safebull","b2g":"bitcoiin","xdna":"extradna","botx":"botxcoin","poke":"pokeball","nbng":"nobunaga","pinksale":"pinksale","fsdcoin":"fsd-coin","wave":"shockwave-finance","metanaut":"metanaut","byn":"beyond-finance","nicheman":"nicheman","auop":"opalcoin","auni":"aave-uni","smsct":"smscodes","tkb":"tkbtoken","fic":"filecash","opnn":"opennity","znc":"zioncoin","pupdoge":"pup-doge","job":"jobchain","bbp":"biblepay","runes":"runebase","palt":"palchain","moonstar":"moonstar","mdc":"mars-dogecoin","ndn":"ndn-link","topc":"topchain","cats":"catscoin","btshk":"bitshark","xbs":"bitstake","ic":"ignition","zoe":"zoe-cash","spp":"shapepay","cocktail":"cocktail","ubn":"ubricoin","cer":"cerealia","dogebull":"3x-long-dogecoin-token","jejudoge":"jejudoge-bsc","mcat":"meta-cat","crox":"croxswap","aht":"angelheart-token","evape":"everyape-bsc","lvl":"levelapp","hana":"hanacoin","bell":"bellcoin","fch":"fanaticos-cash","bankbtc":"bank-btc","metas":"metaseer","sd":"smart-dollar","srat":"spacerat","safezone":"safezone","zantepay":"zantepay","snrw":"santrast","royalada":"royalada","isr":"insureum","ebsc":"earlybsc","ijc":"ijascoin","windy":"windswap","factr":"defactor","gcn":"gcn-coin","gany":"ganymede","minicake":"minicake","mbud":"moon-bud","adl":"adelphoi","amkr":"aave-mkr-v1","alp":"coinalpha","poco":"pocoland","ri":"ri-token","sphtx":"sophiatx","rush":"rush-defi","zne":"zonecoin","bcx":"bitcoinx","jobs":"jobscoin","prdz":"predictz","ino":"nogoaltoken","sym":"symverse","nmc":"namecoin","scx":"scarcity","bbnd":"beatbind","pcl":"peculium","timec":"time-coin","pow":"eos-pow-coin","marsrise":"marsrise","fomp":"fompound","polygold":"polygold","koko":"kokoswap","try":"try-finance","squid":"squidanomics","safecock":"safecock","kinta":"kintaman","apes":"apehaven","eggplant":"eggplant","redshiba":"redshiba","earn":"yearn-classic-finance","nia":"nydronia","ecop":"eco-defi","shibamon":"shibamon","asnx":"aave-snx-v1","gldx":"goldex-token","prtcle":"particle-2","godz":"godzilla","beer":"beer-money","aset":"parasset","hpot":"hash-pot","bits":"bitcoinus","dinop":"dinopark","mai":"mindsync","foge":"fat-doge","cbd":"greenheart-cbd","wpt":"worldpet","poll":"clearpoll","tesinu":"tesla-inu","pgc":"pegascoin","yfe":"yfe-money","dbuy":"doont-buy","chc":"chunghoptoken","daddyusdt":"daddyusdt","cmerge":"coinmerge-bsc","gmex":"game-coin","cakepunks":"cakepunks","vestx":"vestxcoin","pwrb":"powerbalt","dream":"dream-swap","ttr":"tetherino","nut":"native-utility-token","vany":"vanywhere","dmz":"dmz-token","lunar":"lunar-highway","erz":"earnzcoin","too":"too-token","isola":"intersola","2crz":"2crazynft","ryiu":"ryi-unity","taur":"marnotaur","fups":"feed-pups","vicex":"vicetoken","dgp":"dgpayment","babydoug":"baby-doug","hfil":"huobi-fil","bbjeju":"baby-jeju","ponzu":"ponzu-inu","rptc":"reptilian","vbch":"venus-bch","tls":"tls-token","moontoken":"moontoken","fomo":"fomo-labs","pcb":"451pcbcom","cbrl":"cryptobrl","gloryd":"glorydoge","ecos":"ecodollar","save":"savetheworld","hypr":"hyperburn","flc":"flowchaincoin","bdogex":"babydogex","wolfe":"wolfecoin","floki":"baby-moon-floki","mommyusdt":"mommyusdt","cogi":"cogiverse","sip":"space-sip","dfp2":"defiplaza","mic3":"mousecoin","cakezilla":"cakezilla","dexa":"dexa-coin","zmbe":"rugzombie","nar":"nar-token","silk":"silkchain","ank":"apple-network","rivrshib":"rivrshiba","fsp":"flashswap","yap":"yap-stone","mdb":"metadubai","gold nugget":"blockmine","qbc":"quebecoin","teslasafe":"teslasafe","ieth":"infinity-eth","twi":"trade-win","latte":"latteswap","nsd":"nasdacoin","hlp":"help-coin","andes":"andes-coin","space":"space-token","erp":"entropyfi","kashh":"kashhcoin","lmch":"latamcash","skn":"sharkcoin","ball":"ball-token","mswap":"moneyswap","dsol":"decentsol","hint":"hintchain","hnzo":"hanzo-inu","hss":"hashshare","cakecrypt":"cakecrypt","611":"sixeleven","blfi":"blackfisk","elonballs":"elonballs","capp":"crypto-application-token","xbe":"xbe-token","nnb":"nnb-token","mtcn":"multiven","dkkt":"dkk-token","rpepe":"rare-pepe","cpd":"coinspaid","mvc":"mileverse","1art":"1art","7add":"holdtowin","kcake":"kangaroocake","ret":"realtract","shibacash":"shibacash","klayg":"klaygames","scs":"speedcash","rc20":"robocalls","flokipup":"floki-pup","xscp":"scopecoin","vxvs":"venus-xvs","chow":"chow-chow-finance","boltt":"boltt-coin","vbtc":"venus-btc","ponyo":"ponyo-inu","slf":"solarfare","mbit":"mbitbooks","ouro":"ouroboros","ecl":"eclipseum","kunu":"kuramainu","pocc":"poc-chain","finu":"football-inu","x2p":"xenon-pay-old","rib":"riverboat","alvn":"alvarenet","snp":"synapse-network","kaieco":"kaikeninu","tinku":"tinkucoin","unft":"ultimate-nft","mask20":"hashmasks","cbg":"chainbing","mintys":"mintyswap","gdm":"goldmoney","mnx":"nodetrade","claw":"cats-claw","bixb":"bixb-coin","iup":"infinitup","bebop-inu":"bebop-inu","amsk":"nolewater","vltc":"venus-ltc","vjc":"venjocoin","bna":"bananatok","shiblite":"shibalite","uniusd":"unidollar","rew":"rewardiqa","sug":"sulgecoin","dic":"daikicoin","tco":"tcoin-fun","bitci":"bitcicoin","bolc":"boliecoin","uchad":"ultrachad","babyfloki":"baby-floki","chips":"chipshop-finance","bito":"proshares-bitcoin-strategy-etf","epx":"emporiumx","ezpay":"eazypayza","lsh":"leasehold","dgm":"digimoney","bnz":"bonezyard","fullsend":"full-send","crnbry":"cranberry","bbr":"bitberry-token","dto":"dotoracle","gbk":"goldblock","maga":"maga-coin","solo":"solo-vault-nftx","saint":"saint-token","ausdt":"aave-usdt-v1","etl":"etherlite-2","awbtc":"aave-wbtc-v1","abusd":"aave-busd-v1","safemoney":"safemoney","mptc":"mnpostree","pdao":"panda-dao","nasadoge":"nasa-doge","bhax":"bithashex","ore":"starminer-ore-token","whl":"whaleroom","thrn":"thorncoin","vest":"start-vesting","meo":"meo-tools","ume":"ume-token","asusd":"aave-susd-v1","ulg":"ultragate","curve":"curvehash","rrb":"renrenbit","crm":"cream","bxt":"bittokens","dbtc":"decentralized-bitcoin","ish":"interlude","ims":"ims-wallet","asia":"asia-coin","entrc":"entercoin","bitd":"8bit-doge","isdt":"istardust","ani":"anime-token","nanox":"project-x","mflate":"memeflate","ibg":"ibg-eth","beluga":"beluga-fi","sdfi":"stingdefi","dlycop":"daily-cop","dogek":"doge-king","metti":"metti-inu","bme":"bitcomine","kuky":"kuky-star","shiba":"shiba-fantom","bali":"balicoin","myh":"moneyhero","crace":"coinracer","bxh":"bxh","etx":"ethereumx","lgold":"lyfe-gold","lland":"lyfe-land","dfc":"deficonnect","miks":"miks-coin","crt":"carr-finance","evy":"everycoin","now":"changenow","solid":"soliddefi","nrgy":"nrgy-defi","etit":"etitanium","tree":"tree-defi","niu":"niubiswap","more":"legends-room","coshi":"coshi-inu","jdi":"jdi-token","repo":"repo","mia":"miamicoin","pix":"privi-pix","safepluto":"safepluto","polyshiba":"polyshiba","bchc":"bitcherry","her":"heroverse","bnc":"bifrost-native-coin","luck":"lady-luck","tno":"tnos-coin","sec":"smilecoin","lir":"letitride","yag":"yaki-gold","vegas":"vegasdoge","bamboo":"bamboo-token-2","mcau":"meld-gold","pyq":"polyquity","bp":"beyond-protocol","hpy":"hyper-pay","cock":"shibacock","safeearth":"safeearth","opti":"optitoken","pfid":"pofid-dao","rover":"rover-inu","starsb":"star-shib","mw":"mirror-world-token","moonstorm":"moonstorm","czdiamond":"czdiamond","toki":"tokyo-inu","drunk":"drunkdoge","ultra":"ultrasafe","sports":"zensports","amana":"aave-mana-v1","pluto":"plutopepe","kmon":"kryptomon","ich":"ideachain","spki":"spike-inu","safermoon":"safermoon","0xbtc":"oxbitcoin","fam":"fam-token","shbma":"shibamask","rld":"real-land","bleo":"bep20-leo","imgc":"imagecash","paddy":"paddycoin","xiasi":"xiasi-inu","nuvo":"nuvo-cash","ponzi":"ponzicoin","ltz":"litecoinz","apex":"apexit-finance","rb":"royal-bnb","dappx":"dappstore","sybc":"sybc-coin","skc":"skinchain","wifi":"wifi-coin","honk":"honk-honk","ctpl":"cultiplan","vero":"vero-farm","xmpt":"xiamipool","laika":"laika-protocol","bmh":"blockmesh-2","xcv":"xcarnival","grit":"integrity","shed":"shed-coin","redfloki":"red-floki","bbk":"bitblocks-project","tbg":"thebridge","yayo":"yayo-coin","fuzzy":"fuzzy-inu","para":"paralink-network","osm":"options-market","dingo":"dingo-token","lofi":"lofi-defi","slv":"slavi-coin","shd":"shardingdao","qtf":"quantfury","bbx":"ballotbox","token":"swaptoken","smrt":"solminter","kltr":"kollector","mgc":"magnachain","elonone":"astroelon","moonminer":"moonminer","shibcake":"shib-cake","thoge":"thor-doge","ksc":"kstarcoin","mcf":"moon-chain","rktbsc":"bocketbsc","sgaj":"stablegaj","fuzz":"fuzz-finance","gym":"gym-token","moonwilly":"moonwilly","wot":"moby-dick","safeorbit":"safeorbit","mny":"moonienft","ira":"deligence","naut":"astronaut","trees":"safetrees","shio":"shibanomi","snaut":"shibanaut","snood":"schnoodle","beans":"bnbeanstalk","zash":"zimbocash","papadoge":"papa-doge","c8":"carboneum","pivxl":"pivx-lite","gin":"gin-token","fdao":"flamedefi","burn1coin":"burn1coin","vbsc":"votechain","jaws":"autoshark","wipe":"wipemyass","simps":"onlysimps","foreverup":"foreverup","mgdg":"mage-doge","pcpi":"precharge","spacecat":"space-cat","kite":"kite-sync","snoop":"snoopdoge","bak":"baconcoin","aab":"aax-token","grm":"greenmoon","usopp":"usopp-inu","torq":"torq-coin","dogo":"dogemongo-solana","ba":"batorrent","$elonom":"elonomics","vect":"vectorium","$king":"king-swap","hurricane":"hurricane","bodo":"boozedoge","mcc":"magic-cube","eplus":"epluscoin","aweth":"aave-weth","clbk":"cloudbric","dynge":"dyngecoin","webd":"webdollar","vdai":"venus-dai","reum":"rewardeum","just":"justyours","deeznuts":"deez-nuts","aca":"acash-coin","astrolion":"astrolion","ths":"the-hash-speed","egc":"evergrowcoin","kong":"kong-defi","nerdy":"nerdy-inu","vlt":"bankroll-vault","pazzi":"paparazzi","boobs":"moonboobs","payt":"payaccept","stb":"starblock","xamp":"antiample","symm":"symmetric","seal":"sealchain","ausdc":"aave-usdc-v1","lfc":"linfinity","ltk":"litecoin-token","psix":"propersix","jfin":"jfin-coin","xby":"xtrabytes","mvh":"moviecash","spdx":"spender-x","panft":"picartnft","maya":"maya-coin","stro":"supertron","vxc":"vinx-coin","vrise":"v4p0rr15e","crazytime":"crazytime","safespace":"safespace","smoon":"saylor-moon","pixu":"pixel-inu","dna":"metaverse-dualchain-network-architecture","spaz":"swapcoinz","hapy":"hapy-coin","town":"town-star","elc":"eaglecoin-2","drgb":"dragonbit","limit":"limitswap","ycurve":"curve-fi-ydai-yusdc-yusdt-ytusd","hebe":"hebeblock","hvt":"hirevibes","cbet":"cbet-token","glov":"glovecoin","ship":"secured-ship","tea":"tea-token","akita":"akita-inu","coal":"coalculus","pdai":"prime-dai","odc":"odinycoin","stbz":"stabilize","agvc":"agavecoin","sushik":"oec-sushi","mnstp":"moon-stop","layerx":"unilayerx","clm":"coinclaim","dpc":"dappcents","loto":"lotoblock","eubc":"eub-chain","dph":"digipharm","sloth":"slothcoin","xtnc":"xtendcash","trump":"trumpcoin","hxy":"hex-money","newton":"newtonium","4art":"4artechnologies","kanda":"telokanda","lburst":"loanburst","orbi":"orbicular","gc":"galaxy-wallet","yfiig":"yfii-gold","sfg":"s-finance","gera":"gera-coin","wtn":"waletoken","hatch":"hatch-dao","zupi":"zupi-coin","curry":"curryswap","arnxm":"armor-nxm","pbase":"polkabase","xwc":"whitecoin","tknt":"tkn-token","koel":"koel-coin","love":"lovepot-token","lbet":"lemon-bet","fcr":"fromm-car","spk":"sparks","psk":"poolstake","stxem":"stakedxem","lbd":"linkbased","ghostface":"ghostface","ethback":"etherback","brwn":"browncoin","ndsk":"nadeshiko","supdog":"superdoge","pegs":"pegshares","blok":"bloktopia","therocks":"the-rocks","ample":"ampleswap","blp":"bullperks","uba":"unbox-art","pass":"passport-finance","vsxp":"venus-sxp","btzc":"beatzcoin","dfgl":"defi-gold","awg":"aurusgold","whalefarm":"whalefarm","carr":"carnomaly","safelight":"safelight","wlvr":"wolverine","minty":"minty-art","ns":"nodestats","vfil":"venus-fil","duk+":"dukascoin","atusd":"aave-tusd-v1","stxym":"stakedxym","nplc":"plus-coin","alink":"aave-link-v1","telos":"telos-coin","jm":"justmoney","safelogic":"safelogic","mochi":"mochiswap","gmci":"game-city","bgl":"bitgesell","shpp":"shipitpro","xrge":"rougecoin","gol":"gogolcoin","safetoken":"safetoken","bspay":"brosispay","stream":"zilstream","eswap":"eswapping","thr":"thorecoin","esti":"easticoin","momo":"momo-protocol","ato":"eautocoin","btnt":"bitnautic","invest":"investdex","gpunks20":"gan-punks","krill":"polywhale","hmnc":"humancoin-2","scy":"synchrony","ffa":"cryptofifa","vxrp":"venus-xrp","btym":"blocktyme","dobe":"dobermann","darthelon":"darthelon","gift":"gift-coin","scurve":"lp-scurve","safetesla":"safetesla","jind":"jindo-inu","apet":"ape-token","zoot":"zoo-token","hua":"chihuahua","tkinu":"tsuki-inu","moonghost":"moonghost","e2p":"e2p-group","lovedoge":"love-doge","chibi":"chibi-inu","shibsc":"shiba-bsc","beers":"moonbeers","home":"home-coin","cenx":"centralex","dogeback":"doge-back","greenmars":"greenmars","ds":"destorage","cazi":"cazi-cazi","coco":"coco-swap","kpop":"kpop-coin","hub":"minter-hub","kishu":"kishu-inu","cool20":"cool-cats","newb":"new-token","$weeties":"sweetmoon","abc":"abc-chain","labra":"labracoin","homt":"hom-token","lemo":"lemochain","aipi":"aipichain","mntt":"moontrust","buffdoge":"buff-doge","gtn":"glitzkoin","sbear":"yeabrswap","pchart":"polychart","karen":"karencoin","tenshi":"tenshi","lov":"lovechain","eost":"eos-trust","greatape":"great-ape","slnt":"salanests","xvx":"mainfinex","grlc":"garlicoin","ez":"easyfi","mybtc":"mybitcoin","au":"autocrypto","rakuc":"raku-coin","bravo":"bravo-coin","stc":"starchain","gmy":"gameology","agusd":"aave-gusd","aaave":"aave-aave","50k":"50k","boxer":"boxer-inu","frag":"game-frag","vdot":"venus-dot","nd":"neverdrop","kich":"kichicoin","daddyfeg":"daddy-feg","defc":"defi-coin","gator":"gatorswap","cbr":"cybercoin","chaincade":"chaincade","babycake":"baby-cake","rth":"rotharium","tcub":"tiger-cub","shon":"shontoken","safearn":"safe-earn","cybrrrdoge":"cyberdoge","boxerdoge":"boxerdoge","kirby":"kirby-inu","petg":"pet-games","babylink":"baby-link","ninja":"ninja-protocol","tbe":"trustbase","bunnycake":"bunnycake","myfi":"myfichain","gsmt":"grafsound","burnx20":"burnx20","daddycake":"daddycake","aftrbck":"afterback","surge":"surge-inu","micn":"mindexnew","pbs":"pbs-chain","cfxt":"chainflix","dei":"dei-token","dara":"immutable","bay":"cryptobay","yak":"yield-yak","btcr":"bitcurate","exen":"exentoken","murphy":"murphycat","aftrbrn":"afterburn","gre":"greencoin","xnl":"chronicle","fegn":"fegnomics","idl":"idl-token","flokis":"flokiswap","scan":"scan-defi","inftee":"infinitee","shillmoon":"shillmoon","mbm":"mbm-token","sugar":"sugarchain","pets":"polkapet-world","srv":"zilsurvey","lsp":"lumenswap","dm":"dogematic","intx":"intexcoin","looks":"lookscoin","hejj":"hedge4-ai","okt":"oec-token","ramen":"ramenswap","asn":"ascension","arap":"araplanet","dogezilla":"dogezilla","dui":"dui-token","bash":"luckchain","sch":"schillingcoin","panda":"hashpanda","asuka":"asuka-inu","dogepepsi":"dogepepsi","luto":"luto-cash","asunainu":"asuna-inu","bitb":"bean-cash","orb":"orbitcoin","aquagoat":"aquagoat-old","creva":"crevacoin","magicdoge":"magicdoge","dogedash":"doge-dash","bun":"bunnycoin","money":"moneytree","avai":"orca-avai","gdai":"geist-dai","mcs":"mcs-token","pte":"peet-defi","geth":"guarded-ether","wolverinu":"wolverinu","gftm":"geist-ftm","scare":"scarecrow","marvin":"marvininu","tsct":"transient","lilfloki":"lil-floki","nsc":"nftsocial","pyro":"pyro-network","misty":"misty-inu","rbx":"rbx-token","nokn":"nokencoin","exm":"exmo-coin","btsc":"beyond-the-scene-coin","smak":"smartlink","winry":"winry-inu","onepiece":"one-piece","z2o":"zerotwohm","zptc":"zeptagram","nttc":"navigator","sshld":"sunshield","flokiloki":"flokiloki","bxr":"blockster","ginspirit":"ginspirit","enno":"enno-cash","hlink":"hydrolink","idm":"idm-token","sway":"clout-art","pulsedoge":"pulsedoge","robin":"nico-robin-inu","xld":"stellar-diamond","shibarmy":"shib-army","flom":"flokimars","mtg":"magnetgold","gemit":"gemit-app","info":"infomatix","oje":"oje-token","ons":"one-share","xaea12":"x-ae-a-12","wndg95":"windoge95","bunnygirl":"bunnygirl","sob":"solalambo","naal":"ethernaal","kaiba":"kaiba-inu","place":"place-war","babel":"babelfish","binosaurs":"binosaurs","whe":"worthwhile","dt3":"dreamteam3","bglg":"big-league","dogedealer":"dogedealer","banker":"bankerdoge","cdrop":"cryptodrop","lowb":"loser-coin","cfg":"centrifuge","jt":"jubi-token","genx":"genx-token","lnko":"lnko-token","chex":"chex-token","tuber":"tokentuber","sa":"superalgos","os76":"osmiumcoin","agte":"agronomist","webn":"web-innovation-ph","hcs":"help-coins","spacetoast":"spacetoast","micro":"microdexwallet","tp3":"token-play","osc":"oasis-city","eux":"dforce-eux","fang":"fang-token","ctc":"community-coin-2","zlf":"zillionlife","sakura":"sakura-inu","tking":"tiger-king","high":"highstreet","vert":"polyvertex","pakk":"pakkun-inu","prz":"prize-coin","ai":"flourishing-ai-token","omm":"omm-tokens","moonlyfans":"moonlyfans","snj":"sola-ninja","horny":"horny-doge","csm":"citystates-medieval","rzn":"rizen-coin","sabaka inu":"sabaka-inu","colx":"colossuscoinxt","dogefather":"dogefather-ecosystem","gzx":"greenzonex","carbo":"carbondefi","shibazilla":"shibazilla","dandy":"dandy","babycuban":"baby-cuban","uvu":"ccuniverse","ethsc":"ethereumsc","tigerbaby":"tiger-baby","dogs":"doggy-swap","sinu":"sasuke-inu","pitqd":"pitquidity","tiim":"triipmiles","speed":"speed-coin","babylondon":"babylondon","fng":"fungie-dao","hyperboost":"hyperboost","sicx":"staked-icx","bhunt":"binahunter","dscp":"disciplina-project-by-teachmeplease","rupee":"hyruleswap","bloc":"bloc-money","opcat":"optimuscat","catge":"catge-coin","bboxer":"baby-boxer","pod":"payment-coin","comfy":"comfytoken","littledoge":"littledoge","btsucn":"btsunicorn","mexc":"mexc-token","loop":"loop-token","shitzuinu":"shitzu-inu","soba":"soba-token","xno":"xeno-token","sayan":"saiyan-inu","grow":"growing-fi","xgold":"xgold-coin","krkn":"the-kraken","cl":"coinlancer","robo":"robo-token","zcnox":"zcnox-coin","p2e":"plant2earn","piza":"halfpizza","good":"good-token","nftsol":"nft-solpad","zabaku":"zabaku-inu","pirateboy":"pirate-boy","ntb":"tokenasset","trail":"polkatrail","elite":"ethereum-lite","ncat":"nyan-cat","wnd":"wonderhero","pinkpanda":"pink-panda","dogerkt":"dogerocket","espro":"esportspro","lbr":"little-bunny-rocket","tronx":"tronx-coin","clion":"cryptolion","levl":"levolution","krakbaby":"babykraken","bole":"bole-token","boomshiba":"boom-shiba","fiesta":"fiestacoin","tfloki":"terrafloki","when":"when-token","clown":"clown-coin","sanshu":"sanshu-inu","mbc":"microbitcoin","iown":"iown","give":"give-global","sprtz":"spritzcoin","euro":"euro-token-2","dapp":"dappercoin","quickchart":"quickchart","bsr":"binstarter","dregg":"dragon-egg","trax":"privi-trax","aklima":"aklima","xtra":"xtra-token","mrc":"meroechain","mommydoge":"mommy-doge","echo":"token-echo","gb":"good-bridging","brze":"breezecoin","cntm":"connectome","minifloki":"mini-floki","mverse":"maticverse","flokim":"flokimooni","boruto":"boruto-inu","pornrocket":"pornrocket","msk":"mask-token","saga":"cryptosaga","bhd":"bitcoin-hd","qac":"quasarcoin","hgc":"higamecoin","bidog":"binancedog","icebrk":"icebreak-r","blinky":"blinky-bob","mao":"mao-zedong","hod":"hodooi-com","hum":"humanscape","mad":"make-a-difference-token","fuze":"fuze-token","shard":"shard","jenn":"tokenjenny","nezuko":"nezuko-inu","nuke":"nuke-token","bec":"betherchip","kelpie":"kelpie-inu","ltn":"life-token","edgelon":"lorde-edge","splink":"space-link","mooner":"coinmooner","n8v":"wearesatoshi","puppy":"puppy-token","slab":"slink-labs","paul":"paul-token","yoco":"yocoinyoco","brmv":"brmv-token","undo":"undo-token","ysoy":"ysoy-chain","vlink":"venus-link","dawgs":"spacedawgs","smoke":"the-smokehouse-finance","nxl":"next-level","usds":"stableusd","cyberd":"cyber-doge","syfi":"soft-yearn","joke":"jokes-meme","itam":"itam-games","evny":"evny-token","delos":"delos-defi","ralph":"save-ralph","ebird":"early-bird","mgp":"micro-gaming-protocol","br2.0":"bullrun2-0","smoo":"sheeshmoon","lasereyes":"laser-eyes","vbeth":"venus-beth","drep":"drep-new","spacedoge":"space-doge","raid":"raid-token","mmm7":"mmmluckup7","pun":"cryptopunt","ctcn":"contracoin","c4t":"coin4trade","mob":"mobilecoin","oneuni":"stable-uni","cron":"cryptocean","pgnt":"pigeon-sol","spy":"satopay-yield-token","pkoin":"pocketcoin","kissmymoon":"kissmymoon","chiba":"cate-shiba","carma":"carma-coin","killua":"killua-inu","sundae":"sundaeswap","ivy":"ivy-mining","brbg":"burgerburn","hrb":"herobattle","zaif":"zaigar-finance","btrst":"braintrust","potterinu":"potter-inu","romeodoge":"romeo-doge","nva":"neeva-defi","xpn":"pantheon-x","lunr":"lunr-token","anchor":"anchorswap","shibu":"shibu-life","uze":"uze-token","shico":"shibacorgi","petal":"bitflowers","ccar":"cryptocars","fscc":"fisco","icr":"intercrone","co2":"collective","mac":"machinecoin","ypanda":"yieldpanda","kill":"memekiller","ygoat":"yield-goat","joker":"joker-token","zarh":"zarcash","trv":"trustverse","abi":"apebullinu","tako":"tako-token","cennz":"centrality","shark":"polyshark-finance","shi3ld":"polyshield","jgn":"juggernaut","lmbo":"when-lambo","dvc":"dragonvein","pkd":"petkingdom","dtube":"dtube-coin","dfn":"difo-network","snoge":"snoop-doge","ktv":"kmushicoin","matrix":"matrixswap","policedoge":"policedoge","ltfg":"lightforge","dnc":"danat-coin","xpnet":"xp-network","afk":"idle-cyber","mfm":"moonfarmer","udai":"unagii-dai","rdoge":"robin-doge","yfi3":"yfi3-money","shibm":"shiba-moon","vbusd":"venus-busd","vusdt":"venus-usdt","zabu":"zabu-token","plc":"pluton-chain","leek":"leek-token","scm":"simulacrum","chs":"chainsquare","gsonic":"gold-sonic","minishiba":"mini-shiba","elt":"elite-swap","jaguar":"jaguarswap","qhc":"qchi-chain","nfty":"nifty-token","balls":"balls-health","refraction":"refraction","coral":"coral-swap","ebsp":"ebsp-token","kim":"king-money","hyp":"hyperstake","eqt":"equitrader","smartworth":"smartworth","hera":"hero-arena","chinu":"chubby-inu","wiz":"bluewizard","cdoge":"chubbydoge","rocketbusd":"rocketbusd","tlx":"the-luxury","sv7":"7plus-coin","plentycoin":"plentycoin","roe":"rover-coin","cent":"centurion-inu","piratecoin\u2620":"piratecoin","nfl":"nftlegends","pshibax":"pumpshibax","ipegg":"parrot-egg","pcws":"polycrowns","metax":"metaversex","sdo":"safedollar","hshiba":"huskyshiba","basid":"basid-coin","hash":"hash-token","imi":"influencer","bwx":"blue-whale","abcd":"abcd-token","islainu":"island-inu","bgo":"bingo-cash","light":"lightning-protocol","kfan":"kfan-token","vusdc":"venus-usdc","gpkr":"gold-poker","sfex":"safelaunch","shadow":"shadowswap","$aow":"art-of-war","mshiba":"meta-shiba","hare":"hare-token","grv":"gravitoken","yland":"yearn-land","fto":"futurocoin","moonrabbit":"moonrabbit-2","cp3r":"compounder","enrg":"energycoin","waroo":"superwhale","brcp":"brcp-token","gogeta":"gogeta-inu","thunderbnb":"thunderbnb","gami":"gami-world","robet":"robet-coin","xagc":"agrocash-x","mima":"kyc-crypto","bsb":"bitcoin-sb","nvx":"novax-coin","usdsp":"usd-sports","garuda":"garudaswap","dmoon":"dragonmoon","divine":"divine-dao","rcube":"retro-defi","vync":"vynk-chain","onefil":"stable-fil","$ninjadoge":"ninja-doge","cacti":"cacti-club","omax":"omax-token","onemph":"stable-mph","hora":"hora","bynd":"beyondcoin","yuang":"yuang-coin","bonuscake":"bonus-cake","cfl":"cryptoflow","xpt":"cryptobuyer-token","pome":"pomerocket","gatsbyinu":"gatsby-inu","tokc":"tokyo","xpc":"experience-chain","fins":"fins-token","pxl":"piction-network","doos":"doos-token","xre":"xre-global","ybear":"yield-bear","fgsport":"footballgo","trib":"contribute","alm":"allium-finance","cosm":"cosmo-coin","grimex":"spacegrime","ryoshimoto":"ryoshimoto","saveanimal":"saveanimal","sne":"strongnode","daddydoge":"daddy-doge","arrb":"arrb-token","flokielon":"floki-elon","kombai":"kombai-inu","jack":"jack-token","bkk":"bkex-token","chli":"chilliswap","cerberus":"gocerberus","grn":"dascoin","plugcn":"plug-chain","r0ok":"rook-token","usdb":"usd-bancor","pp":"pension-plan","scorgi":"spacecorgi","mwd":"madcredits","booty":"pirate-dice","hyfi":"hyper-finance","akm":"cost-coin","jcc":"junca-cash","ichigo":"ichigo-inu","pmp":"pumpy-farm","btcbam":"bitcoinbam","mewtwo":"mewtwo-inu","yum":"yumyumfarm","wdt":"voda-token","udoge":"uncle-doge","sakata":"sakata-inu","vegi":"vegeta-inu","safeinvest":"safeinvest","fmta":"fundamenta","beaglecake":"beaglecake","jic":"joorschain","cyt":"coinary-token","daddyshiba":"daddyshiba","dink":"dink-donk","yea":"yeafinance","gut":"guitarswap","bill":"bill-token","invi":"invi-token","safeicarus":"safelcarus","flofe":"floki-wife","rr":"rug-relief","alloy":"hyperalloy","yfms":"yfmoonshot","bbnana":"babybanana","cmx":"caribmarsx","dmusk":"dragonmusk","gcnx":"gcnx-token","fundx":"funder-one","dune":"dune-token","tons":"thisoption","slyr":"ro-slayers","dass":"dashsports","sans":"sans-token","cicc":"caica-coin","db":"darkbuild-v2","kxc":"kingxchain","tune":"tune-token","solc":"solcubator","euru":"upper-euro","divo":"divo-token","thundereth":"thundereth","mongocm":"mongo-coin","shiryo-inu":"shiryo-inu","awf":"alpha-wolf","crop":"farmerdoge","rotts":"rottschild","ddr":"digi-dinar","dmgk":"darkmagick","smile":"smile-token","babyethv2":"babyeth-v2","kpc":"koloop-basic","collar":"collar-dobe-defender","arbimatter":"arbimatter","vprc":"vaperscoin","swole":"swole-doge","ogc":"onegetcoin","ktr":"kutikirise","dogedrinks":"dogedrinks","woof":"shibance-token","che":"cherryswap","pearl":"pearl-finance","lrg":"largo-coin","pist":"pist-trust","ulti":"ulti-arena","icicb":"icicb-coin","pfzr":"pfzer-coin","pgn":"pigeoncoin","crex":"crex-token","magiccake":"magic-cake","csc":"curio-stable-coin","expo":"online-expo","rmoon":"rocketmoon","lce":"lance-coin","kgw":"kawanggawa","grw":"growthcoin","carbon":"carbon-finance","medic":"medic-coin","ami":"ammyi-coin","pai":"project-pai","prot":"prostarter-token","dyor":"dyor-token","vx":"vitex","nah":"strayacoin","seek":"rugseekers","cosmic":"cosmicswap","ecpn":"ecpntoken","bnox":"blocknotex","babytrump":"baby-trump","bcnt":"bincentive","djbz":"daddybezos","yge":"yu-gi-eth","bullaf":"bullish-af","dain":"dain-token","sheep":"sheeptoken","harta":"harta-tech","dint":"dint-token","she":"shinechain","prdetkn":"pridetoken","elama":"elamachain","g-fi":"gorilla-fi","rain":"rain-network","tth":"tetrahedra","eph":"epochtoken","vdoge":"venus-doge","rd":"round-dollar","xmtl":"novaxmetal","astrogold":"astro-gold","hokage":"hokage-inu","dangermoon":"dangermoon","findsibby":"findshibby","minisoccer":"minisoccer","nce":"new-chance","phn":"phillionex","big":"thebigcoin","gdp":"gold-pegas","sswim":"shiba-swim","evoc":"evocardano","insta":"instaraise","bff":"bitcoffeen","fl":"freeliquid","lof":"lonelyfans","phiba":"papa-shiba","kaby":"kaby-arena","hec":"hector-dao","invc":"investcoin","gm":"gmcoin","skyx":"skyx-token","myc":"myteamcoin","hedg":"hedgetrade","hlth":"hlth-token","noahark":"noah-ark","hungry":"hungrybear","chihua":"chihua-token","usdg":"usd-gambit","butter":"butter-token","shade":"shade-cash","hope":"hope-token","ggive":"globalgive","hrld":"haroldcoin","fbnb":"foreverbnb","mzr":"maze-token","year":"lightyears","$lordz":"meme-lordz","erc":"europecoin","yfis":"yfiscurity","deva":"deva-token","eros":"eros-token","kishubaby":"kishu-baby","elet":"ether-legends","mfloki":"mini-floki-shiba","dtop":"dhedge-top-index","tvnt":"travelnote","daa":"double-ace","mgpc":"magpiecoin","mfy":"mifty-swap","spook":"spooky-inu","bnm":"binanomics","gcx":"germancoin","bodav2":"boda-token","frinu":"frieza-inu","cbbn":"cbbn-token","credit":"credit","grill":"grill-farm","polt":"polkatrain","hpad":"harmonypad","willie":"williecoin","kt":"kuaitoken","tavitt":"tavittcoin","txt":"taxa-token","sdog":"small-doge","drap":"doge-strap","autz":"autz-token","wdr":"wider-coin","erth":"erth-token","yta":"yottacoin","pixel":"pixelverse","frmx":"frmx-token","cft":"coinbene-future-token","bhiba":"baby-shiba","ski":"skillchain","miners":"minersdefi","oink":"oink-token","bsg":"basis-gold","coic":"coic","ccash":"campuscash","konj":"konjungate","fndz":"fndz-token","cleanocean":"cleanocean","babykishu":"baby-kishu","ueth":"unagii-eth","xbrt":"bitrewards","bkita":"baby-akita","dogg":"dogg-token","lvh":"lovehearts","dmch":"darma-cash","safecookie":"safecookie","xslr":"novaxsolar","flokigold":"floki-gold","sovi":"sovi-token","hptf":"heptafranc","cng":"cng-casino","gwbtc":"geist-wbtc","stkr":"staker-dao","floor":"punk-floor","ttn":"titan-coin","rwn":"rowan-coin","cyf":"cy-finance","stfiro":"stakehound","kongz20":"cyberkongz","microshib":"microshiba","frozen":"frozencake","xbtc":"synthetic-btc","cmm":"commercium","gusdc":"geist-usdc","babymatic":"baby-matic","soil":"synth-soil","clr":"color","torj":"torj-world","xeth":"synthetic-eth","omt":"onion-mixer","stkd":"stakd-token","ot-ethusdc-29dec2022":"ot-eth-usdc","ssn":"supersonic-finance","pint":"pub-finance","kip":"khipu-token","sprx":"sprint-coin","dt":"dcoin-token","genius":"genius-coin","rwsc":"rewardscoin","ride":"ride-my-car","emoji":"emojis-farm","steak":"steaks-finance","svc":"silvercashs","budg":"bulldogswap","nimbus":"shiba-cloud","tsa":"teaswap-art","xpd":"petrodollar","idx":"index-chain","trxc":"tronclassic","mveda":"medicalveda","hbd":"hive_dollar","gls":"glass-chain","shibin":"shibanomics","wkcs":"wrapped-kcs","wsc":"wesing-coin","bkt":"blocktanium","elnc":"eloniumcoin","emax":"ethereummax","proud":"proud-money","riot":"riot-racers","dhold":"diamondhold","bnj":"binjit-coin","hachiko":"hachiko-inu","limon":"limon-group","mimir":"mimir-token","footie":"footie-plus","wswap":"wallet-swap","aurora":"arctic-finance","arbys":"arbys","dfm":"defi-on-mcw","btp":"bitcoin-pay","trr":"terran-coin","pal":"palestine-finance","psychodoge":"psycho-doge","sla":"superlaunch","iog":"playgroundz","ytho":"ytho-online","bmbo":"bamboo-coin","drct":"ally-direct","neko":"neko-network","shibarocket":"shibarocket","expr":"experiencer","lsilver":"lyfe-silver","orbyt":"orbyt-token","hiz":"hiz-finance","fund":"unification","nc":"nayuta-coin","storm":"storm-token","tasty":"tasty-token","omc":"ormeus-cash","shibaw":"shiba-watch","tshare":"tomb-shares","daddyshark":"daddy-shark","wxrp":"wrapped-xrp","beast":"cryptobeast","live":"tronbetlive","vd":"vindax-coin","esz":"ethersportz","cakita":"chubbyakita","evcoin":"everestcoin","mirai":"mirai-token","ref":"ref-finance","hxn":"havens-nook","ebso":"eblockstock","ctb":"cointribute","day":"chronologic","marsm":"marsmission","cbp":"cashbackpro","shokk":"shikokuaido","starc":"star-crunch","wdai":"wrapped-dai","balpac":"baby-alpaca","mrx":"linda","tshiba":"terra-shiba","gam":"gamma-token","kebab":"kebab-token","but":"bitup-token","imagic":"imagictoken","sloki":"super-floki","ert":"eristica","chtrv2":"coinhunters","rip":"fantom-doge","earth":"earth-token","bshib":"buffedshiba","hmc":"harmonycoin","hip":"hippo-token","wjxn":"jax-network","jpyn":"wenwen-jpyn","shibmerican":"shibmerican","babydefido":"baby-defido","tankz":"cryptotankz","shibaramen":"shiba-ramen","frkt":"frakt-token","god":"bitcoin-god","boomb":"boombaby-io","chiro":"chihiro-inu","tfg1":"energoncoin","bath":"battle-hero","zombie":"zombie-farm","bnxx":"bitcoinnexx","scoobi":"scoobi-doge","vcash":"vcash-token","shell":"shell-token","lecliente":"le-caliente","bunnyrocket":"bunnyrocket","grew":"green-world","fed":"fedora-gold","lilflokiceo":"lilflokiceo","doraemoninu":"doraemoninu","mpro":"manager-pro","cdz":"cdzexchange","bih":"bithostcoin","zbk":"zbank-token","plenty":"plenty-dao","bvnd":"binance-vnd","cadax":"canada-coin","pnft":"pawn-my-nft","bks":"baby-kshark","mti":"mti-finance","etnx":"electronero","sya":"sya-x-flooz","boofi":"boo-finance","krz":"kranz-token","finn":"huckleberry","yokai":"yokai-money","lsv":"litecoin-sv","collt":"collectible","fmk":"fawkes-mask","raff":"rafflection","dlta":"delta-theta","tlnt":"talent-coin","auctionk":"oec-auction","payn":"paynet-coin","batdoge":"the-batdoge","kshiba":"kawai-shiba","wfct":"wrapped-fct","snb":"synchrobitcoin","bgx":"bitcoingenx","actn":"action-coin","flokin":"flokinomics","mech":"mech-master","dcnt":"decenturion","wncg":"wrapped-ncg","famous":"famous-coin","tusk":"tusk-token","dhx":"datahighway","ssv":"ssv-network","btcmz":"bitcoinmono","sweet":"honey-token","l1t":"lucky1token","slvt":"silvertoken","heo":"helios-cash","life":"life-crypto","kimj":"kimjongmoon","grind":"grind-token","mason":"mason-token","glxc":"galaxy-coin","hbn":"hobonickels","anft":"artwork-nft","leash":"leash","dynamo":"dynamo-coin","cf":"californium","crdao":"crunchy-dao","energyx":"safe-energy","chiv":"chiva-token","travel":"travel-care","nexus":"nexus-token","rtc":"read-this-contract","flt":"fluttercoin","hybn":"hey-bitcoin","biden":"biden","todinu":"toddler-inu","shak":"shakita-inu","jshiba":"jomon-shiba","pox":"pollux-coin","pbom":"pocket-bomb","per":"per-project","yfarm":"yfarm-token","bccx":"bitconnectx-genesis","chopper":"chopper-inu","supra":"supra-token","cousindoge":"cousin-doge","poodl":"poodle","gemg":"gemguardian","kusd":"kolibri-usd","pig":"pig-finance","mello":"mello-token","tomato":"tomatotoken","navi":"natus-vincere-fan-token","game":"gamecredits","ikura":"ikura-token","shibboo":"shibboo-inu","srsb":"sirius-bond","tractor":"tractor-joe","safebtc":"safebitcoin","porte":"porte-token","vikings":"vikings-inu","arena":"arena-token","rboys":"rocket-boys","ttb":"tetherblack","treep":"treep-token","cstar":"celostarter","tom":"tom-finance","goldyork":"golden-york","q8e20":"q8e20-token","gbpu":"upper-pound","pbk":"profit-bank","ghoul":"ghoul-token","cbank":"crypto-bank","gfnc":"grafenocoin-2","dlaunch":"defi-launch","atmup":"automaticup","cfxq":"cfx-quantum","bridge":"multibridge","ksr":"kickstarter","hdn":"hidden-coin","pdoge":"pocket-doge","tcat":"top-cat-inu","wokt":"wrapped-okt","bishoku":"bishoku-inu","fbt":"fanbi-token","sbrt":"savebritney","nyc":"newyorkcoin","drg":"dragon-coin","simba":"simba-token","digs":"digies-coin","vollar":"vollar","babyyooshi":"baby-yooshi","arcanineinu":"arcanineinu","entc":"enterbutton","btd":"bolt-true-dollar","algop":"algopainter","bpeng":"babypenguin","witch":"witch-token","nutsg":"nuts-gaming","togashi":"togashi-inu","plock":"pancakelock","axsushi":"aave-xsushi","dogdefi":"dogdeficoin","smrtr":"smart-coin-smrtr","rocketshib":"rocket-shib","lnc":"linker-coin","shwa":"shibawallet","aws":"aurus-silver","xxp":"xx-platform","gamingdoge":"gaming-doge","nst":"nft-starter","bnbd":"bnb-diamond","$caseclosed":"case-closed","wolf":"moonwolf-io","tsc":"trustercoin","fetish":"fetish-coin","solace":"solace-coin","crude":"crude-token","shinu":"shinigami-inu","genes":"genes-chain","kitty dinger":"schrodinger","minx":"innovaminex","ghd":"giftedhands","kp0r":"kp0rnetwork","pulse":"pulse-token","dxy":"dxy-finance","burger":"burger-swap","dnd":"diamond-dnd","golf":"golfrochain","cca":"counos-coin","kili":"kilimanjaro","wleo":"wrapped-leo","blosm":"blossomcoin","mandi":"mandi-token","pekc":"peacockcoin-eth","brilx":"brilliancex","fred":"fredenergy","vida":"vidiachange","remit":"remita-coin","gdefi":"global-defi","boot":"bootleg-nft","aeth":"aave-eth-v1","hyd":"hydra-token","rxs":"rune-shards","zeus":"zuescrowdfunding","mst":"idle-mystic","tsla":"tessla-coin","carb":"carbon-labs","summit":"summit-defi","cbs3":"crypto-bits","gpyx":"pyrexcoin","xkr":"kryptokrona","brb":"rabbit-coin","fibo":"fibo-token","death":"death-token","klb":"black-label","flvr":"flavors-bsc","$sshiba":"super-shiba","cbix7":"cbi-index-7","babybitc":"babybitcoin","cpx":"centerprime","$kei":"keisuke-inu","beets":"beethoven-x","pola":"polaris-share","bcoin":"bomber-coin","isle":"island-coin","dfe":"dfe-finance","tbake":"bakerytools","ewit":"wrapped-wit","bdcc":"bitica-coin","scb":"spacecowboy","roningmz":"ronin-gamez","fstar":"future-star","lyca":"lyca-island","granx":"cranx-chain","sbgo":"bingo-share","mkoala":"koala-token","kenny":"kenny-token","berserk":"berserk-inu","babycasper":"babycasper","dweb":"decentraweb","bwrx":"wrapped-wrx","bullish":"bullishapes","raya":"raya-crypto","aqu":"aquarius-fi","carom":"carillonium","planets":"planetwatch","erk":"eureka-coin","ttm":"tothe-moon","wpkt":"wrapped-pkt","bbc":"bigbang-core","xchf":"cryptofranc","send":"social-send","gfusdt":"geist-fusdt","scoot":"scootercoin","gorilla inu":"gorilla-inu","rugbust":"rug-busters","gummie":"gummy-beans","pikachu":"pikachu-inu","harold":"harold-coin","fc":"futurescoin","notsafemoon":"notsafemoon","808ta":"808ta-token","panther":"pantherswap","msd":"moneydefiswap","oh":"oh-finance","casper":"casper-defi","gart":"griffin-art","kst":"ksm-starter","success":"success-inu","stark":"stark-chain","spkl":"spookeletons-token","tzki":"tsuzuki-inu","chlt":"chellitcoin","ddy":"daddyyorkie","baked":"baked-token","tkc":"turkeychain","ucr":"ultra-clear","eurn":"wenwen-eurn","fcb":"forcecowboy","c2o":"cryptowater","lox":"lox-network","bidcom":"bidcommerce","f1c":"future1coin","gl":"green-light","lbtc":"lightning-bitcoin","lnt":"lottonation","epay":"ethereumpay","uzumaki":"uzumaki-inu","foreverfomo":"foreverfomo","viking":"viking-legend","mario":"super-mario","shiborg":"shiborg-inu","ibz":"ibiza-token","dili":"d-community","dcy":"dinastycoin","jackr":"jack-raffle","cun":"currentcoin","gmyx":"gameologyv2","amy":"amy-finance","alc":"alrightcoin","loud":"loud-market","thunder":"minithunder","pkp":"pikto-group","svr":"sovranocoin","gnto":"goldenugget","silva":"silva-token","baw":"wab-network","wgp":"w-green-pay","spookyshiba":"spookyshiba","shkooby":"shkooby-inu","wone":"wrapped-one","hwi":"hawaii-coin","codeo":"codeo-token","medi":"mediconnect","babyharmony":"babyharmony","ddn":"data-delivery-network","crg":"cryptogcoin","saitama":"saitama-inu","ack":"acknoledger","gamer":"gamestation","f9":"falcon-nine","zln":"zillioncoin","shiko":"shikoku-inu","munch":"munch-token","mtcl":"maticlaunch","dgc":"digitalcoin","tcg2":"tcgcoin-2-0","bscm":"bsc-memepad","yff":"yff-finance","shill":"shillit-app","honor":"honor-token","dwr":"dogewarrior","mrty":"morty-token","htdf":"orient-walt","kccm":"kcc-memepad","yoo":"yoo-ecology","bouje":"bouje-token","pyram":"pyram-token","fshib":"floki-shiba","mashima":"mashima-inu","ndoge":"naughtydoge","chakra":"bnb-shinobi","xqc":"quras-token","fans":"unique-fans","orc":"oracle-system","uusd":"youves-uusd","etf":"entherfound","xrpc":"xrp-classic","hland":"hland-token","wnce":"wrapped-nce","wemix":"wemix-token","wbnb":"wbnb","pumpkin":"pumpkin-inu","kitsu":"kitsune-inu","hg":"hygenercoin","bfk":"babyfortknox","cbucks":"cryptobucks","dragon":"dragon-finance","cmd":"comodo-coin","haven":"haven-token","rpc":"ronpaulcoin","masterchef2":"masterchef2","bsatoshi":"babysatoshi","wana":"wanaka-farm","svt":"spacevikings","kafe":"kukafe-finance","pkmon":"polkamonster","bbtc":"binance-wrapped-btc","duel":"duel-network","dzar":"digital-rand","ivc":"invoice-coin","foreverpump":"forever-pump","wnear":"wrapped-near","vena":"vena-network","o1t":"only-1-token","bcf":"bitcoin-fast","mishka":"mishka-token","drm":"dodreamchain","fnb":"finexbox-token","sgo":"sportemon-go","pgx":"pegaxy-stone","prqboost":"parsiq-boost","kbtc":"klondike-btc","esrc":"echosoracoin","kper":"kper-network","incake":"infinitycake","mada":"mini-cardano","trt":"taurus-chain","cart":"cryptoart-ai","nkclc":"nkcl-classic","spmk":"space-monkey","sona":"sona-network","bg":"bagus-wallet","ryip":"ryi-platinum","game1":"game1network","exe":"8x8-protocol","prb":"premiumblock","brp":"bor-protocol","nxct":"xchain-token","biswap":"biswap-token","viagra":"viagra-token","elyx":"elynet-token","mcn":"moneta-verde","ryoshi":"ryoshis-vision","isikc":"isiklar-coin","crcl":"crowdclassic","gshiba":"gambler-shiba","kshib":"kaiken-shiba","empire":"empire-token","helth":"health-token","hepa":"hepa-finance","xcon":"connect-coin","aammdai":"aave-amm-dai","alkom":"alpha-kombat","safemoona":"safemoonavax","bsfm":"babysafemoon","one1inch":"stable-1inch","sora":"sorachancoin","shibco":"shiba-cosmos","juno":"juno-network","cgs":"crypto-gladiator-shards","nausicaa":"nausicaal-inu","dgstb":"dogestribute","vent":"vent-finance","mtr":"moonstarevenge-token","dreams":"dreams-quest","miyazaki":"miyazaki-inu","btllr":"betller-coin","atmc":"atomic-token","babypoo":"baby-poocoin","mcan":"medican-coin","mflokiada":"miniflokiada","thg":"thetan-arena","vcg":"vipcoin-gold","dinger":"dinger-token","lmao":"lmao-finance","loa":"loa-protocol","fcx":"fission-cash","grandpadoge":"grandpa-doge","epg":"encocoinplus","mau":"egyptian-mau","kokomo":"kokomo-token","ttx":"talent-token","phl":"placeh","bimp":"bimp-finance","loon":"loon-network","wxdai":"wrapped-xdai","xotl":"xolotl-token","peaq":"peaq-petwork","dixt":"dixt-finance","lumi":"luminos-mining-protocol","pube":"pube-finance","sephi":"sephirothinu","xdef2":"xdef-finance","trdc":"traders-coin","hokk":"hokkaido-inu-bsc","tym":"timelockcoin","skill":"cryptoblades","bcm":"bitcoinmoney","ymen":"ymen-finance","nsdx":"nasdex-token","babysaitama":"baby-saitama","carrot":"carrot-stable-coin","fbtc":"fire-bitcoin","dp":"digitalprice","mononoke-inu":"mononoke-inu","island":"island-doges","hellsing":"hellsing-inu","bia":"bilaxy-token","btct":"bitcoin-trc20","btap":"bta-protocol","gengar":"gengar-token","vers":"versess-coin","sats":"decus","olympic doge":"olympic-doge","bulk":"bulk-network","bbq":"barbecueswap","wbind":"wrapped-bind","bdc":"babydogecake","zttl":"zettelkasten","lnx":"linix","noel":"noel-capital","gogo":"gogo-finance","vlty":"vaulty-token","cnrg":"cryptoenergy","pele":"pele-network","cet":"coinex-token","usdu":"upper-dollar","fcn":"feichang-niu","haze":"haze-finance","cnz":"coinzo-token","yfed":"yfedfinance","cudl":"cudl-finance","wavax":"wrapped-avax","wlink":"wrapped-link","hate":"heavens-gate","puffs":"crypto-puffs","hymeteor":"hyper-meteor","mi":"mosterisland","bwc":"bongweedcoin","fia":"fia-protocol","auntie":"auntie-whale","1mil":"1million-nfts","form":"formation-fi","charix":"charix-token","mvt":"the-movement","ftmo":"fantom-oasis","waka":"waka-finance","deus":"deus-finance-2","blub":"blubber-coin","reaper":"reaper-token","wusdc":"wrapped-usdc","alucard":"baby-alucard","btcu":"bitcoin-ultra","metauniverse":"metauniverse","unr":"unirealchain","csmc":"cosmic-music","stonks":"stonks-token","zuz":"zuz-protocol","azt":"az-fundchain","bic":"bitcrex-coin","acr":"acreage-coin","blade":"blade","ror":"ror-universe","yuno":"yuno-finance","safehamsters":"safehamsters","tcx":"tron-connect","qb":"quick-bounty","ak":"astrokitty","etet":"etet-finance","orao":"orao-network","ubx":"ubix-network","balo":"balloon-coin","emrx":"emirex-token","$pulsar":"pulsar-token","wcc":"wincash-coin","skb":"sakura-bloom","aureusrh":"aureus-token","fridge":"fridge-token","soga":"soga-project","lsc":"live-swap-coin","grap":"grap-finance","yfib":"yfibalancer-finance","vics":"robofi-token","tst":"touch-social","bbdoge":"babybackdoge","htn":"heartnumber","dcw":"decentralway","yfos":"yfos-finance","fds":"fds","chm":"cryptochrome","yt":"cherry-token","cla":"candela-coin","load":"load-network","bbgc":"bigbang-game","tyt":"tianya-token","grpl":"grpl-finance-2","phoon":"typhoon-cash","hogl":"hogl-finance","fshn":"fashion-coin","wweth":"wrapped-weth","icnq":"iconiq-lab-token","wlt":"wealth-locks","wusdt":"wrapped-usdt","cann":"cannabiscoin","minisaitama":"mini-saitama","cord":"cord-finance","cold":"cold-finance","allbi":"all-best-ico","dragn":"astro-dragon","movd":"move-network","nac":"nowlage-coin","btca":"bitcoin-anonymous","vlad":"vlad-finance","dio":"deimos-token","wxbtc":"wrapped-xbtc","modx":"model-x-coin","tama":"tama-finance","csms":"cosmostarter","vpu":"vpunks-token","zep":"zeppelin-dao","xt":"xtcom-token","ww":"wayawolfcoin","earn$":"earn-network","spin":"spinada-cash","wbusd":"wrapped-busd","uc":"youlive-coin","kseed":"kush-finance","fgc":"fantasy-gold","avngrs":"babyavengers","saft":"safe-finance","xgc":"xiglute-coin","kodx":"king-of-defi","pngn":"spacepenguin","aleth":"alchemix-eth","fidenz":"fidenza-527","shibal":"shiba-launch","sdm":"sky-dog-moon","biot":"biopassport","toad":"toad-network","zild":"zild-finance","wick":"wick-finance","lift":"lift-kitchen","etna":"etna-network","wec":"whole-earth-coin","lqdr":"liquiddriver","cpan":"cryptoplanes","doge2":"dogecoin-2","qm":"quick-mining","epro":"ethereum-pro","catnip":"catnip-money","flns":"falcon-swaps","back":"back-finance","sid":"shield-token","jackpot":"jackpot-army","wcelo":"wrapped-celo","cbix-p":"cubiex-power","dota":"dota-finance","aurum":"alchemist-defi-aurum","siam":"siamese-neko","lpc":"lightpaycoin","evi":"eagle-vision","bnbx":"bnbx-finance","shiberus":"shiberus-inu","coop":"coop-network","mbgl":"mobit-global","hyper":"hyper-vault-nftx","t2l":"ticket2lambo","spat":"meta-spatial","avg":"avengers-bsc","buff":"buffalo-swap","goma":"goma-finance","wizard":"wizard-vault-nftx","lory":"yield-parrot","solape":"solape-token","sim":"simba-empire","bored":"bored-museum","lizard":"lizard-token","ahouse":"animal-house","deuro":"digital-euro","zeon":"zeon","sbank":"safebank-eth","bgb":"bitget-token","rak":"rake-finance","ats":"attlas-token","gcz":"globalchainz","mmm":"multimillion","moo":"moola-market","cba":"cabana-token","yamp":"yamp-finance","supd":"support-doge","sctk":"sparkle-coin","frostedcake":"frosted-cake","sphynx":"sphynx-token","rotten":"rotten-floki","bpcake":"baby-pancake","minifootball":"minifootball","airt":"airnft-token","tundra":"tundra-token","diah":"diarrheacoin","able":"able-finance","rainbowtoken":"rainbowtoken","dkt":"duelist-king","pangolin":"pangolinswap","povo":"povo-finance","kft":"knit-finance","fewgo":"fewmans-gold","silver":"silver-token","wiken":"project-with","kada":"king-cardano","kaiju":"kaiju-worlds","admc":"adamant-coin","mu":"mu-continent","rofi":"herofi-token","wxtc":"wechain-coin","rckt":"rocket-launchpad","fuma":"fuma-finance","ctft":"coin-to-fish","ejs":"enjinstarter","arti":"arti-project","gameone":"gameonetoken","cere":"cere-network","xfloki":"spacex-floki","mach":"mach","oasis":"project-oasis","erabbit":"elons-rabbit","qrt":"qrkita-token","kki":"kakashiinuv2","vetter":"vetter-token","qtech":"quattro-tech","dfktears":"gaias-tears","scusd":"scientix-usd","trolls":"trolls-token","dsg":"dinosaureggs","flokig":"flokigravity","lyptus":"lyptus-token","vfy":"verify-token","geldf":"geld-finance","zenx":"zenith-token","xcrs":"novaxcrystal","mich":"charity-alfa","yfix":"yfix-finance","hes":"hero-essence","vkt":"vankia-chain","tx":"transfercoin","ethbnt":"ethbnt","vnxlu":"vnx-exchange","quam":"quam-network","jus":"just-network","dddd":"peoples-punk","zefi":"zcore-finance","b1p":"b-one-payment","cousd":"coffin-dollar","neal":"neal","ppunks":"pumpkin-punks","phifiv2":"phifi-finance","flrs":"flourish-coin","xusd":"xdollar-stablecoin","duet":"duet-protocol","krn":"kryza-network","scale":"scale-finance","xtt-b20":"xtblock-token","risq":"risq-protocol","xag":"xrpalike-gene","yfive":"yfive-finance","asec":"asec-frontier","wiotx":"wrapped-iotex","mnme":"masternodesme","dogen":"dogen-finance","fpup":"ftm-pup-token","promise":"promise-token","gent":"genesis-token","idt":"investdigital","exenp":"exenpay-token","entrp":"hut34-entropy","gvc":"gemvault-coin","l2p":"lung-protocol","volts":"volts-finance","vinx":"vinx-coin-sto","dogpro":"dogstonks-pro","baby everdoge":"baby-everdoge","sbnk":"solbank-token","sone":"sone-finance","ctro":"criptoro-coin","ztnz":"ztranzit-coin","spw":"sparda-wallet","froge":"froge-finance","well":"wellness-token-economy","xftt":"synthetic-ftt","rasta":"rasta-finance","hep":"health-potion","fs":"fantomstarter","fsh":"fusion-heroes","redbuff":"redbuff-token","adf":"ad-flex-token","btbs":"bitbase-token","xnft":"xnft","spacexdoge":"doge-universe","ksf":"kesef-finance","mxf":"mixty-finance","xrm":"refine-medium","lnk":"link-platform","cgd":"coin-guardian","zomb":"antique-zombie-shards","zcon":"zcon-protocol","dogekongzilla":"dogekongzilla","vancii":"vanci-finance","exnx":"exenox-mobile","rkg":"rap-keo-group","pmc":"paymastercoin","xfc":"football-coin","hosp":"hospital-coin","bmt":"bmchain-token","ibchf":"iron-bank-chf","pand":"panda-finance","dbubble":"double-bubble","lwazi":"lwazi-project","ethos":"ethos-project","pxu":"phoenix-unity","ghsp":"ghospers-game","yrise":"yrise-finance","codex":"codex-finance","olympus":"olympus-token","ufc":"union-fair-coin","rewards":"rewards-token","ecgod":"eloncryptogod","iflt":"inflationcoin","swass":"swass-finance","momat":"moma-protocol","minidogepro":"mini-doge-pro","aammusdc":"aave-amm-usdc","prd":"predator-coin","dexi":"dexioprotocol","xns":"xeonbit-token","h2o":"ifoswap-token","hcc":"health-care-coin","reloaded":"doge-reloaded","bday":"birthday-cake","nmn":"99masternodes","klear":"klear-finance","sapphire":"sapphire-defi","dse":"dolphin-token-2","polly":"polly","btcx":"bitcoinx-2","lyd":"lydia-finance","dnf":"dnft-protocol","whole":"whitehole-bsc","vcoin":"tronvegascoin","shbl":"shoebill-coin","lem":"lemur-finance","bhig":"buckhath-coin","excl":"exclusivecoin","oac":"one-army-coin","hams":"space-hamster","cth":"crypto-hounds","wtk":"wadzpay-token","dogex":"dogehouse-capital","smbswap":"simbcoin-swap","foy":"fund-of-yours","bho":"bholdus-token","charizard":"charizard-inu","kids":"save-the-kids","gangstadoge":"gangster-doge","ocv":"oculus-vision","kphi":"kephi-gallery","sunrise":"the-sun-rises","etos":"eternal-oasis","bishufi":"bishu-finance","wnl":"winstars","dmtc":"dmtc-token","rebd":"reborn-dollar","pyx":"pyxis-network","plaza":"plaza-finance","evrt":"everest-token","uv":"unityventures","squeeze":"squeeze-token","hx":"hyperexchange","gns":"gains-network","torii":"torii-finance","agri":"agrinovuscoin","gil":"gilgamesh-eth","wzec":"wrapped-zcash","xczm":"xavander-coin","umc":"umbrellacoin","emont":"etheremontoken","xcf":"cenfura-token","umg":"underminegold","ltcb":"litecoin-bep2","linkk":"oec-chainlink","xsm":"spectrum-cash","est":"ester-finance","wpc":"wave-pay-coin","arbis":"arbis-finance","blzz":"blizz-finance","kroot":"k-root-wallet","cust":"custody-token","hmdx":"poly-peg-mdex","cyn":"cycan-network","krypto":"kryptobellion","btnyx":"bitonyx-token","gnsh":"ganesha-token","ebs":"ebisu-network","joos":"joos-protocol","halo":"halo-platform","sbdo":"bdollar-share","evault":"ethereumvault","fenix":"fenix-finance","peech":"peach-finance","peppa":"peppa-network","hcut":"healthchainus","ltrbt":"little-rabbit","soldier":"space-soldier","xao":"alloy-project","ext":"exchain","luc":"play2live","69c":"6ix9ine-chain","vega":"vega-protocol","obsr":"observer-coin","yffii":"yffii-finance","mtdr":"matador-token","dhs":"dirham-crypto","jeff":"jeff-in-space","qnx":"queendex-coin","src":"simracer-coin","qcore":"qcore-finance","bct":"toucan-protocol-base-carbon-tonne","wtp":"web-token-pay","rayons":"rayons-energy","unis":"universe-coin","yyfi":"yyfi-protocol","scha":"schain-wallet","zpaint":"zilwall-paint","vgd":"vangold-token","molk":"mobilink-coin","aammwbtc":"aave-amm-wbtc","oxs":"oxbull-solana","eapex":"ethereum-apex","egr":"egoras","bkf":"bking-finance","drs":"dragon-slayer","$blaze":"blaze-the-cat","pixiu":"pixiu-finance","tai":"tai","o-ocean-mar22":"o-ocean-mar22","feast":"feast-finance","breast":"safebreastinu","hdfl":"hyper-deflate","dhands":"diamond-hands","gmng":"global-gaming","pfb":"penny-for-bit","yfpro":"yfpro-finance","totem":"totem-finance","sfc":"safecap-token","invox":"invox-finance","wsteth":"wrapped-steth","aplp":"apple-finance","8ball":"8ball-finance","cflo":"chain-flowers","rbh":"robinhoodswap","ordr":"the-red-order","woj":"wojak-finance","babydogezilla":"babydogezilla","slme":"slime-finance","tdf":"trade-fighter","qwla":"qawalla-token","date":"soldate-token","fifty":"fiftyonefifty","$sol":"helios-charts","ytsla":"ytsla-finance","rbunny":"rewards-bunny","aft":"ape-fun-token","myl":"my-lotto-coin","gpc":"greenpay-coin","alita":"alita-network","tuda":"tutors-diary","chtt":"token-cheetah","tfc":"treasure-financial-coin","dxt":"dexit-finance","bsh":"bitcoin-stash","wshift":"wrapped-shift","fkavian":"kavian-fantom","indc":"nano-dogecoin","acpt":"crypto-accept","champ":"nft-champions","$babydogeinu":"baby-doge-inu","spay":"smart-payment","eyes":"eyes-protocol","brng":"bring-finance","sfms":"safemoon-swap","oltc":"boringdao-ltc","xwg":"x-world-games","blzn":"blaze-network","cisla":"crypto-island","hedge":"1x-short-bitcoin-token","bfu":"baby-floki-up","onlexpa":"onlexpa-token","robodoge":"robodoge-coin","wpx":"wallet-plus-x","swusd":"swusd","rhea":"rheaprotocol","ot-pe-29dec2022":"ot-pendle-eth","aammusdt":"aave-amm-usdt","yansh":"yandere-shiba","bgame":"binamars-game","smon":"starmon-token","rockstar":"rockstar-doge","mons":"monsters-clan","end":"endgame-token","ari":"arise-finance","swipe":"swipe-network","nbot":"naka-bodhi-token","bundb":"unidexbot-bsc","aammweth":"aave-amm-weth","torocus":"torocus-token","ibkrw":"ibkrw","knight":"forest-knight","rbtc":"rootstock","ibaud":"ibaud","ibjpy":"iron-bank-jpy","vdg":"veridocglobal","ibgbp":"iron-bank-gbp","glo":"glosfer-token","plt":"plutus-defi","adinu":"adventure-inu","phtg":"phoneum-green","dscvr":"dscvr-finance","kishimoto":"kishimoto-inu","sharen":"wenwen-sharen","rickmortydoxx":"rickmortydoxx","xsol":"synthetic-sol","inet":"ideanet-token","hp":"heartbout-pay","dx":"dxchain","ginza":"ginza-network","btf":"btf","elcash":"electric-cash","btcf":"bitcoin-final","gts":"gt-star-token","btad":"bitcoin-adult","ovl":"overload-game","scat":"sad-cat-token","fetch":"moonretriever","pipi":"pippi-finance","nash":"neoworld-cash","com":"complus-network","cora":"corra-finance","diamonds":"black-diamond","womi":"wrapped-ecomi","wmatic":"wrapped-matic-tezos","chadlink":"chad-link-set","nfi":"norse-finance","wxtz":"wrapped-tezos","stbb":"stabilize-bsc","awt":"airdrop-world","bdog":"bulldog-token","brn":"brainaut-defi","creed":"creed-finance","avex!":"aevolve-token","raider":"crypto-raiders","pareto":"pareto-network","bbl":"bubble-network","oak":"octree-finance","daisy":"daisy","ctg":"cryptorg-token","raptr":"raptor-finance","cfl365":"cfl365-finance","lionisland":"lionisland-inu","gnp":"genie-protocol","gon+":"dragon-warrior","bribe":"bribe-token","sahu":"sakhalin-husky","rickmorty":"rick-and-morty","unity":"polyunity-finance","wanatha":"wrapped-anatha","delo":"decentra-lotto","ucap":"unicap-finance","ecot":"echo-tech-coin","new":"newton-project","efft":"effort-economy","kmw":"kepler-network","los":"land-of-strife","mtm":"momentum-token","guard":"guardian-token","mov":"motiv-protocol","jsb":"jsb-foundation","grape":"grape-2","daos":"daopolis-token","babywolf":"baby-moon-wolf","flokachu":"flokachu-token","babydogo":"baby-dogo-coin","css":"coinswap-space","eth2socks":"etherean-socks","bfloki":"baby-floki-inu","sofi":"social-finance","$kirbyreloaded":"kirby-reloaded","sunglassesdoge":"sunglassesdoge","slash":"slash-protocol","psi":"passive-income","wilc":"wrapped-ilcoin","marsshiba":"the-mars-shiba","dquick":"dragons-quick","presidentdoge":"president-doge","dsc":"data-saver-coin","odoge":"boringdao-doge","kimchi":"kimchi-finance","onez":"the-nifty-onez","poc":"pangea-cleanup-coin","fina":"defina-finance","se":"starbase-huobi","cvt":"civitas-protocol","nanoshiba":"nano-shiba-inu","bsts":"magic-beasties","owo":"one-world-coin","rick":"infinite-ricks","mto":"merchant-token","hibiki":"hibiki-finance","cavo":"excavo-finance","inflex":"inflex-finance","zseed":"sowing-network","gaia":"gaia-everworld","ugt":"unreal-finance","swfi":"swirge-finance","monster":"monster-valley","mor":"mor-stablecoin","dart":"dart-insurance","thunderada":"thunderada-app","vcco":"vera-cruz-coin","eveo":"every-original","aglyph":"autoglyph-271","mnstrs":"block-monsters","spex":"sproutsextreme","dsbowl":"doge-superbowl","mgg":"mud-guild-game","baln":"balance-tokens","mmt":"moments","chad":"the-chad-token","yaan":"yaan-launchpad","prp":"pharma-pay-coin","sifi":"simian-finance","gwc":"genwealth-coin","cxc":"capital-x-cell","und":"unbound-dollar","dpr":"deeper-network","atis":"atlantis-token","addict":"addict-finance","rvst":"revest-finance","nelo":"nelo-metaverse","earena":"electric-arena","mbull":"mad-bull-token","btrl":"bitcoinregular","valk":"valkyrio-token","upeur":"universal-euro","elephant":"elephant-money","ppug":"pizza-pug-coin","tcnx":"tercet-network","sohm":"staked-olympus","qa":"quantum-assets","babyshibainu":"baby-shiba-inu","shusky":"siberian-husky","urg-u":"urg-university","duke":"duke-inu-token","elena":"elena-protocol","sos":"sos-foundation","btsl":"bitsol-finance","shieldnet":"shield-network","bingus":"bingus-network","perx":"peerex-network","undead":"undead-finance","babypig":"baby-pig-token","grmzilla":"greenmoonzilla","bfr":"bridge-finance","cad":"candy-protocol","recap":"review-capital","cmc":"community-coin-token","dem":"deutsche-emark","yoshi":"yoshi-exchange","gvy":"groovy-finance","vsn":"vision-network","hng":"hanagold-token","atmssft":"atmosphere-ccg","neon":"neonic-finance","3crv":"lp-3pool-curve","pinks":"pinkswap-token","chord":"chord-protocol","fsc":"five-star-coin","bcash":"bankcoincash","foc":"theforce-trade","pjm":"pajama-finance","naka":"nakamoto-games","blxm":"bloxmove-erc20","coffin":"coffin-finance","helios":"mission-helios","hnb":"hashnet-biteco","swapp":"swapp","wgl":"wiggly-finance","richdoge \ud83d\udcb2":"rich-doge-coin","wildf":"wildfire-token","it":"infinity","polven":"polka-ventures","kbd":"king-baby-doge","burns":"mr-burns-token","msz":"megashibazilla","scorp":"scorpion-token","sk":"sidekick-token","spo":"spores-network","xfr":"the-fire-token","cbtc":"classicbitcoin","minibabydoge":"mini-baby-doge","rho":"rhinos-finance","pepr":"pepper-finance","acx":"accesslauncher","binom":"binom-protocol","foofight":"fruit-fighters","nbm":"nftblackmarket","mystic":"mystic-warrior","etr":"electric-token","lyn":"lynchpin_token","dynmt":"dynamite-token","prtn":"proton-project","rok":"ragnarok-token","aph":"apholding-coin","npw":"new-power-coin","kfi":"klever-finance","codi":"coin-discovery","nr1":"number-1-token","mzk":"muzika-network","gnbt":"genebank-token","ect":"ethereum-chain-token","ushiba":"american-shiba","louvre":"louvre-finance","toll":"toll-free-swap","fft":"futura-finance","roy":"royal-protocol","snowball":"snowballtoken","genesis":"genesis-worlds","uskita":"american-akita","$rvlvr":"revolver-token","hzd":"horizondollar","mtns":"omotenashicoin","smnr":"cryptosummoner","tdw":"the-doge-world","ethmny":"ethereum-money","mensa":"mensa-protocol","mot":"mobius-finance","rio":"realio-network","katana":"katana-finance","mrcr":"mercor-finance","merkle":"merkle-network","upxau":"universal-gold","pbl":"polkalab-token","dododo":"baby-shark-inu","rsct":"risecointoken","bf":"bitforex","buffshiba":"buff-shiba-inu","dance":"dancing-banana","xmc":"monero-classic-xmc","omen":"augury-finance","ucoin":"universal-coin","fes":"feedeveryshiba","dragonfortune":"dragon-fortune","ccy":"cryptocurrency","ecoreal":"ecoreal-estate","rktv":"rocket-venture","babydogecash":"baby-doge-cash","mlk":"milk-alliance","babyflokipup":"baby-floki-pup","gjco":"giletjaunecoin","hppot":"healing-potion","sedo":"sedo-pow-token","yf4":"yearn4-finance","buc":"buyucoin-token","mayp":"maya-preferred-223","fex":"fidex-exchange","drb":"dragon-battles","we":"wanda-exchange","wftm":"wrapped-fantom","xlab":"xceltoken-plus","prdx":"predix-network","shrimp":"shrimp-finance","beco":"becoswap-token","dkwon":"dogekwon-terra","advar":"advar-protocol","drink":"beverage-token","holdex":"holdex-finance","wscrt":"secret-erc20","dogecoin":"buff-doge-coin","solpad":"solpad-finance","ubtc":"united-bitcoin","gnc":"galaxy-network","metp":"metaprediction","gs":"genesis-shards","umbr":"umbra-network","impulse":"impulse-by-fdr","ltcu":"litecoin-ultra","cdl":"coindeal-token","ccake":"cheesecakeswap","crystl":"crystl-finance","cfs":"cryptoforspeed","xuc":"exchange-union","metashib":"metashib-token","peakavax":"peak-avalanche","cfo":"cforforum-token","sho":"showcase-token","babyshib":"babyshibby-inu","wac":"warranty-chain","bagel":"bagel","hmt":"human-protocol","hmochi":"mochiswap-token","ndefi":"polly-defi-nest","ccbch":"cross-chain-bch","bst1":"blueshare-token","ratiodoom":"ethbtc-1x-short","flokifrunkpuppy":"flokifrunkpuppy","udt":"unlock-protocol","npi":"ninja-panda-inu","yfarmer":"yfarmland-token","bpc":"backpacker-coin","wag8":"wrapped-atromg8","hps":"happiness-token","khalifa":"khalifa-finance","cmcx":"core","moonday":"moonday-finance","esn":"escudonavacense","erenyeagerinu":"erenyeagerinu","mg":"minergate-token","nmp":"neuromorphic-io","bop":"boring-protocol","ashib":"alien-shiba-inu","gshib":"god-shiba-token","bchip":"bluechips-token","yfiking":"yfiking-finance","escrow":"escrow-protocol","archa":"archangel-token","weather":"weather-finance","babyfd":"baby-floki-doge","reosc":"reosc-ecosystem","infs":"infinity-esaham","trdl":"strudel-finance","ddrt":"digidinar-token","lazio":"lazio-fan-token","lec":"love-earth-coin","libref":"librefreelencer","babyflokicoin":"baby-floki-coin","wmpro":"wm-professional","wsienna":"sienna-erc20","set":"sustainable-energy-token","nste":"newsolution-2-0","gfshib":"ghostface-shiba","idoge":"influencer-doge","agspad":"aegis-launchpad","petn":"pylon-eco-token","spl":"simplicity-coin","sprkl":"sparkle","stimmy":"stimmy-protocol","wccx":"wrapped-conceal","eoc":"everyonescrypto","nrt":"nft-royal-token","moonlight":"moonlight-token","krg":"karaganda-token","dkks":"daikokuten-sama","bcc":"basis-coin-cash","mkat":"moonkat-finance","elongd":"elongate-duluxe","moolah":"block-creatures","kurai":"kurai-metaverse","tni":"tunnel-protocol","aoe":"apes-of-empires","ciotx":"crosschain-iotx","axa":"alldex-alliance","diamnd":"projekt-diamond","sent":"sentiment-token","blink":"blockmason-link","bde":"big-defi-energy","shoco":"shiba-chocolate","skyward":"skyward-finance","mkrethdoom":"mkreth-1x-short","qbit":"project-quantum","ldn":"ludena-protocol","bishu":"black-kishu-inu","nanodoge":"nano-doge","gdt":"globe-derivative-exchange","fico":"french-ico-coin","usdj":"just-stablecoin","grand":"the-grand-banks","qusd":"qusd-stablecoin","copycat":"copycat-finance","bashtank":"baby-shark-tank","renbtccurve":"lp-renbtc-curve","ot-cdai-29dec2022":"ot-compound-dai","dlegends":"my-defi-legends","orex":"orenda-protocol","kimochi":"kimochi-finance","cnp":"cryptonia-poker","malt":"malt-stablecoin","nftpunk":"nftpunk-finance","ans":"ans-crypto-coin","shuf":"shuffle-monster","brki":"baby-ryukyu-inu","altm":"altmarkets-coin","dimi":"diminutive-coin","cwv":"cryptoworld-vip","sca":"scaleswap-token","dofi":"doge-floki-coin","bakt":"backed-protocol","ssj":"super-saiya-jin","ltd":"livetrade-token","hoodrat":"hoodrat-finance","thundrr":"thunder-run-bsc","ppn":"puppies-network","nora":"snowcrash-token","babl":"babylon-finance","tland":"terraland-token","vct":"valuecybertoken","emb":"overline-emblem","flokishib":"floki-shiba-inu","abco":"autobitco-token","fiat":"floki-adventure","kana":"kanaloa-network","spe":"saveplanetearth-old","dball":"drakeball-token","chum":"chumhum-finance","fol":"folder-protocol","hideous":"hideous-coin","nos":"nitrous-finance","evt":"elevation-token","prints":"fingerprints","smpl":"smpl-foundation","um":"continuum-world","pablo":"the-pablo-token","aens":"aen-smart-token","pchs":"peaches-finance","grpft":"grapefruit-coin","mus":"mus","ginux":"green-shiba-inu","fusion":"fusion-energy-x","afib":"aries-financial-token","cooom":"incooom-genesis","tetherdoom":"tether-3x-short","usdo":"usd-open-dollar","alphashib":"alpha-shiba-inu","sbsh":"safe-baby-shiba","ketchup":"ketchup-finance","uusdc":"unagii-usd-coin","sgt":"snglsdao-governance-token","yfild":"yfilend-finance","bttr":"bittracksystems","ssg":"sea-swap-global","mpwr":"empower-network","ringx":"ring-x-platform","trips":"trips-community","snbl":"safenebula","ccf":"cerberus","wsta":"wrapped-statera","bpul":"betapulsartoken","bips":"moneybrain-bips","tcl":"techshare-token","dfsg":"dfsocial-gaming","infi":"insured-finance","m3c":"make-more-money","comc":"community-chain","bti":"bitcoin-instant","gdl":"gondola-finance","pwrd":"pwrd-stablecoin","lic":"lightening-cash","tnet":"title-network","pshib":"pixel-shiba-inu","qcx":"quickx-protocol","ycorn":"polycorn-finance","moona":"ms-moona-rewards","cnet":"currency-network","tschybrid":"tronsecurehybrid","mtlmc3":"metal-music-coin","btrs":"bitball-treasure","rtf":"regiment-finance","wwcn":"wrapped-widecoin","ggc":"gg-coin","hodo":"holographic-doge","flat":"flat-earth-token","fb":"fenerbahce-token","oda":"eiichiro-oda-inu","idleusdtyield":"idle-usdt-yield","cyc":"cyclone-protocol","mtnt":"mytracknet-token","bfdoge":"baby-falcon-doge","pmf":"polymath-finance","rod":"republic-of-dogs","nnn":"novem-gold-token","gla":"galaxy-adventure","magi":"magikarp-finance","seadog":"seadog-metaverse","gpunks":"grumpydoge-punks","toncoin":"the-open-network","linkethmoon":"linketh-2x-token","afc":"arsenal-fan-token","spot":"cryptospot-token","cytr":"cyclops-treasure","mil":"military-finance","foxy":"foxy-equilibrium","lbl":"label-foundation","hcore":"hardcore-finance","zkp":"panther","king":"cryptoblades-kingdoms","bci":"bitcoin-interest","hoodie":"cryptopunk-7171-hoodie","flm":"flamingo-finance","gummy":"gummy-bull-token","pndr":"pandora-protocol","shibaken":"shibaken-finance","cbu":"banque-universal","lfbtc":"lift-kitchen-lfbtc","idlesusdyield":"idle-susd-yield","troller":"the-troller-coin","esupreme":"ethereum-supreme","ctr":"creator-platform","roger":"theholyrogercoin","mbf":"moonbear-finance","ltfn":"litecoin-finance","sensi":"sensible-finance","bxk":"bitbook-gambling","whxc":"whitex-community","fxtc":"fixed-trade-coin","niftsy":"niftsy","fte":"fishy-tank-token","polybabydoge":"polygon-babydoge","bplc":"blackpearl-chain","lfeth":"lift-kitchen-eth","ggg":"good-games-guild","usx":"token-dforce-usd","ssl":"sergey-save-link","bb":"blackberry-token","clo":"callisto","myid":"my-identity-coin","tori":"storichain-token","wsb":"wall-street-bets-dapp","degenr":"degenerate-money","bdigg":"badger-sett-digg","jfi":"jackpool-finance","nye":"newyork-exchange","hole":"super-black-hole","artg":"goya-giant-token","tryon":"stellar-invictus","xblade":"cryptowar-xblade","liltk":"little-tsuki-inu","phm":"phantom-protocol","minisports":"minisports-token","mcu":"memecoinuniverse","pyd":"polyquity-dollar","icube":"icecubes-finance","scorpfin":"scorpion-finance","uwu":"uwu-vault-nftx","gnlr":"gods-and-legends","alte":"altered-protocol","pfi":"protocol-finance","wel":"welnance-finance","soda":"cheesesoda-token","wbb":"wild-beast-block","brand":"brandpad-finance","bcs":"business-credit-substitute","hnw":"hobbs-networking","biut":"bit-trust-system","vsd":"value-set-dollar","lgb":"let-s-go-brandon","usdfl":"usdfreeliquidity","goi":"goforit","qqq":"qqq-token","des":"despace-protocol","slush":"iceslush-finance","gme":"gamestop-finance","amdai":"aave-polygon-dai","$time":"madagascar-token","vamp":"vampire-protocol","kotdoge":"king-of-the-doge","atfi":"atlantic-finance","xlpg":"stellarpayglobal","pcake":"polycake-finance","br":"bull-run-token","shiver":"shibaverse-token","fbn":"five-balance","blizz":"blizzard-network","hpt":"huobi-pool-token","mnop":"memenopoly-money","uhp":"ulgen-hash-power","wducx":"wrapped-ducatusx","ibtc":"improved-bitcoin","bnusd":"balanced-dollars","$bst":"baby-santa-token","west":"waves-enterprise","rnrc":"rock-n-rain-coin","plx":"octaplex-network","ipx":"ipx-token","dogey":"doge-yellow-coin","cgc":"cash-global-coin","idleusdcyield":"idle-usdc-yield","mwc":"mimblewimblecoin","safedog":"safedog-protocol","btcn":"bitcoin-networks","xcomb":"xdai-native-comb","hds":"hotdollars-token","swl":"swiftlance-token","grem":"gremlins-finance","tomoe":"tomoe","mof":"molecular-future","plum":"plumcake-finance","brtk":"battleroyaletoken","dcl":"delphi-chain-link","mee":"mercurity-finance","mcat20":"wrapped-moon-cats","sxcc":"southxchange-coin","aumi":"automatic-network","ssf":"secretsky-finance","okbbull":"3x-long-okb-token","tetu":"tetu","wpe":"opes-wrapped-pe","cbsn":"blockswap-network","3cs":"cryptocricketclub","cool":"cool-vault-nftx","mbt":"magic-birds-token","csto":"capitalsharetoken","stor":"self-storage-coin","xbtx":"bitcoin-subsidium","trustk":"trustkeys-network","skt":"sukhavati-network","aac":"acute-angle-cloud","agf":"augmented-finance","transparent":"transparent-token","xrpbull":"3x-long-xrp-token","leobull":"3x-long-leo-token","reau":"vira-lata-finance","humanity":"complete-humanity","trxbull":"3x-long-trx-token","bctr":"bitcratic-revenue","pups":"pups-vault-nftx","sicc":"swisscoin-classic","ssb":"satoshistreetbets","ce":"crypto-excellence","bluesparrow":"bluesparrow-token","tmcn":"timecoin-protocol","bnbbull":"3x-long-bnb-token","gmc":"gokumarket-credit","sqgl":"sqgl-vault-nftx","slvn":"salvation-finance","hhnft":"hodler-heroes-nft","knockers":"australian-kelpie","nmbtc":"nanometer-bitcoin","amaave":"aave-polygon-aave","minikishimoto":"minikishimoto-inu","cars":"crypto-cars-world","etnxp":"electronero-pulse","mcelo":"moola-celo-atoken","sfo":"sunflower-finance","gkcake":"golden-kitty-cake","ctf":"cybertime-finance","rvc":"ravencoin-classic","bvl":"bullswap-protocol","smars":"safemars-protocol","mrf":"moonradar-finance","sds":"safedollar-shares","rft":"rangers-fan-token","limex":"limestone-network","punk":"punk-vault-nftx","meteor":"meteorite-network","bakc":"bakc-vault-nftx","bayc":"bayc-vault-nftx","mbs":"micro-blood-science","amweth":"aave-polygon-weth","amwbtc":"aave-polygon-wbtc","foxt":"fox-trading-token","spr":"polyvolve-finance","bbkfi":"bitblocks-finance","amusdc":"aave-polygon-usdc","goldr":"golden-ratio-coin","bgan":"bgan-vault-nftx","mdza":"medooza-ecosystem","erw":"zeloop-eco-reward","purr":"purr-vault-nftx","cloud9":"cloud9bsc-finance","amusdt":"aave-polygon-usdt","pope":"crypto-pote-token","agac":"aga-carbon-credit","eosbull":"3x-long-eos-token","nhc":"neo-holistic-coin","mps":"mt-pelerin-shares","rbs":"robiniaswap-token","ksp":"klayswap-protocol","eplat":"ethereum-platinum","hogt":"heco-origin-token","gec":"green-energy-coin","dbz":"diamond-boyz-coin","brt":"base-reward-token","uusdt":"unagii-tether-usd","vbzrx":"vbzrx","ethusdadl4":"ethusd-adl-4h-set","stgz":"stargaze-protocol","ign":"infinity-game-nft","kart":"dragon-kart-token","ciphc":"cipher-core-token","shibawitch":"shiwbawitch-token","scnsol":"socean-staked-sol","dar":"mines-of-dalarnia","chfu":"upper-swiss-franc","peeps":"the-people-coin","tpc":"trading-pool-coin","eq":"equilibrium","bshibr":"baby-shiba-rocket","yficg":"yfi-credits-group","twj":"tronweeklyjournal","efc":"everton-fan-token","asm":"assemble-protocol","cnc":"global-china-cash","loom":"loom-network-new","cgb":"crypto-global-bank","cpi":"crypto-price-index","phunk":"phunk-vault-nftx","okbhedge":"1x-short-okb-token","xrpbear":"3x-short-xrp-token","aggt":"aggregator-network","lovely":"lovely-inu-finance","egl":"ethereum-eagle-project","pmt":"playmarket","kamax":"kamax-vault-nftx","stardust":"stargazer-protocol","yhfi":"yearn-hold-finance","anime":"anime-vault-nftx","clock":"clock-vault-nftx","soccer":"bakery-soccer-ball","safuyield":"safuyield-protocol","ang":"aureus-nummus-gold","supern":"supernova-protocol","bnbbear":"3x-short-bnb-token","cpos":"cpos-cloud-payment","stkxprt":"persistence-staked-xprt","satx":"satoexchange-token","dzi":"definition-network","okbbear":"3x-short-okb-token","vmain":"mainframe-protocol","abp":"arc-block-protocol","starlinkdoge":"baby-starlink-doge","papr":"paprprintr-finance","kongz":"kongz-vault-nftx","iop":"internet-of-people","hbo":"hash-bridge-oracle","pixls":"pixls-vault-nftx","waco":"waste-coin","ascend":"ascension-protocol","acar":"aga-carbon-rewards","yfb2":"yearn-finance-bit2","lelouch":"lelouch-lamperouge","ppegg":"parrot-egg-polygon","copter":"helicopter-finance","mengo":"flamengo-fan-token","quokk":"polyquokka-finance","axt":"alliance-x-trading","spunk":"spunk-vault-nftx","catx":"cat-trade-protocol","mhsp":"melonheadsprotocol","eqmt":"equus-mining-token","eosbear":"3x-short-eos-token","deft":"defi-factory-token","xuni":"ultranote-infinity","gsa":"global-smart-asset","bbadger":"badger-sett-badger","stkatom":"pstake-staked-atom","pudgy":"pudgy-vault-nftx","cric":"cricket-foundation","awc":"atomic-wallet-coin","edh":"elon-diamond-hands","smc":"smart-medical-coin","trxbear":"3x-short-trx-token","$bwh":"baby-white-hamster","bnbhedge":"1x-short-bnb-token","pol":"polars-governance-token","waifu":"waifu-vault-nftx","zht":"zerohybrid","tln":"trustline-network","leobear":"3x-short-leo-token","eoshedge":"1x-short-eos-token","legion":"legion-for-justice","markk":"mirror-markk-token","puml":"puml-better-health","liqlo":"liquid-lottery-rtc","unit":"universal-currency","tan":"taklimakan-network","spu":"spaceport-universe","pvp":"playervsplayercoin","ghc":"galaxy-heroes-coin","afdlt":"afrodex-labs-token","cry":"cryptosphere-token","sauna":"saunafinance-token","kws":"knight-war-spirits","delta rlp":"rebasing-liquidity","otium":"otium-technologies","im":"intelligent-mining","hkun":"hakunamatata-new","sml":"super-music-league","bafi":"bafi-finance-token","vrt":"venus-reward-token","dhc":"diamond-hands-token","ght":"global-human-trust","nbtc":"nano-bitcoin-token","hima":"himalayan-cat-coin","mco2":"moss-carbon-credit","trxhedge":"1x-short-trx-token","xrphedge":"1x-short-xrp-token","fdoge":"first-doge-finance","tfbx":"truefeedbackchain","rugpull":"rugpull-prevention","glyph":"glyph-vault-nftx","\u2728":"sparkleswap-rewards","ceek":"ceek","minute":"minute-vault-nftx","sbland":"sbland-vault-nftx","l99":"lucky-unicorn-token","spade":"polygonfarm-finance","wxmr":"wrapped-xmr-btse","maticbull":"3x-long-matic-token","aammunirenweth":"aave-amm-unirenweth","mmp":"moon-maker-protocol","emp":"electronic-move-pay","tlt":"trip-leverage-token","wcusd":"wrapped-celo-dollar","yfiv":"yearn-finance-value","raddit":"radditarium-network","eternal":"cryptomines-eternal","sst":"simba-storage-token","topdog":"topdog-vault-nftx","dfnorm":"dfnorm-vault-nftx","wsdoge":"doge-of-woof-street","gmc24":"24-genesis-mooncats","hdpunk":"hdpunk-vault-nftx","climb":"climb-token-finance","bbw":"big-beautiful-women","xjp":"exciting-japan-coin","psn":"polkasocial-network","pnix":"phoenixdefi-finance","gbd":"great-bounty-dealer","hsn":"hyper-speed-network","bbh":"beavis-and-butthead","wnyc":"wrapped-newyorkcoin","xrphalf":"0-5x-long-xrp-token","beth":"binance-eth","aammbptbalweth":"aave-amm-bptbalweth","fcd":"future-cash-digital","msc":"monster-slayer-cash","yi12":"yi12-stfinance","aammuniyfiweth":"aave-amm-uniyfiweth","sodium":"sodium-vault-nftx","eoshalf":"0-5x-long-eos-token","ygy":"generation-of-yield","myce":"my-ceremonial-event","gdildo":"green-dildo-finance","dola":"dola-usd","zecbull":"3x-long-zcash-token","yskf":"yearn-shark-finance","mollydoge\u2b50":"mini-hollywood-doge","udog":"united-doge-finance","sushibull":"3x-long-sushi-token","bonsai":"bonsai-vault-nftx","xspc":"spectresecuritycoin","xtzbull":"3x-long-tezos-token","cix100":"cryptoindex-io","rtt":"real-trump-token","mclb":"millenniumclub","dss":"defi-shopping-stake","thb":"bkex-taihe-stable-b","gsc":"global-social-chain","avastr":"avastr-vault-nftx","mkrbull":"3x-long-maker-token","lico":"liquid-collectibles","aammuniuniweth":"aave-amm-uniuniweth","aammunicrvweth":"aave-amm-unicrvweth","aammunidaiusdc":"aave-amm-unidaiusdc","aammunibatweth":"aave-amm-unibatweth","upusd":"universal-us-dollar","aammunidaiweth":"aave-amm-unidaiweth","ringer":"ringer-vault-nftx","ncp":"newton-coin-project","trgi":"the-real-golden-inu","sxpbull":"3x-long-swipe-token","cana":"cannabis-seed-token","goong":"tomyumgoong-finance","fmf":"fantom-moon-finance","hbdc":"happy-birthday-coin","bmg":"black-market-gaming","serbiancavehermit":"serbian-cave-hermit","aammunisnxweth":"aave-amm-unisnxweth","mtk":"magic-trading-token","dsfr":"digital-swis-franc","refi":"realfinance-network","gbi":"galactic-blue-index","androttweiler":"androttweiler-token","pft":"pitch-finance-token","wton":"wrapped-ton-crystal","tha":"bkex-taihe-stable-a","energy":"energy-vault-nftx","sbyte":"securabyte-protocol","cities":"cities-vault-nftx","stoge":"stoner-doge","nftg":"nft-global-platform","maneki":"maneki-vault-nftx","tkg":"takamaka-green-coin","hct":"hurricaneswap-token","amwmatic":"aave-polygon-wmatic","ymf20":"yearn20moonfinance","gmm":"gold-mining-members","bpf":"blockchain-property","tmh":"trustmarkethub-token","ledu":"education-ecosystem","wgc":"green-climate-world","sbecom":"shebolleth-commerce","ccdoge":"community-doge-coin","vpp":"virtue-poker","london":"london-vault-nftx","okbhalf":"0-5x-long-okb-token","hmng":"hummingbird-finance","yfie":"yfiexchange-finance","aammunimkrweth":"aave-amm-unimkrweth","hifi":"hifi-gaming-society","idledaiyield":"idle-dai-yield","fur":"pagan-gods-fur-token","ibeth":"interest-bearing-eth","msmi2":"mini-safemoon-inu-v2","scv":"super-coinview-token","aammbptwbtcweth":"aave-amm-bptwbtcweth","afo":"all-for-one-business","teo":"trust-ether-reorigin","fanta":"football-fantasy-pro","matichedge":"1x-short-matic-token","aammuniwbtcweth":"aave-amm-uniwbtcweth","tgco":"thaler","xzar":"south-african-tether","terc":"troneuroperewardcoin","pnixs":"phoenix-defi-finance","fredx":"fred-energy-erc20","eses":"eskisehir-fan-token","sleepy":"sleepy-sloth","vgt":"vault12","hzt":"black-diamond-rating","sxpbear":"3x-short-swipe-token","$moby":"whale-hunter-finance","ethbtcmoon":"ethbtc-2x-long-token","aammuniwbtcusdc":"aave-amm-uniwbtcusdc","aammunilinkweth":"aave-amm-unilinkweth","dai-matic":"matic-dai-stablecoin","forestplus":"the-forbidden-forest","usdtbull":"3x-long-tether-token","hpay":"hyper-credit-network","wp":"underground-warriors","mooncat":"mooncat-vault-nftx","tmtg":"the-midas-touch-gold","opm":"omega-protocol-money","thex":"thore-exchange","xtzhedge":"1x-short-tezos-token","trybbull":"3x-long-bilira-token","sil":"sil-finance","rrt":"recovery-right-token","aammuniusdcweth":"aave-amm-uniusdcweth","stn5":"smart-trade-networks","rht":"reward-hunters-token","wis":"experty-wisdom-token","frank":"frankenstein-finance","$tream":"world-stream-finance","mndcc":"mondo-community-coin","dollar":"dollar-online","aammuniaaveweth":"aave-amm-uniaaveweth","oai":"omni-people-driven","zecbear":"3x-short-zcash-token","gcooom":"incooom-genesis-gold","tcs":"timechain-swap-token","wx42":"wrapped-x42-protocol","hvi":"hungarian-vizsla-inu","kaba":"kripto-galaxy-battle","snakes":"snakes-on-a-nft-game","usc":"ultimate-secure-cash","aapl":"apple-protocol-token","deor":"decentralized-oracle","utt":"united-traders-token","atombull":"3x-long-cosmos-token","sushibear":"3x-short-sushi-token","sxphedge":"1x-short-swipe-token","bc":"bitcoin-confidential","bdoge":"blue-eyes-white-doge","wsbt":"wallstreetbets-token","bnfy":"b-non-fungible-yearn","mkrbear":"3x-short-maker-token","xtzbear":"3x-short-tezos-token","cld":"cryptopia-land-dollar","bsbt":"bit-storage-box-token","lml":"link-machine-learning","jeur":"jarvis-synthetic-euro","gtf":"globaltrustfund-token","matichalf":"0-5x-long-matic-token","acd":"alliance-cargo-direct","intratio":"intelligent-ratio-set","ducato":"ducato-protocol-token","znt":"zenswap-network-token","kclp":"korss-chain-launchpad","avl":"aston-villa-fan-token","linkpt":"link-profit-taker-set","dnz":"denizlispor-fan-token","gsx":"gold-secured-currency","atombear":"3x-short-cosmos-token","upak":"unicly-pak-collection","xlmbull":"3x-long-stellar-token","seco":"serum-ecosystem-token","babydogemm":"baby-doge-money-maker","ggt":"gard-governance-token","dmr":"dreamr-platform-token","blo":"based-loans-ownership","imbtc":"the-tokenized-bitcoin","yfn":"yearn-finance-network","babydinger":"baby-schrodinger-coin","chy":"concern-proverty-chain","wrap":"wrap-governance-token","inter":"inter-milan-fan-token","ddrst":"digidinar-stabletoken","polybunny":"bunny-token-polygon","vetbull":"3x-long-vechain-token","anka":"ankaragucu-fan-token","toshimon":"toshimon-vault-nftx","idlewbtcyield":"idle-wbtc-yield","gcc":"thegcccoin","glob":"global-reserve-system","octane":"octane-protocol-token","otaku":"fomo-chronicles-manga","adabull":"3x-long-cardano-token","sxphalf":"0-5x-long-swipe-token","xtzhalf":"0-5x-long-tezos-token","usdtbear":"3x-short-tether-token","incx":"international-cryptox","atomhedge":"1x-short-cosmos-token","shb4":"super-heavy-booster-4","tfi":"trustfi-network-token","araid":"airraid-lottery-token","vcf":"valencia-cf-fan-token","usd":"uniswap-state-dollar","lbxc":"lux-bio-exchange-coin","evz":"electric-vehicle-zone","htg":"hedge-tech-governance","idletusdyield":"idle-tusd-yield","drft":"dino-runner-fan-token","btci":"bitcoin-international","hegg":"hummingbird-egg-token","wct":"waves-community-token","lfw":"legend-of-fantasy-war","yfx":"yfx","wows":"wolves-of-wall-street","edi":"freight-trust-network","efg":"ecoc-financial-growth","dca":"decentralized-currency-assets","crs":"cryptorewards","crooge":"uncle-scrooge-finance","marc":"market-arbitrage-coin","cact":"crypto-against-cancer","julb":"justliquidity-binance","opa":"option-panda-platform","smrat":"secured-moonrat-token","infinity":"infinity-protocol-bsc","trybbear":"3x-short-bilira-token","babydb":"baby-doge-billionaire","wet":"weble-ecosystem-token","dsu":"digital-standard-unit","ihc":"inflation-hedging-coin","adahedge":"1x-short-cardano-token","xdex":"xdefi-governance-token","ubi":"universal-basic-income","heroes":"dehero-community-token","bevo":"bevo-digital-art-token","dpt":"diamond-platform-token","mcpc":"mobile-crypto-pay-coin","paxgbull":"3x-long-pax-gold-token","atomhalf":"0-5x-long-cosmos-token","xlmbear":"3x-short-stellar-token","foo":"fantums-of-opera-token","uwbtc":"unagii-wrapped-bitcoin","algobull":"3x-long-algorand-token","leg":"legia-warsaw-fan-token","gdc":"global-digital-content","sunder":"sunder-goverance-token","tgic":"the-global-index-chain","uff":"united-farmers-finance","yfrm":"yearn-finance-red-moon","balbull":"3x-long-balancer-token","ecn":"ecosystem-coin-network","ltcbull":"3x-long-litecoin-token","dcd":"digital-currency-daily","fdr":"french-digital-reserve","adabear":"3x-short-cardano-token","bsi":"bali-social-integrated","bmp":"brother-music-platform","dba":"digital-bank-of-africa","goz":"goztepe-s-k-fan-token","ryma":"bakumatsu-swap-finance","smnc":"simple-masternode-coin","bnd":"doki-doki-chainbinders","lufc":"leeds-united-fan-token","wsohm":"wrapped-staked-olympus","tgt":"twirl-governance-token","vetbear":"3x-short-vechain-token","tpos":"the-philosophers-stone","cvcc":"cryptoverificationcoin","linkrsico":"link-rsi-crossover-set","babyfb":"baby-floki-billionaire","call":"global-crypto-alliance","hth":"help-the-homeless-coin","vethedge":"1x-short-vechain-token","ihf":"invictus-hyprion-fund","et":"ethst-governance-token","yfp":"yearn-finance-protocol","yfiec":"yearn-finance-ecosystem","bnkrx":"bankroll-extended-token","bags":"basis-gold-share-heco","vit":"team-vitality-fan-token","bepr":"blockchain-euro-project","collective":"collective-vault-nftx","idledaisafe":"idle-dai-risk-adjusted","sato":"super-algorithmic-token","ethbear":"3x-short-ethereum-token","balbear":"3x-short-balancer-token","tsf":"teslafunds","brz":"brz","ethhedge":"1x-short-ethereum-token","ltchedge":"1x-short-litecoin-token","locc":"low-orbit-crypto-cannon","vbnt":"bancor-governance-token","algohedge":"1x-short-algorand-token","sauber":"alfa-romeo-racing-orlen","gnbu":"nimbus-governance-token","half":"0-5x-long-bitcoin-token","gve":"globalvillage-ecosystem","itg":"itrust-governance-token","uwaifu":"unicly-waifu-collection","inex":"internet-exchange-token","adahalf":"0-5x-long-cardano-token","rrr":"rapidly-reusable-rocket","rcw":"ran-online-crypto-world","paxgbear":"3x-short-pax-gold-token","linkbull":"3x-long-chainlink-token","dzg":"dinamo-zagreb-fan-token","dogehedge":"1x-short-dogecoin-token","ethrsiapy":"eth-rsi-60-40-yield-set-ii","pwc":"prime-whiterock-company","dogmoon":"dog-landing-on-the-moon","mlgc":"marshal-lion-group-coin","wemp":"women-empowerment-token","tomobull":"3x-long-tomochain-token","ltcbear":"3x-short-litecoin-token","abpt":"aave-balancer-pool-token","idleusdcsafe":"idle-usdc-risk-adjusted","pec":"proverty-eradication-coin","pbtt":"purple-butterfly-trading","linkhedge":"1x-short-chainlink-token","bvol":"1x-long-btc-implied-volatility-token","basd":"binance-agile-set-dollar","balhalf":"0-5x-long-balancer-token","tomohedge":"1x-short-tomochain-token","cbn":"connect-business-network","bscgirl":"binance-smart-chain-girl","nasa":"not-another-shit-altcoin","cbunny":"crazy-bunny-equity-token","ethhalf":"0-5x-long-ethereum-token","sup":"supertx-governance-token","bhp":"blockchain-of-hash-power","sxut":"spectre-utility-token","algohalf":"0-5x-long-algorand-token","dogehalf":"0-5x-long-dogecoin-token","mgpx":"monster-grand-prix-token","pcusdc":"pooltogether-usdc-ticket","upt":"universal-protocol-token","defibull":"3x-long-defi-index-token","bnft":"bruce-non-fungible-token","hid":"hypersign-identity-token","fret":"future-real-estate-token","idleusdtsafe":"idle-usdt-risk-adjusted","$hrimp":"whalestreet-shrimp-token","linkbear":"3x-short-chainlink-token","p2ps":"p2p-solutions-foundation","bsvbull":"3x-long-bitcoin-sv-token","ass":"australian-safe-shepherd","alk":"alkemi-network-dao-token","aped":"baddest-alpha-ape-bundle","best":"bitcoin-and-ethereum-standard-token","yefim":"yearn-finance-management","ftv":"futurov-governance-token","dcvr":"defi-cover-and-risk-index","fcf":"french-connection-finance","sss":"simple-software-solutions","byte":"btc-network-demand-set-ii","brrr":"money-printer-go-brrr-set","wai":"wanaka-farm-wairere-token","bptn":"bit-public-talent-network","bsvbear":"3x-short-bitcoin-sv-token","vol":"volatility-protocol-token","cmccoin":"cine-media-celebrity-coin","tlod":"the-legend-of-deification","eth2":"eth2-staking-by-poolx","cum":"cryptographic-ultra-money","rpst":"rock-paper-scissors-token","lega":"link-eth-growth-alpha-set","wcdc":"world-credit-diamond-coin","ulu":"universal-liquidity-union","elp":"the-everlasting-parachain","sxdt":"spectre-dividend-token","efil":"ethereum-wrapped-filecoin","defihedge":"1x-short-defi-index-token","htbull":"3x-long-huobi-token-token","defibear":"3x-short-defi-index-token","anw":"anchor-neural-world-token","collg":"collateral-pay-governance","linkhalf":"0-5x-long-chainlink-token","xautbull":"3x-long-tether-gold-token","byte3":"bitcoin-network-demand-set","htbear":"3x-short-huobi-token-token","yfka":"yield-farming-known-as-ash","quipu":"quipuswap-governance-token","arcc":"asia-reserve-currency-coin","cute":"blockchain-cuties-universe","bsvhalf":"0-5x-long-bitcoin-sv-token","defihalf":"0-5x-long-defi-index-token","sccp":"s-c-corinthians-fan-token","sih":"salient-investment-holding","xac":"general-attention-currency","drgnbull":"3x-long-dragon-index-token","umoon":"unicly-mooncats-collection","ioen":"internet-of-energy-network","wgrt":"waykichain-governance-coin","cva":"crypto-village-accelerator","cnhpd":"chainlink-nft-vault-nftx","care":"spirit-orb-pets-care-token","xautbear":"3x-short-tether-gold-token","midbull":"3x-long-midcap-index-token","aib":"advanced-internet-block","chft":"crypto-holding-frank-token","sheesh":"sheesh-it-is-bussin-bussin","bchbull":"3x-long-bitcoin-cash-token","midbear":"3x-short-midcap-index-token","eth20smaco":"eth_20_day_ma_crossover_set","court":"optionroom-governance-token","kncbull":"3x-long-kyber-network-token","eth50smaco":"eth-50-day-ma-crossover-set","bchhedge":"1x-short-bitcoin-cash-token","bchbear":"3x-short-bitcoin-cash-token","yfdt":"yearn-finance-diamond-token","innbc":"innovative-bioresearch","xauthalf":"0-5x-long-tether-gold-token","pcooom":"incooom-genesis-psychedelic","acc":"asian-african-capital-chain","cusdtbull":"3x-long-compound-usdt-token","xet":"xfinite-entertainment-token","abc123":"art-blocks-curated-full-set","privbull":"3x-long-privacy-index-token","uartb":"unicly-artblocks-collection","drgnbear":"3x-short-dragon-index-token","ethrsi6040":"eth-rsi-60-40-crossover-set","citizen":"kong-land-alpha-citizenship","qdao":"q-dao-governance-token-v1-0","uad":"ubiquity-algorithmic-dollar","lpnt":"luxurious-pro-network-token","thetabull":"3x-long-theta-network-token","btcrsiapy":"btc-rsi-crossover-yield-set","altbull":"3x-long-altcoin-index-token","peco":"polygon-ecosystem-index","apecoin":"asia-pacific-electronic-coin","gan":"galactic-arena-the-nftverse","thetahedge":"1x-short-theta-network-token","privbear":"3x-short-privacy-index-token","thetabear":"3x-short-theta-network-token","altbear":"3x-short-altcoin-index-token","uglyph":"unicly-autoglyph-collection","privhedge":"1x-short-privacy-index-token","bullshit":"3x-long-shitcoin-index-token","fnd1066xt31d":"fnd-otto-heldringstraat-31d","cusdtbear":"3x-short-compound-usdt-token","kncbear":"3x-short-kyber-network-token","bxa":"blockchain-exchange-alliance","qdefi":"qdefi-governance-token-v2.0","etas":"eth-trending-alpha-st-set-ii","jchf":"jarvis-synthetic-swiss-franc","mlr":"mega-lottery-services-global","drgnhalf":"0-5x-long-dragon-index-token","blct":"bloomzed-token","eth26emaco":"eth-26-day-ema-crossover-set","bchhalf":"0-5x-long-bitcoin-cash-token","compbull":"3x-long-compound-token-token","innbcl":"innovativebioresearchclassic","ugone":"unicly-gone-studio-collection","ibp":"innovation-blockchain-payment","mhce":"masternode-hype-coin-exchange","althalf":"0-5x-long-altcoin-index-token","roush":"roush-fenway-racing-fan-token","cnyq":"cnyq-stablecoin-by-q-dao-v1","jpyq":"jpyq-stablecoin-by-q-dao-v1","bearshit":"3x-short-shitcoin-index-token","compbear":"3x-short-compound-token-token","hedgeshit":"1x-short-shitcoin-index-token","qsd":"qian-second-generation-dollar","ot-ausdc-29dec2022":"ot-aave-interest-bearing-usdc","greed":"fear-greed-sentiment-set-ii","comphedge":"1x-short-compound-token-token","thetahalf":"0-5x-long-theta-network-token","knchalf":"0-5x-long-kyber-network-token","privhalf":"0-5x-long-privacy-index-token","sana":"storage-area-network-anywhere","tusc":"original-crypto-coin","tip":"technology-innovation-project","ethemaapy":"eth-26-ma-crossover-yield-ii","ethbtcemaco":"eth-btc-ema-ratio-trading-set","ethbtcrsi":"eth-btc-rsi-ratio-trading-set","tsuga":"tsukiverse-galactic-adventures","bcac":"business-credit-alliance-chain","yvboost":"yvboost","urevv":"unicly-formula-revv-collection","jgbp":"jarvis-synthetic-british-pound","halfshit":"0-5x-long-shitcoin-index-token","linkethrsi":"link-eth-rsi-ratio-trading-set","cdsd":"contraction-dynamic-set-dollar","aethb":"ankr-reward-earning-staked-eth","uch":"universidad-de-chile-fan-token","etcbull":"3x-long-ethereum-classic-token","mayfi":"matic-aave-yfi","ntrump":"no-trump-augur-prediction-token","stkabpt":"staked-aave-balancer-pool-token","madai":"matic-aave-dai","bhsc":"blackholeswap-compound-dai-usdc","etcbear":"3x-short-ethereum-classic-token","fdnza":"art-blocks-curated-fidenza-855","cvag":"crypto-village-accelerator-cvag","kun":"chemix-ecology-governance-token","sgtv2":"sharedstake-governance-token","mauni":"matic-aave-uni","epm":"extreme-private-masternode-coin","sge":"society-of-galactic-exploration","uarc":"unicly-the-day-by-arc-collection","por":"portugal-national-team-fan-token","maaave":"matic-aave-aave","malink":"matic-aave-link","etchalf":"0-5x-long-ethereum-classic-token","mausdt":"matic-aave-usdt","filst":"filecoin-standard-hashrate-token","eth20macoapy":"eth-20-ma-crossover-yield-set-ii","matusd":"matic-aave-tusd","mausdc":"matic-aave-usdc","ethpa":"eth-price-action-candlestick-set","chiz":"sewer-rat-social-club-chiz-token","galo":"clube-atletico-mineiro-fan-token","maweth":"matic-aave-weth","ibvol":"1x-short-btc-implied-volatility","am":"aston-martin-cognizant-fan-token","evdc":"electric-vehicle-direct-currency","lpdi":"lucky-property-development-invest","ebloap":"eth-btc-long-only-alpha-portfolio","usns":"ubiquitous-social-network-service","work":"the-employment-commons-work-token","ylab":"yearn-finance-infrastructure-labs","bqt":"blockchain-quotations-index-token","ethmacoapy":"eth-20-day-ma-crossover-yield-set","zjlt":"zjlt-distributed-factoring-network","crab":"darwinia-crab-network","ugmc":"unicly-genesis-mooncats-collection","atbfig":"financial-intelligence-group-token","gusdt":"gusd-token","exchbull":"3x-long-exchange-token-index-token","exchbear":"3x-short-exchange-token-index-token","emtrg":"meter-governance-mapped-by-meter-io","tbft":"turkiye-basketbol-federasyonu-token","sweep":"bayc-history","exchhedge":"1x-short-exchange-token-index-token","exchhalf":"0-5x-long-echange-token-index-token","dubi":"decentralized-universal-basic-income","dvp":"decentralized-vulnerability-platform","linkethpa":"eth-link-price-action-candlestick-set","ujord":"unicly-air-jordan-1st-drop-collection","ugas-jun21":"ugas-jun21","ibtcv":"inverse-bitcoin-volatility-index-token","dml":"decentralized-machine-learning","iethv":"inverse-ethereum-volatility-index-token","pxusd-mar2022":"pxusd-synthetic-usd-expiring-31-mar-2022","arg":"argentine-football-association-fan-token","dcip":"decentralized-community-investment-protocol","realtoken-s-14918-joy-rd-detroit-mi":"14918-joy","realtoken-s-8181-bliss-st-detroit-mi":"8181-bliss","realtoken-s-13045-wade-st-detroit-mi":"13045-wade","realtoken-s-4061-grand-st-detroit-mi":"4061-grand","realtoken-s-11957-olga-st-detroit-mi":"11957-olga","realtoken-s-15770-prest-st-detroit-mi":"15770-prest","realtoken-s-15778-manor-st-detroit-mi":"15778-manor","realtoken-s-9717-everts-st-detroit-mi":"9717-everts","realtoken-s-19317-gable-st-detroit-mi":"19317-gable","realtoken-s-4340-east-71-cleveland-oh":"4340-east-71","realtoken-s-15039-ward-ave-detroit-mi":"15039-ward","realtoken-s-9920-bishop-st-detroit-mi":"9920-bishop","realtoken-s-1000-florida-ave-akron-oh":"1000-florida","realtoken-s-5601-s.wood-st-chicago-il":"5601-s-wood","realtoken-s-19136-tracey-st-detroit-mi":"19136-tracey","realtoken-s-9336-patton-st-detroit-mi":"9336-patton","realtoken-s-20200-lesure-st-detroit-mi":"20200-lesure","realtoken-s-18983-alcoy-ave-detroit-mi":"18983-alcoy","realtoken-s-9481-wayburn-st-detroit-mi":"9481-wayburn","realtoken-s-10974-worden-st-detroit-mi":"10974-worden","realtoken-s-9943-marlowe-st-detroit-mi":"9943-marlowe","realtoken-s-19333-moenart-st-detroit-mi":"19333-moenart","realtoken-s-9169-boleyn-st-detroit-mi":"9169-boleyn","realtoken-s-12866-lauder-st-detroit-mi":"12866-lauder","realtoken-s-19996-joann-ave-detroit-mi":"19996-joann","realtoken-s-5942-audubon-rd-detroit-mi":"5942-audubon","realtoken-s-11201-college-st-detroit-mi":"11201-college","realtoken-s-10084-grayton-st-detroit-mi":"10084-grayton","realtoken-s-1244-s.avers-st-chicago-il":"1244-s-avers","realtoken-s-13991-warwick-st-detroit-mi":"13991-warwick","realtoken-s-17809-charest-st-detroit-mi":"17809-charest","realtoken-s-15095-hartwell-st-detroit-mi":"15095-hartwell","realtoken-s-1815-s.avers-ave-chicago-il":"1815-s-avers","realtoken-s-18466-fielding-st-detroit-mi":"18466-fielding","realtoken-s-14825-wilfried-st-detroit-mi":"14825-wilfred","realtoken-s-18433-faust-ave-detroit-mi":"18433-faust","realtoken-s-1617-s.avers-ave-chicago-il":"1617-s-avers","realtoken-s-11078-wayburn-st-detroit-mi":"11078-wayburn","realtoken-s-15777-ardmore-st-detroit-mi":"15777-ardmore","realtoken-s-11300-roxbury-st-detroit-mi":"11300-roxbury","realtoken-s-15634-liberal-st-detroit-mi":"15634-liberal","realtoken-s-13895-saratoga-st-detroit-mi":"realtoken-s-13895-saratoga-st-detroit-mi","realtoken-s-11078-longview-st-detroit-mi":"11078-longview","realtoken-s-15753-hartwell-st-detroit-mi":"15753-hartwell","realtoken-s-402-s.kostner-ave-chicago-il":"402-s-kostner","realtoken-s-10616-mckinney-st-detroit-mi":"10616-mckinney","realtoken-s-17813-bradford-st-detroit-mi":"17813-bradford","realtoken-s-9309-courville-st-detroit-mi":"9309-courville","realtoken-s-19163-mitchell-st-detroit-mi":"19163-mitchell","realtoken-s-19311-keystone-st-detroit-mi":"19311-keystone","realtoken-s-19218-houghton-st-detroit-mi":"19218-houghton","realtoken-s-15796-hartwell-st-detroit-mi":"15796-hartwell","realtoken-s-14229-wilshire-dr-detroit-mi":"14229-wilshire","realtoken-s-14319-rosemary-st-detroit-mi":"14319-rosemary","realtoken-s-18276-appoline-st-detroit-mi":"18276-appoline","realtoken-s-9166-devonshire-rd-detroit-mi":"9166-devonshire","realtoken-s-13606-winthrop-st-detroit-mi":"13606-winthrop","realtoken-s-14882-troester-st-detroit-mi":"14882-troester","realtoken-s-10629-mckinney-st-detroit-mi":"10629-mckinney","realtoken-s-15860-hartwell-st-detroit-mi":"15860-hartwell","realtoken-s-15373-parkside-st-detroit-mi":"15373-parkside","realtoken-s-14494-chelsea-ave-detroit-mi":"14494-chelsea","realtoken-s-10639-stratman-st-detroit-mi":"10639-stratman","realtoken-s-15350-greydale-st-detroit-mi":"15350-greydale","realtoken-s-14078-carlisle-st-detroit-mi":"14078-carlisle","realtoken-s-18900-mansfield-st-detroit-mi":"18900-mansfield","realtoken-s-12409-whitehill-st-detroit-mi":"12409-whitehill","realtoken-s-15048-freeland-st-detroit-mi":"15048-freeland","realtoken-s-19596-goulburn-st-detroit-mi":"19596-goulburn","realtoken-s-19200-strasburg-st-detroit-mi":"19200-strasburg","realtoken-s-6923-greenview-ave-detroit-mi":"6923-greenview","realtoken-s-9133-devonshire-rd-detroit-mi":"9133-devonshire","realtoken-s-10604-somerset-ave-detroit-mi":"10604-somerset","realtoken-s-19020-rosemont-ave-detroit-mi":"19020-rosemont","realtoken-s-10612-somerset-ave-detroit-mi":"10612-somerset","realtoken-s-10700-whittier-ave-detroit-mi":"10700-whittier","realtoken-s-17500-evergreen-rd-detroit-mi":"17500-evergreen","realtoken-s-9165-kensington-ave-detroit-mi":"9165-kensington","realtoken-s-1542-s.ridgeway-ave-chicago-il":"1542-s-ridgeway","realtoken-s-11653-nottingham-rd-detroit-mi":"11653-nottingham","realtoken-s-4680-buckingham-ave-detroit-mi":"4680-buckingham","realtoken-s-18481-westphalia-st-detroit-mi":"18481-westphalia","realtoken-s-13114-glenfield-ave-detroit-mi":"13114-glenfield","realtoken-s-13116-kilbourne-ave-detroit-mi":"13116-kilbourne","realtoken-s-16200-fullerton-ave-detroit-mi":"16200-fullerton","realtoken-s-14066-santa-rosa-dr-detroit-mi":"14066-santa-rosa","realtoken-s-19201-westphalia-st-detroit-mi":"19201-westphalia","realtoken-s-12405-santa-rosa-dr-detroit-mi":"12405-santa-rosa","realtoken-s-18776-sunderland-rd-detroit-mi":"18776-sunderland","realtoken-s-14231-strathmoor-st-detroit-mi":"14231-strathmoor","realtoken-s-15784-monte-vista-st-detroit-mi":"15784-monte-vista","realtoken-s-3432-harding-street-detroit-mi":"3432-harding","realtoken-s-18273-monte-vista-st-detroit-mi":"18273-monte-vista","mbcc":"blockchain-based-distributed-super-computing-platform","realtoken-s-10617-hathaway-ave-cleveland-oh":"10617-hathaway","realtoken-s-4380-beaconsfield-st-detroit-mi":"4380-beaconsfield","realtoken-s-9465-beaconsfield-st-detroit-mi":"9465-beaconsfield","realtoken-s-8342-schaefer-highway-detroit-mi":"8342-schaefer","realtoken-s-4852-4854-w.cortez-st-chicago-il":"4852-4854-w-cortez","realtoken-s-10024-10028-appoline-st-detroit-mi":"10024-10028-appoline","realtoken-s-12334-lansdowne-street-detroit-mi":"12334-lansdowne","realtoken-s-581-587-jefferson-ave-rochester-ny":"581-587-jefferson","realtoken-s-25097-andover-dr-dearborn-heights-mi":"25097-andover","realtoken-s-272-n.e.-42nd-court-deerfield-beach-fl":"272-n-e-42nd-court"};

//end
