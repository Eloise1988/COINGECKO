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

     GECKOPRICE            For use by end users to real-time cryptocurrency prices 
     GECKOVOLUME           For use by end users to real-time cryptocurrency 24h volumes
     GECKOCAP              For use by end users to real-time cryptocurrency total market caps

  
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
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
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
          
      
    return price_gecko;
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
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
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
          
      return vol_gecko;
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
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
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
      
      vol_gecko=parseFloat(parsedJSON[0].market_cap);
          
      return vol_gecko;
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
  try{
      
      id_coin=id_coin.toLowerCase()
      currency=currency.toLowerCase()
      
      url="https://api.coingecko.com/api/v3/simple/price?ids="+id_coin+"&vs_currencies="+currency;
   
      var res = await UrlFetchApp.fetch(url);
      var content = res.getContentText();
      var parsedJSON = JSON.parse(content);
      
      price_gecko=parseFloat(parsedJSON[id_coin][currency]);
      return price_gecko;
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
  try{
      
      id_coin=id_coin.toLowerCase()
      currency=currency.toLowerCase()
      
      url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
   
      var res = await UrlFetchApp.fetch(url);
      var content = res.getContentText();
      var parsedJSON = JSON.parse(content);
      vol_gecko=parseFloat(parsedJSON[0].market_cap);
      
      return vol_gecko;
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
  try{
      
      id_coin=id_coin.toLowerCase()
      currency=currency.toLowerCase()
      
      url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
   
      var res = await UrlFetchApp.fetch(url);
      var content = res.getContentText();
      var parsedJSON = JSON.parse(content);
      vol_gecko=parseFloat(parsedJSON[0].total_volume);
      
      return vol_gecko;
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
  try{
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      ticker2=ticker2.toLowerCase()
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
      
    
      
      type=type.toLowerCase()
      nb_days=nb_days.toString()
      
      
      url="https://api.coingecko.com/api/v3/coins/"+id_coin+"/market_chart?vs_currency="+ticker2+"&days="+nb_days;
   
      var res = await UrlFetchApp.fetch(url);
      var content = res.getContentText();
      var parsedJSON = JSON.parse(content);
      
     if (type=="price")
         { vol_gecko=parsedJSON.prices[parsedJSON.prices.length-1][1]/parsedJSON.prices[0][1]-1;}
     else if (type=="volume")
         { vol_gecko=parsedJSON.total_volumes[parsedJSON.total_volumes.length-1][1]/parsedJSON.total_volumes[0][1]-1;}
     else if (type=="marketcap")
         { vol_gecko=parsedJSON.market_caps[parsedJSON.market_caps.length-1][1]/parsedJSON.market_caps[0][1]-1;}
    else 
         { vol_gecko="Wrong parameter, either price, volume or marketcap";}
      

      return vol_gecko;
  }

  catch(err){
    return GECKOCHANGE(ticker,ticker2,type, nb_days);
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
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
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
          
      
    return ath_gecko;
  }

  catch(err){
    return GECKOATH(ticker,currency);
  }

}

   
