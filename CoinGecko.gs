/*====================================================================================================================================*
  CoinGecko by Eloise1988
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

function GECKOPRICE(ticker,currency){
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
      var res = UrlFetchApp.fetch(url);
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
          
      
    
    Logger.log(price_gecko)
    return price_gecko;
  }

  catch(err){
    return "Refresh to load again";
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

function GECKOVOLUME(ticker,currency){
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
      var res = UrlFetchApp.fetch(url);
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
      //Logger.log(parsedJSON[id_coin][currency])
      
      vol_gecko=parseFloat(parsedJSON[0].total_volume);
          
      return vol_gecko;
  }

  catch(err){
    return "Refresh to load again";
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
function GECKOCAP(ticker,currency){
  try{
    
    
      url="https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
      ticker=ticker.toUpperCase()
      currency=currency.toLowerCase()
      var res = UrlFetchApp.fetch(url);
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
    return "Refresh to load again";
  }

}
