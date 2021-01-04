/*====================================================================================================================================*
  CoinGecko Google Sheet Feed by Eloise1988
  ====================================================================================================================================
  Version:      1.0
  Project Page: https://github.com/Eloise1988/COINGECKO
  Copyright:    (c) 2020 by Eloise1988
                
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing CoinGecko's price, volume & market cap feeds into Google spreadsheets. Functions include:

     GECKOPRICE            For use by end users to cryptocurrency prices 
     GECKOVOLUME           For use by end users to cryptocurrency 24h volumes
     GECKOCAP              For use by end users to cryptocurrency total market caps
     GECKOPRICEBYNAME      For use by end users to cryptocurrency prices using id name
     GECKOVOLBYNAME        For use by end users to cryptocurrency volumes using id name
     GECKOCAPBYNAME        For use by end users to cryptocurrency total market caps using id name
     GECKOCHANGE           For use by end users to cryptocurrency % change price, volume, mkt
     GECKOATH              For use by end users to cryptocurrency All Time High Prices

  
  For bug reports see https://github.com/Eloise1988/COINGECKO/issues

  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  1.0.0  Initial release
 *====================================================================================================================================*/


/** GECKOPRICE
 * Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The price feed is a ONE-dimensional array.
 * By default, data gets transformed into a number so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKOPRICE("BTC", "USD","$A$1")
 *               
 * 
 * @param {cryptocurrency}          the cryptocurrency ticker you want the price from
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the price
 **/

async function GECKOPRICE(ticker,currency){


  ticker=ticker.toUpperCase()
  currency=currency.toLowerCase()
  id_cache=ticker+currency+'price'
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
    
    url="https://api.coingecko.com/api/v3/simple/price?ids="+id_coin+"&vs_currencies="+currency;
    
    var res = UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    price_gecko=parseFloat(parsedJSON[id_coin][currency]);
    cache.put(id_cache, Number(price_gecko));
    
    return Number(price_gecko);
  }
  
  catch(err){
    return GECKOPRICE(ticker,currency);
  }
  
}

/** GECKOVOLUME
 * Imports CoinGecko's cryptocurrency 24h volumes into Google spreadsheets. The feed is a ONE-dimensional array.
 * By default, data gets transformed into a number so it looks more like a normal number data import. 
 * For example:
 *
 *   =GECKOVOLUME("BTC", "USD","$A$1")
 *               
 * 
 * @param {cryptocurrency}          the cryptocurrency ticker you want the 24h volume from
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the 24h volume
 **/

async function GECKOVOLUME(ticker,currency){
  
  ticker=ticker.toUpperCase()
  currency=currency.toLowerCase()
  id_cache=ticker+currency+'volume'
  
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
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    var res = UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    
    vol_gecko=parseFloat(parsedJSON[0].total_volume);
    cache.put(id_cache, Number(vol_gecko));
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return GECKOVOLUME(ticker,currency);
  }

}


/** GECKOCAP
 * Imports cryptocurrencies total market cap into Google spreadsheets. The feed is a ONE-dimensional array.
 * By default, data gets transformed into a number so it looks more like a normal number data import. 
 * For example:
 *
 *   =GECKOCAP("BTC", "USD","$A$1")
 *               
 * 
 * @param {cryptocurrency}          the cryptocurrency ticker you want the total market cap from
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the total market cap
 **/
async function GECKOCAP(ticker,currency){

  ticker=ticker.toUpperCase()
  currency=currency.toLowerCase()
  id_cache=ticker+currency+'mkt'
  
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
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    var res = UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    mkt_gecko=parseFloat(parsedJSON[0].market_cap);
    cache.put(id_cache, Number(mkt_gecko));
    
    return Number(mkt_gecko);
  }
  
  catch(err){
    return GECKOCAP(ticker,currency);
  }

}
/** GECKOPRICEBYNAME
 * Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd).
 * For example:
 *
 *   =GECKOPRICEBYNAME("bitcoin", "USD","$A$1")
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
 * Imports CoinGecko's cryptocurrency market capitalization into Google spreadsheets. The id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd).
 * For example:
 *
 *   =GECKOCAPBYNAME("bitcoin", "USD","$A$1")
 *               
 * 
 * @param {id_coin}                 the id name of cryptocurrency ticker found in web address of Coingecko ex:https://www.coingecko.com/en/coins/bitcoin/usd 
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the marketcap
 **/
async function GECKOCAPBYNAME(id_coin,currency){
  id_coin=id_coin.toLowerCase()
  currency=currency.toLowerCase()
  id_cache=id_coin+currency+'capbyname'
  
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
    cap_gecko=parseFloat(parsedJSON[0].market_cap);
    cache.put(id_cache, Number(cap_gecko));
    
    return Number(cap_gecko);
  }
  
  catch(err){
    return GECKOCAPBYNAME(id_coin,currency);
  }

}
/** GECKOVOLUMEBYNAME
 * Imports CoinGecko's cryptocurrency 24H Volume into Google spreadsheets. The id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd).
 * For example:
 *
 *   =GECKOVOLUMEBYNAME("bitcoin", "USD","$A$1")
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
    return "";
  }

}  
 /** GECKOATH
 * Imports CoinGecko's cryptocurrency All Time High Price into Google spreadsheets. The price feed is a ONE-dimensional array.
 * By default, data gets transformed into a number so it looks more like a normal price data import. 
 * For example:
 *
 *   =GECKOATH("BTC", "USD","$A$1")
 *               
 * 
 * @param {cryptocurrency}          the cryptocurrency ticker you want the price from
 * @param {against fiat currency}   the fiat currency ex: usd  or eur
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the ATH price
 **/

async function GECKOATH(ticker,currency){
  ticker=ticker.toUpperCase()
  currency=currency.toLowerCase()
  id_cache=ticker+currency+"ath"
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
    
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    var res = UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    ath_gecko=parseFloat(parsedJSON[0].ath);
    cache.put(id_cache, Number(ath_gecko));
    
    
    return Number(ath_gecko);
  }
  
  catch(err){
    return GECKOATH(ticker,currency);
  }

}
/** GECKOHIST
 * Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
 * For example:
 *
 *   =GECKOHIST("BTC","LTC","price", "31-12-2020")
 *   =GECKOHIST("ETH","USD","volume", "01-01-2021")
 *   =GECKOHIST("YFI","EUR","marketcap","06-06-2020")
 *               
 * 
 * @param {ticker}                 the cryptocurrency ticker 
 * @param {ticker2}                the cryptocurrency ticker against which you want the %chage
 * @param {price,volume, or marketcap}     the type of change you are looking for
 * @param {date_ddmmyyy}           the date format dd-mm-yyy get open of the specified date, for close dd-mm-yyy+ 1day
 * @param {parseOptions}           an optional fixed cell for automatic refresh of the data
 * @customfunction
 *
 * @return a one-dimensional array containing the historical open price of BTC -LTC on the 31-12-2020
 **/
async function GECKOHIST(ticker,ticker2,type, date_ddmmyyy){
  
  ticker=ticker.toUpperCase()
  ticker2=ticker2.toLowerCase()
  type=type.toLowerCase()
  date_ddmmyyy=date_ddmmyyy.toString()
  id_cache=ticker+ticker2+type+date_ddmmyyy+'hist'
  
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
    return "";
  }

}  

