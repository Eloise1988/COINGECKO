/**
 * @OnlyCurrentDoc
 */

/*====================================================================================================================================*
  CoinGecko Google Sheet Feed by Eloise1988
  ====================================================================================================================================
  Version:      2.0.5
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
     GECKOCAPDILUTED       For use by end users to cryptocurrency total diluted market caps
     GECKOPRICEBYNAME      For use by end users to cryptocurrency prices by id, one input only
     GECKOVOLUMEBYNAME     For use by end users to cryptocurrency 24h volumes by id, one input only
     GECKOCAPBYNAME        For use by end users to cryptocurrency total market caps by id, one input only
     GECKOCHANGE           For use by end users to cryptocurrency % change price, volume, mkt
     GECKOCHANGEBYNAME     For use by end users to cryptocurrency % change price, volume, mkt using the ticker's id
     GECKOCHART            For use by end users to cryptocurrency price history for plotting
     GECKOHIST             For use by end users to cryptocurrency historical prices, volumes, mkt
     GECKOATH              For use by end users to cryptocurrency All Time High Prices
     GECKOATL              For use by end users to cryptocurrency All Time Low Prices
     GECKO24HIGH           For use by end users to cryptocurrency 24H Low Price
     GECKO24LOW            For use by end users to cryptocurrency 24H High Price
     GECKO24HPRICECHANGE   For use by end users to get cryptocurrency 24h % Price change 
     GECKO_ID_DATA         For use by end users to cryptocurrency data end points
     GECKOLOGO             For use by end users to cryptocurrency Logos by ticker
     GECKOLOGOBYNAME       For use by end users to cryptocurrency Logos by id
     COINGECKO_ID          For use by end users to get the coin's id in Coingecko
     GECKO_RANK            For use by end users to get the coin's ranking by market cap


  If ticker isn't functionning please refer to the coin's id you can find in the following JSON pas: https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1

  
  For bug reports see https://github.com/Eloise1988/COINGECKO/issues
  
  
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  2.0.4  May 31st Added functionality COINGECKO PRIVATE KEY
  2.0.5  Sept 30th Improved code description + uploaded new Coingecko ticker IDs
 *====================================================================================================================================*/
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
const CoinList = {"index":"index-cooperative","btc":"bitcoin","eth":"ethereum","usdt":"tether","ada":"cardano","bnb":"binancecoin","xrp":"ripple","sol":"solana","usdc":"usd-coin","dot":"polkadot","doge":"dogecoin","avax":"avalanche-2","luna":"terra-luna","busd":"binance-usd","uni":"uniswap","link":"chainlink","ltc":"litecoin","algo":"algorand","atom":"cosmos","bch":"bitcoin-cash","wbtc":"wrapped-bitcoin","matic":"matic-network","icp":"internet-computer","xlm":"stellar","fil":"filecoin","trx":"tron","ftt":"ftx-token","dai":"dai","etc":"ethereum-classic","vet":"vechain","ceth":"compound-ether","xtz":"tezos","theta":"theta-token","bcha":"bitcoin-cash-abc-2","xec":"ecash","cusdc":"compound-usd-coin","xmr":"monero","cake":"pancakeswap-token","cdai":"cdai","okb":"okb","axs":"axie-infinity","egld":"elrond-erd-2","cro":"crypto-com-chain","steth":"staked-ether","qnt":"quant-network","eos":"eos","aave":"aave","shib":"shiba-inu","hbar":"hedera-hashgraph","near":"near","grt":"the-graph","ftm":"fantom","miota":"iota","ksm":"kusama","leo":"leo-token","neo":"neo","klay":"klay-token","ust":"terrausd","bsv":"bitcoin-cash-sv","waves":"waves","ar":"arweave","cel":"celsius-degree-token","amp":"amp-token","mkr":"maker","btt":"bittorrent-2","sushi":"sushi","rune":"thorchain","celo":"celo","comp":"compound-governance-token","hbtc":"huobi-btc","hnt":"helium","snx":"havven","dash":"dash","one":"harmony","deso":"bitclout","xdc":"xdce-crowd-sale","ohm":"olympus","omg":"omisego","tfuel":"theta-fuel","hot":"holotoken","tusd":"true-usd","dcr":"decred","chz":"chiliz","dydx":"dydx","ht":"huobi-token","xem":"nem","iost":"iostoken","zec":"zcash","stx":"blockstack","enj":"enjincoin","omi":"ecomi","zil":"zilliqa","yfi":"yearn-finance","mina":"mina-protocol","qtum":"qtum","flow":"flow","icx":"icon","srm":"serum","osmo":"osmosis","crv":"curve-dao-token","rvn":"ravencoin","bat":"basic-attention-token","usdp":"paxos-standard","btg":"bitcoin-gold","mana":"decentraland","mim":"magic-internet-money","tel":"telcoin","audio":"audius","ren":"republic-protocol","celr":"celer-network","perp":"perpetual-protocol","bnt":"bancor","safemoon":"safemoon","zen":"zencash","nexo":"nexo","kcs":"kucoin-shares","nxm":"nxm","xsushi":"xsushi","renbtc":"renbtc","zrx":"0x","mdx":"mdex","cusdt":"compound-usdt","sc":"siacoin","ray":"raydium","dgb":"digibyte","ont":"ontology","gala":"gala","gt":"gatechain-token","iotx":"iotex","chsb":"swissborg","ankr":"ankr","movr":"moonriver","lusd":"liquity-usd","c98":"coin98","nano":"nano","ln":"link","dag":"constellation-labs","uma":"uma","sand":"the-sandbox","usdn":"neutrino","vxv":"vectorspace","coti":"coti","rpl":"rocket-pool","fet":"fetch-ai","erg":"ergo","ygg":"yield-guild-games","hero":"metahero","fei":"fei-protocol","poly":"polymath","kava":"kava","titan":"titanswap","1inch":"1inch","wrx":"wazirx","lrc":"loopring","oxy":"oxygen","woo":"woo-network","glm":"golem","uos":"ultra","etn":"electroneum","xprt":"persistence","ubt":"unibright","arrr":"pirate-chain","dent":"dent","lpt":"livepeer","sxp":"swipe","lsk":"lisk","rsr":"reserve-rights-token","seth":"seth","akt":"akash-network","waxp":"wax","gno":"gnosis","anc":"anchor-protocol","skl":"skale","ckb":"nervos-network","alpha":"alpha-finance","frax":"frax","plex":"plex","lyxe":"lukso-token","twt":"trust-wallet-token","vtho":"vethor-token","xdb":"digitalbits","ewt":"energy-web-token","bake":"bakerytoken","xyo":"xyo-network","med":"medibloc","ilv":"illuvium","fida":"bonfida","joe":"joe","inj":"injective-protocol","xvg":"verge","cfx":"conflux-token","mngo":"mango-markets","win":"wink","pundix":"pundi-x-2","agix":"singularitynet","paxg":"pax-gold","vlx":"velas","husd":"husd","band":"band-protocol","orbs":"orbs","mir":"mirror-protocol","bcd":"bitcoin-diamond","scrt":"secret","sdn":"shiden","snt":"status","asd":"asd","xch":"chia","cvc":"civic","eden":"eden","ocean":"ocean-protocol","fx":"fx-coin","tribe":"tribe-2","elf":"aelf","ogn":"origin-protocol","cvxcrv":"convex-crv","prom":"prometeus","ardr":"ardor","mask":"mask-network","ldo":"lido-dao","reef":"reef-finance","rgt":"rari-governance-token","ton":"tokamak-network","gusd":"gemini-dollar","npxs":"pundi-x","cvx":"convex-finance","xvs":"venus","rlc":"iexec-rlc","alusd":"alchemix-usd","ctsi":"cartesi","bfc":"bifrost","nmr":"numeraire","orn":"orion-protocol","maid":"maidsafecoin","peak":"marketpeak","stmx":"storm","ark":"ark","toke":"tokemak","rose":"oasis-network","albt":"allianceblock","sapp":"sapphire","dero":"dero","kda":"kadena","agld":"adventure-gold","bal":"balancer","cuni":"compound-uniswap","sbtc":"sbtc","spell":"spell-token","ach":"alchemy-pay","susd":"nusd","tlm":"alien-worlds","mln":"melon","cspr":"casper-network","keep":"keep-network","fun":"funfair","hive":"hive","idex":"aurora-dao","dodo":"dodo","zcx":"unizen","alice":"my-neighbor-alice","eps":"ellipsis","flex":"flex-coin","nkn":"nkn","dpi":"defipulse-index","tru":"truefi","klv":"klever","dawn":"dawn-protocol","dvpn":"sentinel","tomo":"tomochain","vra":"verasity","time":"wonderland","mtl":"metal","strax":"stratis","oxt":"orchid-protocol","wcfg":"wrapped-centrifuge","10set":"tenset","sys":"syscoin","math":"math","steem":"steem","pac":"paccoin","auction":"auction","bdx":"beldex","ddx":"derivadao","trac":"origintrail","rad":"radicle","super":"superfarm","rly":"rally-2","hxro":"hxro","ant":"aragon","atlas":"star-atlas","fxs":"frax-share","pla":"playdapp","rif":"rif-token","artr":"artery","mbox":"mobox","yfii":"yfii-finance","alcx":"alchemix","noia":"noia-network","chr":"chromaway","xrune":"thorstarter","utk":"utrust","nwc":"newscrypto-coin","banana":"apeswap-finance","aeth":"ankreth","badger":"badger-dao","dao":"dao-maker","nu":"nucypher","storj":"storj","tlos":"telos","rare":"superrare","knc":"kyber-network-crystal","xaut":"tether-gold","lend":"ethlend","ava":"concierge-io","wan":"wanchain","elg":"escoin-token","req":"request-network","polis":"star-atlas-dao","htr":"hathor","dpx":"dopex","ata":"automata","slp":"smooth-love-potion","meta":"metadium","orca":"orca","rndr":"render-token","c20":"crypto20","uqc":"uquid-coin","kncl":"kyber-network","pvm":"privateum","axc":"axia-coin","vai":"vai","alpaca":"alpaca-finance","clv":"clover-finance","tko":"tokocrypto","egg":"waves-ducks","sun":"sun-token","quick":"quick","exrd":"e-radix","rep":"augur","hydra":"hydra","mine":"pylon-protocol","iq":"everipedia","usdx":"usdx","zmt":"zipmex-token","kiro":"kirobo","kin":"kin","powr":"power-ledger","api3":"api3","wnxm":"wrapped-nxm","dvi":"dvision-network","cream":"cream-2","pha":"pha","pols":"polkastarter","pbtc":"ptokens-btc","kmd":"komodo","btcst":"btc-standard-hashrate-token","bond":"barnbridge","cqt":"covalent","iris":"iris-network","qkc":"quark-chain","core":"cvault-finance","czrx":"compound-0x","forth":"ampleforth-governance-token","eth2x-fli":"eth-2x-flexible-leverage-index","dnt":"district0x","zks":"zkswap","bts":"bitshares","ampl":"ampleforth","gas":"gas","pyr":"vulcan-forged","kai":"kardiachain","any":"anyswap","slim":"solanium","ern":"ethernity-chain","gmx":"gmx","mx":"mx-token","eurs":"stasis-eurs","loc":"lockchain","lgcy":"lgcy-network","lina":"linear","bscpad":"bscpad","mrph":"morpheus-network","farm":"harvest-finance","gtc":"gitcoin","velo":"velo","pre":"presearch","wild":"wilder-world","starl":"starlink","sfp":"safepal","occ":"occamfi","hegic":"hegic","ramp":"ramp","bytz":"bytz","tpt":"token-pocket","xor":"sora","strong":"strong","cards":"cardstarter","rook":"rook","mft":"mainframe","nrg":"energi","jst":"just","lit":"litentry","obtc":"boringdao-btc","trb":"tellor","val":"sora-validator-token","mist":"alchemist","sure":"insure","cusd":"celo-dollar","ctk":"certik","divi":"divi","kp3r":"keep3rv1","bzrx":"bzx-protocol","rvp":"revolution-populi","ghst":"aavegotchi","seur":"seur","stsol":"lido-staked-sol","png":"pangolin","stake":"xdai-stake","ufo":"ufo-gaming","btm":"bytom","yooshi":"yooshi","boo":"spookyswap","cbat":"compound-basic-attention-token","om":"mantra-dao","bifi":"beefy-finance","xdata":"streamr-xdata","hi":"hi-dollar","seth2":"seth2","lcx":"lcx","bel":"bella-protocol","rdd":"reddcoin","nrv":"nerve-finance","psg":"paris-saint-germain-fan-token","woop":"woonkly-power","inst":"instadapp","tvk":"terra-virtua-kolect","ela":"elastos","step":"step-finance","raca":"radio-caca","cre":"carry","xhv":"haven","ice":"ice-token","xcm":"coinmetro","hns":"handshake","btse":"btse-token","mxc":"mxc","swap":"trustswap","pnk":"kleros","loomold":"loom-network","zai":"zero-collateral-dai","vid":"videocoin","dia":"dia-data","lto":"lto-network","torn":"tornado-cash","dg":"decentral-games","mcb":"mcdex","hard":"kava-lend","aion":"aion","dock":"dock","ibeur":"iron-bank-euro","nmx":"nominex","chess":"tranchess","fwb":"friends-with-benefits-pro","xcad":"xcad-network","shr":"sharering","arpa":"arpa-chain","feg":"feg-token","suku":"suku","whale":"whale","flux":"zelcash","gzil":"governance-zil","wozx":"wozx","pcx":"chainx","prq":"parsiq","ion":"ion","rari":"rarible","tt":"thunder-token","snm":"sonm","xpr":"proton","df":"dforce-token","pond":"marlin","hez":"hermez-network-token","adax":"adax","kar":"karura","firo":"zcoin","hunt":"hunt-token","ersdl":"unfederalreserve","akro":"akropolis","creth2":"cream-eth2","aergo":"aergo","blz":"bluzelle","ltx":"lattice-token","edg":"edgeware","evn":"evolution-finance","sdao":"singularitydao","front":"frontier-token","maps":"maps","naos":"naos-finance","tryb":"bilira","cdt":"blox","vrsc":"verus-coin","cos":"contentos","stpt":"stp-network","city":"manchester-city-fan-token","aqua":"planet-finance","paid":"paid-network","atri":"atari","fst":"futureswap","nsbt":"neutrino-system-base-token","stax":"stablexswap","cvp":"concentrated-voting-power","znn":"zenon","fio":"fio-protocol","xsgd":"xsgd","grs":"groestlcoin","soul":"phantasma","vite":"vite","slink":"slink","nftx":"nftx","sero":"super-zero","cru":"crust-network","adx":"adex","mtv":"multivac","ctx":"cryptex-finance","pdex":"polkadex","vgx":"ethos","sfund":"seedify-fund","xcp":"counterparty","qi":"benqi","upp":"sentinel-protocol","erowan":"sifchain","yld":"yield-app","pvu":"plant-vs-undead-token","nft":"apenft","bor":"boringdao-[old]","drgn":"dragonchain","sbd":"steem-dollars","bcn":"bytecoin","kobe":"shabu-shabu","swp":"kava-swap","rfr":"refereum","rai":"rai","beam":"beam","umb":"umbrella-network","koda":"koda-finance","lon":"tokenlon","cxo":"cargox","yldy":"yieldly","rfox":"redfox-labs-2","pro":"propy","dext":"dextools","sbr":"saber","xhdx":"hydradx","cudos":"cudos","o3":"o3-swap","idia":"idia","slt":"smartlands","dusk":"dusk-network","sai":"sai","bepro":"bepro-network","nxs":"nexus","uft":"unlend-finance","kine":"kine-protocol","xava":"avalaunch","metis":"metis-token","cbk":"cobak-token","dgd":"digixdao","lqty":"liquity","btu":"btu-protocol","bar":"fc-barcelona-fan-token","gny":"gny","met":"metronome","sfi":"saffron-finance","eurt":"tether-eurt","qash":"qash","boson":"boson-protocol","get":"get-token","ooe":"openocean","veed":"veed","kub":"bitkub-coin","glch":"glitch-protocol","shft":"shyft-network-2","pivx":"pivx","ngm":"e-money","bmx":"bitmart-token","sdt":"stake-dao","led":"ledgis","gero":"gerowallet","for":"force-protocol","vidt":"v-id-blockchain","sx":"sx-network","pltc":"platoncoin","adapad":"adapad","bns":"bns-token","usdk":"usdk","chain":"chain-games","pefi":"penguin-finance","dexe":"dexe","nuls":"nuls","tronpad":"tronpad","anj":"anj","bpay":"bnbpay","veri":"veritaseum","ask":"permission-coin","urus":"urus-token","part":"particl","aqt":"alpha-quark-token","ethbull":"3x-long-ethereum-token","ast":"airswap","skey":"smartkey","gxc":"gxchain","sparta":"spartan-protocol-token","fis":"stafi","fold":"manifold-finance","thoreum":"thoreum","ube":"ubeswap","unfi":"unifi-protocol-dao","adk":"aidos-kuneen","krt":"terra-krw","aleph":"aleph","hc":"hshare","cgg":"chain-guardians","kyl":"kylin-network","raini":"rainicorn","mpl":"maple","dehub":"dehub","dego":"dego-finance","bmon":"binamon","vsys":"v-systems","cope":"cope","ycc":"yuan-chain-coin","ctxc":"cortex","mbx":"mobiecoin","tbtc":"tbtc","hai":"hackenai","like":"only1","xyz":"universe-xyz","trias":"trias-token","vsp":"vesper-finance","dog":"the-doge-nft","ae":"aeternity","naft":"nafter","shi":"shirtum","apl":"apollo","slrs":"solrise-finance","eac":"earthcoin","snl":"sport-and-leisure","aioz":"aioz-network","root":"rootkit","cummies":"cumrocket","coval":"circuits-of-value","fine":"refinable","zoom":"coinzoom-token","hoge":"hoge-finance","rail":"railgun","cap":"cap","spi":"shopping-io","card":"cardstack","moc":"mossland","ceur":"celo-euro","nim":"nimiq-2","duck":"unit-protocol-duck","mcash":"midas-cash","juv":"juventus-fan-token","musd":"musd","apy":"apy-finance","vlxpad":"velaspad","epk":"epik-protocol","auto":"auto","fxf":"finxflo","pepecash":"pepecash","push":"ethereum-push-notification-service","hibs":"hiblocks","pmon":"polychain-monsters","thn":"throne","vee":"blockv","wing":"wing-finance","hotcross":"hot-cross","fsn":"fsn","ibbtc":"interest-bearing-bitcoin","zano":"zano","id":"everid","teddy":"teddy","lhc":"lightcoin","mass":"mass","conv":"convergence","kccpad":"kccpad","pnt":"pnetwork","dsla":"stacktical","gal":"galatasaray-fan-token","go":"gochain","hbc":"hbtc-token","belt":"belt","srk":"sparkpoint","xed":"exeedme","pkf":"polkafoundry","hapi":"hapi","mhc":"metahash","wpp":"wpp-token","ppt":"populous","mqqq":"mirrored-invesco-qqq-trust","posi":"position-token","qsp":"quantstamp","elon":"dogelon-mars","hopr":"hopr","atm":"atletico-madrid","flx":"reflexer-ungovernance-token","grin":"grin","aria20":"arianee","betu":"betu","vtc":"vertcoin","ult":"ultiledger","mtrg":"meter","matter":"antimatter","solve":"solve-care","zpay":"zoid-pay","sny":"synthetify-token","dep":"deapcoin","oxen":"loki-network","mgoogl":"mirrored-google","mmsft":"mirrored-microsoft","revv":"revv","bios":"bios","bux":"blockport","xido":"xido-finance","dec":"decentr","ousd":"origin-dollar","adp":"adappter-token","rdn":"raiden-network","snow":"snowblossom","mer":"mercurial","mtsla":"mirrored-tesla","cube":"somnium-space-cubes","htb":"hotbit-token","nif":"unifty","cut":"cutcoin","sale":"dxsale-network","lpool":"launchpool","mamzn":"mirrored-amazon","maapl":"mirrored-apple","boa":"bosagora","mbl":"moviebloc","mslv":"mirrored-ishares-silver-trust","xms":"mars-ecosystem-token","mnflx":"mirrored-netflix","pool":"pooltogether","dashd":"dash-diamond","wicc":"waykichain","cnd":"cindicator","mtwtr":"mirrored-twitter","frm":"ferrum-network","bank":"bankless-dao","socks":"unisocks","tulip":"solfarm","port":"port-finance","wtc":"waltonchain","phb":"red-pulse","mith":"mithril","nftl":"nftlaunch","nav":"nav-coin","muso":"mirrored-united-states-oil-fund","visr":"visor","ethpad":"ethpad","cvnt":"content-value-network","swth":"switcheo","map":"marcopolo","mork":"mork","bao":"bao-finance","lz":"launchzone","erc20":"erc20","dpet":"my-defi-pet","wow":"wownero","troy":"troy","vvsp":"vvsp","coc":"coin-of-the-champions","fevr":"realfevr","lbc":"lbry-credits","nest":"nest","dxd":"dxdao","fcl":"fractal","cocos":"cocos-bcx","route":"route","dfy":"defi-for-you","stos":"stratos","unic":"unicly","poolz":"poolz-finance","sky":"skycoin","dxl":"dexlab","lith":"lithium-finance","useless":"useless","gto":"gifto","bmi":"bridge-mutual","rbc":"rubic","govi":"govi","pendle":"pendle","dvf":"dvf","ring":"darwinia-network-native-token","polk":"polkamarkets","mbaba":"mirrored-alibaba","mdt":"measurable-data-token","armor":"armor","axn":"axion","xmon":"xmon","bz":"bit-z-token","nftb":"nftb","mlt":"media-licensing-token","svs":"givingtoservices-svs","cell":"cellframe","gyen":"gyen","deri":"deri-protocol","arcx":"arc-governance","salt":"salt","dafi":"dafi-protocol","c3":"charli3","key":"selfkey","bdt":"blackdragon-token","nex":"neon-exchange","mitx":"morpheus-labs","mix":"mixmarvel","zb":"zb-token","dusd":"defidollar","sha":"safe-haven","ads":"adshares","lat":"platon-network","foam":"foam-protocol","trubgr":"trubadger","caps":"coin-capsule","wusd":"wault-usd","oxb":"oxbull-tech","sku":"sakura","bmc":"bountymarketcap","ppc":"peercoin","nebl":"neblio","lamb":"lambda","ppay":"plasma-finance","axel":"axel","monsta":"cake-monster","dora":"dora-factory","bpt":"blackpool-token","hyn":"hyperion","xcur":"curate","ipad":"infinity-pad","maki":"makiswap","pop":"pop-chest-token","acm":"ac-milan-fan-token","gel":"gelato","mwat":"restart-energy","enq":"enq-enecuum","pbtc35a":"pbtc35a","gfarm2":"gains-farm","dip":"etherisc","spec":"spectrum-token","ghx":"gamercoin","mfg":"smart-mfg","buy":"burency","zcn":"0chain","tht":"thought","jup":"jupiter","mvi":"metaverse-index","&#127760;":"qao","zee":"zeroswap","ignis":"ignis","labs":"labs-group","nftart":"nft-art-finance","xsn":"stakenet","idv":"idavoll-network","mta":"meta","bean":"bean","amb":"amber","insur":"insurace","koge":"bnb48-club-token","tarot":"tarot","dcn":"dentacoin","pib":"pibble","gton":"graviton","tone":"te-food","signa":"signum","spirit":"spiritswap","six":"six-network","el":"elysia","layer":"unilayer","civ":"civilization","sntvt":"sentivate","btc2":"bitcoin-2","if":"impossible-finance","kono":"konomi-network","asr":"as-roma-fan-token","kan":"kan","palg":"palgold","oly":"olyseum","dht":"dhedge-dao","dbc":"deepbrain-chain","fox":"shapeshift-fox-token","opium":"opium","int":"internet-node-token","fct":"factom","bax":"babb","gmr":"gmr-finance","zwap":"zilswap","zt":"ztcoin","pbr":"polkabridge","pnd":"pandacoin","mph":"88mph","bip":"bip","myst":"mysterium","nxt":"nxt","don":"don-key","tct":"tokenclub","ddim":"duckdaodime","bpro":"b-protocol","fara":"faraland","nas":"nebulas","orai":"oraichain-token","yla":"yearn-lazy-ape","swingby":"swingby","mm":"million","smart":"smartcash","urqa":"ureeqa","pacoca":"pacoca","fwt":"freeway-token","qrl":"quantum-resistant-ledger","samo":"samoyedcoin","suter":"suterusu","abt":"arcblock","uncx":"unicrypt-2","spa":"sperax","cfi":"cyberfi","safemars":"safemars","diver":"divergence-protocol","upunk":"unicly-cryptopunks-collection","koin":"koinos","xrt":"robonomics-network","sylo":"sylo","kex":"kira-network","scream":"scream","arv":"ariva","bscx":"bscex","lgo":"legolas-exchange","drk":"draken","ichi":"ichi-farm","ifc":"infinitecoin","hdp.\u0444":"hedpay","mod":"modefi","spank":"spankchain","gvt":"genesis-vision","ujenny":"jenny-metaverse-dao-token","yve-crvdao":"vecrv-dao-yvault","wom":"wom-token","robot":"robot","veth":"vether","dfyn":"dfyn-network","evx":"everex","san":"santiment-network-token","minds":"minds","rcn":"ripio-credit-network","mth":"monetha","etp":"metaverse-etp","cyce":"crypto-carbon-energy","vfox":"vfox","mda":"moeda-loyalty-points","prob":"probit-exchange","brd":"bread","oddz":"oddz","ndx":"indexed-finance","snob":"snowball-token","zoon":"cryptozoon","satt":"satt","wxt":"wirex","defi5":"defi-top-5-tokens-index","baas":"baasid","txl":"tixl-new","xend":"xend-finance","kick":"kick","stf":"structure-finance","ubq":"ubiq","utnp":"universa","chi":"chimaera","bondly":"bondly","degen":"degen-index","spnd":"spendcoin","gth":"gather","si":"siren","vemp":"vempire-ddao","miau":"mirrored-ishares-gold-trust","feed":"feeder-finance","cs":"credits","liq":"liq-protocol","digg":"digg","wault":"wault-finance-old","sefi":"secret-finance","spc":"spacechain-erc-20","bog":"bogged-finance","wabi":"wabi","ubxt":"upbots","ara":"adora-token","mute":"mute","muse":"muse-2","yfiii":"dify-finance","ann":"annex","nec":"nectar-token","ban":"banano","qanx":"qanplatform","cas":"cashaa","hyve":"hyve","dino":"dinoswap","cws":"crowns","ovr":"ovr","euno":"euno","media":"media-network","wex":"waultswap","crpt":"crypterium","smt":"swarm-markets","saito":"saito","xai":"sideshift-token","marsh":"unmarshal","apw":"apwine","saf":"safcoin","rae":"rae-token","stn":"stone-token","rsv":"reserve","og":"og-fan-token","eqx":"eqifi","zig":"zignaly","grid":"grid","bit":"biconomy-exchange-token","xtk":"xtoken","crp":"cropperfinance","amlt":"coinfirm-amlt","arch":"archer-dao-governance-token","meme":"degenerator","olt":"one-ledger","exnt":"exnetwork-token","chp":"coinpoker","xep":"electra-protocol","shroom":"shroom-finance","wag":"wagyuswap","slice":"tranche-finance","apm":"apm-coin","jade":"jade-currency","clu":"clucoin","deto":"delta-exchange-token","lmt":"lympo-market-token","juld":"julswap","pros":"prosper","niox":"autonio","k21":"k21","dea":"dea","rfuel":"rio-defi","instar":"insights-network","dnxc":"dinox","jrt":"jarvis-reward-token","superbid":"superbid","razor":"razor-network","xeq":"triton","iqn":"iqeon","zap":"zap","kdc":"fandom-chain","cnfi":"connect-financial","swrv":"swerve-dao","fuse":"fuse-network-token","opct":"opacity","iov":"starname","ones":"oneswap-dao-token","blank":"blank","gmee":"gamee","zora":"zoracles","cops":"cops-finance","tab":"tabank","plr":"pillar","dtx":"databroker-dao","oil":"oiler","oax":"openanx","nlg":"gulden","glq":"graphlinq-protocol","inv":"inverse-finance","col":"unit-protocol","shopx":"splyt","swftc":"swftcoin","mobi":"mobius","lcc":"litecoin-cash","btc2x-fli":"btc-2x-flexible-leverage-index","awx":"auruscoin","tidal":"tidal-finance","scc":"stakecube","block":"blocknet","sunny":"sunny-aggregator","emc2":"einsteinium","pika":"pikachu","mtlx":"mettalex","moov":"dotmoovs","xcash":"x-cash","os":"os","gleec":"gleec-coin","bdi":"basketdao-defi-index","pi":"pchain","ablock":"any-blocknet","man":"matrix-ai-network","valor":"smart-valor","helmet":"helmet-insure","bbank":"blockbank","hord":"hord","dmd":"diamond","hunny":"pancake-hunny","cmk":"credmark","ktn":"kattana","nebo":"csp-dao-network","trtl":"turtlecoin","ngc":"naga","lnd":"lendingblock","umx":"unimex-network","soc":"all-sports","nyzo":"nyzo","hvn":"hiveterminal","cwbtc":"compound-wrapped-btc","fin":"definer","cov":"covesting","mbtc":"mstable-btc","vrx":"verox","nct":"polyswarm","dust":"dust-token","ionx":"charged-particles","nvt":"nervenetwork","gcr":"global-coin-research","free":"free-coin","es":"era-swap-token","prcy":"prcy-coin","xft":"offshift","tkn":"tokencard","eng":"enigma","filda":"filda","ten":"tokenomy","tnb":"time-new-bank","aog":"smartofgiving","$anrx":"anrkey-x","unn":"union-protocol-governance-token","ghost":"ghost-by-mcafee","idle":"idle","abyss":"the-abyss","krl":"kryll","poa":"poa-network","chng":"chainge-finance","afin":"afin-coin","wgr":"wagerr","udoo":"howdoo","eqo":"equos-origin","pny":"peony-coin","meth":"mirrored-ether","steamx":"steam-exchange","mng":"moon-nation-game","mtx":"matryx","wsg":"wall-street-games","rev":"revain","xfund":"xfund","plu":"pluton","idrt":"rupiah-token","stnd":"standard-protocol","yfl":"yflink","tch":"tigercash","put":"putincoin","lua":"lua-token","gswap":"gameswap-org","owc":"oduwa-coin","lym":"lympo","cbc":"cashbet-coin","rbase":"rbase-finance","mchc":"mch-coin","xmx":"xmax","tower":"tower","nfd":"feisty-doge-nft","eqz":"equalizer","vib":"viberate","maha":"mahadao","oce":"oceanex-token","gains":"gains","bix":"bibox-token","pickle":"pickle-finance","dough":"piedao-dough-v2","mint":"public-mint","la":"latoken","vnla":"vanilla-network","fab":"fabric","fkx":"fortknoxter","tra":"trabzonspor-fan-token","stack":"stackos","drace":"deathroad","ele":"eleven-finance","tcap":"total-crypto-market-cap-token","paper":"dope-wars-paper","vex":"vexanium","haus":"daohaus","top":"top-network","rtm":"raptoreum","hzn":"horizon-protocol","act":"achain","sak3":"sak3","dlt":"agrello","egt":"egretia","abl":"airbloc-protocol","yuki":"yuki-coin","dop":"drops-ownership-power","aoa":"aurora","bitcny":"bitcny","raze":"raze-network","ace":"acent","cw":"cardwallet","bigsb":"bigshortbets","reap":"reapchain","must":"must","mnst":"moonstarter","saud":"saud","fly":"franklin","udo":"unido-ep","tau":"lamden","ioi":"ioi-token","moon":"mooncoin","vidya":"vidya","oap":"openalexa-protocol","unidx":"unidex","crwd":"crowdhero","coin":"coin","idna":"idena","minidoge":"minidoge","qlc":"qlink","psl":"pastel","ncash":"nucleus-vision","ocn":"odyssey","fear":"fear","xpx":"proximax","ode":"odem","premia":"premia","swapz":"swapz-app","tcp":"the-crypto-prophecies","sail":"sail","yam":"yam-2","bcp":"block-commerce-protocol","appc":"appcoins","bcdt":"blockchain-certified-data-token","move":"holyheld-2","avt":"aventus","fnt":"falcon-token","leos":"leonicorn-swap","oin":"oin-finance","mfi":"marginswap","brew":"cafeswap-token","nsfw":"xxxnifty","hget":"hedget","smg":"smaugs-nft","deus":"deus-finance","boring":"boringdao","geeq":"geeq","kalm":"kalmar","gspi":"gspi","shibx":"shibavax","dyp":"defi-yield-protocol","sake":"sake-token","cmt":"cybermiles","cifi":"citizen-finance","pnode":"pinknode","mooned":"moonedge","sph":"spheroid-universe","eosdt":"equilibrium-eosdt","bgld":"based-gold","combo":"furucombo","avxl":"avaxlauncher","wasp":"wanswap","elk":"elk-finance","vnt":"inventoryclub","crep":"compound-augur","tips":"fedoracoin","pay":"tenx","vso":"verso","nrch":"enreachdao","crbn":"carbon","euler":"euler-tools","world":"world-token","krw":"krown","cofi":"cofix","bird":"bird-money","revo":"revomon","argon":"argon","bft":"bnktothefuture","woofy":"woofy","uwl":"uniwhales","start":"bscstarter","trava":"trava-finance","swag":"swag-finance","warp":"warp-finance","bas":"block-ape-scissors","dov":"dovu","mds":"medishares","umask":"unicly-hashmasks-collection","nds":"nodeseeds","npx":"napoleon-x","cc":"cryptocart","node":"dappnode","xmy":"myriadcoin","bwf":"beowulf","dev":"dev-protocol","roobee":"roobee","etho":"ether-1","obot":"obortech","phtr":"phuture","hpb":"high-performance-blockchain","btcz":"bitcoinz","heroegg":"herofi","bscs":"bsc-station","dopx":"dopple-exchange-token","cvr":"polkacover","srn":"sirin-labs-token","hbt":"habitat","epic":"epic-cash","white":"whiteheart","zmn":"zmine","kus":"kuswap","sfd":"safe-deal","c0":"carboneco","ftc":"feathercoin","cover":"cover-protocol","polx":"polylastic","thales":"thales","argo":"argo","vision":"apy-vision","ptf":"powertrade-fuel","hakka":"hakka-finance","oms":"open-monetary-system","nord":"nord-finance","1337":"e1337","uip":"unlimitedip","isp":"ispolink","raven":"raven-protocol","yvault-lp-ycurve":"yvault-lp-ycurve","keanu":"keanu-inu","spore":"spore","cv":"carvertical","sco":"score-token","uncl":"uncl","uape":"unicly-bored-ape-yacht-club-collection","dhc":"deltahub-community","cwap":"defire","pslip":"pinkslip-finance","stars":"mogul-productions","starship":"starship","rabbit":"rabbit-finance","blkc":"blackhat-coin","ccx":"conceal","glc":"goldcoin","fuel":"fuel-token","xio":"xio","vbk":"veriblock","cnft":"communifty","usf":"unslashed-finance","value":"value-liquidity","xvix":"xvix","tech":"cryptomeda","rvf":"rocket-vault-finance","efl":"electronicgulden","mfb":"mirrored-facebook","cswap":"crossswap","cnns":"cnns","dextf":"dextf","vab":"vabble","xct":"citadel-one","hanu":"hanu-yokia","float":"float-protocol-float","ff":"forefront","ork":"orakuru","ess":"empty-set-share","onx":"onx-finance","locg":"locgame","midas":"midas","brush":"paint-swap","toa":"toacoin","cgt":"cache-gold","mtgy":"moontography","neu":"neumark","yec":"ycash","l2":"leverj-gluon","onion":"deeponion","eosc":"eosforce","sold":"solanax","grg":"rigoblock","rendoge":"rendoge","wasabi":"wasabix","efx":"effect-network","tfl":"trueflip","esd":"empty-set-dollar","umi":"umi-digital","ooks":"onooks","mgs":"mirrored-goldman-sachs","hit":"hitchain","blt":"bloom","sdefi":"sdefi","zefu":"zenfuse","lss":"lossless","pct":"percent","palla":"pallapay","bcpay":"bcpay-fintech","bed":"bankless-bed-index","mark":"benchmark-protocol","ut":"ulord","blk":"blackcoin","cc10":"cryptocurrency-top-10-tokens-index","agve":"agave-token","julien":"julien","gfi":"gravity-finance","hy":"hybrix","uaxie":"unicly-mystic-axies-collection","vdv":"vdv-token","42":"42-coin","asap":"chainswap","wpr":"wepower","oto":"otocash","mabnb":"mirrored-airbnb","tern":"ternio","emon":"ethermon","drc":"dracula-token","jur":"jur","waultx":"wault","dgx":"digix-gold","eye":"beholder","gdao":"governor-dao","let":"linkeye","epan":"paypolitan-token","pma":"pumapay","dta":"data","oneeth":"oneeth","yaxis":"yaxis","b20":"b20","tky":"thekey","bos":"boscoin-2","rnbw":"rainbow-token","btx":"bitcore","ivn":"investin","uniq":"uniqly","swise":"stakewise","nsure":"nsure-network","trade":"unitrade","pkr":"polker","cntr":"centaur","gnt":"greentrust","boom":"boom-token","itc":"iot-chain","apein":"ape-in","kit":"dexkit","treat":"treatdao","vsf":"verisafe","sata":"signata","snc":"suncontract","grc":"gridcoin-research","xdn":"digitalnote","paint":"paint","twx":"twindex","gro":"growth-defi","pin":"public-index-network","btcp":"bitcoin-pro","plot":"plotx","rocki":"rocki","buidl":"dfohub","unistake":"unistake","mvixy":"mirrored-proshares-vix","gnx":"genaro-network","props":"props","wdc":"worldcoin","xwin":"xwin-finance","sta":"statera","ruff":"ruff","kat":"kambria","lead":"lead-token","cti":"clintex-cti","play":"herocoin","blvr":"believer","cls":"coldstack","tyc":"tycoon","qbx":"qiibee","dax":"daex","pot":"potcoin","mona":"monavale","face":"face","bcube":"b-cube-ai","chg":"charg-coin","stpl":"stream-protocol","linka":"linka","bet":"eosbet","crwny":"crowny-token","unifi":"unifi","gen":"daostack","proto":"proto-gold-fuel","four":"the-4th-pillar","mvp":"merculet","emc":"emercoin","tad":"tadpole-finance","launch":"superlauncher","quai":"quai-dao","$manga":"manga-token","pear":"pear","dos":"dos-network","yee":"yee","cvn":"cvcoin","true":"true-chain","ops":"octopus-protocol","yf-dai":"yfdai-finance","adm":"adamant-messenger","zero":"zero-exchange","tnt":"tierion","zoo":"zookeeper","sense":"sense","wings":"wings","pipt":"power-index-pool-token","sync":"sync-network","exrn":"exrnchain","bdp":"big-data-protocol","seen":"seen","bac":"basis-cash","cook":"cook","yop":"yield-optimization-platform","scp":"siaprime-coin","ssgt":"safeswap","asko":"askobar-network","emt":"emanate","tera":"tera-smart-money","$crdn":"cardence","lyr":"lyra","mgme":"mirrored-gamestop","rmt":"sureremit","ceres":"ceres","peri":"peri-finance","ufewo":"unicly-fewocious-collection","ares":"ares-protocol","geo":"geodb","cub":"cub-finance","loot":"nftlootbox","grim":"grimtoken","rosn":"roseon-finance","equad":"quadrant-protocol","mamc":"mirrored-amc-entertainment","bid":"topbidder","bnsd":"bnsd-finance","dfd":"defidollar-dao","res":"resfinex-token","yield":"yield-protocol","gat":"game-ace-token","auc":"auctus","yoyow":"yoyow","fvt":"finance-vote","bwi":"bitwin24","ditto":"ditto","cloak":"cloakcoin","aur":"auroracoin","waif":"waifu-token","dfx":"dfx-finance","haka":"tribeone","you":"you-chain","0xbtc":"oxbitcoin","mdf":"matrixetf","pilot":"unipilot","open":"open-governance-token","dgcl":"digicol-token","cpc":"cpchain","fts":"footballstars","axpr":"axpire","spwn":"bitspawn","phnx":"phoenixdao","reth2":"reth2","bull":"bull-coin","utu":"utu-coin","pussy":"pussy-financial","thc":"hempcoin-thc","par":"par-stablecoin","aga":"aga-token","pgt":"polyient-games-governance-token","dappt":"dapp-com","ntk":"neurotoken","octo":"octofi","kton":"darwinia-commitment-token","vvt":"versoview","swm":"swarm","xla":"stellite","ixi":"ixicash","b21":"b21","smartcredit":"smartcredit-token","xpm":"primecoin","nfti":"nft-index","rel":"relevant","its":"iteration-syndicate","pink":"pinkcoin","rsun":"risingsun","sumo":"sumokoin","wexpoly":"waultswap-polygon","lix":"lixir-protocol","airi":"airight","yup":"yup","defi+l":"piedao-defi-large-cap","watch":"yieldwatch","nfy":"non-fungible-yearn","hnst":"honest-mining","uuu":"u-network","tendie":"tendieswap","quack":"richquack","cht":"chronic-token","idea":"ideaology","gsail":"solanasail-governance-token","angel":"polylauncher","bir":"birake","can":"canyacoin","imx":"impermax","$based":"based-money","skrt":"sekuritance","sdx":"swapdex","1wo":"1world","agar":"aga-rewards-2","spdr":"spiderdao","unv":"unvest","masq":"masq","tiki":"tiki-token","sign":"signaturechain","bag":"bondappetit-gov-token","csai":"compound-sai","stv":"sint-truidense-voetbalvereniging","777":"jackpot","yae":"cryptonovae","pta":"petrachor","rope":"rope-token","nux":"peanut","corn":"cornichon","redpanda":"redpanda-earth","vntw":"value-network-token","milk2":"spaceswap-milk2","amn":"amon","qrk":"quark","qrx":"quiverx","adco":"advertise-coin","cate":"catecoin","ait":"aichain","lnchx":"launchx","chonk":"chonk","polydoge":"polydoge","dis":"tosdis","mcx":"machix","idh":"indahash","vips":"vipstarcoin","milk":"milkshakeswap","doki":"doki-doki-finance","prxy":"proxy","aid":"aidcoin","pet":"battle-pets","ucash":"ucash","edn":"edenchain","dps":"deepspace","dgtx":"digitex-futures-exchange","prt":"portion","edda":"eddaswap","d":"denarius","auscm":"auric-network","yeed":"yggdrash","hnd":"hundred-finance","afr":"afreum","direwolf":"direwolf","sin":"suqa","sysl":"ysl-io","bison":"bishares","flixx":"flixxo","propel":"payrue","poli":"polinate","lkr":"polkalokr","bry":"berry-data","ryo":"ryo","somee":"somee-social","rat":"the-rare-antiquities-token","ybo":"young-boys-fan-token","bomb":"bomb","sarco":"sarcophagus","surf":"surf-finance","ethix":"ethichub","pwar":"polkawar","kek":"cryptokek","bitx":"bitscreener","gxt":"gem-exchange-and-trading","dmg":"dmm-governance","odin":"odin-protocol","hodl":"hodl-token","zer":"zero","lxt":"litex","nfts":"nft-stars","sashimi":"sashimi","nbx":"netbox-coin","vinci":"davinci-token","cliq":"deficliq","mega":"megacryptopolis","flurry":"flurry","arcona":"arcona","nlife":"night-life-crypto","giv":"givly-coin","gems":"carbon-gems","pye":"creampye","exrt":"exrt-network","bxx":"baanx","chart":"chartex","husl":"the-husl","omni":"omni","crd":"crd-network","ok":"okcash","tcc":"the-champcoin","veo":"amoveo","ong":"somee-social-old","urac":"uranus","ugas":"ultrain","phr":"phore","swfl":"swapfolio","lba":"libra-credit","scb":"spacecowboy","8pay":"8pay","voice":"nix-bridge-token","reli":"relite-finance","gdoge":"golden-doge","vibe":"vibe","ogo":"origo","cure":"curecoin","moca":"museum-of-crypto-art","sig":"xsigma","gfx":"gamyfi-token","renzec":"renzec","bntx":"bintex-futures","xfi":"xfinance","dhv":"dehive","grey":"grey-token","mofi":"mobifi","nuts":"squirrel-finance","sry":"serey-coin","xaur":"xaurum","mxx":"multiplier","dets":"dextrust","nabox":"nabox","rnb":"rentible","sfuel":"sparkpoint-fuel","shld":"shield-finance","prare":"polkarare","moar":"moar","rbt":"robust-token","ixc":"ixcoin","ost":"simple-token","x8x":"x8-project","papel":"papel","assy":"assy-index","tbc":"terablock","pcnt":"playcent","cycle":"cycle-token","cwt":"crosswallet","bpet":"binapet","aitra":"aitra","fsw":"fsw-token","vgw":"vegawallet-token","next":"nextexchange","dime":"dimecoin","axis":"axis-defi","spice":"spice-finance","bskt":"basketcoin","aln":"aluna","gear":"bitgear","lev":"lever-network","holy":"holy-trinity","wdgld":"wrapped-dgld","xbc":"bitcoin-plus","klp":"kulupu","ddd":"scry-info","2gt":"2gether-2","vault":"vault","ncc":"neurochain","afen":"afen-blockchain","defi++":"piedao-defi","arte":"ethart","chads":"chads-vc","gysr":"geyser","sbf":"steakbank-finance","meeb":"meeb-master","skm":"skrumble-network","pmgt":"perth-mint-gold-token","ktlyo":"katalyo","sphr":"sphere","safemooncash":"safemooncash","kian":"porta","cphr":"polkacipher","scifi":"scifi-index","tsx":"tradestars","eosdac":"eosdac","ufarm":"unifarm","wish":"mywish","roya":"royale","sub":"subme","vi":"vid","nyan-2":"nyan-v2","ebox":"ethbox-token","tkp":"tokpie","azuki":"azuki","axiav3":"axia","ddos":"disbalancer","bles":"blind-boxes","sola":"sola-token","bfly":"butterfly-protocol-2","ppp":"paypie","rei":"zerogoki","dun":"dune","bitto":"bitto-exchange","dows":"shadows","l3p":"lepricon","skull":"skull","adb":"adbank","nlc2":"nolimitcoin","catt":"catex-token","fti":"fanstime","tico":"topinvestmentcoin","pipl":"piplcoin","mcrn":"macaronswap","vrc":"vericoin","avs":"algovest","chx":"chainium","stbu":"stobox-token","moons":"moontools","bkbt":"beekan","woa":"wrapped-origin-axie","room":"option-room","merge":"merge","btb":"bitball","crw":"crown","azr":"aezora","pfl":"professional-fighters-league-fan-token","nfta":"nfta","acxt":"ac-exchange-token","etha":"etha-lend","bunny":"pancake-bunny","uat":"ultralpha","reosc":"reosc-ecosystem","ptoy":"patientory","bnf":"bonfi","mars":"mars","zp":"zen-protocol","cnn":"cnn","at":"abcc-token","ldfi":"lendefi","bcvt":"bitcoinvend","bmxx":"multiplier-bsc","eved":"evedo","skyrim":"skyrim-finance","smly":"smileycoin","phx":"phoenix-token","ecte":"eurocoinpay","yolov":"yoloverse","snov":"snovio","hgold":"hollygold","yfbtc":"yfbitcoin","veil":"veil","trio":"tripio","ppblz":"pepemon-pepeballs","wspp":"wolfsafepoorpeople","fera":"fera","ctt":"cryptotycoon","bnkr":"bankroll-network","pvt":"pivot-token","tol":"tolar","daps":"daps-token","dmagic":"dark-magic","all":"alliance-fan-token","sphri":"spherium","edc":"edc-blockchain","alpa":"alpaca","peps":"pepegold","2key":"2key","coll":"collateral-pay","byg":"black-eye-galaxy","bite":"dragonbite","mue":"monetaryunit","mintme":"webchain","pis":"polkainsure-finance","polp":"polkaparty","edoge":"elon-doge-token","twin":"twinci","moma":"mochi-market","vrs":"veros","inft":"infinito","edr":"endor","dit":"inmediate","earnx":"earnx","tube":"bittube","happy":"happycoin","apys":"apyswap","gard":"hashgard","fair":"fairgame","hmq":"humaniq","ftx":"fintrux","lien":"lien","xrc":"bitcoin-rhodium","bob":"bobs_repair","sada":"sada","ag8":"atromg8","enb":"earnbase","dsd":"dynamic-set-dollar","kif":"kittenfinance","fyd":"find-your-developer","shield":"shield-protocol","mcm":"mochimo","bakecoin":"bake-coin","altrucoin":"altrucoin","crx":"cryptex","cai":"club-atletico-independiente","matpad":"maticpad","rem":"remme","zeit":"zeitcoin","upi":"pawtocol","road":"yellow-road","sepa":"secure-pad","zcl":"zclassic","wheat":"wheat-token","imt":"moneytoken","mtn":"medicalchain","sota":"sota-finance","lotto":"lotto","land":"landshare","zip":"zip","smi":"safemoon-inu","rage":"rage-fan","olive":"olivecash","almx":"almace-shards","rhythm":"rhythm","ugotchi":"unicly-aavegotchi-astronauts-collection","elx":"energy-ledger","krb":"karbo","defi+s":"piedao-defi-small-cap","defit":"defit","alphr":"alphr","ama":"mrweb-finance","cali":"calicoin","fff":"future-of-finance-fund","myx":"myx-network","kuma":"kuma-inu","htre":"hodltree","cnt":"cryption-network","rating":"dprating","nftp":"nft-platform-index","bright":"bright-union","stzen":"stakedzen","wg0":"wrapped-gen-0-cryptokitties","zhegic":"zhegic","banca":"banca","babi":"babylons","dfio":"defi-omega","cot":"cotrader","zusd":"zusd","multi":"multigame","ubex":"ubex","zipt":"zippie","ave":"avaware","mdg":"midas-gold","polr":"polystarter","tdx":"tidex-token","ss":"sharder-protocol","rvrs":"reverse","ort":"omni-real-estate-token","icap":"invictus-capital-token","pera":"pera-finance","nix":"nix-platform","spn":"sapien","power":"unipower","polc":"polka-city","hsc":"hashcoin","arq":"arqma","ionc":"ionchain-token","mate":"mate","less":"less-network","excc":"exchangecoin","rws":"robonomics-web-services","font":"font","otb":"otcbtc-token","cor":"coreto","sav3":"sav3","mgo":"mobilego","uop":"utopia-genesis-foundation","stbz":"stabilize","pasc":"pascalcoin","pirate":"piratecash","snet":"snetwork","dcb":"decubate","dpy":"delphy","chai":"chai","kampay":"kampay","keyfi":"keyfi","kgo":"kiwigo","zxc":"0xcert","cash":"litecash","bart":"bartertrade","reec":"renewableelectronicenergycoin","aux":"auxilium","htz":"hertz-network","ggtk":"gg-token","balpha":"balpha","esbc":"e-sport-betting-coin","impact":"alpha-impact","bdg":"bitdegree","vxt":"virgox-token","hlc":"halalchain","zco":"zebi","inxt":"internxt","kom":"kommunitas","tap":"tapmydata","donut":"donut","ethv":"ethverse","c4g3":"cage","dctd":"dctdao","comfi":"complifi","tango":"keytango","cbt":"cryptobulls-token","pry":"prophecy","sishi":"sishi-finance","dexf":"dexfolio","bask":"basketdao","kwik":"kwikswap-protocol","zrc":"zrcoin","sstx":"silverstonks","dav":"dav","vox":"vox-finance","smty":"smoothy","crusader":"crusaders-of-crypto","zpae":"zelaapayae","cns":"centric-cash","d4rk":"darkpaycoin","dinu":"dogey-inu","buzz":"buzzcoin","khc":"koho-chain","totm":"totemfi","rox":"robotina","pst":"primas","kangal":"kangal","dacc":"dacc","ibfk":"istanbul-basaksehir-fan-token","zdex":"zeedex","bcv":"bcv","arth":"arth","vusd":"vesper-vdollar","bva":"bavala","ufr":"upfiring","kko":"kineko","ptt":"potent-coin","name":"polkadomain","bgov":"bgov","imo":"imo","hydro":"hydro","mzc":"maza","defx":"definity","troll":"trollcoin","adc":"audiocoin","fdz":"friendz","sg":"social-good-project","bree":"cbdao","shrew":"shrew","drt":"domraider","mnc":"maincoin","oro":"oro","gmat":"gowithmi","bcug":"blockchain-cuties-universe-governance","myfarmpet":"my-farm-pet","blue":"blue","cag":"change","grft":"graft-blockchain","zet":"zetacoin","lcs":"localcoinswap","isla":"insula","trst":"wetrust","use":"usechain","dmt":"dmarket","prism":"prism-network","ptm":"potentiam","baepay":"baepay","yel":"yel-finance","rac":"rac","web":"webcoin","uct":"ucot","abx":"arbidex","rfi":"reflect-finance","vig":"vig","spd":"stipend","tenfi":"ten","dwz":"defi-wizard","msr":"masari","sacks":"sacks","lot":"lukki-operating-token","vdx":"vodi-x","frc":"freicoin","ctask":"cryptotask-2","2lc":"2local-2","bitt":"bittoken","yeti":"yearn-ecosystem-token-index","own":"owndata","kerman":"kerman","ric":"riecoin","astro":"astrotools","ladz":"ladz","dfsocial":"defisocial","cur":"curio","base":"base-protocol","fdo":"firdaos","airx":"aircoins","add":"add-xyz-new","gaj":"gaj","ink":"ink","znz":"zenzo","crdt":"crdt","bls":"blocsport-one","air":"aircoin-2","box":"contentbox","soar":"soar-2","n1":"nftify","mtc":"medical-token-currency","gse":"gsenetwork","kpad":"kickpad","fyp":"flypme","axi":"axioms","deb":"debitum-network","dth":"dether","xiot":"xiotri","bgg":"bgogo","metric":"metric-exchange","typh":"typhoon-network","deflct":"deflect","sngls":"singulardtv","pylon":"pylon-finance","sat":"somee-advertising-token","qwc":"qwertycoin","xbp":"blitzpredict","subx":"startup-boost-token","th":"team-heretics-fan-token","bto":"bottos","tent":"snowgem","iic":"intelligent-investment-chain","qch":"qchi","xiv":"project-inverse","msp":"mothership","mt":"mytoken","klonx":"klondike-finance-v2","ysec":"yearn-secure","wqt":"work-quest","mpad":"multipad","kally":"polkally","bsty":"globalboost","candy":"skull-candy-shards","cbm":"cryptobonusmiles","groot":"growth-root","dotx":"deli-of-thrones","flot":"fire-lotto","ocp":"omni-consumer-protocol","zone":"gridzone","pinkm":"pinkmoon","wenlambo":"wenlambo","mota":"motacoin","ypie":"piedao-yearn-ecosystem-pie","komet":"komet","pgu":"polyient-games-unity","avxt":"avaxtars-token","monk":"monk","ethy":"ethereum-yield","adel":"akropolis-delphi","iht":"iht-real-estate-protocol","s":"sharpay","dds":"dds-store","cherry":"cherrypick","ndr":"noderunners","omx":"project-shivom","hqx":"hoqu","xnk":"ink-protocol","ind":"indorse","mmaon":"mmaon","babydoge":"babydoge-coin-eth","slm":"solomon-defi","ssp":"smartshare","vtx":"vortex-defi","pht":"lightstreams","lqd":"liquidity-network","syc":"synchrolife","wiki":"wiki-token","stsla":"stsla","fry":"foundrydao-logistics","star":"starbase","cspn":"crypto-sports","family":"the-bitcoin-family","aaa":"app-alliance-association","sib":"sibcoin","octi":"oction","zut":"zero-utility-token","tcake":"pancaketools","wfil":"wrapped-filecoin","lun":"lunyr","asp":"aspire","kdg":"kingdom-game-4-0","toshi":"toshi-token","catbread":"catbread","bsl":"bsclaunch","dgvc":"degenvc","datx":"datx","dyt":"dynamite","tox":"trollbox","dac":"degen-arts","elec":"electrify-asia","pak":"pakcoin","wvg0":"wrapped-virgin-gen-0-cryptokitties","gio":"graviocoin","unt":"unity-network","nobl":"noblecoin","mfo":"moonfarm-finance","perry":"swaperry","crea":"creativecoin","myth":"myth-token","xas":"asch","ucm":"ucrowdme","bether":"bethereum","ipc":"ipchain","egem":"ethergem","swagg":"swagg-network","lqt":"liquidifty","hugo":"hugo-finance","sxag":"sxag","rnt":"oneroot-network","dfnd":"dfund","share":"seigniorage-shares","bpriva":"privapp-network","sfshld":"safe-shield","tao":"taodao","tnc":"trinity-network-credit","pnl":"true-pnl","stk":"stk","beach":"beach-token","aidoc":"ai-doctor","ors":"origin-sport","tos":"thingsoperatingsystem","tour":"touriva","zsc":"zeusshield","qbt":"qbao","ecom":"omnitude","exf":"extend-finance","kobo":"kobocoin","bund":"bundles","vdl":"vidulum","eko":"echolink","rte":"rate3","jet":"jetcoin","xlr":"solaris","acat":"alphacat","wtt":"giga-watt-token","bone":"bone","ird":"iridium","cakebank":"cake-bank","svx":"savix","redc":"redchillies","red":"red","edu":"educoin","cnb":"coinsbit-token","dope":"dopecoin","build":"build-finance","baby":"babyswap","sconex":"sconex","biop":"biopset","bez":"bezop","onc":"one-cash","exzo":"exzocoin","btc++":"piedao-btc","eco":"ormeus-ecosystem","yeld":"yeld-finance","upx":"uplexa","defo":"defhold","lmy":"lunch-money","wck":"wrapped-cryptokitties","flp":"gameflip","fxp":"fxpay","degov":"degov","artx":"artx","cue":"cue-protocol","gum":"gourmetgalaxy","obc":"oblichain","tns":"transcodium","tend":"tendies","miva":"minerva-wallet","dat":"datum","hgt":"hellogold","dogec":"dogecash","alley":"nft-alley","hue":"hue","dvt":"devault","ac":"acoconut","atn":"atn","bobo":"bobo-cash","npxsxem":"pundi-x-nem","ukg":"unikoin-gold","modic":"modern-investment-coin","ptn":"palletone","latx":"latiumx","genix":"genix","pigx":"pigx","shnd":"stronghands","foto":"uniqueone-photo","babyusdt":"babyusdt","poe":"poet","nov":"novara-calcio-fan-token","dirty":"dirty-finance","nanj":"nanjcoin","rvx":"rivex-erc20","dead":"party-of-the-living-dead","x42":"x42-protocol","vcn":"versacoin","alch":"alchemy-dao","stacy":"stacy","tdp":"truedeck","fmg":"fm-gallery","ieth":"ieth","comb":"combine-finance","adt":"adtoken","eland":"etherland","pie":"defipie","1mt":"1million-token","pgo":"pengolincoin","tik":"chronobase","dam":"datamine","rito":"rito","rot":"rotten","lync":"lync-network","dct":"decent","portal":"portal","debase":"debase","nfxc":"nfx-coin","ncdt":"nuco-cloud","rocks":"social-rocket","twa":"adventure-token","zpt":"zeepin","bcpt":"blockmason-credit-protocol","evil":"evil-coin","corgib":"the-corgi-of-polkabridge","ely":"elysian","wander":"wanderlust","srh":"srcoin","mas":"midas-protocol","hac":"hackspace-capital","gem":"nftmall","ferma":"ferma","alex":"alex","tcore":"tornadocore","ysl":"ysl","fxt":"fuzex","quan":"quantis","trdg":"tardigrades-finance","ecoin":"ecoin-2","shdw":"shadow-token","trc":"terracoin","tzc":"trezarcoin","ken":"keysians-network","tie":"ties-network","shake":"spaceswap-shake","xp":"xp","fess":"fess-chain","cnj":"conjure","bis":"bismuth","unl":"unilock-network","n3rdz":"n3rd-finance","senc":"sentinel-chain","jamm":"flynnjamm","sxau":"sxau","asafe":"allsafe","haut":"hauteclere-shards-2","type":"typerium","dfi":"amun-defi-index","inve":"intervalue","force":"force-dao","meri":"merebel","ethys":"ethereum-stake","dogown":"dog-owner","zlot":"zlot","whirl":"polywhirl","fud":"fudfinance","kmpl":"kiloample","myb":"mybit-token","mbn":"membrana-platform","loox":"safepe","morph":"morphose","kfx":"knoxfs","swing":"swing","xgt":"xion-finance","fors":"foresight","stop":"satopay","swt":"swarm-city","cova":"covalent-cova","svcs":"givingtoservices","bkc":"facts","renbch":"renbch","mdoge":"miss-doge","bcdn":"blockcdn","alv":"allive","rvt":"rivetz","fire":"fire-protocol","noahp":"noah-coin","cbix":"cubiex","fmt":"finminity","mthd":"method-fi","bth":"bithereum","mntp":"goldmint","lpk":"l-pesa","xwp":"swap","snn":"sechain","melo":"melo-token","ptd":"peseta-digital","moonpirate":"moonpirate","ppdex":"pepedex","pcn":"peepcoin","bpx":"black-phoenix","$rope":"rope","cato":"catocoin","riskmoon":"riskmoon","axe":"axe","berry":"rentberry","btcs":"bitcoin-scrypt","bscv":"bscview","ifund":"unifund","prv":"privacyswap","fr":"freedom-reserve","roge":"roge","undb":"unibot-cash","psi":"passive-income","cpay":"cryptopay","foxx":"star-foxx","gene":"parkgene","mec":"megacoin","delta":"deltachain","etg":"ethereum-gold","arthx":"arthx","bsov":"bitcoinsov","udoki":"unicly-doki-doki-collection","proge":"protector-roge","ipl":"insurepal","i7":"impulseven","cmp":"component","peg":"pegnet","sct":"clash-token","dexg":"dextoken-governance","ziot":"ziot","pfr":"payfair","nbc":"niobium-coin","mib":"mib-coin","whey":"whey","lid":"liquidity-dividends-protocol","aro":"arionum","topb":"topb","mdo":"midas-dollar","pkg":"pkg-token","gmt":"gambit","fyz":"fyooz","mis":"mithril-share","hndc":"hondaiscoin","tig":"tigereum","opt":"open-predict-token","orcl5":"oracle-top-5","tmt":"traxia","stq":"storiqa","etz":"etherzero","dmx":"amun-defi-momentum-index","kombat":"crypto-kombat","gap":"gapcoin","tbx":"tokenbox","thirm":"thirm-protocol","thrt":"thrive","deep":"deepcloud-ai","cob":"cobinhood","mol":"molten","scex":"scex","doges":"dogeswap","dft":"defiat","levin":"levin","tff":"tutti-frutti-finance","shdc":"shd-cash","suv":"suvereno","cat":"cat-token","skin":"skincoin","yfte":"yftether","sista":"srnartgallery-tokenized-arts","fdd":"frogdao-dime","kgc":"krypton-token","dogy":"dogeyield","ubu":"ubu-finance","lulz":"lulz","pc":"promotionchain","amm":"micromoney","esh":"switch","etgp":"ethereum-gold-project","sergs":"sergs","arnx":"aeron","karma":"karma-dao","yfdot":"yearn-finance-dot","her":"hero-node","pdog":"polkadog","tsl":"energo","cxn":"cxn-network","corx":"corionx","rgp":"rigel-protocol","quin":"quinads","kp4r":"keep4r","bnty":"bounty0x","horus":"horuspay","insn":"insanecoin","music":"nftmusic","ugc":"ugchain","swiss":"swiss-finance","taco":"tacos","dfs":"digital-fantasy-sports","2x2":"2x2","pho":"photon","punk-basic":"punk-basic","wwc":"werewolf-coin","lama":"llamaswap","coil":"coil-crypto","swirl":"swirl-cash","sbnb":"sbnb","hlix":"helix","mwg":"metawhale-gold","bear":"arcane-bear","alt":"alt-estate","bbo":"bigbom-eco","ddoge":"daughter-doge","horse":"ethorse","goat":"goatcoin","plura":"pluracoin","etm":"en-tan-mo","brdg":"bridge-protocol","scap":"safecapital","sact":"srnartgallery","trust":"trust","sins":"safeinsure","ags":"aegis","imm":"imm","dogefi":"dogefi","fota":"fortuna","trnd":"trendering","ica":"icarus-finance","chl":"challengedac","bouts":"boutspro","yvs":"yvs-finance","coni":"coinbene-token","yffi":"yffi-finance","uedc":"united-emirate-decentralized-coin","jntr":"jointer","ynk":"yoink","kind":"kind-ads-token","kennel":"token-kennel","pswap":"porkswap","swift":"swiftcash","gst2":"gastoken","arms":"2acoin","btw":"bitwhite","mon":"moneybyte","lkn":"linkcoin-token","sxmr":"sxmr","plus1":"plusonecoin","2give":"2give","covidtoken":"covid-token","tob":"tokens-of-babel","bking":"king-arthur","lock":"meridian-network","yfbeta":"yfbeta","vtd":"variable-time-dollar","r3fi":"recharge-finance","tix":"blocktix","cphx":"crypto-phoenix","cpr":"cipher","semi":"semitoken","boost":"boosted-finance","gofi":"goswapp","yamv2":"yam-v2","rfctr":"reflector-finance","oros":"oros-finance","ubeeple":"unicly-beeple-collection","bgtt":"baguette-token","bse":"buy-sell","hand":"showhand","mush":"mushroom","ad":"asian-dragon","scriv":"scriv","nor":"bring","btdx":"bitcloud","aval":"avaluse","mash":"masternet","pylnt":"pylon-network","sxtz":"sxtz","rpt":"rug-proof","tbb":"trade-butler-bot","ali":"ailink-token","bta":"bata","cyl":"crystal-token","eltcoin":"eltcoin","wand":"wandx","pasta":"spaghetti","crc":"crycash","fusii":"fusible","xuez":"xuez","orme":"ormeuscoin","arm":"armours","btcred":"bitcoin-red","yfbt":"yearn-finance-bit","adi":"aditus","gup":"matchpool","ig":"igtoken","bro":"bitradio","bonk":"bonk-token","rex":"rex","mshld":"moonshield-finance","kash":"kids-cash","cmct":"crowd-machine","metm":"metamorph","ora":"coin-oracle","pria":"pria","ffyi":"fiscus-fyi","lcp":"litecoin-plus","itl":"italian-lira","atb":"atbcoin","cbx":"bullion","scr":"scorum","long":"longdrink-finance","bltg":"bitcoin-lightning","mntis":"mantis-network","lana":"lanacoin","stu":"bitjob","bfi":"bearn-fi","enol":"ethanol","artex":"artex","bt":"bt-finance","bev":"binance-ecosystem-value","ehrt":"eight-hours","first":"harrison-first","vsx":"vsync","bpunks":"babypunks","iut":"mvg-token","mcp":"my-crypto-play","sets":"sensitrust","arco":"aquariuscoin","bsd":"basis-dollar","undg":"unidexgas","beet":"beetle-coin","fsxu":"flashx-ultra","clc":"caluracoin","glox":"glox-finance","yun":"yunex","boli":"bolivarcoin","eve":"devery","dex":"alphadex","wdp":"waterdrop","mgames":"meme-games","xfg":"fango","smol":"smol","hur":"hurify","uunicly":"unicly-genesis-collection","cymt":"cybermusic","ltb":"litebar","rehab":"nft-rehab","sno":"savenode","boxx":"boxx","yfox":"yfox-finance","yfpi":"yearn-finance-passive-income","gcg":"gulf-coin-gold","cpoo":"cockapoo","duo":"duo","yfd":"yfdfi-finance","shmn":"stronghands-masternode","gun":"guncoin","xjo":"joulecoin","chop":"porkchop","mar":"mchain","mss":"monster-cash-share","zfl":"zedxe","apc":"alpha-coin","herb":"herbalist-token","gtm":"gentarium","yft":"yield-farming-token","paws":"paws-funds","ruler":"ruler-protocol","araw":"araw-token","got":"gonetwork","updog":"updog","xgg":"10x-gg","dtrc":"datarius-cryptobank","usdq":"usdq","pokelon":"pokelon-finance","mooi":"moonai","fsbt":"forty-seven-bank","arion":"arion","swgb":"swirge","cpu":"cpuchain","gulag":"gulag-token","wrc":"worldcore","dmb":"digital-money-bits","sbs":"staysbase","tcash":"tcash","hfi":"holder-finance","tsuki":"tsuki-dao","ecash":"ethereum-cash","shrmp":"shrimp-capital","gic":"giant","nat":"natmin-pure-escrow","tic":"thingschain","obr":"obr","max":"maxcoin","help":"help-token","yui":"yui-hinata","ccn":"custom-contract-network","vaultz":"vaultz","50c":"50cent","impl":"impleum","juice":"moon-juice","sur":"suretly","lnc":"blocklancer","sfcp":"sf-capital","cen":"coinsuper-ecosystem-network","inx":"inmax","mixs":"streamix","tgame":"truegame","ctsc":"cts-coin","prix":"privatix","rntb":"bitrent","vls":"veles","toto":"tourist-token","kydc":"know-your-developer","medibit":"medibit","pux":"polypux","yfuel":"yfuel","hb":"heartbout","$noob":"noob-finance","kiwi":"kiwi-token","scam":"simple-cool-automatic-money","1up":"uptrennd","ucn":"uchain","tds":"tokendesk","seal":"seal-finance","tft":"the-famous-token","mwbtc":"metawhale-btc","com":"community-token","ethplo":"ethplode","obee":"obee-network","ethm":"ethereum-meta","ftxt":"futurax","yffs":"yffs","bugs":"starbugs-shards","scho":"scholarship-coin","gsr":"geysercoin","shb":"skyhub","bznt":"bezant","tmn":"ttanslateme-network-token","xta":"italo","zzzv2":"zzz-finance-v2","senpai":"project-senpai","prx":"proxynode","nice":"nice","joon":"joon","joint":"joint","bacon":"baconswap","swipp":"swipp","raise":"hero-token","cash2":"cash2","xsr":"sucrecoin","xstar":"starcurve","yfsi":"yfscience","cred":"verify","ifex":"interfinex-bills","klon":"klondike-finance","imp":"ether-kingdoms-token","ctrt":"cryptrust","abs":"absolute","hqt":"hyperquant","coke":"cocaine-cowboy-shards","reign":"sovreign-governance-token","error":"484-fund","infx":"influxcoin","nzl":"zealium","cof":"coffeecoin","martk":"martkist","nrp":"neural-protocol","gtx":"goaltime-n","raijin":"raijin","milf":"milf-finance","dbet":"decentbet","epc":"experiencecoin","swyftt":"swyft","taj":"tajcoin","dmst":"dmst","yfrb":"yfrb-finance","lud":"ludos","etgf":"etg-finance","ethbn":"etherbone","kwatt":"4new","fruit":"fruit","burn":"blockburn","trvc":"thrivechain","wgo":"wavesgo","evc":"evrice","jem":"jem","bsds":"basis-dollar-share","bboo":"panda-yield","bsgs":"basis-gold-share","tme":"tama-egg-niftygotchi","guess":"peerguess","osina":"osina","tata":"hakuna-metata","zyon":"bitzyon","datp":"decentralized-asset-trading-platform","bm":"bitcomo","havy":"havy-2","war":"yieldwars-com","lno":"livenodes","tux":"tuxcoin","knt":"kora-network","dtc":"datacoin","kema":"kemacoin","vikky":"vikkytoken","gst":"game-stars","noodle":"noodle-finance","xd":"scroll-token","rise":"rise-protocol","ntbc":"note-blockchain","bold":"boldman-capital","cco":"ccore","cjt":"connectjob","obs":"openbisea","apr":"apr-coin","beverage":"beverage","eggp":"eggplant-finance","kmx":"kimex","jmc":"junsonmingchancoin","aer":"aeryus","mat":"bitsum","dcntr":"decentrahub-coin","klks":"kalkulus","nka":"incakoin","vgr":"voyager","ztc":"zent-cash","bon":"bonpay","dalc":"dalecoin","intu":"intucoin","ylc":"yolo-cash","distx":"distx","cou":"couchain","nyante":"nyantereum","rigel":"rigel-finance","actp":"archetypal-network","rank":"rank-token","bdl":"bundle-dao","team":"team-finance","qnc":"qnodecoin","rle":"rich-lab-token","wcoinbase-iou":"deus-synthetic-coinbase-iou","hfs":"holderswap","arc":"arcticcoin","memex":"memex","mxt":"martexcoin","mftu":"mainstream-for-the-underground","exn":"exchangen","btcui":"bitcoin-unicorn","l1q":"layer-1-quality-index","jiaozi":"jiaozi","gdr":"guider","js":"javascript-token","aet":"aerotoken","boat":"boat","cct":"crystal-clear","c2c":"ctc","zzz":"zzz-finance","npc":"npcoin","scsx":"secure-cash","znd":"zenad","eld":"electrum-dark","uffyi":"unlimited-fiscusfyi","house":"toast-finance","sas":"stand-share","labo":"the-lab-finance","tsd":"true-seigniorage-dollar","seos":"seos","dow":"dowcoin","cow":"cowry","azum":"azuma-coin","fntb":"fintab","yfid":"yfidapp","neet":"neetcoin","roco":"roiyal-coin","daiq":"daiquilibrium","hippo":"hippo-finance","kermit":"kermit","hlx":"hilux","mok":"mocktailswap","sac":"stand-cash","btcb":"bitcoinbrand","better":"better-money","quot":"quotation-coin","abst":"abitshadow-token","clg":"collegicoin","swc":"scanetchain","gfn":"game-fanz","nyb":"new-year-bull","faith":"faithcoin","bul":"bulleon","ore":"oreo","wtl":"welltrado","payx":"paypex","yieldx":"yieldx","orm":"orium","jbx":"jboxcoin","kec":"keyco","edao":"elondoge-dao","polar":"polaris","bkx":"bankex","orox":"cointorox","brtr":"barter","strng":"stronghold","ary":"block-array","pfarm":"farm-defi","voise":"voise","setc":"setc","bdcash":"bigdata-cash","fsd":"freq-set-dollar","fast":"fastswap","rugz":"rugz","sms":"speed-mining-service","myfriends":"myfriends","404":"404","atl":"atlant","a":"alpha-platform","gbcr":"gold-bcr","zla":"zilla","bds":"borderless","voco":"provoco","dice":"dice-finance","pinke":"pinkelon","yffc":"yffc-finance","crad":"cryptoads-marketplace","sxrp":"sxrp","up":"uptoken","xpat":"pangea","kndc":"kanadecoin","fyznft":"fyznft","x":"gibx-swap","xki":"ki","m2":"m2","x2":"x2","g\u00fc":"gu","owl":"owl-token","hex":"hex","mrv":"mrv","aos":"aos","bgt":"bgt","kvi":"kvi","867":"867","lbk":"legal-block","xbx":"bitex-global","gya":"gya","mp4":"mp4","ucx":"ucx-foundation","tmc":"tmc-niftygotchi","dbx":"dbx-2","evo":"evo","lvx":"level01-derivatives-exchange","yfc":"yearn-finance-center","x22":"x22","htm":"htm","7up":"7up","h3x":"h3x","car":"car","vbt":"vbt","rug":"rug","dad":"decentralized-advertising","eft":"eft","txa":"txa","yes":"yes","eox":"eox","iab":"iab","pop!":"pop","mex":"mex","yas":"yas","ize":"ize","mp3":"revamped-music","ash":"aeneas","idk":"idk","xtp":"tap","msn":"msn","mimatic":"mimatic","sov":"store-of-value-token","mvl":"mass-vehicle-ledger","zyx":"zyx","vow":"vow","tvt":"tvt","die":"die","b26":"b26","mox":"mox","p2p":"p2p","onot":"ono","olo":"olo","bae":"bae","lcg":"lcg","lif":"winding-tree","520":"520","zin":"zomainfinity","ecc":"ecc","sfb":"sfb","zos":"zos","zom":"zoom-protocol","fme":"fme","rxc":"rxc","pica":"pica","bcat":"bcat","lean":"lean","pasv":"pasv","dojo":"dojofarm-finance","420x":"420x","hudi":"hudi","aeur":"aeur","s4f":"s4fe","lbrl":"lbrl","benz":"benz","zort":"zort","zpr":"zper","avme":"avme","dogz":"dogz","tun":"tune","ntm":"netm","bare":"bare","agpc":"agpc","logs":"logs","boss":"boss","rusd":"rusd","bnbc":"bnbc","ndau":"ndau","evai":"evai","pick":"pick","musk":"musk","lyfe":"lyfe","xank":"xank","arke":"arke","alis":"alis","ympl":"ympl","ruc":"rush","aeon":"aeon","dao1":"dao1","dina":"dina","psrs":"psrs","hush":"hush","amis":"amis","weth":"weth","arx":"arcs","gasp":"gasp","bsys":"bsys","olcf":"olcf","amix":"amix","etor":"etor","pako":"pako","texo":"texo","nilu":"nilu","bast":"bast","wiva":"wiva","odop":"odop","sti":"stib-token","1-up":"1-up","gmb":"gamb","yfia":"yfia","agt":"aisf","scrv":"scrv","boid":"boid","efin":"efin","sbet":"sbet","soge":"soge","arix":"arix","idot":"idot","kala":"kalata","many":"manyswap","biki":"biki","crow":"crow-token","$godl":"godl","abbc":"alibabacoin","sren":"sren","esk":"eska","gr":"grom","r34p":"r34p","bu":"bumo","vivo":"vivo","gold":"cyberdragon-gold","usdl":"usdl","safe":"safe-coin-2","tomb":"tomb","ausd":"ausd","xc":"xcom","kupp":"kupp","obic":"obic","zyro":"zyro","yce":"myce","usda":"usda","swop":"swop","bidr":"binanceidr","camp":"camp","r64x":"r64x","n1ce":"n1ce","prot":"prostarter-token","pirl":"pirl","iten":"iten","nova":"shibanova","lynx":"lynx","acdc":"volt","sono":"sonocoin","sltc":"sltc","taxi":"taxi","miss":"miss","tosc":"t-os","hype":"hype-finance","zinc":"zinc","mogx":"mogu","olxa":"olxa","koto":"koto","ekta":"ekta","rccc":"rccc","jojo":"jojo","vspy":"vspy","bpop":"bpop","mini":"mini","ibnb":"ibnb-2","yefi":"yearn-ethereum-finance","thx":"thorenext","wula":"wula","yfet":"yfet","cmkr":"compound-maker","maro":"ttc-protocol","attn":"attn","tugz":"tugz","joys":"joys","xdai":"xdai","pofi":"pofi","xls":"elis","vybe":"vybe","weyu":"weyu","pyrk":"pyrk","peos":"peos","fil6":"filecoin-iou","elya":"elya","lucy":"lucy","cspc":"chinese-shopping-platform","vidy":"vidy","pway":"pway","xels":"xels","yuan":"yuan","teat":"teal","pgov":"pgov","reth":"reth","vera":"vera-exchange","tbcc":"tbcc","dmme":"dmme-app","apix":"apix","tena":"tena","g999":"g999","afro":"afro","bora":"bora","foin":"foincoin","anon":"anonymous-bsc","drax":"drax","bitz":"bitz","xolo":"xolo","exor":"exor","wbx":"wibx","cyfi":"compound-yearn-finance","door":"door","wise":"wise-token11","xtrd":"xtrade","ioex":"ioex","sg20":"sg20","utip":"utip","noku":"noku","ng":"ngin","rfis":"rfis","glex":"glex","suni":"starbaseuniverse","moac":"moac","cez":"cezo","xfit":"xfit","punk":"punk-vault-nftx","pusd":"pusd","hdac":"hdac","lcms":"lcms","chbt":"chbt","ymax":"ymax","tomi":"tomi","o2ox":"o2ox","edge":"edge","weld":"weld","xbt":"elastic-bitcoin","voyrme":"voyr","fan8":"fan8","waxe":"waxe","ibex":"ibex","enx":"enex","marx":"marxcoin","ers":"eros","roc":"roxe","dona":"dona","dsys":"dsys","mymn":"mymn","ston":"ston","aly":"ally","koji":"koji","pryz":"pryz","sdot":"safedot","torg":"torg","seer":"seer","veco":"veco","vndc":"vndc","dtmi":"dtmi","tahu":"tahu","vain":"vain","birb":"birb","redi":"redi","oryx":"oryx","n0031":"ntoken0031","plg":"pledgecamp","post":"postcoin","nton":"nton","donu":"donu","xtrm":"xtrm","frat":"frat","aced":"aced","bolt":"thunderbolt","azu":"azus","iron":"iron-bsc","asta":"asta","sheng":"sheng","twist":"twist","moz":"mozik","ksk":"karsiyaka-taraftar-token","yinbi":"yinbi","tools":"tools","daf":"dafin","tup":"tenup","eql":"equal","sem":"semux","kappa":"kappa","yusra":"yusra","tro":"trodl","mri":"mirai","hyc":"hycon","emoj":"emoji","pitch":"pitch","snap":"snap-token","larix":"larix","f7":"five7","uncle":"uncle","acryl":"acryl","wco":"winco","lex":"elxis","reeth":"reeth","hny":"honey","fil12":"fil12","srx":"storx","flash":"flash","fleta":"fleta","temco":"temco","voltz":"voltz","ping":"cryptoping","myobu":"myobu","bukh":"bukh","alix":"alinx","manna":"manna","audax":"audax","vidyx":"vidyx","caave":"caave","crave":"crave","bzz":"swarm-bzz","grimm":"grimm","lunes":"lunes","krex":"kronn","akn":"akoin","pizza":"pizzaswap","sts":"sbank","btr":"bitrue-token","plut":"plutos-network","jwl":"jewel","byts":"bytus","u":"ucoin","sls":"salus","seed":"seedswap-token","vnx":"venox","stamp":"stamp","axl":"axial","nafty":"nafty","doggy":"doggy","ipfst":"ipfst","acoin":"acoin","xax":"artax","xtx":"xtock","blast":"safeblast","zch":"zilchess","keyt":"rebit","nosta":"nosta","ori":"orica","claim":"claim","gig":"gigecoin","sld":"safelaunchpad","sgoog":"sgoog","egi":"egame","upbnb":"upbnb","lrk":"lekan","antr":"antra","fls":"flits","mozox":"mozox","franc":"franc","theos":"theos","xvc":"vcash","cms":"comsa","ccomp":"ccomp","amon":"amond","zcr":"zcore","modex":"modex","kxusd":"kxusd","dudgx":"dudgx","libfx":"libfx","cprop":"cprop","chpz":"chipz","atc":"atlantic-coin","ysr":"ystar","iag":"iagon","bulls":"bulls","kcash":"kcash","inari":"inari","scash":"scash","az":"azbit","gena":"genta","april":"april","oks":"okschain","eloin":"eloin","qc":"qcash","haz":"hazza","unify":"unify","carat":"carat","ram":"ramifi","eject":"eject","rmx":"remex","xri":"xroad","xnc":"xenios","atmos":"atmos","tur":"turex","ape-x":"ape-x","qrdo":"qredo","xkncb":"xkncb","apn":"apron","xfe":"feirm","bsha3":"bsha3","eurxb":"eurxb","sklay":"sklay","cff":"coffe-1-st-round","spt":"spectrum","ybusd":"ybusd","xsp":"xswap","lkk":"lykke","omnis":"omnis","myu":"myubi","ovo":"ovato","realm":"realm","spok":"spock","xtm":"torum","clam":"clams","veth2":"veth2","ibank":"ibank","zwx":"ziwax","xknca":"xknca","vld":"valid","kau":"kinesis-2","ovi":"oviex","mooni":"mooni","cirus":"cirus","bion":"biido","tlr":"taler","fma":"flama","lucky":"lucky-token","arata":"arata","dre":"doren","ezx":"ezdex","alias":"spectrecoin","hop":"hoppy","senso":"senso","prntr":"prntr","hplus":"hplus","steel":"steel","utrin":"utrin","vacay":"vacay","bust":"busta","snflx":"snflx","atd":"atd","samzn":"samzn","posh":"shill","srune":"srune","klt":"klend","nhbtc":"nhbtc","xra":"ratecoin","peach":"peach","ox":"orcax","bxiot":"bxiot","stonk":"stonk","$aapl":"aapl","aunit":"aunit","sop":"sopay","blurt":"blurt","byron":"bitcoin-cure","vesta":"vesta","cyb":"cybex","piasa":"piasa","xgm":"defis","shk":"shrek","fx1":"fanzy","pazzy":"pazzy","magic":"magic","mla":"moola","perra":"perra","drf":"drife","em":"eminer","brnk":"brank","grain":"grain-token","gamma":"gamma","clt":"clientelecoin","ytofu":"ytofu","bagel":"bagel","ehash":"ehash","slnv2":"slnv2","hdi":"heidi","con":"converter-finance","klo":"kalao","1doge":"1doge","penky":"penky","miami":"miami","vrn":"varen","rlx":"relex","flap":"flapp","visio":"visio","qob":"qobit","xin":"infinity-economics","water":"water-finance","rup":"rupee","swace":"swace","eidos":"eidos","tia":"tican","rey":"rey","xbn":"xbn","toz":"tozex","xeuro":"xeuro","altom":"altcommunity-coin","rkn":"rakon","syf":"syfin","tor":"torchain","taiyo":"taiyo","vaivox":"vaivo","touch":"touch","ethup":"ethup","snk":"snook","asimi":"asimi","wliti":"wliti","purge":"purge","xnode":"xnode","raku":"rakun","egold":"egold","regen":"regen","xos":"oasis-2","celeb":"celeb","arw":"arowana-token","kbn":"kbn","tengu":"tengu","seeds":"seeds","dacxi":"dacxi","cdex":"codex","xrd":"raven-dark","vmr":"vomer","lexi":"lexit-2","funjo":"funjo","naxar":"naxar","ifx24":"ifx24","xmark":"xmark","imusd":"imusd","tsr":"tesra","octax":"octax","pzm":"prizm","znko":"zenko","depay":"depay","pgpay":"puregold-token","bxbtc":"bxbtc","basic":"basic","bud":"buddy","ecu":"decurian","gbyte":"byteball","rfbtc":"rfbtc","trybe":"trybe","dfl":"defily","bdefi":"bdefi","xnv":"nerva","topia":"topia","hve2":"uhive","seele":"seele","zfarm":"zfarm","xfuel":"xfuel","ytusd":"ytusd","aloha":"aloha","tks":"tokes","poker":"poker","gof":"golff","sar":"saren","sbe":"sombe","dxiot":"dxiot","dlike":"dlike","wolfy":"wolfy","digex":"digex","aico":"aicon","atx":"aston","xpo":"x-power-chain","zlp":"zilpay-wallet","amr":"ammbr","scomp":"scomp","mts":"mtblock","yummy":"yummy","mks":"makes","bliss":"bliss-2","lc":"lightningcoin","croat":"croat","bitsz":"bitsz","omb":"ombre","trism":"trism","story":"story","viper":"viper","vix":"vixco","xen":"xenon-2","lps":"lapis","omega":"omega","fo":"fibos","tok":"tokenplace","daovc":"daovc","saave":"saave","elons":"elons","ikomp":"ikomp","ct":"communitytoken","gapt":"gaptt","nftfy":"nftfy","se7en":"se7en-2","ifarm":"ifarm","ing":"iungo","hlo":"helio","niifi":"niifi","pando":"pando","myo":"mycro-ico","xazab":"xazab","odi":"odius","tdoge":"tdoge","atp":"atlas-protocol","husky":"husky-avax","egx":"eaglex","tlo":"talleo","donk":"donkey","rich":"richierich-coin","bzzone":"bzzone","zag":"zigzag","apx":"appics","fdn":"fundin","cod":"codemy","orfano":"orfano","ecob":"ecobit","cnr":"canary","paa":"palace","$ads":"alkimi","wraith":"wraith","bze":"bzedge","zcc":"zccoin","nii":"nahmii","agol":"algoil","inn":"innova","zdr":"zloadr","amc":"amc-fight-night","ivi":"inoovi","min":"mindol","bsy":"bestay","yco":"y-coin","r2r":"citios","kicks":"sessia","kzc":"kzcash","oyt":"oxy-dev","bdk":"bidesk","dtep":"decoin","bay":"bitbay","uis":"unitus","nbu":"nimbus","oft":"orient","blx":"bullex","pcatv3":"pcatv3","dacs":"dacsee","prkl":"perkle","yoc":"yocoin","lotdog":"lotdog","qmc":"qmcoin","dxf":"dexfin","s1inch":"s1inch","egcc":"engine","moneta":"moneta","pzs":"payzus","mns":"monnos","whx":"whitex","emrals":"emrals","gfce":"gforce","bab":"basis-bond","ntr":"nether","tem":"temtem","pteria":"pteria","enviro":"enviro","synd":"syndex","pat":"patron","ilayer":"ilayer","riseup":"riseup","kue":"kuende","vny":"vanity","tewken":"tewken","vlu":"valuto","2goshi":"2goshi","redfeg":"redfeg","nftpad":"nftpad","aquari":"aquari","co2b":"co2bit","dek":"dekbox","usd1":"psyche","aapx":"ampnet","redbux":"redbux","avak":"avakus","mor":"mor-stablecoin","xym":"symbol","str":"staker","rin":"aldrin","ilc":"ilcoin","zcor":"zrocor","sfr":"safari","syp":"sypool","talk":"talken","bceo":"bitceo","cys":"cyclos","ceds":"cedars","ain":"ai-network","jntr/e":"jntre","rblx":"rublix","lyk":"luyuka","hd":"hubdao","eauric":"eauric","tofy":"toffee","pan":"panvala-pan","vndt":"vendit","aka":"akroma","anatha":"anatha","d11":"defi11","fbe":"foobee","sensei":"sensei","bsw":"biswap","dcore":"decore","revt":"revolt","rfx":"reflex","dgn":"degen-protocol","cir":"circleswap","xlt":"nexalt","mdm":"medium","mct":"master-contract-token","armd":"armada","lhcoin":"lhcoin","upcoin":"upcoin","zoc":"01coin","csushi":"compound-sushi","dusa":"medusa","arteon":"arteon","hbx":"hashbx","upshib":"upshib","pup":"polypup","gaze":"gazetv","qdx":"quidax","i0c":"i0coin","mnm":"mineum","dess":"dessfi","turtle":"turtle","toko":"toko","onebtc":"onebtc","zdc":"zodiac","vyn":"vyndao","kabosu":"kabosu","a5t":"alpha5","dfni":"defini","cheems":"cheems","rupx":"rupaya","dms":"documentchain","polyfi":"polyfi","sienna":"sienna","koduro":"koduro","vbswap":"vbswap","ktt":"k-tune","dexm":"dexmex","sprink":"sprink","nkc":"nework","bstx":"blastx","was":"wasder","awo":"aiwork","pixeos":"pixeos","octa":"octapay","entone":"entone","uzz":"azuras","beck":"macoin","anb":"angryb","exg":"exgold","zooshi":"zooshi","xbtg":"bitgem","erc223":"erc223","djv":"dejave","pea":"pea-farm","ec":"echoin","xaaveb":"xaaveb","levelg":"levelg","degens":"degens","cx":"circleex","fpt":"finple","gom":"gomics","ufi":"purefi","sbt":"solbit","apad":"anypad","qoob":"qoober","raux":"ercaux","ipm":"timers","fit":"financial-investment-token","ett":"efficient-transaction-token","ket":"rowket","potato":"potato","cso":"crespo","bst":"bitsten-token","r3t":"rock3t","dsr":"desire","agrs":"agoras","omm":"omcoin","nt":"nextype-finance","waf":"waffle","lib":"banklife","barrel":"barrel","frel":"freela","becn":"beacon","echt":"e-chat","mmon":"mommon","renfil":"renfil","ftr":"future","att":"africa-trading-chain","frts":"fruits","glf":"glufco","efk":"refork","alg":"bitalgo","esp":"espers","jui":"juiice","usg":"usgold","trl":"trolite","cby":"cberry","kuro":"kurobi","ytn":"yenten","wtm":"waytom","clx":"celeum","newinu":"newinu","shorty":"shorty","uted":"united-token","acu":"aitheon","dogegf":"dogegf","maru":"hamaru","rpd":"rapids","gxi":"genexi","dka":"dkargo","wgold":"apwars","merl":"merlin","xhi":"hicoin","rpzx":"rapidz","yfo":"yfione","gsfy":"gasify","dbt":"datbit","yplx":"yoplex","fnd":"fundum","fai":"fairum","ign":"ignite","htmoon":"htmoon","byt":"byzbit","mrvl":"marvel","azx":"azeusx","musubi":"musubi","din":"dinero","hgro":"helgro","me":"all-me","ntvrk":"netvrk","mgx":"margix","stri":"strite","oml":"omlira","alu":"altura","xaavea":"xaavea","edux":"edufex","hoop":"hoopoe","forint":"forint","ubin":"ubiner","daw":"deswap","in":"incoin","ebst":"eboost","uno":"unobtanium","vancat":"vancat","bump":"bumper","wbpc":"buypay","swamp":"swamp-coin","dln":"delion","zlw":"zelwin","skrp":"skraps","strn":"strain","simple":"simple","kodi":"kodiak","gafi":"gamefi","marmaj":"marmaj","age":"agenor","smbr":"sombra-network","dxo":"deepspace-token","mimo":"mimo-parallel-governance-token","sic":"sicash","xce":"cerium","rndm":"random","byco":"bycoin","jmt":"jmtime","cuminu":"cuminu","xsh":"shield","topcat":"topcat","lcnt":"lucent","crts":"cryptotipsfr","cocoin":"cocoin","scribe":"scribe","yac":"yacoin","drdoge":"drdoge","heal":"etheal","xqr":"qredit","dah":"dirham","rno":"snapparazzi","trat":"tratok","uponly":"uponly","agu":"agouti","ilk":"inlock-token","xinchb":"xinchb","s8":"super8","strk":"strike","gbx":"gbrick","xditto":"xditto","onit":"onbuff","wiz":"bluewizard","bumn":"bumoon","dogira":"dogira","melody":"melody","upps":"uppsme","sxi":"safexi","ivg":"ivogel","fzy":"frenzy","hpx":"hupayx","rnx":"roonex","xincha":"xincha","wynaut":"wynaut","qiq":"qoiniq","derc":"derace","priv":"privcy","slth":"slothi","ocul":"oculor","iqq":"iqoniq","bchain":"bchain","mdu":"mdu","nip":"catnip","xdag":"dagger","sherpa":"sherpa","incnt":"incent","wad":"warden","flty":"fluity","dfa":"define","sefa":"mesefa","crb":"cribnb","nbr":"niobio-cash","bte":"btecoin","akuaku":"akuaku","gunthy":"gunthy","nickel":"nickel","spg":"super-gold","kel":"kelvpn","kudo":"kudoge","usnbt":"nubits","ras":"raksur","anct":"anchor","evr":"everus","zoa":"zotova","doogee":"doogee","lemd":"lemond","pspace":"pspace","ame":"amepay","uco":"uniris","tara":"taraxa","jigsaw":"jigsaw","wix":"wixlar","cyclub":"mci-coin","heartk":"heartk","sead":"seadog-finance","oct":"octopus-network","xcz":"xchainz","sunc":"sunrise","del":"decimal","sdgo":"sandego","vtar":"vantaur","gadoshi":"gadoshi","moonpaw":"moonpaw","ebtc":"eos-btc","eeth":"eos-eth","mmui":"metamui","chaos":"zkchaos","pad":"smartpad","lota":"loterra","rapdoge":"rapdoge","ddm":"ddmcoin","cpz":"cashpay","ham":"hamster","cpac":"compact","rzrv":"rezerve","tat":"tatcoin","kenu":"ken-inu","ents":"eunomia","gzro":"gravity","the":"the-node","x0z":"zerozed","celc":"celcoin","tlc":"tl-coin","smdx":"somidax","vro":"veraone","twee":"tweebaa","nug":"nuggets","bzn":"benzene","lobs":"lobstex-coin","far":"farmland-protocol","caj":"cajutel","mapc":"mapcoin","etck":"oec-etc","xlon":"excelon","exp":"exchange-payment-coin","net":"netcoin","jed":"jedstar","babyegg":"babyegg","bchk":"oec-bch","spike":"spiking","sum":"sumswap","btkc":"beautyk","meowcat":"meowcat","winr":"justbet","dotk":"oec-dot","eag":"ea-coin","tinu":"tom-inu","catgirl":"catgirl","ibh":"ibithub","b2b":"b2bcoin-2","xdo":"xdollar","sgb":"songbird","zum":"zum-token","babyuni":"babyuni","poocoin":"poocoin","bbsc":"babybsc","sjw":"sjwcoin","ctl":"citadel","ath":"aetherv2","ptr":"payturn","bafe":"bafe-io","bixcpro":"bixcpro","gsm":"gsmcoin","ape":"apecoin","tgdy":"tegridy","ardx":"ardcoin","bitc":"bitcash","hesh":"hesh-fi","def":"deffect","trcl":"treecle","odex":"one-dex","safeass":"safeass","bbs":"baby-shark-finance","baxs":"boxaxis","rwd":"rewards","legends":"legends","betxc":"betxoin","pit":"pitbull","kuv":"kuverit","cid":"cryptid","tgbp":"truegbp","alia":"xanalia","hotdoge":"hot-doge","7e":"7eleven","pbl":"polkalab-token","sxc":"simplexchain","bark":"bored-ark","kaiinu":"kai-inu","plug":"plgnet","glx":"galaxer","hld":"holdefi","cyfm":"cyberfm","lthn":"intensecoin","ril":"rilcoin","fn":"filenet","pzap":"polyzap","sto":"storeum","x-token":"x-token","volt":"voltage","pm":"pomskey","meebits20":"meebits","nld":"newland","pt":"predict","stfi":"startfi","wntr":"weentar","erotica":"erotica-2","pbx":"paribus","babybnb":"babybnb","dch":"doch-coin","tag":"tagcoin-erc20","vspacex":"vspacex","jam":"tune-fm","xf":"xfarmer","zny":"bitzeny","roo":"roocoin","did":"didcoin","minibnb":"minibnb","pfy":"portify","vltm":"voltium","sam":"samurai","btv":"bitvote","ydr":"ydragon","vbit":"voltbit","addy":"adamant","bbfeg":"babyfeg","wenb":"wenburn","ohmc":"ohm-coin","onelink":"onelink","asy":"asyagro","opul":"opulous","mnmc":"mnmcoin","dvx":"derivex","xph":"phantom","rlz":"relianz","deq":"dequant","btrm":"betrium","jdc":"jd-coin","mkey":"medikey","czz":"classzz","sandman":"sandman","cop":"copiosa","htc":"hitcoin","some":"mixsome","dyn":"dynamic","rvl":"revival","rech":"rechain","fra":"findora","mlm":"mktcoin","ethp":"ethplus","onigiri":"onigiri","canu":"cannumo","bgr":"bitgrit","safesun":"safesun","lar":"linkart","mmo":"mmocoin","wxc":"wiix-coin","pdox":"paradox","thkd":"truehkd","tek":"tekcoin","btck":"oec-btc","ktc":"kitcoin","lty":"ledgity","peer":"unilord","bonfire":"bonfire","mnr":"mineral","reddoge":"reddoge","bbyxrp":"babyxrp","mesh":"meshbox","ecp":"ecp-technology","bdo":"bdollar","hmr":"homeros","ccxx":"counosx","bins":"bsocial","gnft":"gamenft","buck":"arbucks","300":"spartan","xemx":"xeniumx","kuka":"kukachu","$dpace":"defpace","fml":"formula","dogedao":"dogedao","bnx":"bnx","btrn":"bitroncoin","xes":"proxeus","safeeth":"safeeth","vnl":"vanilla","ixs":"ix-swap","slds":"solidus","elv":"e-leven","mma":"mmacoin","ree":"reecoin","dank":"mu-dank","ubomb":"unibomb","ets":"etheros","evereth":"evereth","news":"publish","btcm":"btcmoon","mndao":"moondao","mpay":"menapay","bn":"bitnorm","dxh":"daxhund","peth18c":"peth18c","bgc":"bigcash","dion":"dionpay","arts":"artista","ttt":"the-transfer-token","kfc":"chicken","attr":"attrace","epstein":"epstein","fnk":"fnkcom","yok":"yokcoin","xfyi":"xcredit","meow":"meowshi","kyan":"kyanite","tfd":"etf-dao","esw":"emiswap","ael":"aelysir","avn":"avantage","yot":"payyoda","crfi":"crossfi","satoz":"satozhi","pshp":"payship","komp":"kompass","tkmn":"tokemon","pamp":"pamp-network","pqt":"prediqt","psy":"psychic","sfn":"strains","thun":"thunder","halv":"halving-coin","bdot":"babydot","nada":"nothing","trop":"interop","sap":"sapchain","efi":"efinity","via":"viacoin","wcx":"wecoown","won":"weblock","our":"our-pay","unos":"unoswap","checoin":"checoin","ella":"ellaism","shroud":"shroud-protocol","axnt":"axentro","dxct":"dnaxcat","flexusd":"flex-usd","tronish":"tronish","nyex":"nyerium","pugl":"puglife","ala":"aladiex","cava":"cavapoo","onemoon":"onemoon","lkt":"locklet","klee":"kleekai","yay":"yay-games","maxgoat":"maxgoat","sup8eme":"sup8eme","jindoge":"jindoge","hrd":"hrd","ethk":"oec-eth","vana":"nirvana","ratoken":"ratoken","buz":"buzcoin","vash":"vpncoin","lil":"lillion","crunch":"crunch","v":"version","skyborn":"skyborn","csp":"caspian","opus":"opusbeat","fatcake":"fatcake","boob":"boobank","mora":"meliora","daik":"oec-dai","hitx":"hithotx","enu":"enumivo","1trc":"1tronic","org":"ogcnode","pkt":"playkey","oneperl":"oneperl","dkyc":"dont-kyc","zksk":"oec-zks","xat":"shareat","mttcoin":"mttcoin","babyboo":"babyboo","aby":"artbyte","ddc":"duxdoge","bist":"bistroo","buoc":"buocoin","ozg":"ozagold","pgs":"pegasus","w3b":"w3bpush","prophet":"prophet","mql":"miraqle","zdx":"zer-dex","bool":"boolean","bin":"binarium","gate":"gatenet","jch":"jobcash","bup":"buildup","befx":"belifex","trbt":"tribute","pswamp":"pswampy","fat":"tronfamily","wyx":"woyager","bnp":"benepit","fig":"flowcom","fey":"feyorra","mojov2":"mojo-v2","mb":"minebee","lhb":"lendhub","msb":"misbloc","ift":"iftoken","filk":"oec-fil","safewin":"safewin","dogebtc":"dogebtc","lux":"lux-expression","ecell":"celletf","tcgcoin":"tcgcoin","c":"c-token","bscb":"bscbond","pyn":"paycent","wfx":"webflix","fdm":"freedom","mnry":"moonery","cyo":"calypso","lithium":"lithium-2","xht":"hollaex-token","dgmt":"digimax","onewing":"onewing","babysun":"babysun","moochii":"moochii","lmo":"lumeneo","pkex":"polkaex","jar":"jarvis","myak":"miniyak","afrox":"afrodex","coi":"coinnec","nax":"nextdao","rdt":"ridotto","banketh":"banketh","glms":"glimpse","hada":"hodlada","onevbtc":"onevbtc","tlw":"tilwiki","swat":"swtcoin","i9c":"i9-coin","unik":"oec-uni","cnx":"cryptonex","bnode":"beenode","ethdown":"ethdown","ix":"x-block","barmy":"bscarmy","gps":"triffic","ogx":"organix","sfm":"sfmoney","babyeth":"babyeth","wsote":"soteria","mpt":"metal-packaging-token","digi":"digible","pots":"moonpot","fate":"fatebet","ltck":"oec-ltc","cashdog":"cashdog","brain":"nobrainer-finance","gly":"glyph-token","sprts":"sprouts","cmg":"cmgcoin","hawk":"hawkdex","sfgk":"oec-sfg","xnb":"xeonbit","xiro":"xiropht","rzb":"rizubot","rebound":"rebound","eum":"elitium","everape":"everape","data":"data-economy-index","lyra":"scrypta","pcm":"precium","qtcon":"quiztok","momento":"momento","tty":"trinity","song":"songcoin","moonbar":"moonbar","pog":"pogged-finance","opc":"op-coin","tshp":"12ships","pmeer":"qitmeer","rtk":"ruletka","hbit":"hashbit","rest":"restore","gaia":"gaiadao","si14":"si14bet","bly":"blocery","bnk":"bankera","cp":"cryptoprofile","xmv":"monerov","888":"888-infinity","iby":"ibetyou","hamtaro":"hamtaro","pci":"pay-coin","eca":"electra","dzoo":"dogezoo","torpedo":"torpedo","oioc":"oiocoin","grx":"gravitx","yuct":"yucreat","mch":"meme-cash","ekt":"educare","bsccrop":"bsccrop","qzk":"qzkcoin","swin":"swinate","vita":"vitadao","btsg":"bitsong","brise":"bitrise-token","xov":"xov","iti":"iticoin","kurt":"kurrent","dogepot":"dogepot","vention":"vention","ebase":"eurbase","nftd":"nftrade","taud":"trueaud","foot":"bigfoot","psb":"pesobit","gbt":"gamebetcoin","bbt":"blockbase","nucleus":"nucleus","lime":"limeswap","assg":"assgard","bern":"bernard","wdx":"wordlex","xxa":"ixinium","hal":"halcyon","bstbl":"bstable","leopard":"leopard","lildoge":"lildoge","rx":"raven-x","ole":"olecoin","bfic":"bficoin","igg":"ig-gold","onefuse":"onefuse","xya":"freyala","syn":"synapse-2","lpi":"lpi-dao","capt":"captain","bim":"bimcoin","youc":"youcash","mdtk":"mdtoken","zik":"zik-token","bscgold":"bscgold","fk":"fk-coin","yplt":"yplutus","tape":"toolape","shrm":"shrooms","exo":"exohood","marks":"bitmark","gpt":"grace-period-token","fnax":"fnaticx","sushiba":"sushiba","ntx":"nitroex","xst":"stealthcoin","fnsp":"finswap","prvs":"previse","mouse":"mouse","scl":"sociall","mel":"caramelswap","dmtr":"dimitra","mepad":"memepad","kol":"kollect","aglt":"agrolot","bono":"bonorum-coin","mowa":"moniwar","rhegic2":"rhegic2","xgmt":"xgambit","chat":"beechat","nss":"nss-coin","kogecoin":"kogecoin","bith":"bithachi","vlk":"vulkania","cim":"coincome","agn":"agrinoble","bait":"baitcoin","pos":"pos-coin","fave":"favecoin","aenj":"aave-enj-v1","stash":"bitstash-marketplace","hpot":"hash-pot","html":"htmlcoin","amkr":"aave-mkr-v1","amz":"amazonacoin","eva":"evanesco-network","glxm":"galaxium","poco":"pocoland","fch":"fanaticos-cash","payns":"paynshop","ziti":"ziticoin","rush":"rushmoon","slc":"selenium","xln":"lunarium","mltpx":"moonlift","soku":"sokuswap","tkb":"tkbtoken","urx":"uraniumx","jobs":"jobscoin","zne":"zonecoin","bkr":"balkari-token","safedoge":"safedoge-token","smax":"shibamax","gldy":"buzzshow","hdao":"hyperdao","0xc":"0xcharts","kdag":"kdag","gasg":"gasgains","try":"try-finance","lazydoge":"lazydoge","cmit":"cmitcoin","stopelon":"stopelon","meetone":"meetone","safecity":"safecity","pump":"pump-coin","windy":"windswap","srp":"starpunk","nbl":"nobility","solarite":"solarite","gcn":"gcn-coin","swg":"swgtoken","kawaii":"kawaiinu","flur":"flurmoon","elongate":"elongate","tar":"tartarus","boomc":"boomcoin","swaps":"nftswaps","rdct":"rdctoken","tokau":"tokyo-au","llt":"lifeline","xgs":"genesisx","uca":"uca","gfun":"goldfund-ico","polymoon":"polymoon","verse":"shibaverse","pact":"packswap","smgm":"smegmars","nvc":"novacoin","trtt":"trittium","bmars":"binamars","bnw":"nagaswap","ftn":"fountain","moondash":"moondash","xbs":"bitstake","timec":"time-coin","fren":"frenchie","xi":"xi-token","dark":"darkbuild","bigo":"bigo-token","safemusk":"safemusk","bcx":"bitcoinx","mola":"moonlana","eti":"etherinc","kube":"kubecoin","eswa":"easyswap","tatm":"tron-atm","wpt":"worldpet","safu":"ceezee-safu","crox":"croxswap","miniusdc":"miniusdc","safebull":"safebull","safenami":"safenami","jrex":"jurasaur","qbu":"quannabu","foxd":"foxdcoin","ldoge":"litedoge","instinct":"instinct","plat":"bitguild","bitbucks":"bitbucks","babybake":"baby-bake","smsct":"smscodes","same":"samecoin","disk":"darklisk","papacake":"papacake","brun":"bull-run","moonwalk":"moonwalk","shfl":"shuffle","trn":"tronnodes","sine":"sinelock","spp":"shapepay","fll":"feellike","ecoc":"ecochain","tnr":"tonestra","ocb":"blockmax","inrt":"inrtoken","bio":"biocrypt","dcash":"dappatoz","dinop":"dinopark","wdf":"wildfire","atyne":"aerotyne","ddtg":"davecoin","graph":"unigraph","srat":"spacerat","foho":"fohocoin","zantepay":"zantepay","prtcle":"particle-2","babyada":"baby-ada","kinek":"oec-kine","hca":"harcomia","burndoge":"burndoge","guap":"guapcoin","cross":"crosspad","sw":"safewolf","redshiba":"redshiba","teslf":"teslafan","atmn":"antimony","rcg":"recharge","xmm":"momentum","mes":"meschain","lazy":"lazymint","dfk":"defiking","dogecola":"dogecola","lord":"overlord","rice":"rice-wallet","babybusd":"babybusd","oswap":"openswap","swsh":"swapship","nmc":"namecoin","gict":"gictrade","home":"home-coin","vip":"limitless-vip","okfly":"okex-fly","auop":"opalcoin","mo":"morality","myfi":"myfichain","poof":"poofcash","polygold":"polygold","nole":"nolecoin","abat":"aave-bat-v1","wcs":"weecoins","cats":"catscoin","lvl":"levelapp","hypebet":"hype-bet","kkc":"primestone","jpyc":"jpyc","exmr":"exmr-monero","safecock":"safecock","izi":"izichain","apes":"apehaven","ragna":"ragnarok","mnt":"meownaut","fomp":"fompound","yetu":"yetucoin","nmt":"nftmart-token","koko":"kokoswap","dyx":"xcoinpay","seachain":"seachain","orly":"orlycoin","gldx":"goldex-token","isr":"insureum","eggplant":"eggplant","roll":"polyroll","adai":"aave-dai-v1","gix":"goldfinx","ansr":"answerly","pok":"pokmonsters","black":"blackhole-protocol","dmod":"demodyfi","stol":"stabinol","wcn":"widecoin","bsc":"bitsonic-token","kekw":"kekwcoin","100x":"100x-coin","afarm":"arbifarm","kdoge":"kingdoge","ltg":"litegold","sng":"sinergia","bizz":"bizzcoin","foge":"fat-doge","vga":"vegaswap","lava":"lavacake-finance","mne":"minereum","meda":"medacoin","mmda":"pokerain","glass":"ourglass","aim":"ai-mining","upl":"uploadea","ijc":"ijascoin","mdc":"mindcell","fic":"filecash","dogerise":"dogerise","pinksale":"pinksale","fjc":"fujicoin","taste":"tastenft","ofi":"ofi-cash","rvmt":"rivemont","wave":"polywave","lby":"libonomy","ap3":"ap3-town","sme":"safememe","inf":"infbundle","xviper":"viperpit","pepe":"pepemoon","2chainlinks":"2-chains","znc":"zioncoin","opnn":"opennity","busy":"busy-dao","lst":"lendroid-support-token","evm":"evermars","entr":"enterdao","megarise":"megarise","ogods":"gotogods","defy":"defycoinv2","buda":"budacoin","kali":"kalicoin","owdt":"oduwausd","meme20":"meme-ltd","csx":"coinstox","pupdoge":"pup-doge","ethpy":"etherpay","bnv":"benative","lvn":"livenpay","ic":"ignition","hana":"hanacoin","i9x":"i9x-coin","york":"polyyork","tep":"tepleton","palt":"palchain","mbonk":"megabonk","stpc":"starplay","tmed":"mdsquare","cer":"cerealia","cocktail":"cocktail","guss":"guss-one","alp":"alp-coin","nuko":"nekonium","lion":"lion-token","npo":"npo-coin","botx":"botxcoin","ethvault":"ethvault","mms":"minimals","toc":"touchcon","wrk":"blockwrk","etch":"elontech","coge":"cogecoin","bfg":"bfg-token","epichero":"epichero","ntrs":"nosturis","firu":"firulais","acrv":"aave-crv","syl":"xsl-labs","chee":"cheecoin","tpad":"trustpad","srnt":"serenity","bee":"bee-coin","msh":"crir-msh","chnd":"cashhand","gbts":"gembites","perl":"perlin","hfire":"hellfire","qbz":"queenbee","mbs":"micro-blood-science","$maid":"maidcoin","lol":"emogi-network","b2u":"b2u-coin","pampther":"pampther","gens":"genshiro","arai":"aave-rai","mem":"memecoin","xqn":"quotient","adoge":"arbidoge","gom2":"gomoney2","yfr":"youforia","bbnd":"beatbind","char":"charitas","vrap":"veraswap","shih":"shih-tzu","babybilz":"babybilz","fraction":"fraction","ixt":"insurex","oxo":"oxo-farm","mamadoge":"mamadoge","mgt":"megatech","nicheman":"nicheman","moonshot":"moonshot","blu":"bluecoin","miro":"mirocana","kva":"kevacoin","ants":"fireants","vn":"vice-network","ple":"plethori","plf":"playfuel","aya":"aryacoin","dhd":"dhd-coin","bnu":"bytenext","sh":"super-hero","moonmoon":"moonmoon","vice":"vicewrld","beer":"beer-token","cirq":"cirquity","tnglv3":"tangle","xblzd":"blizzard","eds":"endorsit","ioc":"iocoin","trusd":"trustusd","bshiba":"bscshiba","bankbtc":"bank-btc","yda":"yadacoin","honey":"honey-pot-beekeepers","ssx":"somesing","aren":"aave-ren-v1","safebank":"safebank","ea":"ea-token","shit":"shitcoin","ccm":"car-coin","sym":"symverse","admonkey":"admonkey","hdoge":"holydoge","hburn":"hypeburn","moonarch":"moonarch","bcna":"bitcanna","gabecoin":"gabecoin","elm":"elements-2","stak":"jigstack","tinv":"tinville","catz":"catzcoin","kok":"kok-coin","zuc":"zeuxcoin","hta":"historia","mig":"migranet","wage":"philscurrency","xrp-bf2":"xrp-bep2","mowl":"moon-owl","pax":"payperex","pure":"puriever","xil":"projectx","xgk":"goldkash","tkm":"thinkium","bucks":"swagbucks","btcv":"bitcoin-volatility-index-token","fastmoon":"fastmoon","plbt":"polybius","loge":"lunadoge","auni":"aave-uni","azrx":"aave-zrx-v1","vlm":"valireum","prime":"primedao","amo":"amo","mkcy":"markaccy","polo":"polkaplay","evermusk":"evermusk","tpay":"tetra-pay","alr":"alacrity","sticky":"flypaper","club":"clubcoin","ow":"owgaming","hl":"hl-chain","wheel":"wheelers","leaf":"seeder-finance","imc":"imm-coin","b2g":"bitcoiin","slrm":"solareum","adl":"adelphoi","wtip":"worktips","ubn":"ubricoin","aht":"ahatoken","ndn":"ndn-link","goc":"eligma","usdf":"new-usdf","wit":"witchain","noa":"noa-play","zg":"zg","swan":"blackswan","adaflect":"adaflect","ebsc":"earlybsc","bell":"bellcoin","gany":"ganymede","safezone":"safezone","elonpeg":"elon-peg","maskdoge":"maskdoge","scix":"scientix","dgw":"digiwill","nyan":"arbinyan","coom":"coomcoin","minishib":"minishib-token","trp":"tronipay","ninu":"neko-inu","aswap":"arbiswap","trad":"tradcoin","jejudoge":"jejudoge-bsc","zoe":"zoe-cash","mojo":"moonjuice","cxpad":"coinxpad","lanc":"lanceria","ytv":"ytv-coin","winlambo":"winlambo","trip":"tripedia","pmd":"promodio","scoin":"shincoin","bpp":"bitpower","earn":"yearn-classic-finance","asnx":"aave-snx-v1","trix":"triumphx","evape":"everyape-bsc","bfl":"bitflate","mxw":"maxonrow","tv":"ti-value","bln":"baby-lion","pti":"paytomat","moonrise":"moonrise","art":"around-network","yts":"yetiswap","deku":"deku-inu","bwt":"babywhitetiger","hnc":"helleniccoin","pawg":"pawgcoin","btcl":"btc-lite","hzm":"hzm-coin","mfund":"memefund","icol":"icolcoin","payb":"paybswap","ebusd":"earnbusd","bsn":"bastonet","bblink":"babylink","idtt":"identity","burp":"coinburp","mbbased":"moonbase","bricks":"mybricks","fairlife":"fairlife","bbp":"biblepay","rmrk":"rmrk-app","nawa":"narwhale","gamesafe":"gamesafe","urg":"urgaming","minicake":"minicake","mcontent":"mcontent","safehold":"safehold","seq":"sequence","ever":"everswap","polystar":"polystar","wifedoge":"wifedoge","chubbies20":"chubbies","bkkg":"biokkoin","isal":"isalcoin","nemo":"nemocoin","ttc":"thetimeschaincoin","aidi":"aidi-inu","bsp":"ballswap","vcc":"victorum","nftbs":"nftbooks","mbby":"minibaby","dcat":"donutcat","shibk":"oec-shib","pxg":"playgame","ape$":"ape-punk","runes":"runebase","itgr":"integral","bugg":"bugg-finance","snft":"seedswap","ayfi":"ayfi-v1","herodoge":"herodoge","edgt":"edgecoin-2","goon":"goonrich","acs":"acryptos","getdoge":"get-doge","daft":"daftcoin","arcadium":"arcadium","hina":"hina-inu","homi":"homihelp","smd":"smd-coin","alh":"allohash","safestar":"safestar","mbud":"moon-bud","xdna":"extradna","cetf":"cetf","boge":"bogecoin","log":"woodcoin","dxc":"dex-trade-coin","poke":"pokeball","path":"path-vault-nftx","txc":"tenxcoin","lpl":"linkpool","ri":"ri-token","metamoon":"metamoon","cbd":"greenheart-cbd","nbng":"nobunaga","prdz":"predictz","ino":"ino-coin","sphtx":"sophiatx","spiz":"space-iz","metas":"metaseer","18c":"block-18","astax":"ape-stax","btshk":"bitshark","enk":"enkronos","bnana":"banana-token","gabr":"gaberise","drops":"defidrop","goku":"goku-inu","okboomer":"okboomer","moonstar":"moonstar","aem":"atheneum","lf":"linkflow","bankr":"bankroll","qfi":"qfinance","sbfc":"sbf-coin","oneusd":"1-dollar","scol":"scolcoin","blowf":"blowfish","kami":"kamiland","aknc":"aave-knc-v1","bits":"bitcoinus","bnpl":"bnpl-pay","hup":"huplife","topc":"topchain","fan":"fanadise","nan":"nantrade","job":"jobchain","bca":"bitcoin-atom","libertas":"libertas-token","0xmr":"0xmonero","moto":"motocoin","mai":"mindsync","ultgg":"ultimogg","vns":"va-na-su","babyelon":"babyelon","pxp":"pointpay","pxi":"prime-xi","nia":"nia-token","richduck":"richduck","dyz":"dyztoken","knb":"kronobit","pcl":"peculium","zyn":"zynecoin","meet":"coinmeet","anv":"aniverse","investel":"investel","dane":"danecoin","bitgatti":"biitgatti","abal":"aave-bal","jrc":"finchain","nsr":"nushares","mrch":"merchdao","gpu":"gpu-coin","dogemoon":"dogemoon","nifty":"niftynft","cpt":"cryptaur","solberry":"solberry","trex":"tyrannosaurus-rex","tagr":"tagrcoin","yfim":"yfimobi","mnd":"mound-token","shibapup":"shibapup","crush":"bitcrush","buni":"bunicorn","gram":"gram","xrpape":"xrp-apes","ainu":"ainu-token","ons":"one-share","1gold":"1irstgold","pte":"peet-defi","hint":"hintchain","creva":"crevacoin","orb":"orbitcoin","bitb":"bean-cash","panda":"hashpanda","bash":"luckchain","dui":"dui-token","arap":"araplanet","asn":"ascension","ramen":"ramenswap","hejj":"hedge4-ai","intx":"intexcoin","srv":"zilsurvey","inftee":"infinitee","space":"space-token","idl":"idl-token","gre":"greencoin","crm":"cream","nanox":"project-x","bchc":"bitcherry","lir":"letitride","rth":"rotharium","cbr":"cybercoin","gator":"gatorswap","ponzi":"ponzicoin","shd":"shardingdao","fuzz":"fuzz-finance","eost":"eos-trust","lov":"lovechain","tenshi":"tenshi","lemo":"lemochain","homt":"hom-token","abc":"abc-chain","$king":"king-swap","eplus":"epluscoin","mgc":"magnachain","scurve":"lp-scurve","btnt":"bitnautic","ato":"eautocoin","bgl":"bitgesell","jm":"justmoney","nplc":"plus-coin","vfil":"venus-fil","ksc":"kstarcoin","btzc":"beatzcoin","slv":"silverway","blp":"bullperks","omc":"ormeus-cash","laika":"laika-protocol","honk":"honk-honk","pton":"foresting","wifi":"wifi-coin","skc":"skinchain","brwn":"browncoin","spk":"sparks","newos":"newstoken","fcr":"fromm-car","lbet":"lemon-bet","pbase":"polkabase","dfc":"deficonnect","wtn":"waletoken","poll":"clearpoll","entrc":"entercoin","eubc":"eub-chain","loto":"lotoblock","forex":"handle-fi","asusd":"aave-susd-v1","meo":"meo-tools","sushik":"oec-sushi","agvc":"agavecoin","etl":"etherlite-2","tea":"tea-token","hvt":"hirevibes","ycurve":"curve-fi-ydai-yusdc-yusdt-ytusd","limit":"limitswap","ezpay":"eazypayza","smoon":"saylor-moon","vrise":"v4p0rr15e","rew":"rewardiqa","uniusd":"unidollar","bna":"bananatok","vjc":"venjocoin","amsk":"nolewater","bixb":"bixb-coin","pazzi":"paparazzi","okt":"okexchain","pocc":"poc-chain","egc":"evergrowcoin","kong":"kong-defi","cpd":"coinspaid","dkkt":"dkk-token","mtcn":"multiven","nnb":"nnb-token","xbe":"xbe-token","611":"sixeleven","cakecrypt":"cakecrypt","payt":"payaccept","stb":"stb-chain","xamp":"antiample","yap":"yap-stone","lfc":"linfinity","ltk":"litecoin-token","psix":"propersix","bdogex":"babydogex","exm":"exmo-coin","eup":"eup-chain","maya":"maya-coin","stro":"supertron","bnc":"bnoincoin","vxc":"vinx-coin","crazytime":"crazytime","safespace":"safespace","zmbe":"rugzombie","dexa":"dexa-coin","dsc":"data-saver-coin","sports":"zensports","mic3":"mousecoin","spaz":"swapcoinz","elc":"eaglecoin-2","drgb":"dragonbit","save":"savetheworld","cbrl":"cryptobrl","cbet":"cbet-token","glov":"glovecoin","ship":"shipchain","akita":"akita-inu","coal":"coalculus","pdai":"prime-dai","amana":"aave-mana-v1","isdt":"istardust","gbk":"goldblock","lmch":"latamcash","mask20":"hashmasks","mnstp":"moon-stop","layerx":"unilayerx","dpc":"dappcents","sloth":"slothcoin","pcb":"451pcbcom","ecos":"ecodollar","kanda":"telokanda","lburst":"loanburst","orbi":"orbicular","sfg":"s-finance","fsp":"flashswap","qbc":"quebecoin","twi":"trade-win","hlp":"help-coin","tknt":"tkn-token","koel":"koel-coin","love":"love-coin","mvc":"mileverse","vxvs":"venus-xvs","chow":"chow-chow-finance","stxem":"stakedxem","lbd":"linkbased","ghostface":"ghostface","ethback":"etherback","unft":"ultra-nft","bots":"bot-ocean","uba":"unbox-art","jasmy":"jasmycoin","bito":"bito-coin","epx":"emporiumx","lsh":"leasehold","awg":"aurusgold","supdog":"superdoge","crnbry":"cranberry","safemoney":"safemoney","mptc":"mnpostree","hoo":"hoo-token","pdao":"panda-dao","whl":"whaleroom","ume":"ume-token","corgi":"corgidoge","iai":"iai-token","bspay":"brosispay","stream":"zilstream","eswap":"eswapping","pdoge":"pocket-doge","momo":"momo-protocol","real":"real-coin","invest":"investdex","sendwhale":"sendwhale","hmnc":"humancoin-2","etit":"etitanium","tree":"tree-defi","niu":"niubiswap","more":"legends-room","coshi":"coshi-inu","jdi":"jdi-token","safepluto":"safepluto","polyshiba":"polyshiba","luck":"lady-luck","tno":"tnos-coin","sec":"smilecoin","yag":"yaki-gold","btym":"blocktyme","cock":"shibacock","safeearth":"safeearth","rover":"rover-inu","starsb":"star-shib","darthelon":"darthelon","gift":"gift-coin","safetesla":"safetesla","jind":"jindo-inu","apet":"ape-token","zoot":"zoo-token","hua":"chihuahua","tkinu":"tsuki-inu","apex":"apexit-finance","rb":"royal-bnb","e2p":"e2p-group","lovedoge":"love-doge","chibi":"chibi-inu","xmpt":"xiamipool","bmh":"blockmesh-2","cenx":"centralex","shibacash":"shibacash","dogeback":"doge-back","greenmars":"greenmars","ds":"destorage","cazi":"cazi-cazi","fuzzy":"fuzzy-inu","osm":"options-market","dingo":"dingo-token","newb":"new-token","$weeties":"sweetmoon","moonminer":"moonminer","rktbsc":"bocketbsc","sgaj":"stablegaj","aipi":"aipichain","mntt":"moontrust","buffdoge":"buff-doge","gtn":"glitzkoin","sbear":"yeabrswap","pchart":"polychart","karen":"karencoin","burn1coin":"burn1coin","vbsc":"votechain","jaws":"autoshark","slnt":"salanests","pcpi":"precharge","spacecat":"space-cat","aweth":"aave-weth","just":"justyours","ttr":"tetherino","frag":"game-frag","2crz":"2crazynft","taur":"marnotaur","babydoug":"baby-doug","daddyfeg":"daddy-feg","luffy":"luffy-inu","fups":"feed-pups","isola":"intersola","chaincade":"chaincade","babycake":"baby-cake","cakepunks":"cakepunks","safearn":"safe-earn","nasadoge":"nasa-doge","cybrrrdoge":"cyberdoge","dbuy":"doont-buy","kirby":"kirby-inu","petg":"pet-games","babylink":"baby-link","bunnycake":"bunnycake","dogo":"dogemon-go","snoop":"snoopdoge","burnx20":"burnx20","mny":"moonienft","moonwilly":"moonwilly","x2p":"xenon-pay","cfxt":"chainflix","dara":"immutable","yak":"yield-yak","shed":"shed-coin","solar":"solarmoon","aftrbrn":"afterburn","xnl":"chronicle","scan":"scan-defi","vegas":"vegasdoge","pix":"privi-pix","mia":"miamicoin","bme":"bitcomine","dm":"dogematic","ish":"interlude","sch":"schillingcoin","dogepepsi":"dogepepsi","aquagoat":"aquagoat-old","hypr":"hyperburn","arnxm":"armor-nxm","bxh":"bxh","psk":"poolstake","50k":"50k","token":"swaptoken","babyfloki":"baby-floki","hpns":"happiness","4art":"4artechnologies","dgp":"dgpayment","newton":"newtonium","vdot":"venus-dot","hxy":"hex-money","trump":"trumpcoin","clbk":"cloudbric","vbtc":"venus-btc","ns":"nodestats","ultra":"ultrasafe","thrn":"thorncoin","shon":"shontoken","kite":"kite-sync","pyro":"pyro-network","toki":"tokyo-inu","bbx":"ballotbox","hurricane":"hurricane","evy":"everycoin","duk+":"dukascoin","ani":"anime-token","slf":"solarfare","erz":"earnzcoin","vest":"start-vesting","ouro":"ouroboros","boltt":"boltt-coin","fomo":"fomo-labs","pivxl":"pivx-lite","ecl":"eclipseum","rakuc":"raku-coin","ret":"realtract","pbs":"pbs-chain","vxrp":"venus-xrp","xpb":"transmute","pluto":"plutopepe","floki":"shiba-floki","celt":"celestial","ausdc":"aave-usdc-v1","bazt":"baooka-token","tinku":"tinkucoin","solid":"soliddefi","nokn":"nokencoin","clm":"coinclaim","vect":"vectorium","vicex":"vicetoken","nar":"nar-token","cmerge":"coinmerge-bsc","safelight":"safelight","kmon":"kryptomon","czdiamond":"czdiamond","moontoken":"moontoken","mochi":"mochiswap","ninja":"ninjaswap","kich":"kichicoin","vlt":"bankroll-vault","symm":"symmetric","xvx":"mainfinex","elonone":"astroelon","dph":"digipharm","curve":"curvehash","bravo":"bravo-coin","tbe":"trustbase","vgtg":"vgtgtoken","ndsk":"nadeshiko","krill":"polywhale","stc":"starchain","ba":"batorrent","sdfi":"stingdefi","nd":"neverdrop","aaave":"aave-aave","beluga":"beluga-fi","labra":"labracoin","torq":"torq-coin","ank":"apple-network","fam":"yefam-finance","agusd":"aave-gusd","stxym":"stakedxym","au":"aurumcoin","lunar":"lunar-highway","dmz":"dmz-token","ibg":"ibg-token","yfiig":"yfii-gold","mybtc":"mybitcoin","vdai":"venus-dai","gin":"gin-token","mnx":"nodetrade","pegs":"pegshares","snood":"schnoodle","moonstorm":"moonstorm","foreverup":"foreverup","aab":"aax-token","xscp":"scopecoin","gdm":"goldmoney","whalefarm":"whalefarm","mintys":"mintyswap","papadoge":"papa-doge","greatape":"great-ape","chc":"chunghoptoken","fsafe":"fair-safe","vsxp":"venus-sxp","solo":"solo-vault-nftx","pfid":"pofid-dao","cbg":"chainbing","asia":"asia-coin","vltc":"venus-ltc","yfe":"yfe-money","nuvo":"nuvo-cash","kaiken":"kaikeninu","dobe":"dobermann","xtg":"xtg-world","hss":"hashshare","dbtc":"decentralized-bitcoin","snp":"synapse-network","gms":"gemstones","tls":"tls-token","silk":"silkchain","mtp":"multiplay","safetoken":"safetoken","pgc":"pegascoin","hpy":"hyper-pay","rc20":"robocalls","bak":"baconcoin","bxt":"bittokens","mcf":"moon-chain","opti":"optitoken","dgm":"digimoney","wot":"moby-dick","gmy":"gameology","c8":"carboneum","gol":"gogolcoin","shibcake":"shib-cake","gpunks20":"gan-punks","shpp":"shipitpro","tco":"tcoin-fun","bp":"bunnypark","ims":"ims-wallet","bitci":"bitcicoin","astrolion":"astrolion","stt":"scatter-cx","dfgl":"defi-gold","pyq":"polyquity","aftrbck":"afterback","imgc":"imagecash","safelogic":"safelogic","lland":"lyfe-land","mw":"mirror-world-token","hatch":"hatch-dao","inu":"hachikoinu","ira":"deligence","boxerdoge":"boxerdoge","zash":"zimbocash","dna":"metaverse-dualchain-network-architecture","sugar":"sugarchain","beers":"moonbeers","zupi":"zupi-coin","fgc":"fantasy-gold","jfin":"jfin-coin","gera":"gera-coin","shibsc":"shiba-bsc","etx":"ethereumx","rrb":"renrenbit","ctpl":"cultiplan","kcake":"kangaroocake","webd":"webdollar","kashh":"kashhcoin","lgold":"lyfe-gold","mbm":"mbm-token","nsd":"nasdacoin","vestx":"vestxcoin","ulg":"ultragate","gsmt":"grafsound","xby":"xtrabytes","drunk":"drunkdoge","pwrb":"powerbalt","murphy":"murphycat","hapy":"hapy-coin","rpepe":"rare-pepe","dappx":"dappstore","tesinu":"tesla-inu","defc":"defi-coin","xwc":"whitecoin","mbit":"mbitbooks","boxer":"boxer-inu","safeorbit":"safeorbit","bali":"balicoin","kuky":"kuky-star","xrge":"rougecoin","dream":"dream-swap","tcr":"tracer-dao","gmci":"game-city","skn":"sharkcoin","ths":"the-hash-speed","flunar":"fairlunar","hebe":"hebeblock","asac":"asac-coin","ausdt":"aave-usdt-v1","grit":"integrity","mswap":"moneyswap","gc":"galaxy-wallet","sybc":"sybc-coin","moonghost":"moonghost","naut":"astronaut","bolc":"boliecoin","ponzu":"ponzu-inu","crt":"carr-finance","safecomet":"safecomet","hnzo":"hanzo-inu","vany":"vanywhere","xiasi":"xiasi-inu","latte":"latteswap","nrgy":"nrgy-defi","ryiu":"ryi-unity","bbk":"bitblocks-project","hub":"minter-hub","blfi":"blackfisk","paddy":"paddycoin","bbjeju":"baby-jeju","ltz":"litecoinz","trees":"safetrees","capp":"crypto-application-token","now":"changenow","esti":"easticoin","ez":"easyfi","bnz":"bonezyard","ich":"ideachain","shillmoon":"shillmoon","deeznuts":"deez-nuts","fullsend":"full-send","btcr":"bitcurate","thr":"thorecoin","dic":"daikicoin","teslasafe":"teslasafe","img":"imagecoin","odc":"odinycoin","daddycake":"daddycake","simps":"onlysimps","pass":"passport-finance","repo":"repo","rld":"real-land","qtf":"quantfury","smrt":"solminter","mcc":"magic-cube","andes":"andes-coin","hfil":"huobi-fil","bbr":"bitberry-token","xtnc":"xtendcash","tbg":"thebridge","snaut":"shibanaut","mgdg":"mage-doge","atusd":"aave-tusd-v1","yayo":"yayo-coin","bun":"bunnycoin","lsp":"lumenswap","kpop":"kpop-fan-token","tcub":"tiger-cub","awbtc":"aave-wbtc-v1","thoge":"thor-doge","7add":"holdtowin","minty":"minty-art","telos":"telos-coin","reum":"rewardeum","grlc":"garlicoin","pixu":"pixel-inu","safermoon":"safermoon","dynge":"dyngecoin","mcau":"meld-gold","abusd":"aave-busd-v1","boobs":"moonboobs","beans":"bnbeanstalk","lofi":"lofi-defi","vbch":"venus-bch","spdx":"spender-x","scs":"speedcash","light":"light-defi","curry":"curryswap","ball":"ball-token","bamboo":"bamboo-token-2","ffa":"cryptofifa","acsi":"acryptosi","carr":"carnomaly","kishu":"kishu-inu","nut":"native-utility-token","cool20":"cool-cats","miks":"miks-coin","alink":"aave-link-v1","flc":"flowchaincoin","mvh":"moviecash","micn":"mindexnew","dlycop":"daily-cop","jaguar":"jaguarswap","sswim":"shiba-swim","invc":"investcoin","dapp":"dapp","nah":"strayacoin","grw":"growthcoin","kgw":"kawanggawa","dtube":"dtube-coin","lrg":"largo-coin","policedoge":"policedoge","expo":"online-expo","dvc":"dragonvein","kt":"kuaitoken","tavitt":"tavittcoin","wdr":"wider-coin","blinky":"blinky-bob","ivy":"ivy-mining","erth":"erth-token","frmx":"frmx-token","hedg":"hedgetrade","noahark":"noah-ark","soda":"cheesesoda-token","lvh":"lovehearts","rwn":"rowan-coin","mgpc":"magpiecoin","cmm":"commercium","torj":"torj-world","credit":"credit","icebrk":"icebreak-r","sprtz":"spritzcoin","$aow":"art-of-war","grv":"gravitoken","cent":"centurion-inu","floor":"punk-floor","chs":"chainsquare","plc":"platincoin","dt3":"dreamteam3","yland":"yearn-land","garuda":"garudaswap","onefil":"stable-fil","bynd":"beyondcoin","cfl":"cryptoflow","hyp":"hyperstake","hgc":"higamecoin","bhd":"bitcoin-hd","coral":"coral-swap","vegi":"veggiecoin","safeicarus":"safelcarus","kim":"king-money","banker":"bankerdoge","lnko":"lnko-token","chex":"chex-token","divo":"divo-token","btsucn":"btsunicorn","espro":"esportspro","cosm":"cosmo-coin","yta":"yottacoin","dogg":"dogg-token","moonrabbit":"moonrabbit-2","hora":"hora","msk":"mask-token","tune":"tune-token","gm":"gmcoin","scm":"simulacrum","cng":"cng-casino","gcx":"germancoin","deva":"deva-token","omt":"onion-mixer","itam":"itam-games","elama":"elamachain","soak":"soak-token","bnox":"blocknotex","bcnt":"bincentive","vbeth":"venus-beth","vlink":"venus-link","dtop":"dhedge-top-index","fto":"futurocoin","robet":"robet-coin","db":"darkbuild-v2","akm":"cost-coin","frozen":"frozencake","c4t":"coin4trade","zabaku":"zabaku-inu","bec":"betherchip","cntm":"connectome","tronx":"tronx-coin","btcbam":"bitcoinbam","pmp":"pumpy-farm","jcc":"junca-cash","scorgi":"spacecorgi","grn":"dascoin","eqt":"equitrader","vusdt":"venus-usdt","vbusd":"venus-busd","dnc":"danat-coin","rcube":"retro-defi","xpt":"cryptobuyer-token","mob":"mobilecoin","mad":"make-a-difference-token","mrc":"meroechain","fmta":"fundamenta","vusdc":"venus-usdc","kiz":"kizunacoin","uvu":"ccuniverse","trv":"trustverse","lbr":"liber-coin","leek":"leek-token","ccash":"campuscash","bsg":"bitsonic-gas","phn":"phillionex","thundereth":"thundereth","pod":"payment-coin","bwx":"blue-whale","butter":"butter-token","mima":"kyc-crypto","rd":"round-dollar","ygoat":"yield-goat","carma":"carma-coin","drep":"drep-new","usds":"stableusd","jenn":"tokenjenny","quickchart":"quickchart","fiesta":"fiestacoin","ncat":"nyan-cat","robo":"robo-token","mexc":"mexc-token","soba":"soba-token","rupee":"hyruleswap","sos":"sos-foundation","rmoon":"rocketmoon","lce":"lance-coin","dain":"dain-token","harta":"harta-tech","spup":"spurt-plus","hokage":"hokage-inu","sox":"ethersocks","bglg":"big-league","cl":"coinlancer","shibm":"shiba-moon","hungry":"hungrybear","usdg":"usd-gambit","dscp":"disciplina-project-by-teachmeplease","comfy":"comfytoken","ltn":"life-token","snowge":"snowgecoin","petal":"bitflowers","pkoin":"pocketcoin","pitqd":"pitquidity","smartworth":"smartworth","grow":"grow-token-2","lowb":"loser-coin","cfg":"centrifuge","sdog":"small-doge","cft":"coinbene-future-token","bhiba":"baby-shiba","ttn":"titan-coin","hshiba":"huskyshiba","smoo":"sheeshmoon","bgo":"bingo-cash","usdsp":"usd-sports","snoge":"snoop-doge","chinu":"chubby-inu","strike":"strikecoin","xre":"xre-global","grimex":"spacegrime","saveanimal":"saveanimal","moonlyfans":"moonlyfans","gzx":"greenzonex","fng":"fungie-dao","yum":"yumyumfarm","safeinvest":"safeinvest","brmv":"brmv-token","dink":"dink-donk","pchf":"peachfolio","duke":"duke-token","sanshu":"sanshu-inu","vprc":"vaperscoin","euro":"euro-token-2","pinkpanda":"pink-panda","pearl":"pearl-finance","awf":"alpha-wolf","cosmic":"cosmicswap","prdetkn":"pridetoken","chihua":"chihua-token","csm":"citystates-medieval","tiim":"triipmiles","ai":"flourishing-ai-token","genx":"genx-token","minishiba":"mini-shiba","rain":"rain-network","icr":"intercrone","nuke":"nuke-token","krakbaby":"babykraken","astra":"astra-protocol","fl":"freeliquid","ysoy":"ysoy-chain","trax":"privi-trax","slam":"slam-token","erc":"europecoin","rdoge":"royal-doge","yfis":"yfiscurity","ktr":"kutikirise","littledoge":"littledoge","oneuni":"stable-uni","r0ok":"rook-token","$ninjadoge":"ninja-doge","ski":"skillchain","ralph":"save-ralph","gcnx":"gcnx-token","invi":"invi-token","nfl":"nftlegends","cyf":"cy-finance","$lordz":"meme-lordz","skyx":"skyx-token","soil":"synth-soil","gdp":"gold-pegas","babytrump":"baby-trump","che":"cherryswap","dogedealer":"dogedealer","bhunt":"binahunter","enrg":"energycoin","brcp":"brcp-token","flofe":"floki-wife","fins":"fins-token","trib":"contribute","tp3":"token-play","xagc":"agrocash-x","thunderbnb":"thunderbnb","echo":"token-echo","zcnox":"zcnox-coin","boruto":"boruto-inu","br2.0":"bullrun2-0","lasereyes":"laser-eyes","raid":"raid-token","sundae":"sundaeswap","shade":"shade-cash","dmusk":"dragonmusk","hrb":"herobattle","btrst":"braintrust","romeodoge":"romeo-doge","kill":"memekiller","pkd":"petkingdom","seek":"rugseekers","agte":"agronomist","ulti":"ulti-arena","woof":"shibance-token","dogedrinks":"dogedrinks","babylondon":"babylondon","pgn":"pigeoncoin","medic":"medic-coin","pai":"project-pai","bullaf":"bullish-af","cyt":"coinary-token","hlth":"hlth-token","chiba":"cate-shiba","nce":"new-chance","cennz":"centrality","vert":"polyvertex","lof":"lonelyfans","g-fi":"gorilla-fi","kissmymoon":"kissmymoon","fndz":"fndz-token","eph":"epochtoken","cyberd":"cyber-doge","dawgs":"spacedawgs","undo":"undo-token","fuze":"fuze-token","myc":"myteamcoin","phiba":"papa-shiba","iown":"iown","safegalaxy":"safegalaxy","safecookie":"safecookie","yfms":"yfmoonshot","webn":"web-innovation-ph","feta":"feta-token","bkita":"baby-akita","mfm":"moonfarmer","ccar":"cryptocars","sdo":"safedollar","trail":"polkatrail","syfi":"soft-yearn","smoke":"the-smokehouse-finance","tako":"tako-token","piratecoin\u2620":"piratecoin","cleanocean":"cleanocean","grill":"grill-farm","ecpn":"ecpntoken","xno":"xeno-token","carbo":"carbondefi","dogefather":"dogefather-ecosystem","mgp":"micro-gaming-protocol","euru":"upper-euro","ggive":"globalgive","hope":"hope-token","rzn":"rizen-coin","kaby":"kaby-arena","tvnt":"travelnote","tuber":"tokentuber","collar":"collar-dobe-defender","abi":"apebullinu","willie":"williecoin","polt":"polkatrain","rr":"rug-relief","escx":"escx-token","ucos":"ucos-token","minifloki":"mini-floki","elet":"ether-legends","arbimatter":"arbimatter","udoge":"uncle-doge","booty":"pirate-dice","findshibby":"findshibby","ktv":"kmushicoin","mfy":"mifty-swap","eros":"eros-token","crl":"coral-farm","saga":"cryptosaga","aca":"acash-coin","crex":"crex-token","tons":"thisoption","pxc":"phoenixcoin","ddr":"digi-dinar","micro":"micromines","ami":"ammyi-coin","tking":"tiger-king","bboxer":"baby-boxer","daddydoge":"daddy-doge","hart":"hara-token","vdoge":"venus-doge","fundx":"funder-one","mommydoge":"mommy-doge","big":"thebigcoin","alm":"allium-finance","mao":"mao-zedong","csc":"casinocoin","hare":"hare-token","hash":"hash-token","shadow":"shadowswap","cicc":"caica-coin","abcd":"abcd-token","roul":"roul-token","carbon":"carbon-finance","pfzr":"pfzer-coin","roe":"rover-coin","gb":"good-bridging","icicb":"icicb-coin","nvx":"novax-coin","onemph":"stable-mph","dogs":"doggy-swap","autz":"autz-token","ypanda":"yieldpanda","aklima":"aklima","dmoon":"dragonmoon","minisoccer":"minisoccer","pist":"pist-trust","fscc":"fisco","kxc":"kingxchain","shi3ld":"polyshield","bole":"bole-token","ykz":"yakuza-dao","mzr":"maze-token","smile":"smile-token","give":"give-global","ogc":"onegetcoin","kfi":"klever-finance","brze":"breezecoin","pornrocket":"pornrocket","uze":"uze-token","co2":"collective","$g":"gooddollar","daa":"double-ace","good":"good-token","blox":"blox-token","nxl":"next-level","year":"lightyears","jt":"jubi-token","cdoge":"chubbydoge","txt":"taxa-token","drap":"doge-strap","shard":"shard","gpkr":"gold-poker","kelpie":"kelpie-inu","elt":"elite-swap","dfn":"difo-network","nezuko":"nezuko-inu","dregg":"dragon-egg","hod":"hodooi-com","nacho":"nacho-coin","jic":"joorschain","coic":"coic","joke":"jokes-meme","ueth":"unagii-eth","slab":"slink-labs","babykishu":"baby-kishu","dmch":"darma-cash","sovi":"sovi-token","puppy":"puppy-doge","ctcn":"contracoin","zabu":"zabu-token","krkn":"the-kraken","cron":"cryptocean","mac":"machinecoin","evny":"evny-token","ntb":"tokenasset","refraction":"refraction","xpn":"pantheon-x","matrix":"matrixswap","ebsp":"ebsp-token","fibo":"fibo-token","mverse":"maticverse","alloy":"hyperalloy","babycuban":"baby-cuban","ebird":"early-bird","xpnet":"xp-network","hrld":"haroldcoin","mmm7":"mmmluckup7","tth":"tetrahedra","dass":"dashsports","sing":"sing-token","tusk":"tusk-token","sabaka inu":"sabaka-inu","xbtc":"dforce-btc","xpc":"experience-chain","microshib":"microshiba","kongz20":"cyberkongz","clr":"color","prz":"prize-coin","solc":"solcubator","sayan":"saiyan-inu","yfi3":"yfi3-money","cp3r":"compounder","mongocm":"mongo-coin","jgn":"juggernaut","nva":"neeva-defi","catge":"catge-coin","qhc":"qchi-chain","eurx":"etoro-euro","ltfg":"lightforge","kishubaby":"kishu-baby","rogue":"rogue-west","dandy":"dandy","stfiro":"stakehound","cerberus":"gocerberus","levl":"levolution","vx":"vitex","bff":"bitcoffeen","zarh":"zarcash","clown":"clown-coin","p2e":"plant2earn","udai":"unagii-dai","piza":"halfpizza","basid":"basid-coin","sakura":"sakura-inu","mbc":"microbitcoin","hum":"humanscape","qac":"quasarcoin","tlx":"the-luxury","spacetoast":"spacetoast","lmbo":"when-lambo","tokc":"tokyo","doos":"doos-token","ybear":"yield-bear","stkr":"staker-dao","zaif":"zaif-token","bkk":"bkex-token","hptf":"heptafranc","wdt":"voda-token","yuang":"yuang-coin","yea":"yeafinance","xbrt":"bitrewards","she":"shinechain","n8v":"wearesatoshi","xeth":"dforce-eth","bill":"bill-token","ctc":"culture-ticket-chain","spacedoge":"space-doge","colx":"colossuscoinxt","ethsc":"ethereumsc","astrogold":"astro-gold","when":"when-token","bonuscake":"bonus-cake","speed":"speed-coin","os76":"osmiumcoin","jack":"jack-token","bsr":"binstarter","konj":"konjungate","plentycoin":"plentycoin","sv7":"7plus-coin","shark":"polyshark-finance","hcs":"help-coins","babymatic":"baby-matic","osc":"oasis-city","epik":"epik-prime","bmch":"bmeme-cash","vync":"vynk-chain","zlf":"zillionlife","sfex":"safelaunch","bloc":"bloc-money","shico":"shibacorgi","usdb":"usd-bancor","yoco":"yocoinyoco","gbpu":"upper-pound","game":"gamecredits","bpeng":"babypenguin","foreverfomo":"foreverfomo","crude":"crude-token","bgx":"bitcoingenx","axsushi":"aave-xsushi","pig":"pig-finance","mveda":"medicalveda","bnxx":"bitcoinnexx","xkr":"kryptokrona","gpyx":"pyrexcoin","wone":"wrapped-one","md+":"moon-day-plus","fed":"fedora-gold","hybn":"hey-bitcoin","pint":"pub-finance","idx":"index-chain","orc":"oracle-system","hland":"hland-token","wemix":"wemix-token","dt":"dcoin-token","todinu":"toddler-inu","bishoku":"bishoku-inu","fans":"unique-fans","tsc":"time-space-chain","crypl":"cryptolandy","bolo":"bollo-token","pola":"polaris-share","bvnd":"binance-vnd","cbucks":"cryptobucks","mti":"mti-finance","carom":"carillonium","fred":"fredenergy","shibmerican":"shibmerican","carb":"carbon-labs","yoo":"yoo-ecology","hyd":"hydra-token","fund":"unification","gldr":"golder-coin","nc":"nayuta-coin","aws":"aurus-silver","htdf":"orient-walt","dhx":"datahighway","mrx":"linda","ksr":"kickstarter","storm":"storm-token","drg":"dragon-coin","simba":"simba-token","chtr":"coinhunters","tbake":"bakerytools","sbgo":"bingo-share","env":"env-finance","f9":"falcon-nine","mkb":"maker-basic","jbp":"jb-protocol","rkt":"rocket-fund","arbys":"arbys","crg":"cryptogcoin","ot-ethusdc-29dec2022":"ot-eth-usdc","dgc":"digitalcoin","aidus":"aidus","hachiko":"hachiko-inu","daddyshark":"daddy-shark","aurora":"arctic-finance","trr":"terran-coin","hdn":"hidden-coin","baw":"wab-network","svr":"sovranocoin","shokk":"shikokuaido","dili":"d-community","starc":"star-crunch","blosm":"blossomcoin","raff":"rafflection","payn":"paynet-coin","collt":"collectible","gdefi":"global-defi","esz":"ethersportz","tcg2":"tcgcoin-2-0","yff":"yff-finance","fyy":"grandpa-fan","erk":"eureka-coin","ssn":"supersonic-finance","poodl":"poodle","hwi":"hawaii-coin","$sshiba":"super-shiba","f1c":"future1coin","cpx":"centerprime","$kei":"keisuke-inu","taboo":"taboo-token","brb":"rabbit-coin","planets":"planetwatch","dwr":"dogewarrior","gart":"griffin-art","mkoala":"koala-token","kenny":"kenny-token","casper":"casper-defi","xrpc":"xrp-classic","loud":"loud-market","dcy":"dinastycoin","kccm":"kcc-memepad","harold":"harold-coin","gl":"green-light","notsafemoon":"notsafemoon","ido":"idexo-token","wana":"wanaka-farm","energyx":"safe-energy","tsa":"teaswap-art","beast":"cryptobeast","flt":"fluttercoin","cheese":"cheese-swap","epay":"ethereumpay","trxc":"tronclassic","alc":"alrightcoin","gemg":"gemguardian","jackr":"jack-raffle","cdz":"cdzexchange","lbtc":"lightning-bitcoin","brick":"brick","relay":"relay-token","fgp":"fingerprint","yfarm":"yfarm-token","pox":"pollux-coin","auctionk":"oec-auction","bkt":"blocktanium","hbn":"hobonickels","dogdefi":"dogdeficoin","punk-attr-5":"punk-attr-5","punk-female":"punk-female","punk-attr-4":"punk-attr-4","mcn":"moneta-verde","tshare":"tomb-shares","solace":"solace-coin","mandi":"mandi-token","tomato":"tomatotoken","footie":"footie-plus","ghoul":"ghoul-token","ert":"eristica","c2o":"cryptowater","xqc":"quras-token","cmd":"comodo-coin","honor":"honor-token","mrty":"morty-token","nst":"newsolution","bsatoshi":"babysatoshi","treep":"treep-token","wokt":"wrapped-okt","shinu":"shinigami-inu","genes":"genes-chain","grind":"grind-token","uzumaki":"uzumaki-inu","but":"bitup-token","steak":"steaks-finance","heo":"helios-cash","gfnc":"grafenocoin-2","wswap":"wallet-swap","zeus":"zuescrowdfunding","mello":"mello-token","bdcc":"bitica-coin","drct":"ally-direct","babybitc":"babybitcoin","tsla":"tessla-coin","remit":"remita-coin","cca":"counos-coin","dxy":"dxy-finance","cousindoge":"cousin-doge","granx":"cranx-chain","ghd":"giftedhands","bks":"baby-kshark","burger":"burger-swap","sbrt":"savebritney","nyc":"newyorkcoin","zln":"zillioncoin","dhold":"diamondhold","srsb":"sirius-bond","xxp":"xx-platform","emax":"ethereummax","safebtc":"safebitcoin","marsm":"marsmission","hxn":"havens-nook","elnc":"eloniumcoin","actn":"action-coin","wleo":"wrapped-leo","bidcom":"bidcommerce","bridge":"multibridge","spkl":"spoklottery","zombie":"zombie-farm","ucr":"ultra-clear","orion":"orion-initiative","stark":"stark-chain","cakita":"chubbyakita","jshiba":"jomon-shiba","rugbust":"rug-busters","bnbd":"bnb-diamond","scoobi":"scoobi-doge","ald":"aludra-network","wsc":"wesing-coin","fstar":"future-star","isle":"island-coin","pyram":"pyram-token","party":"money-party","aqu":"aquarius-fi","ref":"ref-finance","cbp":"cashbackpro","rip":"fantom-doge","lnt":"lottonation","rpc":"ronpaulcoin","limon":"limon-group","wkcs":"wrapped-kcs","sprx":"sprint-coin","sss":"simple-software-solutions","cun":"currentcoin","supra":"supra-token","yfip":"yfi-paprika","algop":"algopainter","wbnb":"wbnb","dbund":"darkbundles","ikura":"ikura-token","dvd":"daoventures","tom":"tom-finance","porte":"porte-token","ebso":"eblockstock","medi":"mediconnect","sloki":"super-floki","codeo":"codeo-token","boot":"bootleg-nft","kip":"khipu-token","god":"bitcoin-god","kebab":"kebab-token","svc":"silvercashs","munch":"munch-token","mtcl":"maticlaunch","viking":"viking-legend","vida":"vidiachange","tkc":"turkeychain","papp":"papp-mobile","cadax":"canada-coin","chopper":"chopper-inu","l1t":"lucky1token","klb":"black-label","nfty":"nifty-token","goldyork":"golden-york","bnj":"binjit-coin","cbix7":"cbi-index-7","psychodoge":"psycho-doge","fbt":"fanbi-token","pbom":"pocket-bomb","ride":"ride-my-car","bccx":"bitconnectx-genesis","famous":"famous-coin","ctb":"cointribute","panther":"pantherswap","krz":"kranz-token","dlta":"delta-theta","btp":"bitcoin-pay","wncg":"wrapped-ncg","mc":"margin-call","kili":"kilimanjaro","sweet":"honey-token","dfe":"dfe-finance","golf":"golfrochain","cbank":"crypto-bank","memes":"memes-token","dragon":"dragon-finance","vollar":"vollar","kitsu":"kitsune-inu","fmk":"fawkes-mask","kp0r":"kp0rnetwork","dnd":"dungeonswap","minx":"innovaminex","wgp":"w-green-pay","grew":"green-world","xchf":"cryptofranc","lsv":"litecoin-sv","cf":"californium","fc":"futurescoin","btd":"bolt-true-dollar","vd":"vindax-coin","hip":"hippo-token","tasty":"tasty-token","fetish":"fetish-coin","tfg1":"energoncoin","hmc":"harmonycoin","day":"chronologic","death":"death-token","q8e20":"q8e20-token","cfxq":"cfx-quantum","plock":"pancakelock","arena":"arena-token","wfct":"wrapped-fct","send":"social-send","bih":"bithostcoin","lsilver":"lyfe-silver","bcoin":"bomber-coin","yo":"yobit-token","808ta":"808ta-token","leash":"leash","pekc":"peacockcoin-eth","brilx":"brilliancex","success":"success-inu","nutsg":"nuts-gaming","witch":"witch-token","rboys":"rocket-boys","dcnt":"decenturion","babyyooshi":"baby-yooshi","digs":"digies-coin","ytho":"ytho-online","iog":"playgroundz","genius":"genius-coin","btcmz":"bitcoinmono","rc":"russell-coin","ttm":"tothe-moon","pkp":"pikto-group","tlnt":"talent-coin","haven":"haven-token","vcash":"vcash-token","etnx":"electronero","gnto":"goldenugget","dfm":"defi-on-mcw","scoot":"scootercoin","dynamo":"dynamo-coin","life":"life-crypto","wnce":"wrapped-nce","navi":"natus-vincere-fan-token","zbk":"zbank-token","kimj":"kimjongmoon","shibarocket":"shibarocket","saitama":"saitama-inu","fshib":"floki-shiba","glxc":"galaxy-coin","ewit":"wrapped-wit","pal":"palestine-finance","shiko":"shikoku-inu","orbyt":"orbyt-token","travel":"travel-care","live":"tronbetlive","bbc":"bigbang-core","hiz":"hiz-finance","earth":"earth-token","balpac":"baby-alpaca","xpd":"petrodollar","hbd":"hive_dollar","saint":"saint-token","etf":"entherfound","thunder":"minithunder","gmyx":"gameologyv2","cbs3":"crypto-bits","hg":"hygenercoin","wolf":"moonwolf-io","nimbus":"shiba-cloud","emoji":"emojis-farm","armx":"armx-unidos","proud":"proud-money","per":"per-project","lecliente":"le-caliente","snb":"synchrobitcoin","shibaramen":"shiba-ramen","boomb":"boombaby-io","lift":"lift-kitchen","skill":"cryptoblades","ryip":"ryi-platinum","bbq":"barbecueswap","bulk":"bulk-network","cnz":"coinzo-token","bia":"bilaxy-token","gogo":"gogo-finance","kpc":"koloop-basic","finu":"football-inu","yg":"yearn-global","gcz":"globalchainz","rak":"rake-finance","nxct":"xchain-token","deuro":"digital-euro","xdef2":"xdef-finance","shibal":"shiba-launch","wavax":"wrapped-avax","kodx":"king-of-defi","sdm":"sky-dog-moon","ryoshi":"ryoshis-vision","viagra":"viagra-token","load":"load-network","wick":"wick-finance","bezoge":"bezoge-earth","chm":"cryptochrome","vena":"vena-network","1mil":"1million-nfts","lqdr":"liquiddriver","hate":"heavens-gate","doge2":"dogecoin-2","yfed":"yfedfinance","wiken":"project-with","btct":"bitcoin-trc20","svt":"spacevikings","safehamsters":"safehamsters","dff":"defi-firefly","ymen":"ymen-finance","usdu":"upper-dollar","grap":"grap-finance","modx":"model-x-coin","metauniverse":"metauniverse","mvt":"the-movement","fridge":"fridge-token","tndr":"thunder-swap","wcc":"wincash-coin","cnrg":"cryptoenergy","avngrs":"babyavengers","balo":"balloon-coin","auntie":"auntie-whale","lpc":"lightpaycoin","trt":"taurus-chain","cbix-p":"cubiex-power","dota":"dota-finance","aurum":"alchemist-defi-aurum","isikc":"isiklar-coin","ak":"astrokitty","siam":"siamese-neko","bnbx":"bnbx-finance","shiberus":"shiberus-inu","ethbnt":"ethbnt","tx":"transfercoin","pow":"eos-pow-coin","tcx":"tron-connect","bbtc":"binance-wrapped-btc","carrot":"carrot-token","o1t":"only-1-token","yfix":"yfix-finance","nkclc":"nkcl-classic","epg":"encocoinplus","flokipup":"flokipup-inu","empire":"empire-token","wizard":"wizard-vault-nftx","cann":"cannabiscoin","vkt":"vankia-chain","vnxlu":"vnx-exchange","hepa":"hepa-finance","neww":"newv-finance","rckt":"rocket-launchpad","grandpadoge":"grandpa-doge","solape":"solape-token","drm":"dodreamchain","sim":"simba-empire","bored":"bored-museum","ubx":"ubix-network","xt":"xtcom-token","skb":"sakura-bloom","vers":"versess-coin","wbind":"wrapped-bind","lnx":"linix","mmm":"multimillion","moo":"moola-market","soga":"soga-project","ww":"wayawolfcoin","lsc":"live-swap-coin","vics":"robofi-token","fcn":"feichang-niu","cudl":"cudl-finance","biswap":"biswap-token","dcw":"decentralway","sats":"baby-satoshi","sphynx":"sphynx-token","nsdx":"nasdex-token","fds":"fds","bpcake":"baby-pancake","azt":"az-fundchain","diah":"diarrheacoin","mach":"mach","wec":"whole-earth-coin","able":"able-finance","affinity":"safeaffinity","etna":"etna-network","qtech":"quattro-tech","btchg":"bitcoinhedge","ivc":"invoice-coin","bic":"bitcrex-coin","biot":"biopassport","povo":"povo-finance","ncr":"neos-credits","vent":"vent-finance","fshn":"fashion-coin","dgstb":"dogestribute","one1inch":"stable-1inch","bsfm":"babysafemoon","safemoona":"safemoonavax","icnq":"iconiq-lab-token","fidenz":"fidenza-527","lyptus":"lyptus-token","cord":"cord-finance","sona":"sona-network","mada":"mini-cardano","zttl":"zettelkasten","kada":"king-cardano","dragn":"astro-dragon","kaiju":"kaiju-worlds","spmk":"space-monkey","earn$":"earn-network","zep":"zeppelin-dao","mcan":"medican-coin","btap":"bta-protocol","zuz":"zuz-protocol","wxdai":"wrapped-xdai","cart":"cryptoart-ai","noel":"noel-capital","qb":"quick-bounty","babysaitama":"baby-saitama","form":"formation-fi","fcx":"fission-cash","gpool":"genesis-pool","cold":"cold-finance","etet":"etet-finance","coop":"coop-network","vcg":"vipcoin-gold","cet":"coinex-token","stonks":"stonks-token","ahouse":"animal-house","vlad":"vlad-finance","rainbowtoken":"rainbowtoken","tyt":"tianya-token","shibco":"shiba-cosmos","lumi":"lumi-credits","back":"back-finance","wcelo":"wrapped-celo","sbank":"safebank-eth","kper":"kper-network","cla":"candela-coin","blade":"blade","loa":"loa-protocol","kafe":"kukafe-finance","dixt":"dixt-finance","fnb":"finexbox-token","sgo":"sportemon-go","mu":"mu-continent","kft":"knit-finance","waka":"waka-finance","balls":"balls-health","phl":"placeh","sid":"shield-token","silver":"silver-token","jackpot":"jackpot-army","bcm":"bitcoinmoney","ats":"attlas-token","ftmo":"fantom-oasis","sora":"sorachancoin","dp":"digitalprice","bwc":"bongweedcoin","incake":"infinitycake","duel":"duel-network","wxbtc":"wrapped-xbtc","catnip":"catnip-money","kbtc":"klondike-btc","fewgo":"fewmans-gold","btllr":"betller-coin","pkmon":"polkamonster","bgb":"bitget-token","hokk":"hokkaido-inu-bsc","xotl":"xolotl-token","vlty":"vaulty-token","fiwa":"defi-warrior","wlt":"wealth-locks","shiba":"shiba-fantom","lory":"yield-parrot","puffs":"crypto-puffs","bbdoge":"babybackdoge","unii":"unii-finance","xgc":"xiglute-coin","wxtc":"wechain-coin","phoon":"typhoon-cash","loon":"loon-network","btca":"bitcoin-anonymous","btcu":"bitcoin-ultra","zeon":"zeon","wdefi":"woonkly-defi","yamp":"yamp-finance","saft":"safe-finance","kseed":"kush-finance","supd":"support-doge","htn":"heartnumber","trdc":"traders-coin","mtr":"meter-stable","grpl":"grpl-finance-2","tst":"touch-social","green":"greeneum-network","uc":"youlive-coin","tym":"timelockcoin","zild":"zild-finance","kokomo":"kokomo-token","yt":"cherry-token","crcl":"crowdclassic","aleth":"alchemix-eth","pacific":"pacific-defi","acr":"acreage-coin","thg":"thetan-arena","babypoo":"baby-poocoin","mich":"charity-alfa","neko":"neko-network","goma":"goma-finance","fbtc":"fire-bitcoin","emrx":"emirex-token","wnear":"wrapped-near","quam":"quam-network","yfib":"yfibalancer-finance","buff":"buffalo-swap","dzar":"digital-rand","pngn":"spacepenguin","esrc":"echosoracoin","mishka":"mishka-token","avg":"avengers-bsc","jus":"just-network","kshib":"kaiken-shiba","tama":"tama-finance","aammdai":"aave-amm-dai","qm":"quick-mining","helth":"health-token","yfos":"yfos-finance","xcon":"connect-coin","lmao":"lmao-finance","exe":"8x8-protocol","elyx":"elynet-token","bcf":"bitcoin-fast","kawa":"kawakami-inu","prqboost":"parsiq-boost","minifootball":"minifootball","airt":"airnft-token","bimp":"bimp-finance","dio":"deimos-token","alkom":"alpha-kombat","epro":"ethereum-pro","bdc":"babydogecake","yuno":"yuno-finance","atmc":"atomic-token","hogl":"hogl-finance","ttx":"talent-token","t2l":"ticket2lambo","hyper":"hyperchain-x-old","charix":"charix-token","sd":"smart-dollar","haze":"haze-finance","tundra":"tundra-token","pube":"pube-finance","allbi":"all-best-ico","brp":"bor-protocol","hymeteor":"hyper-meteor","orao":"orao-network","sprk":"sparkle-coin","mbgl":"mobit-global","sephi":"sephirothinu","bbgc":"bigbang-game","ror":"ror-universe","toad":"toad-network","xtt-b20":"xtblock-token","mwar":"moon-warriors","nbs":"new-bitshares","umg":"underminegold","emont":"etheremontoken","arbis":"arbis-finance","rbunny":"rewards-bunny","bct":"bitcoin-trust","gvc":"gemvault-coin","end":"endgame-token","ovl":"overload-game","neuro":"neuro-charity","linkk":"oec-chainlink","ibfr":"ibuffer-token","brn":"brainaut-defi","rockstar":"rockstar-doge","dx":"dxchain","robodoge":"robodoge-coin","hmdx":"poly-peg-mdex","src":"simracer-coin","olympus":"olympus-token","well":"wellness-token-economy","pfi":"protocol-finance","aammweth":"aave-amm-weth","dhs":"dirham-crypto","bdog":"bulldog-token","adf":"ad-flex-token","codex":"codex-finance","cisla":"crypto-island","mnme":"masternodesme","molk":"mobilink-coin","asec":"asec-frontier","qnx":"queendex-coin","obsr":"observer-coin","awt":"airdrop-world","luc":"play2live","rbh":"robinhoodswap","myl":"my-lotto-coin","ordr":"the-red-order","scha":"schain-wallet","xao":"alloy-project","wpc":"wave-pay-coin","hx":"hyperexchange","btbs":"bitbase-token","hyfi":"hyper-finance","lyd":"lydia-finance","squeeze":"squeeze-token","evrt":"everest-token","pyx":"pyxis-network","halo":"halo-platform","gts":"gt-star-token","btf":"btf","hcut":"healthchainus","dnf":"dnft-protocol","yyfi":"yyfi-protocol","wtp":"web-token-pay","kids":"save-the-kids","tiox":"trade-token","xfc":"football-coin","bmt":"bmining-token","btcf":"bitcoin-final","plt":"plutus-defi","drs":"dragon-slayer","creed":"creed-finance","slme":"slime-finance","bundb":"unidexbot-bsc","neal":"neal","spacexdoge":"doge-universe","pixiu":"pixiu-finance","cgd":"coin-guardian","ksf":"kesef-finance","ecgod":"eloncryptogod","reloaded":"doge-reloaded","dhands":"diamond-hands","wmatic":"wmatic","cora":"corra-finance","dbubble":"double-bubble","yffii":"yffii-finance","btad":"bitcoin-adult","zcon":"zcon-protocol","ibgbp":"iron-bank-gbp","kphi":"kephi-gallery","tuda":"tutors-diary","gpc":"greenpay-coin","umc":"umbrellacoin","momat":"moma-protocol","hdfl":"hyper-deflate","ufc":"union-fair-coin","payou":"payou-finance","ext":"exchain","cth":"crypto-hounds","btcx":"bitcoinx-2","anty":"animalitycoin","$babydogeinu":"baby-doge-inu","msd":"moneydefiswap","scale":"scale-finance","dogpro":"dogstonks-pro","baby everdoge":"baby-everdoge","diamond":"diamond-token","o-ocean-mar22":"o-ocean-mar22","hams":"space-hamster","rkg":"rap-keo-group","entrp":"hut34-entropy","alita":"alita-network","joos":"joos-protocol","elite":"ethereum-lite","l2p":"lung-protocol","zefi":"zcore-finance","hcc":"health-care-coin","dddd":"peoples-punk","ibjpy":"iron-bank-jpy","nbot":"naka-bodhi-token","elcash":"electric-cash","tfc":"treasure-financial-coin","qcore":"qcore-finance","evault":"ethereumvault","aft":"ape-fun-token","pebble":"etherrock-72","peech":"peach-finance","phifiv2":"phifi-finance","aammusdt":"aave-amm-usdt","chadlink":"chad-link-set","polly":"polly","rhea":"rheaprotocol","torocus":"torocus-token","dogen":"dogen-finance","bpc":"backpacker-coin","vdg":"veridocglobal","flrs":"flourish-coin","jewel":"defi-kingdoms","xag":"xrpalike-gene","swusd":"swusd","xczm":"xavander-coin","qwla":"qawalla-token","est":"ester-finance","krn":"kryza-network","glo":"glosfer-token","wzec":"wrapped-zcash","stbb":"stabilize-bsc","wpx":"wallet-plus-x","peppa":"peppa-network","wnl":"winstars","xcf":"cenfura-token","ltcb":"litecoin-bep2","swass":"swass-finance","ltrbt":"little-rabbit","soldier":"space-soldier","pmc":"paymastercoin","dse":"dolphin-token-2","prd":"predator-coin","minidogepro":"mini-doge-pro","invox":"invox-finance","oxs":"oxbull-solana","egr":"egoras","aammwbtc":"aave-amm-wbtc","ytsla":"ytsla-finance","wae":"wave-platform","wshift":"wrapped-shift","vega":"vega-protocol","sfms":"safemoon-swap","aplp":"apple-finance","oac":"one-army-coin","eapex":"ethereum-apex","bhig":"buckhath-coin","duet":"duet-protocol","lem":"lemur-finance","acpt":"crypto-accept","jeff":"jeff-in-space","unis":"universe-coin","aura":"aura-protocol","yrise":"yrise-finance","shbl":"shoebill-coin","aammusdc":"aave-amm-usdc","exnx":"exenox-mobile","blzn":"blaze-network","mtdr":"matador-token","tai":"tai","froge":"froge-finance","breast":"safebreastinu","dogex":"dogehouse-capital","etos":"eternal-oasis","nash":"neoworld-cash","mons":"monsters-clan","agri":"agrinovuscoin","oltc":"boringdao-ltc","hosp":"hospital-coin","diamonds":"black-diamond","pfb":"penny-for-bit","geth":"guarded-ether","iflt":"inflationcoin","wxtz":"wrapped-tezos","yfive":"yfive-finance","smon":"starmon-token","bsh":"bitcoin-stash","dexi":"dexioprotocol","b1p":"b-one-payment","bgame":"binamars-game","totem":"totem-finance","sfc":"safecap-token","idt":"investdigital","wtk":"wadzpay-token","brg":"bridge-oracle","onlexpa":"onlexpa-token","ot-pe-29dec2022":"ot-pendle-eth","xsm":"spectrum-cash","whole":"whitehole-bsc","vinx":"vinx-coin-sto","rewards":"rewards-token","ebs":"ebisu-network","wiotx":"wrapped-iotex","xns":"xeonbit-token","ibchf":"iron-bank-chf","promise":"promise-token","sbnk":"solbank-token","8ball":"8ball-finance","gcbn":"gas-cash-back","rasta":"rasta-finance","ztnz":"ztranzit-coin","ctro":"criptoro-coin","lfg":"low-float-gem","bday":"birthday-cake","fsh":"fusion-heroes","rbtc":"rootstock","gent":"genesis-token","xwg":"x-world-games","brng":"bring-finance","bho":"bholdus-token","dmtc":"dmtc-token","dscvr":"dscvr-finance","gshiba":"gambler-shiba","btnyx":"bitonyx-token","nmn":"99masternodes","xrm":"refine-medium","excl":"exclusivecoin","gmng":"global-gaming","cflo":"chain-flowers","pand":"panda-finance","ibaud":"ibaud","eyes":"eyes-protocol","scat":"sad-cat-token","knight":"forest-knight","69c":"6ix9ine-chain","yfpro":"yfpro-finance","brap":"brapper-token","ibkrw":"ibkrw","volts":"volts-finance","gain":"gain-protocol","nfi":"norse-finance","fetch":"moonretriever","pipi":"pippi-finance","smbswap":"simbcoin-swap","vancii":"vanci-finance","sbdo":"bdollar-share","ari":"arise-finance","swipe":"swipe-network","womi":"wrapped-ecomi","mxf":"mixty-finance","rpg":"revolve-games","date":"soldate-token","lnk":"link-platform","vcoin":"tronvegascoin","vgd":"vangold-token","rebd":"reborn-dollar","fifty":"fiftyonefifty","$sol":"helios-charts","krypto":"kryptobellion","indc":"nano-dogecoin","gangstadoge":"gangster-doge","xnft":"xnft","hp":"heartbout-pay","gnsh":"ganesha-token","sps":"splinterlands","dxt":"dexit-finance","most":"most-protocol","foy":"fund-of-yours","h2o":"ifoswap-token","cyn":"cycan-network","feast":"feast-finance","cust":"custody-token","klear":"klear-finance","ugt":"unreal-finance","umbr":"umbra-network","guard":"guardian-token","prtn":"proton-project","ccake":"cheesecakeswap","wanatha":"wrapped-anatha","new":"newton-project","dance":"dancing-banana","foc":"theforce-trade","polven":"polka-ventures","helios":"mission-helios","omen":"augury-finance","mto":"merchant-token","wilc":"wrapped-ilcoin","lyn":"lynchpin_token","eth2socks":"etherean-socks","hnb":"hashnet-biteco","cbtc":"classicbitcoin","upxau":"universal-gold","babyflokipup":"baby-floki-pup","gjco":"giletjaunecoin","xfr":"the-fire-token","dynmt":"dynamite-token","gon":"dragon-warrior","sedo":"sedo-pow-token","cfl365":"cfl365-finance","liquid":"netkoin-liquid","poc":"pangea-cleanup-coin","rok":"ragnarok-token","chord":"chord-protocol","recap":"review-capital","wtf":"walnut-finance","pinks":"pinkswap-token","fex":"fidex-exchange","gnc":"galaxy-network","oak":"octree-finance","ccy":"cryptocurrency","solpad":"solpad-finance","rsct":"risecointoken","deve":"divert-finance","burns":"mr-burns-token","cpte":"crypto-puzzles","ecoreal":"ecoreal-estate","scorp":"scorpion-token","grape":"grape-2","wscrt":"secret-erc20","xmc":"monero-classic-xmc","fsc":"five-star-coin","rvst":"revest-finance","gs":"genesis-shards","mgg":"mud-guild-game","sunglassesdoge":"sunglassesdoge","swapp":"swapp","zseed":"sowing-network","aglyph":"autoglyph-271","thunderada":"thunderada-app","spo":"spores-network","monster":"monster-valley","css":"coinswap-space","tcnx":"tercet-network","prdx":"predix-network","aph":"apholding-coin","gnbt":"genebank-token","onez":"the-nifty-onez","babywolf":"baby-moon-wolf","bsk":"bitcoinstaking","crystl":"crystl-finance","bf":"bitforex","babyshibainu":"baby-shiba-inu","cdl":"coindeal-token","ushiba":"american-shiba","hibiki":"hibiki-finance","espi":"spider-ecology","babypig":"baby-pig-token","toll":"toll-free-swap","shieldnet":"shield-network","inflex":"inflex-finance","metp":"metaprediction","ctg":"cryptorg-token","ect":"ethereum-chain-token","vsn":"vision-network","mtns":"omotenashicoin","presidentdoge":"president-doge","minibabydoge":"mini-baby-doge","nr1":"number-1-token","bbl":"bubble-network","louvre":"louvre-finance","nbm":"nftblackmarket","swfi":"swirge-finance","strp":"strips-finance","buc":"buyucoin-token","ltcu":"litecoin-ultra","gods":"gods-unchained","rickmorty":"rick-and-morty","efft":"effort-economy","mrcr":"mercor-finance","$kirbyreloaded":"kirby-reloaded","npw":"new-power-coin","ubtc":"united-bitcoin","bfr":"bridge-finance","neon":"neonic-finance","yf4":"yearn4-finance","cvt":"civitas-protocol","cfo":"cforforum-token","raptr":"raptor-finance","sk":"sidekick-token","shusky":"siberian-husky","kmw":"kepler-network","wftm":"wrapped-fantom","cad":"candy-protocol","elephant":"elephant-money","rktv":"rocket-venture","dquick":"dragons-quick","activ":"activeightcoin","dogecoin":"buff-doge-coin","bsts":"magic-beasties","snowball":"snowballtoken","roy":"royal-protocol","odoge":"boringdao-doge","spex":"sproutsextreme","impulse":"impulse-by-fdr","hppot":"healing-potion","cavo":"excavo-finance","vcco":"vera-cruz-coin","mov":"motiv-protocol","byn":"beyond-finance","jsb":"jsb-foundation","owo":"one-world-coin","babydogo":"baby-dogo-coin","wac":"warranty-chain","mnstrs":"block-monsters","ron":"rise-of-nebula","mayp":"maya-preferred-223","shrimp":"shrimp-finance","mtm":"momentum-token","eveo":"every-original","upeur":"universal-euro","elena":"elena-protocol","kbd":"king-baby-doge","bcash":"bankcoincash","uskita":"american-akita","btrl":"bitcoinregular","it":"infinity","chad":"the-chad-token","sho":"showcase-token","$rvlvr":"revolver-token","pjm":"pajama-finance","ucoin":"universal-coin","gwc":"genwealth-coin","mmt":"moments","perx":"peerex-network","2based":"2based-finance","hmt":"human-protocol","rio":"realio-network","hdw":"hardware-chain","katana":"katana-finance","atis":"atlantis-token","rho":"rhinos-finance","3crv":"lp-3pool-curve","hzd":"horizondollar","xlab":"xceltoken-plus","rick":"infinite-ricks","cxc":"capital-x-cell","babyshib":"babyshibby-inu","smnr":"cryptosummoner","dart":"dart-insurance","gvy":"groovy-finance","bingus":"bingus-network","dem":"deutsche-emark","addict":"addict-finance","mzk":"muzika-network","ucap":"unicap-finance","tdw":"the-doge-world","pareto":"pareto-network","kimchi":"kimchi-finance","richdoge \ud83d\udcb2":"rich-doge-coin","mensa":"mensa-protocol","ethmny":"ethereum-money","sofi":"social-finance","bribe":"bribe-token","slash":"slash-protocol","daisy":"daisy","mot":"mobius-finance","babydogecash":"baby-doge-cash","dpr":"deeper-network","sahu":"sakhalin-husky","pepr":"pepper-finance","raider":"crypto-raiders","bfloki":"baby-floki-inu","thor":"asgard-finance","sifi":"simian-finance","etr":"electric-token","mlk":"milk-alliance","unc":"unicrypt","cmc":"community-coin-token","qa":"quantum-assets","mbull":"mad-bull-token","xuc":"exchange-union","cnp":"cryptonia-poker","qusd":"qusd-stablecoin","pwrd":"pwrd-stablecoin","smpl":"smpl-foundation","hoodrat":"hoodrat-finance","pchs":"peaches-finance","print":"printer-finance","dimi":"diminutive-coin","pxl":"piction-network","ddrt":"digidinar-token","yfild":"yfilend-finance","yfarmer":"yfarmland-token","emb":"overline-emblem","sca":"scaleswap-token","krg":"karaganda-token","fusion":"fusion-energy-x","bti":"bitcoin-instant","sent":"sentiment-token","bips":"moneybrain-bips","gdt":"globe-derivative-exchange","fol":"folder-protocol","ans":"ans-crypto-coin","fico":"french-ico-coin","uusdc":"unagii-usd-coin","copycat":"copycat-finance","npi":"ninja-panda-inu","bpakc":"bitpakcointoken","elongd":"elongate-duluxe","diamnd":"projekt-diamond","axa":"alldex-alliance","fish":"penguin-party-fish","vct":"valuecybertoken","mus":"mus","renbtccurve":"lp-renbtc-curve","ltd":"livetrade-token","sprkl":"sparkle","bop":"boring-protocol","kurai":"kurai-metaverse","nanodoge":"nano-doge","shuf":"shuffle-monster","bttr":"bittracksystems","ldn":"ludena-protocol","qbit":"project-quantum","nora":"snowcrash-token","m3c":"make-more-money","malt":"malt-stablecoin","ringx":"ring-x-platform","nftpunk":"nftpunk-finance","ginux":"green-shiba-inu","tcl":"techshare-token","chum":"chumhum-finance","ketchup":"ketchup-finance","spe":"saveplanetearth","ssg":"sea-swap-global","bst1":"blueshare-token","dball":"drakeball-token","usdo":"usd-open-dollar","evt":"elevation-token","chal":"chalice-finance","sgt":"snglsdao-governance-token","sbsh":"safe-baby-shiba","libref":"librefreelencer","ssj":"super-saiya-jin","wsta":"wrapped-statera","cwv":"cryptoworld-vip","mg":"minergate-token","infi":"insured-finance","moni":"monsta-infinite","snbl":"safenebula","moonday":"moonday-finance","bchip":"bluechips-token","bishu":"black-kishu-inu","wsienna":"sienna-erc20","grpft":"grapefruit-coin","lec":"love-earth-coin","xld":"stellar-diamond","blink":"blockmason-link","afib":"aries-financial-token","skyward":"skyward-finance","crypt":"the-crypt-space","wmpro":"wm-professional","weather":"weather-finance","wccx":"wrapped-conceal","spl":"simplicity-coin","nos":"nitrous-finance","grand":"the-grand-banks","ndefi":"polly-defi-nest","aens":"aen-smart-token","eoc":"everyonescrypto","gdl":"gondola-finance","tnet":"title-network","kimochi":"kimochi-finance","shoco":"shiba-chocolate","qcx":"quickx-protocol","ppn":"puppies-network","bashtank":"baby-shark-tank","prp":"pharma-pay-coin","bakt":"backed-protocol","udt":"unlock-protocol","hmochi":"mochiswap-token","aoe":"apes-of-empires","bpul":"betapulsartoken","wag8":"wrapped-atromg8","dlegends":"my-defi-legends","usdj":"just-stablecoin","bde":"big-defi-energy","lic":"lightening-cash","mpwr":"empower-network","bcc":"basis-coin-cash","nmp":"neuromorphic-io","idoge":"influencer-doge","infs":"infinity-esaham","stimmy":"stimmy-protocol","prints":"fingerprints","yard":"solyard-finance","ot-cdai-29dec2022":"ot-compound-dai","trips":"trips-community","moonlight":"moonlight-token","petn":"pylon-eco-token","pablo":"the-pablo-token","comc":"community-chain","kana":"kanaloa-network","tni":"tunnel-protocol","hps":"happiness-token","altm":"altmarkets-coin","esn":"escudonavacense","moolah":"block-creatures","flokishib":"floki-shiba-inu","ccf":"cerberus","mkat":"moonkat-finance","skt":"sukhavati-network","trdl":"strudel-finance","yfiking":"yfiking-finance","ciotx":"crosschain-iotx","unicrap":"unicrap","lfeth":"lift-kitchen-eth","hoodie":"cryptopunk-7171-hoodie","kcal":"phantasma-energy","syfl":"yflink-synthetic","gpo":"galaxy-pool-coin","cnet":"currency-network","fb":"fenerbahce-token","mwc":"mimblewimblecoin","pyd":"polyquity-dollar","mtnt":"mytracknet-token","sensi":"sensible-finance","biut":"bit-trust-system","goi":"goforit","tori":"storichain-token","spot":"cryptospot-token","mfloki":"mini-floki-shiba","shx":"stronghold-token","ssl":"sergey-save-link","minisports":"minisports-token","ibtc":"improved-bitcoin","phm":"phantom-protocol","bxk":"bitbook-gambling","supt":"super-trip-chain","pcake":"polycake-finance","tomoe":"tomoe","hds":"hotdollars-token","zkp":"panther","toncoin":"the-open-network","wbb":"wild-beast-block","rod":"republic-of-dogs","bdigg":"badger-sett-digg","u8d":"universal-dollar","myid":"my-identity-coin","gpunks":"grumpydoge-punks","wducx":"wrapped-ducatusx","mnop":"memenopoly-money","bb":"blackberry-token","uhp":"ulgen-hash-power","plx":"octaplex-network","qqq":"qqq-token","rnrc":"rock-n-rain-coin","cbu":"banque-universal","xlpg":"stellarpayglobal","hole":"super-black-hole","magi":"magikarp-finance","blizz":"blizzard-network","flm":"flamingo-finance","hcore":"hardcore-finance","rtf":"regiment-finance","whxc":"whitex-community","btrs":"bitball-treasure","tschybrid":"tronsecurehybrid","para":"paralink-network","cgc":"cash-global-coin","afc":"arsenal-fan-token","west":"waves-enterprise","foxy":"foxy-equilibrium","tryon":"stellar-invictus","alte":"altered-protocol","gummy":"gummy-bull-token","atfi":"atlantic-finance","vsd":"value-set-dollar","jfi":"jackpool-finance","bmj":"bmj-master-nodes","uwu":"uwu-vault-nftx","pmf":"polymath-finance","flat":"flat-earth-token","cytr":"cyclops-treasure","polybabydoge":"polygon-babydoge","cyc":"cyclone-protocol","bcr":"bankcoin-reserve","ggc":"gg-coin","ipx":"ipx-token","degenr":"degenerate-money","wsb":"wall-street-bets-dapp","usdap":"bondappetite-usd","mil":"military-finance","plum":"plumcake-finance","sya":"save-your-assets","safedog":"safedog-protocol","chips":"chipshop-finance","ltfn":"litecoin-finance","bplc":"blackpearl-chain","nye":"newyork-exchange","tkx":"tokenize-xchange","esupreme":"ethereum-supreme","roger":"theholyrogercoin","btcn":"bitcoin-networks","xcomb":"xdai-native-comb","piggy":"piggy-bank-token","pld":"pureland-project","hodo":"holographic-doge","idlesusdyield":"idle-susd-yield","fbn":"five-balance","lfbtc":"lift-kitchen-lfbtc","idleusdtyield":"idle-usdt-yield","idleusdcyield":"idle-usdc-yield","vamp":"vampire-protocol","$time":"madagascar-token","bcs":"business-credit-substitute","gnlr":"gods-and-legends","ctr":"creator-platform","clo":"callisto","amdai":"aave-polygon-dai","shibaken":"shibaken-finance","mtlmc3":"metal-music-coin","usx":"token-dforce-usd","nnn":"novem-gold-token","ycorn":"polycorn-finance","artg":"goya-giant-token","kotdoge":"king-of-the-doge","des":"despace-protocol","mbf":"moonbear-finance","bfdoge":"baby-falcon-doge","pndr":"pandora-protocol","bci":"bitcoin-interest","gme":"gamestop-finance","wwcn":"wrapped-widecoin","mof":"molecular-future","swl":"swiftlance-token","gla":"galaxy-adventure","usdfl":"usdfreeliquidity","fxtc":"fixed-trade-coin","hpt":"huobi-pool-token","br":"bull-run-token","bhc":"billionhappiness","rft":"rangers-fan-token","sds":"safedollar-shares","etnxp":"electronero-pulse","peeps":"the-people-coin","mps":"mt-pelerin-shares","bshibr":"baby-shiba-rocket","sqgl":"sqgl-vault-nftx","tpc":"trading-pool-coin","gkcake":"golden-kitty-cake","transparent":"transparent-token","bgan":"bgan-vault-nftx","bakc":"bakc-vault-nftx","uusdt":"unagii-tether-usd","ghp":"global-hash-power","asm":"assemble-protocol","mkt":"monkey-king-token","vbzrx":"vbzrx","twj":"tronweeklyjournal","eosbull":"3x-long-eos-token","mcat20":"wrapped-moon-cats","yficg":"yfi-credits-group","ksp":"klayswap-protocol","gmc":"gokumarket-credit","bayc":"bayc-vault-nftx","stgz":"stargaze-protocol","foxt":"fox-trading-token","amwbtc":"aave-polygon-wbtc","ciphc":"cipher-core-token","amusdt":"aave-polygon-usdt","agac":"aga-carbon-credit","meteor":"meteorite-network","amweth":"aave-polygon-weth","smars":"safemars-protocol","knockers":"australian-kelpie","amaave":"aave-polygon-aave","eplat":"ethereum-platinum","bvl":"bullswap-protocol","sxcc":"southxchange-coin","gec":"green-energy-coin","pups":"pups-vault-nftx","hogt":"heco-origin-token","ssf":"safe-seafood-coin","dcl":"delphi-chain-link","cbsn":"blockswap-network","mdza":"medooza-ecosystem","xbtx":"bitcoin-subsidium","ctf":"cybertime-finance","dbz":"diamond-boyz-coin","cool":"cool-vault-nftx","csto":"capitalsharetoken","ethusdadl4":"ethusd-adl-4h-set","brt":"base-reward-token","rvc":"ravencoin-classic","ce":"crypto-excellence","limex":"limestone-network","humanity":"complete-humanity","rena":"rena-finance","nhc":"neo-holistic-coin","bctr":"bitcratic-revenue","tmcn":"timecoin-protocol","mrf":"moonradar-finance","cnc":"global-china-cash","encx":"enceladus-network","tetu":"tetu","aac":"acute-angle-cloud","mcelo":"moola-celo-atoken","wpe":"opes-wrapped-pe","yusdc":"yusdc-busd-pool","bbkfi":"bitblocks-finance","reau":"vira-lata-finance","mee":"mercurity-finance","mcaps":"mango-market-caps","stor":"self-storage-coin","slvn":"salvation-finance","sicc":"swisscoin-classic","3cs":"cryptocricketclub","goldr":"golden-ratio-coin","okbbull":"3x-long-okb-token","xrpbull":"3x-long-xrp-token","leobull":"3x-long-leo-token","pope":"crypto-pote-token","bnbbull":"3x-long-bnb-token","trxbull":"3x-long-trx-token","purr":"purr-vault-nftx","spr":"polyvolve-finance","amusdc":"aave-polygon-usdc","agov":"answer-governance","abp":"arc-block-protocol","bnbhedge":"1x-short-bnb-token","eoshedge":"1x-short-eos-token","yfb2":"yearn-finance-bit2","hbo":"hash-bridge-oracle","bbadger":"badger-sett-badger","pmt":"playmarket","clock":"clock-vault-nftx","puml":"puml-better-health","hkun":"hakunamatata-new","spunk":"spunk-vault-nftx","dfly":"dragonfly-protocol","xuni":"ultranote-infinity","liqlo":"liquid-lottery-rtc","tan":"taklimakan-network","safuyield":"safuyield-protocol","sauna":"saunafinance-token","yhfi":"yearn-hold-finance","afdlt":"afrodex-labs-token","pol":"polars-governance-token","trxbear":"3x-short-trx-token","gsa":"global-smart-asset","acar":"aga-carbon-rewards","cpi":"crypto-price-index","pvp":"playervsplayercoin","pudgy":"pudgy-vault-nftx","awc":"atomic-wallet-coin","bafi":"bafi-finance-token","tln":"trustline-network","tfbx":"truefeedbackchain","kws":"knight-war-spirits","mco2":"moss-carbon-credit","smc":"smart-medical-coin","stardust":"stargazer-protocol","im":"intelligent-mining","kongz":"kongz-vault-nftx","ght":"global-human-trust","glyph":"glyph-vault-nftx","okbbear":"3x-short-okb-token","kch":"keep-calm","kp3rb":"keep3r-bsc-network","ang":"aureus-nummus-gold","aggt":"aggregator-network","pixls":"pixls-vault-nftx","rdpx":"dopex-rebate-token","papr":"paprprintr-finance","cry":"cryptosphere-token","kamax":"kamax-vault-nftx","delta rlp":"rebasing-liquidity","axt":"alliance-x-trading","cgb":"crypto-global-bank","mhsp":"melonheadsprotocol","supern":"supernova-protocol","waifu":"waifu-vault-nftx","quokk":"polyquokka-finance","nbtc":"nano-bitcoin-token","vrt":"venus-reward-token","copter":"helicopter-finance","rtc":"read-this-contract","soccer":"bakery-soccer-ball","eqmt":"equus-mining-token","anime":"anime-vault-nftx","trxhedge":"1x-short-trx-token","leobear":"3x-short-leo-token","xrpbear":"3x-short-xrp-token","dzi":"definition-network","starlinkdoge":"baby-starlink-doge","deft":"defi-factory-token","satx":"satoexchange-token","cric":"cricket-foundation","okbhedge":"1x-short-okb-token","eosbear":"3x-short-eos-token","bnbbear":"3x-short-bnb-token","iop":"internet-of-people","ascend":"ascension-protocol","xrphedge":"1x-short-xrp-token","loom":"loom-network-new","edh":"elon-diamond-hands","phunk":"phunk-vault-nftx","legion":"legion-for-justice","catx":"cat-trade-protocol","kitty":"kitty-vault-nftx","egl":"ethereum-eagle-project","unit":"universal-currency","xusd":"xdollar-stablecoin","sodium":"sodium-vault-nftx","london":"london-vault-nftx","tmh":"trustmarkethub-token","thb":"bkex-taihe-stable-b","tha":"bkex-taihe-stable-a","androttweiler":"androttweiler-token","wnyc":"wrapped-newyorkcoin","ccdoge":"community-doge-coin","pnix":"phoenixdefi-finance","hsn":"hyper-speed-network","serbiancavehermit":"serbian-cave-hermit","tlt":"trip-leverage-token","upusd":"universal-us-dollar","aammuniuniweth":"aave-amm-uniuniweth","dss":"defi-shopping-stake","hifi":"hifi-gaming-society","yskf":"yearn-shark-finance","aammunisnxweth":"aave-amm-unisnxweth","gbi":"galactic-blue-index","trgi":"the-real-golden-inu","okbhalf":"0-5x-long-okb-token","hmng":"hummingbird-finance","yi12":"yi12-stfinance","aammunimkrweth":"aave-amm-unimkrweth","sbecom":"shebolleth-commerce","ygy":"generation-of-yield","wgc":"green-climate-world","cities":"cities-vault-nftx","sushibull":"3x-long-sushi-token","bpf":"blockchain-property","goong":"tomyumgoong-finance","cix100":"cryptoindex-io","maneki":"maneki-vault-nftx","refi":"realfinance-network","gdildo":"green-dildo-finance","yfie":"yfiexchange-finance","rtt":"real-trump-token","gmc24":"24-genesis-mooncats","hdpunk":"hdpunk-vault-nftx","amwmatic":"aave-polygon-wmatic","sxpbull":"3x-long-swipe-token","dsfr":"digital-swis-franc","cana":"cannabis-seed-token","zecbull":"3x-long-zcash-token","gmm":"gold-mining-members","stoge":"stoner-doge","avastr":"avastr-vault-nftx","spade":"polygonfarm-finance","aammuniyfiweth":"aave-amm-uniyfiweth","xtzbull":"3x-long-tezos-token","wsdoge":"doge-of-woof-street","\u2728":"sparkleswap-rewards","sbland":"sbland-vault-nftx","xspc":"spectresecuritycoin","mmp":"moon-maker-protocol","bonsai":"bonsai-vault-nftx","pxt":"populous-xbrl-token","sbyte":"securabyte-protocol","yfiv":"yearn-finance-value","aammbptbalweth":"aave-amm-bptbalweth","ncp":"newton-coin-project","xjp":"exciting-japan-coin","ymf20":"yearn20moonfinance","topdog":"topdog-vault-nftx","dola":"dola-usd","ff1":"two-prime-ff1-token","eternal":"cryptomines-eternal","wton":"wrapped-ton-crystal","ceek":"ceek","minute":"minute-vault-nftx","eoshalf":"0-5x-long-eos-token","sst":"simba-storage-token","bbw":"big-beautiful-women","msc":"monster-slayer-cash","ledu":"education-ecosystem","mclb":"millenniumclub","wcusd":"wrapped-celo-dollar","fcd":"future-cash-digital","gsc":"global-social-chain","beth":"binance-eth","plaas":"plaas-farmers-token","wxmr":"wrapped-xmr-btse","xrphalf":"0-5x-long-xrp-token","aammunidaiweth":"aave-amm-unidaiweth","maticbull":"3x-long-matic-token","bmg":"black-market-gaming","hbdc":"happy-birthday-coin","climb":"climb-token-finance","energy":"energy-vault-nftx","aammunibatweth":"aave-amm-unibatweth","aammunidaiusdc":"aave-amm-unidaiusdc","ringer":"ringer-vault-nftx","spy":"satopay-yield-token","vpp":"virtue-poker","aammunirenweth":"aave-amm-unirenweth","raddit":"radditarium-network","tkg":"takamaka-green-coin","aammunicrvweth":"aave-amm-unicrvweth","emp":"electronic-move-pay","dfnorm":"dfnorm-vault-nftx","vgo":"virtual-goods-token","mkrbull":"3x-long-maker-token","l99":"lucky-unicorn-token","mollydoge\u2b50":"mini-hollywood-doge","idledaiyield":"idle-dai-yield","aammuniusdcweth":"aave-amm-uniusdcweth","tgco":"thaler","xzar":"south-african-tether","opm":"omega-protocol-money","sxphedge":"1x-short-swipe-token","omn":"omni-people-driven","mkrbear":"3x-short-maker-token","mooncat":"mooncat-vault-nftx","atombull":"3x-long-cosmos-token","stn5":"smart-trade-networks","afo":"all-for-one-business","teo":"trust-ether-reorigin","uenc":"universalenergychain","ibeth":"interest-bearing-eth","scv":"super-coinview-token","aapl":"apple-protocol-token","utt":"united-traders-token","bc":"bitcoin-confidential","bnfy":"b-non-fungible-yearn","terc":"troneuroperewardcoin","$tream":"world-stream-finance","$moby":"whale-hunter-finance","aammuniwbtcweth":"aave-amm-uniwbtcweth","tcs":"timechain-swap-token","tmtg":"the-midas-touch-gold","deor":"decentralized-oracle","hpay":"hyper-credit-network","rht":"reward-hunters-token","usdtbull":"3x-long-tether-token","fanta":"football-fantasy-pro","forestplus":"the-forbidden-forest","aammunilinkweth":"aave-amm-unilinkweth","xtzbear":"3x-short-tezos-token","thex":"thore-exchange","fredx":"fred-energy-erc20","aammuniwbtcusdc":"aave-amm-uniwbtcusdc","wsbt":"wallstreetbets-token","sxpbear":"3x-short-swipe-token","hvi":"hungarian-vizsla-inu","wis":"experty-wisdom-token","sil":"sil-finance","mndcc":"mondo-community-coin","trybbull":"3x-long-bilira-token","xtzhedge":"1x-short-tezos-token","rrt":"recovery-right-token","sleepy":"sleepy-sloth","dollar":"dollar-online","zecbear":"3x-short-zcash-token","aammbptwbtcweth":"aave-amm-bptwbtcweth","eses":"eskisehir-fan-token","pnixs":"phoenix-defi-finance","frank":"frankenstein-finance","hzt":"black-diamond-rating","aammuniaaveweth":"aave-amm-uniaaveweth","wx42":"wrapped-x42-protocol","usc":"ultimate-secure-cash","vgt":"vault12","matichedge":"1x-short-matic-token","bdoge":"blue-eyes-white-doge","sushibear":"3x-short-sushi-token","qtc":"quality-tracing-chain","araid":"airraid-lottery-token","wet":"weble-ecosystem-token","sxphalf":"0-5x-long-swipe-token","trybbear":"3x-short-bilira-token","gcc":"thegcccoin","opa":"option-panda-platform","glob":"global-reserve-system","edi":"freight-trust-network","julb":"justliquidity-binance","yfx":"yfx","usdtbear":"3x-short-tether-token","cact":"crypto-against-cancer","wct":"waves-community-token","seco":"serum-ecosystem-token","xtzhalf":"0-5x-long-tezos-token","incx":"international-cryptox","z502":"502-bad-gateway-token","atomhedge":"1x-short-cosmos-token","ggt":"gard-governance-token","vcf":"valencia-cf-fan-token","adabull":"3x-long-cardano-token","dca":"decentralized-currency-assets","atombear":"3x-short-cosmos-token","rlr":"relayer-network","yfn":"yearn-finance-network","marc":"market-arbitrage-coin","octane":"octane-protocol-token","drft":"dino-runner-fan-token","bsbt":"bit-storage-box-token","polybunny":"bunny-token-polygon","idletusdyield":"idle-tusd-yield","htg":"hedge-tech-governance","blo":"based-loans-ownership","upak":"unicly-pak-collection","anka":"ankaragucu-fan-token","intratio":"intelligent-ratio-set","cts":"chainlink-trading-set","gtf":"globaltrustfund-token","ddn":"data-delivery-network","tfi":"trustfi-network-token","xlmbull":"3x-long-stellar-token","dsu":"digital-standard-unit","cld":"cryptopia-land-dollar","crs":"cryptorewards","matichalf":"0-5x-long-matic-token","ddrst":"digidinar-stabletoken","dnz":"denizlispor-fan-token","imbtc":"the-tokenized-bitcoin","zomb":"antique-zombie-shards","lml":"link-machine-learning","evz":"electric-vehicle-zone","idlewbtcyield":"idle-wbtc-yield","znt":"zenswap-network-token","smrat":"secured-moonrat-token","efg":"ecoc-financial-growth","crooge":"uncle-scrooge-finance","vetbull":"3x-long-vechain-token","shb4":"super-heavy-booster-4","usd":"uniswap-state-dollar","wows":"wolves-of-wall-street","toshimon":"toshimon-vault-nftx","inter":"inter-milan-fan-token","gsx":"gold-secured-currency","chy":"concern-proverty-chain","linkpt":"link-profit-taker-set","infinity":"infinity-protocol-bsc","btsc":"beyond-the-scene-coin","jeur":"jarvis-synthetic-euro","hegg":"hummingbird-egg-token","babydb":"baby-doge-billionaire","kclp":"korss-chain-launchpad","lbxc":"lux-bio-exchange-coin","dmr":"dreamr-platform-token","ducato":"ducato-protocol-token","acd":"alliance-cargo-direct","hedge":"1x-short-bitcoin-token","tgic":"the-global-index-chain","uwbtc":"unagii-wrapped-bitcoin","dogebull":"3x-long-dogecoin-token","ltcbull":"3x-long-litecoin-token","dpt":"diamond-platform-token","adabear":"3x-short-cardano-token","xlmbear":"3x-short-stellar-token","nami":"nami-corporation-token","cvcc":"cryptoverificationcoin","uff":"united-farmers-finance","dcd":"digital-currency-daily","linkrsico":"link-rsi-crossover-set","vetbear":"3x-short-vechain-token","vethedge":"1x-short-vechain-token","ryma":"bakumatsu-swap-finance","call":"global-crypto-alliance","ecn":"ecosystem-coin-network","bnd":"doki-doki-chainbinders","bmp":"brother-music-platform","balbull":"3x-long-balancer-token","ubi":"universal-basic-income","leg":"legia-warsaw-fan-token","fdr":"french-digital-reserve","hth":"help-the-homeless-coin","adahedge":"1x-short-cardano-token","bevo":"bevo-digital-art-token","heroes":"dehero-community-token","gdc":"global-digital-content","yfrm":"yearn-finance-red-moon","mcpc":"mobile-crypto-pay-coin","algobull":"3x-long-algorand-token","et":"ethst-governance-token","tgt":"twirl-governance-token","yfp":"yearn-finance-protocol","goz":"goztepe-s-k-fan-token","atomhalf":"0-5x-long-cosmos-token","dant":"digital-antares-dollar","xdex":"xdefi-governance-token","paxgbull":"3x-long-pax-gold-token","sunder":"sunder-goverance-token","ihf":"invictus-hyprion-fund","smnc":"simple-masternode-coin","tac":"taekwondo-access-credit","linkbull":"3x-long-chainlink-token","adahalf":"0-5x-long-cardano-token","ethrsiapy":"eth-rsi-60-40-yield-set-ii","locc":"low-orbit-crypto-cannon","mlgc":"marshal-lion-group-coin","gnbu":"nimbus-governance-token","ems":"ethereum-message-search","rrr":"rapidly-reusable-rocket","cgs":"crypto-gladiator-shards","bbe":"bullbearethereum-set-ii","sato":"super-algorithmic-token","bnkrx":"bankroll-extended-token","collective":"collective-vault-nftx","dogmoon":"dog-landing-on-the-moon","dogehedge":"1x-short-dogecoin-token","idledaisafe":"idle-dai-risk-adjusted","vit":"team-vitality-fan-token","itg":"itrust-governance-token","tsf":"teslafunds","pwc":"prime-whiterock-company","ethbear":"3x-short-ethereum-token","tomobull":"3x-long-tomochain-token","ltcbear":"3x-short-litecoin-token","gve":"globalvillage-ecosystem","algohedge":"1x-short-algorand-token","algobear":"3x-short-algorand-token","balbear":"3x-short-balancer-token","brz":"brz","inex":"internet-exchange-token","ltchedge":"1x-short-litecoin-token","uwaifu":"unicly-waifu-collection","bags":"basis-gold-share-heco","sauber":"alfa-romeo-racing-orlen","paxgbear":"3x-short-pax-gold-token","half":"0-5x-long-bitcoin-token","vbnt":"bancor-governance-token","yfiec":"yearn-finance-ecosystem","ethhedge":"1x-short-ethereum-token","cbn":"connect-business-network","bscgirl":"binance-smart-chain-girl","sxut":"spectre-utility-token","algohalf":"0-5x-long-algorand-token","linkbear":"3x-short-chainlink-token","idleusdtsafe":"idle-usdt-risk-adjusted","p2ps":"p2p-solutions-foundation","ass":"australian-safe-shepherd","sup":"supertx-governance-token","ethhalf":"0-5x-long-ethereum-token","$hrimp":"whalestreet-shrimp-token","nasa":"not-another-shit-altcoin","dogehalf":"0-5x-long-dogecoin-token","defibull":"3x-long-defi-index-token","bnft":"bruce-non-fungible-token","set":"sustainable-energy-token","alk":"alkemi-network-dao-token","hid":"hypersign-identity-token","bsvbull":"3x-long-bitcoin-sv-token","pec":"proverty-eradication-coin","upt":"universal-protocol-token","tomohedge":"1x-short-tomochain-token","bhp":"blockchain-of-hash-power","basd":"binance-agile-set-dollar","pcusdc":"pooltogether-usdc-ticket","ethmo":"eth-momentum-trigger-set","yefim":"yearn-finance-management","ftv":"futurov-governance-token","paxghalf":"0-5x-long-pax-gold-token","bvol":"1x-long-btc-implied-volatility-token","balhalf":"0-5x-long-balancer-token","abpt":"aave-balancer-pool-token","idleusdcsafe":"idle-usdc-risk-adjusted","pbtt":"purple-butterfly-trading","best":"bitcoin-and-ethereum-standard-token","linkhedge":"1x-short-chainlink-token","cmccoin":"cine-media-celebrity-coin","eth2":"eth2-staking-by-poolx","brrr":"money-printer-go-brrr-set","elp":"the-everlasting-parachain","xautbull":"3x-long-tether-gold-token","dcvr":"defi-cover-and-risk-index","htbull":"3x-long-huobi-token-token","efil":"ethereum-wrapped-filecoin","anw":"anchor-neural-world-token","defibear":"3x-short-defi-index-token","defihedge":"1x-short-defi-index-token","linkhalf":"0-5x-long-chainlink-token","bsvbear":"3x-short-bitcoin-sv-token","cum":"cryptographic-ultra-money","wcdc":"world-credit-diamond-coin","bptn":"bit-public-talent-network","vol":"volatility-protocol-token","byte":"btc-network-demand-set-ii","sxdt":"spectre-dividend-token","collg":"collateral-pay-governance","ulu":"universal-liquidity-union","lega":"link-eth-growth-alpha-set","xautbear":"3x-short-tether-gold-token","midbull":"3x-long-midcap-index-token","sheesh":"sheesh-it-is-bussin-bussin","ethbtc7525":"eth-btc-75-25-weight-set","bsvhalf":"0-5x-long-bitcoin-sv-token","cnhpd":"chainlink-nft-vault-nftx","chft":"crypto-holding-frank-token","byte3":"bitcoin-network-demand-set","yfka":"yield-farming-known-as-ash","bchbull":"3x-long-bitcoin-cash-token","aib":"advanced-internet-block","sih":"salient-investment-holding","wgrt":"waykichain-governance-coin","drgnbull":"3x-long-dragon-index-token","cva":"crypto-village-accelerator","defihalf":"0-5x-long-defi-index-token","htbear":"3x-short-huobi-token-token","sbx":"degenerate-platform","arcc":"asia-reserve-currency-coin","xac":"general-attention-currency","umoon":"unicly-mooncats-collection","cute":"blockchain-cuties-universe","sccp":"s-c-corinthians-fan-token","ethrsi6040":"eth-rsi-60-40-crossover-set","btcrsiapy":"btc-rsi-crossover-yield-set","innbc":"innovative-bioresearch","qdao":"q-dao-governance-token-v1-0","altbull":"3x-long-altcoin-index-token","uartb":"unicly-artblocks-collection","fact":"fee-active-collateral-token","midbear":"3x-short-midcap-index-token","citizen":"kong-land-alpha-citizenship","privbull":"3x-long-privacy-index-token","drgnbear":"3x-short-dragon-index-token","xet":"xfinite-entertainment-token","abc123":"art-blocks-curated-full-set","thetabull":"3x-long-theta-network-token","cusdtbull":"3x-long-compound-usdt-token","xauthalf":"0-5x-long-tether-gold-token","yfdt":"yearn-finance-diamond-token","eth20smaco":"eth_20_day_ma_crossover_set","eth50smaco":"eth-50-day-ma-crossover-set","lpnt":"luxurious-pro-network-token","court":"optionroom-governance-token","kncbull":"3x-long-kyber-network-token","acc":"asian-african-capital-chain","bchhedge":"1x-short-bitcoin-cash-token","bchbear":"3x-short-bitcoin-cash-token","mlr":"mega-lottery-services-global","uglyph":"unicly-autoglyph-collection","bchhalf":"0-5x-long-bitcoin-cash-token","innbcl":"innovativebioresearchclassic","etas":"eth-trending-alpha-st-set-ii","compbull":"3x-long-compound-token-token","bullshit":"3x-long-shitcoin-index-token","scds":"shrine-cloud-storage-network","kncbear":"3x-short-kyber-network-token","cusdtbear":"3x-short-compound-usdt-token","eth12emaco":"eth-12-day-ema-crossover-set","eth26emaco":"eth-26-day-ema-crossover-set","fnd1066xt31d":"fnd-otto-heldringstraat-31d","apecoin":"asia-pacific-electronic-coin","thetahedge":"1x-short-theta-network-token","bxa":"blockchain-exchange-alliance","privhedge":"1x-short-privacy-index-token","drgnhalf":"0-5x-long-dragon-index-token","blct":"bloomzed-token","jchf":"jarvis-synthetic-swiss-franc","altbear":"3x-short-altcoin-index-token","privbear":"3x-short-privacy-index-token","thetabear":"3x-short-theta-network-token","althalf":"0-5x-long-altcoin-index-token","ibp":"innovation-blockchain-payment","sana":"storage-area-network-anywhere","ethbtcrsi":"eth-btc-rsi-ratio-trading-set","ethbtcemaco":"eth-btc-ema-ratio-trading-set","bearshit":"3x-short-shitcoin-index-token","mhce":"masternode-hype-coin-exchange","jpyq":"jpyq-stablecoin-by-q-dao-v1","ethemaapy":"eth-26-ema-crossover-yield-set","comphedge":"1x-short-compound-token-token","thetahalf":"0-5x-long-theta-network-token","cnyq":"cnyq-stablecoin-by-q-dao-v1","knchalf":"0-5x-long-kyber-network-token","privhalf":"0-5x-long-privacy-index-token","ugone":"unicly-gone-studio-collection","compbear":"3x-short-compound-token-token","tusc":"original-crypto-coin","roush":"roush-fenway-racing-fan-token","greed":"fear-greed-sentiment-set-ii","tip":"technology-innovation-project","qsd":"qian-second-generation-dollar","hedgeshit":"1x-short-shitcoin-index-token","ot-ausdc-29dec2022":"ot-aave-interest-bearing-usdc","ustonks-apr21":"ustonks-apr21","halfshit":"0-5x-long-shitcoin-index-token","linkethrsi":"link-eth-rsi-ratio-trading-set","cdsd":"contraction-dynamic-set-dollar","yvboost":"yvboost","bcac":"business-credit-alliance-chain","bbra":"boobanker-research-association","etcbull":"3x-long-ethereum-classic-token","urevv":"unicly-formula-revv-collection","jgbp":"jarvis-synthetic-british-pound","uch":"universidad-de-chile-fan-token","etcbear":"3x-short-ethereum-classic-token","epm":"extreme-private-masternode-coin","mauni":"matic-aave-uni","madai":"matic-aave-dai","kun":"chemix-ecology-governance-token","mayfi":"matic-aave-yfi","ntrump":"no-trump-augur-prediction-token","bhsc":"blackholeswap-compound-dai-usdc","fdnza":"art-blocks-curated-fidenza-855","sgtv2":"sharedstake-governance-token","sge":"society-of-galactic-exploration","cvag":"crypto-village-accelerator-cvag","stkabpt":"staked-aave-balancer-pool-token","mausdc":"matic-aave-usdc","matusd":"matic-aave-tusd","galo":"clube-atletico-mineiro-fan-token","mausdt":"matic-aave-usdt","maweth":"matic-aave-weth","ibvol":"1x-short-btc-implied-volatility","uarc":"unicly-the-day-by-arc-collection","am":"aston-martin-cognizant-fan-token","filst":"filecoin-standard-hashrate-token","eth20macoapy":"eth-20-ma-crossover-yield-set-ii","por":"portugal-national-team-fan-token","evdc":"electric-vehicle-direct-currency","maaave":"matic-aave-aave","ethpa":"eth-price-action-candlestick-set","etchalf":"0-5x-long-ethereum-classic-token","malink":"matic-aave-link","ylab":"yearn-finance-infrastructure-labs","bqt":"blockchain-quotations-index-token","ethmacoapy":"eth-20-day-ma-crossover-yield-set","work":"the-employment-commons-work-token","ebloap":"eth-btc-long-only-alpha-portfolio","usns":"ubiquitous-social-network-service","ugmc":"unicly-genesis-mooncats-collection","cring":"darwinia-crab-network","gusdt":"gusd-token","exchbull":"3x-long-exchange-token-index-token","zjlt":"zjlt-distributed-factoring-network","emtrg":"meter-governance-mapped-by-meter-io","exchhedge":"1x-short-exchange-token-index-token","exchbear":"3x-short-exchange-token-index-token","sweep":"bayc-history","tbft":"turkiye-basketbol-federasyonu-token","dvp":"decentralized-vulnerability-platform","exchhalf":"0-5x-long-echange-token-index-token","ujord":"unicly-air-jordan-1st-drop-collection","linkethpa":"eth-link-price-action-candlestick-set","ugas-jun21":"ugas-jun21","qdefi":"qdefi-rating-governance-token-v2","ibtcv":"inverse-bitcoin-volatility-index-token","iethv":"inverse-ethereum-volatility-index-token","dml":"decentralized-machine-learning","pxusd-mar2022":"pxusd-synthetic-usd-expiring-31-mar-2022","arg":"argentine-football-association-fan-token","cdr":"communication-development-resources-token","dcip":"decentralized-community-investment-protocol","realtoken-s-14918-joy-rd-detroit-mi":"14918-joy","realtoken-s-8181-bliss-st-detroit-mi":"8181-bliss","realtoken-s-11957-olga-st-detroit-mi":"11957-olga","realtoken-s-13045-wade-st-detroit-mi":"13045-wade","realtoken-s-4061-grand-st-detroit-mi":"4061-grand","realtoken-s-15778-manor-st-detroit-mi":"15778-manor","realtoken-s-5601-s.wood-st-chicago-il":"5601-s-wood","realtoken-s-1000-florida-ave-akron-oh":"1000-florida","realtoken-s-9717-everts-st-detroit-mi":"9717-everts","realtoken-s-19136-tracey-st-detroit-mi":"19136-tracey","realtoken-s-4340-east-71-cleveland-oh":"4340-east-71","realtoken-s-9920-bishop-st-detroit-mi":"9920-bishop","realtoken-s-15039-ward-ave-detroit-mi":"15039-ward","realtoken-s-15770-prest-st-detroit-mi":"15770-prest","realtoken-s-9336-patton-st-detroit-mi":"9336-patton","realtoken-s-19317-gable-st-detroit-mi":"19317-gable","realtoken-s-20200-lesure-st-detroit-mi":"20200-lesure","realtoken-s-18983-alcoy-ave-detroit-mi":"18983-alcoy","realtoken-s-19333-moenart-st-detroit-mi":"19333-moenart","realtoken-s-19996-joann-ave-detroit-mi":"19996-joann","realtoken-s-12866-lauder-st-detroit-mi":"12866-lauder","realtoken-s-9943-marlowe-st-detroit-mi":"9943-marlowe","realtoken-s-5942-audubon-rd-detroit-mi":"5942-audubon","realtoken-s-9169-boleyn-st-detroit-mi":"9169-boleyn","realtoken-s-9481-wayburn-st-detroit-mi":"9481-wayburn","realtoken-s-10974-worden-st-detroit-mi":"10974-worden","realtoken-s-18466-fielding-st-detroit-mi":"18466-fielding","realtoken-s-14825-wilfried-st-detroit-mi":"14825-wilfred","realtoken-s-13991-warwick-st-detroit-mi":"13991-warwick","realtoken-s-15095-hartwell-st-detroit-mi":"15095-hartwell","realtoken-s-1815-s.avers-ave-chicago-il":"1815-s-avers","realtoken-s-10084-grayton-st-detroit-mi":"10084-grayton","realtoken-s-15777-ardmore-st-detroit-mi":"15777-ardmore","realtoken-s-17809-charest-st-detroit-mi":"17809-charest","realtoken-s-11300-roxbury-st-detroit-mi":"11300-roxbury","realtoken-s-11078-wayburn-st-detroit-mi":"11078-wayburn","realtoken-s-11201-college-st-detroit-mi":"11201-college","realtoken-s-15634-liberal-st-detroit-mi":"15634-liberal","realtoken-s-1617-s.avers-ave-chicago-il":"1617-s-avers","realtoken-s-1244-s.avers-st-chicago-il":"1244-s-avers","realtoken-s-18433-faust-ave-detroit-mi":"18433-faust","realtoken-s-14229-wilshire-dr-detroit-mi":"14229-wilshire","realtoken-s-14882-troester-st-detroit-mi":"14882-troester","realtoken-s-15753-hartwell-st-detroit-mi":"15753-hartwell","realtoken-s-14319-rosemary-st-detroit-mi":"14319-rosemary","realtoken-s-14078-carlisle-st-detroit-mi":"14078-carlisle","realtoken-s-11078-longview-st-detroit-mi":"11078-longview","realtoken-s-19163-mitchell-st-detroit-mi":"19163-mitchell","realtoken-s-19218-houghton-st-detroit-mi":"19218-houghton","realtoken-s-19311-keystone-st-detroit-mi":"19311-keystone","realtoken-s-9309-courville-st-detroit-mi":"9309-courville","realtoken-s-10616-mckinney-st-detroit-mi":"10616-mckinney","realtoken-s-10639-stratman-st-detroit-mi":"10639-stratman","realtoken-s-402-s.kostner-ave-chicago-il":"402-s-kostner","realtoken-s-15796-hartwell-st-detroit-mi":"15796-hartwell","realtoken-s-15860-hartwell-st-detroit-mi":"15860-hartwell","realtoken-s-15350-greydale-st-detroit-mi":"15350-greydale","realtoken-s-14494-chelsea-ave-detroit-mi":"14494-chelsea","realtoken-s-17813-bradford-st-detroit-mi":"17813-bradford","realtoken-s-15373-parkside-st-detroit-mi":"15373-parkside","realtoken-s-9166-devonshire-rd-detroit-mi":"9166-devonshire","realtoken-s-13606-winthrop-st-detroit-mi":"13606-winthrop","realtoken-s-10629-mckinney-st-detroit-mi":"10629-mckinney","realtoken-s-13895-saratoga-st-detroit-mi":"realtoken-s-13895-saratoga-st-detroit-mi","realtoken-s-18276-appoline-st-detroit-mi":"18276-appoline","realtoken-s-19596-goulburn-st-detroit-mi":"19596-goulburn","realtoken-s-15048-freeland-st-detroit-mi":"15048-freeland","realtoken-s-12409-whitehill-st-detroit-mi":"12409-whitehill","realtoken-s-18900-mansfield-st-detroit-mi":"18900-mansfield","realtoken-s-19200-strasburg-st-detroit-mi":"19200-strasburg","realtoken-s-6923-greenview-ave-detroit-mi":"6923-greenview","realtoken-s-10612-somerset-ave-detroit-mi":"10612-somerset","realtoken-s-19020-rosemont-ave-detroit-mi":"19020-rosemont","realtoken-s-17500-evergreen-rd-detroit-mi":"17500-evergreen","realtoken-s-9133-devonshire-rd-detroit-mi":"9133-devonshire","realtoken-s-10700-whittier-ave-detroit-mi":"10700-whittier","realtoken-s-10604-somerset-ave-detroit-mi":"10604-somerset","realtoken-s-14066-santa-rosa-dr-detroit-mi":"14066-santa-rosa","realtoken-s-13116-kilbourne-ave-detroit-mi":"13116-kilbourne","realtoken-s-16200-fullerton-ave-detroit-mi":"16200-fullerton","realtoken-s-4680-buckingham-ave-detroit-mi":"4680-buckingham","realtoken-s-11653-nottingham-rd-detroit-mi":"11653-nottingham","realtoken-s-18776-sunderland-rd-detroit-mi":"18776-sunderland","realtoken-s-9165-kensington-ave-detroit-mi":"9165-kensington","realtoken-s-13114-glenfield-ave-detroit-mi":"13114-glenfield","realtoken-s-1542-s.ridgeway-ave-chicago-il":"1542-s-ridgeway","realtoken-s-18481-westphalia-st-detroit-mi":"18481-westphalia","realtoken-s-12405-santa-rosa-dr-detroit-mi":"12405-santa-rosa","realtoken-s-19201-westphalia-st-detroit-mi":"19201-westphalia","realtoken-s-14231-strathmoor-st-detroit-mi":"14231-strathmoor","realtoken-s-18273-monte-vista-st-detroit-mi":"18273-monte-vista","realtoken-s-3432-harding-street-detroit-mi":"3432-harding","realtoken-s-4380-beaconsfield-st-detroit-mi":"4380-beaconsfield","realtoken-s-15784-monte-vista-st-detroit-mi":"15784-monte-vista","mbcc":"blockchain-based-distributed-super-computing-platform","realtoken-s-10617-hathaway-ave-cleveland-oh":"10617-hathaway","realtoken-s-9465-beaconsfield-st-detroit-mi":"9465-beaconsfield","realtoken-s-8342-schaefer-highway-detroit-mi":"8342-schaefer","realtoken-s-4852-4854-w.cortez-st-chicago-il":"4852-4854-w-cortez","realtoken-s-12334-lansdowne-street-detroit-mi":"12334-lansdowne","realtoken-s-10024-10028-appoline-st-detroit-mi":"10024-10028-appoline","realtoken-s-581-587-jefferson-ave-rochester-ny":"581-587-jefferson","realtoken-s-25097-andover-dr-dearborn-heights-mi":"25097-andover","realtoken-s-272-n.e.-42nd-court-deerfield-beach-fl":"272-n-e-42nd-court"};

//end
