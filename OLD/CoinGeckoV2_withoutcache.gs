
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
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + coinList + "&vs_currencies=" + versusCoinList).getContentText());
    
    var dict = []; 
    for (var i=0;i<pairList.length;i++) {
        if (tickerList.hasOwnProperty(pairList[i][0])) {
          if (tickerList[pairList[i][0]].hasOwnProperty(pairList[i][1])) {
            dict.push(tickerList[pairList[i][0]][pairList[i][1]]);}
          else{dict.push("");}}
        else{dict.push("");}
        };
    
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
    return err
    //return GECKOPRICE(ticker_array,defaultVersusCoin);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].total_volume;
        };
      
    
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
    return err
    //return GECKOVOLUME(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].market_cap;
        };
     
    
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
    return err
    //return GECKOCAP(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].fully_diluted_valuation;
        };
    
    
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
    return err
    //return GECKOCAPDILUTED(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=parseFloat(tickerList[i].price_change_percentage_24h)/100;
        };
      
    
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
    return err
    //return GECKO24HPRICECHANGE(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].market_cap_rank;
        };
    
    
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
    return err
    //return GECKORANK(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].ath;
        };
    
    
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
    return err
    //return GECKOATH(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].atl;
        };
    
    
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
    return err
    //return GECKOATL(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].high_24h;
        };
      
    
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
    return err
    //return GECKO24HIGH(ticker_array,currency);
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
    
    
    let tickerList = JSON.parse(UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + defaultVersusCoin + "&ids=" + coinList).getContentText());
    var dict = {}; 
    for (var i=0;i<tickerList.length;i++) {
        dict[tickerList[i].id]=tickerList[i].low_24h;
        };
    
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
    return err
    //return GECKO24LOW(ticker_array,currency);
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
    
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return err
    //return GECKOHIST(ticker,ticker2,type, date_ddmmyyy,by_ticker=true);
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
    
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return err
    //return GECKOCHANGEBYNAME(id_coin,ticker2,type, nb_days);
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
        
        break;
      }
    }}
    catch(err){
    return GECKO_ID_DATA(ticker,parameter, by_ticker);
  }
  }
  else{
    id_coin=ticker.toLowerCase()
    
  }
  
  
  // Gets a cache that is common to all users of the script.
  
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
    
    return parsedJSON;
  }
  
  catch(err){
    return err
    //return GECKO_ID_DATA(ticker,parameter, by_ticker);
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
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return err
    //return GECKOCHANGE(ticker,ticker2,type, nb_days);
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
      
    return parsedJSON[0].image;
    
    
  }
  catch(err){
    return err
    //return GECKOLOGO(ticker);
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
  

  try{
      
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + id_coin;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
  
         
    return parsedJSON[0].image;
    
    
  }
  catch(err){
    return err
    //return GECKOLOGOBYNAME(id_coin);
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
  
  try{
    
    url="https://api.coingecko.com/api/v3/simple/price?ids="+id_coin+"&vs_currencies="+currency;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    
    price_gecko=parseFloat(parsedJSON[id_coin][currency]);
    
    return Number(price_gecko);
  }
  
  catch(err){
    return err
    //return GECKOPRICEBYNAME(id_coin,currency);
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
  
  try{
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    
    var res = UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    if (diluted==true) {if (parsedJSON[0].fully_diluted_valuation!= null){
      mkt_gecko=parseFloat(parsedJSON[0].fully_diluted_valuation);}
      
      else {mkt_gecko=""}}
      
    else 
    { mkt_gecko=parseFloat(parsedJSON[0].market_cap);
      }
      
    
    
    return mkt_gecko;
  }
  
  
  
  catch(err){
    return err
    //return GECKOCAPBYNAME(id_coin,currency,diluted=false);
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
 
    
  try{
    
    url="https://api.coingecko.com/api/v3/coins/markets?vs_currency="+currency+"&ids="+id_coin;
    
    var res = await UrlFetchApp.fetch(url);
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);
    vol_gecko=parseFloat(parsedJSON[0].total_volume);
    
    return Number(vol_gecko);
  }
  
  catch(err){
    return err
    //return GECKOVOLUMEBYNAME(id_coin,currency);
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
const CoinList = {"index": "index-cooperative", "btc": "bitcoin", "eth": "ethereum", "usdt": "tether", "bnb": "binancecoin", "xrp": "ripple", "ada": "cardano", "doge": "dogecoin", "dot": "polkadot", "usdc": "usd-coin", "bch": "bitcoin-cash", "ltc": "litecoin", "uni": "uniswap", "link": "chainlink", "matic": "matic-network", "sol": "solana", "xlm": "stellar", "etc": "ethereum-classic", "vet": "vechain", "busd": "binance-usd", "wbtc": "wrapped-bitcoin", "theta": "theta-token", "trx": "tron", "aave": "aave", "eos": "eos", "shib": "shiba-inu", "fil": "filecoin", "okb": "okb", "klay": "klay-token", "luna": "terra-luna", "dai": "dai", "neo": "neo", "ceth": "compound-ether", "xmr": "monero", "ksm": "kusama", "ht": "huobi-token", "cdai": "cdai", "atom": "cosmos", "cusdc": "compound-usd-coin", "miota": "iota", "mkr": "maker", "cake": "pancakeswap-token", "ftt": "ftx-token", "avax": "avalanche-2", "rune": "thorchain", "bsv": "bitcoin-cash-sv", "xtz": "tezos", "cro": "crypto-com-chain", "safemoon": "safemoon", "algo": "algorand", "leo": "leo-token", "btt": "bittorrent-2", "comp": "compound-governance-token", "snx": "havven", "sushi": "sushi", "cel": "celsius-degree-token", "dash": "dash", "ust": "terrausd", "waves": "waves", "hbar": "hedera-hashgraph", "xem": "nem", "egld": "elrond-erd-2", "yfi": "yearn-finance", "zec": "zcash", "amp": "amp-token", "dcr": "decred", "tel": "telcoin", "chz": "chiliz", "near": "near", "zil": "zilliqa", "hot": "holotoken", "nexo": "nexo", "pax": "paxos-standard", "qtum": "qtum", "bat": "basic-attention-token", "enj": "enjincoin", "tusd": "true-usd", "dgb": "digibyte", "one": "harmony", "mana": "decentraland", "hbtc": "huobi-btc", "hnt": "helium", "btg": "bitcoin-gold", "ftm": "fantom", "uma": "uma", "stx": "blockstack", "bnt": "bancor", "ont": "ontology", "grt": "the-graph", "xsushi": "xsushi", "fei": "fei-protocol", "arrr": "pirate-chain", "sc": "siacoin", "zrx": "0x", "nano": "nano", "steth": "staked-ether", "gt": "gatechain-token", "zen": "zencash", "husd": "husd", "lusd": "liquity-usd", "omg": "omisego", "icx": "icon", "chsb": "swissborg", "rvn": "ravencoin", "ankr": "ankr", "crv": "curve-dao-token", "iost": "iostoken", "ar": "arweave", "bake": "bakerytoken", "xdc": "xdce-crowd-sale", "nxm": "nxm", "omi": "ecomi", "cusdt": "compound-usdt", "flow": "flow", "lsk": "lisk", "1inch": "1inch", "vgx": "ethos", "qnt": "quant-network", "wrx": "wazirx", "rsr": "reserve-rights-token", "xvs": "venus", "bcha": "bitcoin-cash-abc-2", "kcs": "kucoin-shares", "bcd": "bitcoin-diamond", "lpt": "livepeer", "xvg": "verge", "ckb": "nervos-network", "lrc": "loopring", "snt": "status", "oxy": "oxygen", "feg": "feg-token", "celo": "celo", "tribe": "tribe-2", "renbtc": "renbtc", "win": "wink", "ren": "republic-protocol", "btcst": "btc-standard-hashrate-token", "erg": "ergo", "mir": "mirror-protocol", "usdn": "neutrino", "npxs": "pundi-x", "kobe": "shabu-shabu", "btmx": "asd", "pundix": "pundi-x-2", "bal": "balancer", "hbc": "hbtc-token", "alpha": "alpha-finance", "dent": "dent", "vtho": "vethor-token", "rlc": "iexec-rlc", "skl": "skale", "cfx": "conflux-token", "celr": "celer-network", "band": "band-protocol", "ocean": "ocean-protocol", "ewt": "energy-web-token", "seth": "seth", "reef": "reef-finance", "ray": "raydium", "akt": "akash-network", "lend": "ethlend", "srm": "serum", "inj": "injective-protocol", "woo": "wootrade-network", "tlm": "alien-worlds", "glm": "golem", "iotx": "iotex", "gno": "gnosis", "ampl": "ampleforth", "titan": "titanswap", "alcx": "alchemix", "ton": "tokamak-network", "anc": "anchor-protocol", "agi": "singularitynet", "nmr": "numeraire", "steem": "steem", "math": "math", "ctsi": "cartesi", "fun": "funfair", "axs": "axie-infinity", "cuni": "compound-uniswap", "rpl": "rocket-pool", "kava": "kava", "paxg": "pax-gold", "fet": "fetch-ai", "susd": "nusd", "mdx": "mdex", "nkn": "nkn", "prom": "prometeus", "med": "medibloc", "klv": "klever", "xhv": "haven", "stmx": "storm", "waxp": "wax", "xprt": "persistence", "ark": "ark", "oxt": "orchid-protocol", "ardr": "ardor", "orbs": "orbs", "orn": "orion-protocol", "ubt": "unibright", "maid": "maidsafecoin", "cvc": "civic", "audio": "audius", "cards": "cardstarter", "perp": "perpetual-protocol", "vlx": "velas", "dodo": "dodo", "kmd": "komodo", "sxp": "swipe", "iq": "everipedia", "etn": "electroneum", "svcs": "givingtoservices", "rfox": "redfox-labs-2", "sand": "the-sandbox", "twt": "trust-wallet-token", "strax": "stratis", "utk": "utrust", "poly": "polymath-network", "wan": "wanchain", "hoge": "hoge-finance", "kncl": "kyber-network", "ghx": "gamercoin", "coti": "coti", "ava": "concierge-io", "zks": "zkswap", "uos": "ultra", "ant": "aragon", "meta": "metadium", "bts": "bitshares", "pols": "polkastarter", "forth": "ampleforth-governance-token", "ogn": "origin-protocol", "rook": "rook", "zmt": "zipmex-token", "evn": "evolution-finance", "uqc": "uquid-coin", "eps": "ellipsis", "tko": "tokocrypto", "btm": "bytom", "xaut": "tether-gold", "pha": "pha", "mona": "monacoin", "dpi": "defipulse-index", "wnxm": "wrapped-nxm", "kai": "kardiachain", "storj": "storj", "dnt": "district0x", "noia": "noia-network", "mtl": "metal", "gny": "gny", "dag": "constellation-labs", "hns": "handshake", "hydra": "hydra", "auction": "auction", "vra": "verasity", "keep": "keep-network", "atri": "atari", "trac": "origintrail", "rdd": "reddcoin", "rif": "rif-token", "divi": "divi", "rep": "augur", "nwc": "newscrypto-coin", "nbr": "niobio-cash", "badger": "badger-dao", "dao": "dao-maker", "scrt": "secret", "hxro": "hxro", "elon": "dogelon-mars", "czrx": "compound-0x", "sfp": "safepal", "rndr": "render-token", "sys": "syscoin", "sure": "insure", "kin": "kin", "loc": "lockchain", "quick": "quick", "alice": "my-neighbor-alice", "nmx": "nominex", "hive": "hive", "pac": "paccoin", "c20": "crypto20", "elf": "aelf", "fx": "fx-coin", "rose": "oasis-network", "snm": "sonm", "frax": "frax", "gas": "gas", "safemars": "safemars", "htr": "hathor", "qkc": "quark-chain", "rly": "rally-2", "aion": "aion", "col": "unit-protocol", "prq": "parsiq", "nu": "nucypher", "mx": "mx-token", "aeth": "ankreth", "usdp": "usdp", "exrd": "e-radix", "tomo": "tomochain", "swap": "trustswap", "lina": "linear", "lyxe": "lukso-token", "firo": "zcoin", "paid": "paid-network", "mask": "mask-network", "edg": "edgeware", "cbat": "compound-basic-attention-token", "powr": "power-ledger", "bcn": "bytecoin", "jst": "just", "dia": "dia-data", "xcm": "coinmetro", "gala": "gala", "vai": "vai", "ersdl": "unfederalreserve", "trb": "tellor", "super": "superfarm", "cope": "cope", "api3": "api3", "ddx": "derivadao", "cre": "carry", "cru": "crust-network", "bond": "barnbridge", "pnk": "kleros", "duck": "unit-protocol-duck", "cummies": "cumrocket", "mft": "mainframe", "ern": "ethernity-chain", "lon": "tokenlon", "mln": "melon", "lamb": "lambda", "chr": "chromaway", "wicc": "waykichain", "adx": "adex", "iris": "iris-network", "vrsc": "verus-coin", "mist": "alchemist", "pcx": "chainx", "moon": "mooncoin", "ela": "elastos", "seur": "seur", "nrg": "energi", "wozx": "wozx", "beam": "beam", "shr": "sharering", "kda": "kadena", "eth2x-fli": "eth-2x-flexible-leverage-index", "gusd": "gemini-dollar", "whale": "whale", "lto": "lto-network", "fsn": "fsn", "ohm": "olympus", "nrv": "nerve-finance", "maps": "maps", "dea": "dea", "ppt": "populous", "znn": "zenon", "ycc": "yuan-chain-coin", "cream": "cream-2", "alpaca": "alpaca-finance", "tt": "thunder-token", "lit": "litentry", "dbc": "deepbrain-chain", "blz": "bluzelle", "srk": "sparkpoint", "nuls": "nuls", "eac": "earthcoin", "fine": "refinable", "ramp": "ramp", "xor": "sora", "hegic": "hegic", "bunny": "pancake-bunny", "val": "sora-validator-token", "zai": "zero-collateral-dai", "sero": "super-zero", "ae": "aeternity", "tru": "truefi", "glch": "glitch-protocol", "albt": "allianceblock", "aergo": "aergo", "pond": "marlin", "atm": "atletico-madrid", "lbc": "lbry-credits", "rgt": "rari-governance-token", "yfii": "yfii-finance", "bifi": "beefy-finance", "eco": "ecofi", "mxc": "mxc", "akro": "akropolis", "slp": "smooth-love-potion", "ldo": "lido-dao", "wex": "waultswap", "vite": "vite", "pivx": "pivx", "cbk": "cobak-token", "any": "anyswap", "spi": "shopping-io", "creth2": "cream-eth2", "fida": "bonfida", "psg": "paris-saint-germain-fan-token", "core": "cvault-finance", "loomold": "loom-network", "bar": "fc-barcelona-fan-token", "peak": "marketpeak", "data": "streamr-datacoin", "bscpad": "bscpad", "stake": "xdai-stake", "grs": "groestlcoin", "nsbt": "neutrino-system-base-token", "ctk": "certik", "sbd": "steem-dollars", "png": "pangolin", "vsp": "vesper-finance", "oxen": "loki-network", "lqty": "liquity", "front": "frontier-token", "ignis": "ignis", "stpt": "stp-network", "emc2": "einsteinium", "nxs": "nexus", "sntvt": "sentivate", "solve": "solve-care", "om": "mantra-dao", "dsla": "stacktical", "bzrx": "bzx-protocol", "req": "request-network", "get": "get-token", "drgn": "dragonchain", "kyl": "kylin-network", "bel": "bella-protocol", "bmi": "bridge-mutual", "dero": "dero", "sbtc": "sbtc", "bfc": "bifrost", "armor": "armor", "sfi": "saffron-finance", "boa": "bosagora", "farm": "harvest-finance", "dusk": "dusk-network", "pnt": "pnetwork", "df": "dforce-token", "btu": "btu-protocol", "arpa": "arpa-chain", "cos": "contentos", "slink": "slink", "sai": "sai", "tvk": "terra-virtua-kolect", "rari": "rarible", "lgo": "legolas-exchange", "slt": "smartlands", "nxt": "nxt", "pro": "propy", "xhdx": "hydradx", "soc": "all-sports", "vtc": "vertcoin", "skey": "smartkey", "mhc": "metahash", "krt": "terra-krw", "id": "everid", "aqt": "alpha-quark-token", "yld": "yield-app", "vsys": "v-systems", "ppc": "peercoin", "hard": "hard-protocol", "hai": "hackenai", "rfr": "refereum", "hez": "hermez-network-token", "ghst": "aavegotchi", "kp3r": "keep3rv1", "cusd": "celo-dollar", "hc": "hshare", "gxc": "gxchain", "apl": "apollo", "zb": "zb-token", "nim": "nimiq-2", "dgd": "digixdao", "chain": "chain-games", "swth": "switcheo", "xdb": "digitalbits", "met": "metronome", "nif": "unifty", "bor": "boringdao", "rad": "radicle", "suku": "suku", "xbase": "eterbase", "fio": "fio-protocol", "auto": "auto", "veri": "veritaseum", "uft": "unlend-finance", "dg": "decentral-games", "sx": "sportx", "ilv": "illuvium", "visr": "visor", "dego": "dego-finance", "rai": "rai", "bip": "bip", "root": "rootkit", "go": "gochain", "fis": "stafi", "lgcy": "lgcy-network", "bz": "bit-z-token", "btse": "btse-token", "vid": "videocoin", "mrph": "morpheus-network", "occ": "occamfi", "zano": "zano", "free": "free-coin", "bondly": "bondly", "insur": "insurace", "mcb": "mcdex", "ioc": "iocoin", "bao": "bao-finance", "fxs": "frax-share", "esd": "empty-set-dollar", "rcn": "ripio-credit-network", "juv": "juventus-fan-token", "bax": "babb", "vxv": "vectorspace", "cnd": "cindicator", "eurs": "stasis-eurs", "cube": "somnium-space-cubes", "gbyte": "byteball", "mslv": "mirrored-ishares-silver-trust", "swingby": "swingby", "tbtc": "tbtc", "xsgd": "xsgd", "hopr": "hopr", "dext": "idextools", "phb": "red-pulse", "mgoogl": "mirrored-google", "ring": "darwinia-network-native-token", "nest": "nest", "step": "step-finance", "mbx": "mobiecoin", "dmt": "dmarket", "wing": "wing-finance", "ult": "ultiledger", "ast": "airswap", "aria20": "arianee", "mod": "modefi", "edr": "endor", "mqqq": "mirrored-invesco-qqq-trust", "mamzn": "mirrored-amazon", "torn": "tornado-cash", "clo": "callisto", "burst": "burst", "conv": "convergence", "ban": "banano", "pib": "pibble", "mta": "meta", "mmsft": "mirrored-microsoft", "aioz": "aioz-network", "maapl": "mirrored-apple", "route": "route", "zee": "zeroswap", "veth": "vether", "zcn": "0chain", "idex": "aurora-dao", "dock": "dock", "mtsla": "mirrored-tesla", "xyo": "xyo-network", "opium": "opium", "bepro": "bet-protocol", "tryb": "bilira", "revv": "revv", "juld": "julswap", "mnflx": "mirrored-netflix", "tlos": "telos", "cxo": "cargox", "upp": "sentinel-protocol", "mbaba": "mirrored-alibaba", "mbl": "moviebloc", "smart": "smartcash", "usdk": "usdk", "muso": "mirrored-united-states-oil-fund", "rdn": "raiden-network", "qsp": "quantstamp", "mbox": "mobox", "dexe": "dexe", "sha": "safe-haven", "bdt": "blackdragon-token", "flux": "zelcash", "nex": "neon-exchange", "dvpn": "sentinel-group", "fxf": "finxflo", "xrt": "robonomics-network", "wault": "wault-finance-old", "xpr": "proton", "miau": "mirrored-ishares-gold-trust", "musd": "musd", "mtwtr": "mirrored-twitter", "sky": "skycoin", "nftx": "nftx", "baas": "baasid", "mph": "88mph", "oly": "olyseum", "tone": "te-food", "mith": "mithril", "fwt": "freeway-token", "waultx": "wault", "velo": "velo", "usdx": "usdx", "govi": "govi", "salt": "salt", "wtc": "waltonchain", "boson": "boson-protocol", "moc": "mossland", "vitae": "vitae", "oxb": "oxbull-tech", "dcn": "dentacoin", "pltc": "platoncoin", "ifc": "infinitecoin", "vidt": "v-id-blockchain", "digg": "digg", "cfi": "cyberfi", "frm": "ferrum-network", "card": "cardstack", "for": "force-protocol", "qash": "qash", "bft": "bnktothefuture", "buidl": "dfohub", "acs": "acryptos", "cudos": "cudos", "pmon": "pocmon", "suter": "suterusu", "bdpi": "interest-bearing-dpi", "dep": "deapcoin", "xsn": "stakenet", "grin": "grin", "unfi": "unifi-protocol-dao", "htb": "hotbit-token", "nebl": "neblio", "dfy": "defi-for-you", "dip": "etherisc", "soul": "phantasma", "media": "media-network", "snl": "sport-and-leisure", "bmx": "bitmart-token", "wow": "wownero", "zero": "zero-exchange", "mvixy": "mirrored-proshares-vix", "helmet": "helmet-insure", "mix": "mixmarvel", "bytz": "slate", "cas": "cashaa", "apy": "apy-finance", "fst": "futureswap", "bank": "float-protocol", "mitx": "morpheus-labs", "gal": "galatasaray-fan-token", "nas": "nebulas", "prob": "probit-exchange", "gto": "gifto", "fcl": "fractal", "pool": "pooltogether", "lpool": "launchpool", "pi": "pchain", "lcc": "litecoin-cash", "cvnt": "content-value-network", "nav": "nav-coin", "ujenny": "jenny-metaverse-dao-token", "hunt": "hunt-token", "key": "selfkey", "cocos": "cocos-bcx", "upunk": "unicly-cryptopunks-collection", "wcres": "wrapped-crescofin", "gvt": "genesis-vision", "via": "viacoin", "yve-crvdao": "vecrv-dao-yvault", "xdn": "digitalnote", "lmt": "lympo-market-token", "inv": "inverse-finance", "acm": "ac-milan-fan-token", "troy": "troy", "el": "elysia", "blank": "blank", "dht": "dhedge-dao", "yvault-lp-ycurve": "yvault-lp-ycurve", "zap": "zap", "mdt": "measurable-data-token", "nmc": "namecoin", "mark": "benchmark-protocol", "trias": "trias-token", "xed": "exeedme", "fct": "factom", "polk": "polkamarkets", "kan": "kan", "ubxt": "upbots", "pre": "presearch", "oil": "oiler", "six": "six-network", "belt": "belt", "dyn": "dynamic", "deus": "deus-finance", "sdt": "stake-dao", "wxt": "wirex", "lcx": "lcx", "polx": "polylastic", "cvp": "concentrated-voting-power", "bbr": "bitberry-token", "flx": "reflexer-ungovernance-token", "webd": "webdollar", "ode": "odem", "tct": "tokenclub", "zoom": "coinzoom-token", "cmt": "cybermiles", "ones": "oneswap-dao-token", "like": "likecoin", "sylo": "sylo", "trtl": "turtlecoin", "marsh": "unmarshal", "crpt": "crypterium", "cut": "cutcoin", "layer": "unilayer", "impulse": "impulse-by-fdr", "bscx": "bscex", "idle": "idle", "cover": "cover-protocol", "mpl": "maple-finance", "oce": "oceanex-token", "yam": "yam-2", "props": "props", "unc": "unicrypt", "ichi": "ichi-farm", "pbtc35a": "pbtc35a", "ddim": "duckdaodime", "glq": "graphlinq-protocol", "anj": "anj", "xcur": "curate", "ask": "permission-coin", "kex": "kira-network", "tidal": "tidal-finance", "mtv": "multivac", "aleph": "aleph", "plu": "pluton", "qrl": "quantum-resistant-ledger", "uncx": "unicrypt-2", "fic": "filecash", "unn": "union-protocol-governance-token", "axel": "axel", "safe2": "safe2", "fund": "unification", "filda": "filda", "mda": "moeda-loyalty-points", "ppay": "plasma-finance", "strong": "strong", "ltx": "lattice-token", "sparta": "spartan-protocol-token", "nct": "polyswarm", "kine": "kine-protocol", "polydoge": "polydoge", "ubq": "ubiq", "spnd": "spendcoin", "myst": "mysterium", "arch": "archer-dao-governance-token", "kono": "konomi-network", "spank": "spankchain", "axn": "axion", "aitra": "aitra", "ousd": "origin-dollar", "pbtc": "ptokens-btc", "rfuel": "rio-defi", "coin": "coinvest", "dora": "dora-factory", "ovr": "ovr", "jrt": "jarvis-reward-token", "xend": "xend-finance", "cws": "crowns", "bitx": "bitscreener", "vfox": "vfox", "mtlx": "mettalex", "orai": "oraichain-token", "opct": "opacity", "adp": "adappter-token", "bux": "blockport", "propel": "payrue", "labs": "labs-group", "credit": "credit", "si": "siren", "lym": "lympo", "amlt": "coinfirm-amlt", "ctx": "cryptex-finance", "socks": "unisocks", "superbid": "superbid", "mobi": "mobius", "vee": "blockv", "oddz": "oddz", "etp": "metaverse-etp", "rbc": "rubic", "block": "blocknet", "dxd": "dxdao", "bmxx": "multiplier-bsc", "wabi": "wabi", "tips": "fedoracoin", "ablock": "any-blocknet", "hget": "hedget", "swftc": "swftcoin", "bix": "bibox-token", "egg": "goose-finance", "pickle": "pickle-finance", "vrx": "verox", "prcy": "prcy-coin", "sake": "sake-token", "cs": "credits", "wom": "wom-token", "foam": "foam-protocol", "combo": "furucombo", "ost": "simple-token", "meme": "degenerator", "eosc": "eosforce", "part": "particl", "ngm": "e-money", "brd": "bread", "axis": "axis-defi", "tfb": "truefeedbackchain", "k21": "k21", "umb": "umbrella-network", "dec": "decentr", "ice": "ice-token", "san": "santiment-network-token", "cate": "catecoin", "mork": "mork", "mtrg": "meter", "ndx": "indexed-finance", "value": "value-liquidity", "pendle": "pendle", "wgr": "wagerr", "swrv": "swerve-dao", "dextf": "dextf", "spc": "spacechain-erc-20", "abt": "arcblock", "btc2": "bitcoin-2", "cofi": "cofix", "cgg": "chain-guardians", "sfuel": "sparkpoint-fuel", "cbc": "cashbet-coin", "cdt": "blox", "mxx": "multiplier", "hord": "hord", "agve": "agave-token", "koge": "bnb48-club-token", "hny": "honey", "dtx": "databroker-dao", "sdefi": "sdefi", "defi5": "defi-top-5-tokens-index", "dough": "piedao-dough-v2", "onion": "deeponion", "psl": "pastel", "yop": "yield-optimization-platform", "tau": "lamden", "woofy": "woofy", "trade": "unitrade", "dust": "dust-token", "pnd": "pandacoin", "poolz": "poolz-finance", "enq": "enq-enecuum", "naos": "naos-finance", "bmc": "bountymarketcap", "iqn": "iqeon", "adk": "aidos-kuneen", "hzn": "horizon-protocol", "rby": "rubycoin", "spore": "spore-finance-2", "niox": "autonio", "abl": "airbloc-protocol", "mwat": "restart-energy", "evx": "everex", "cnfi": "connect-financial", "shopx": "splyt", "mbtc": "mstable-btc", "tnb": "time-new-bank", "poa": "poa-network", "xfund": "xfund", "xmx": "xmax", "xio": "xio", "txl": "tixl-new", "cov": "covesting", "jul": "jul", "saito": "saito", "wpr": "wepower", "game": "gamecredits", "dfd": "defidollar-dao", "plr": "pillar", "nebo": "csp-dao-network", "hakka": "hakka-finance", "synx": "syndicate", "push": "ethereum-push-notification-service", "scc": "stakecube", "dusd": "defidollar", "nec": "nectar-token", "dev": "dev-protocol", "razor": "razor-network", "bac": "basis-cash", "shroom": "shroom-finance", "xcash": "x-cash", "quai": "quai-dao", "iov": "starname", "bdp": "big-data-protocol", "white": "whiteheart", "cht": "coinhe-token", "aoa": "aurora", "xava": "avalaunch", "coval": "circuits-of-value", "pkf": "polkafoundry", "yla": "yearn-lazy-ape", "appc": "appcoins", "rocks": "rocki", "nfy": "non-fungible-yearn", "plot": "plotx", "ptf": "powertrade-fuel", "b21": "b21", "nlg": "gulden", "oax": "openanx", "fuse": "fuse-network-token", "ncash": "nucleus-vision", "xpx": "proximax", "fnt": "falcon-token", "sngls": "singulardtv", "nyzo": "nyzo", "rio": "realio-network", "raini": "rainicorn", "sdx": "swapdex", "koin": "koinos", "act": "achain", "og": "og-fan-token", "udoo": "howdoo", "asr": "as-roma-fan-token", "xla": "stellite", "robot": "robot", "tcake": "pancaketools", "star": "starbase", "gth": "gather", "world": "world-token", "kit": "dexkit", "msp": "mothership", "krl": "kryll", "hvn": "hiveterminal", "wdc": "worldcoin", "bwf": "beowulf", "egt": "egretia", "chi": "chimaera", "yaxis": "yaxis", "lix": "lixir-protocol", "uip": "unlimitedip", "valor": "smart-valor", "vib": "viberate", "qlc": "qlink", "zt": "ztcoin", "stn": "stone-token", "ele": "eleven-finance", "pros": "prosper", "cnns": "cnns", "shift": "shift", "muse": "muse-2", "apm": "apm-coin", "sph": "spheroid-universe", "rev": "revain", "shft": "shyft-network-2", "open": "open-governance-token", "fuel": "fuel-token", "brew": "cafeswap-token", "apys": "apyswap", "nix": "nix-platform", "meth": "mirrored-ether", "vex": "vexanium", "exnt": "exnetwork-token", "must": "must", "alpa": "alpaca", "emc": "emercoin", "hit": "hitchain", "dhc": "deltahub-community", "crep": "compound-augur", "lien": "lien", "umx": "unimex-network", "unistake": "unistake", "roobee": "roobee", "minds": "minds", "raze": "raze-network", "pay": "tenx", "room": "option-room", "top": "top-network", "abyss": "the-abyss", "mint": "public-mint", "reap": "reapchain", "ach": "alchemy-pay", "ftc": "feathercoin", "gmt": "gambit", "oin": "oin-finance", "nft": "nft-protocol", "julien": "julien", "dmd": "diamond", "time": "chronobank", "swg": "swirge", "kpad": "kickpad", "l2": "leverj-gluon", "dafi": "dafi-protocol", "ruff": "ruff", "octo": "octofi", "mth": "monetha", "usf": "unslashed-finance", "watch": "yieldwatch", "ixc": "ixcoin", "its": "iteration-syndicate", "pma": "pumapay", "sense": "sense", "btx": "bitcore", "yfl": "yflink", "xmy": "myriadcoin", "shard": "shard", "dlt": "agrello", "gains": "gains", "smt": "smartmesh", "wolf": "moonwolf-io", "utnp": "universa", "eng": "enigma", "axpr": "axpire", "chp": "coinpoker", "efx": "effect-network", "cntr": "centaur", "bird": "bird-money", "cwbtc": "compound-wrapped-btc", "ktn": "kattana", "ruler": "ruler-protocol", "haus": "daohaus", "daofi": "daofi", "ibbtc": "interest-bearing-bitcoin", "matter": "antimatter", "rsv": "reserve", "awx": "auruscoin", "la": "latoken", "mds": "medishares", "hy": "hybrix", "nds": "nodeseeds", "crbn": "carbon", "npx": "napoleon-x", "yf-dai": "yfdai-finance", "dta": "data", "grid": "grid", "geo": "geodb", "cti": "clintex-cti", "onx": "onx-finance", "gnx": "genaro-network", "ocn": "odyssey", "swag": "swag-finance", "bcp": "bitcashpay", "prt": "portion", "argon": "argon", "chg": "charg-coin", "vidya": "vidya", "dmg": "dmm-governance", "man": "matrix-ai-network", "cvx": "convex-finance", "srn": "sirin-labs-token", "nsure": "nsure-network", "dov": "dovu", "wasabi": "wasabix", "itc": "iot-chain", "hpb": "high-performance-blockchain", "bry": "berry-data", "boom": "boom-token", "euno": "euno", "etho": "ether-1", "dos": "dos-network", "upi": "pawtocol", "swm": "swarm", "rbase": "rbase-finance", "zefu": "zenfuse", "flo": "flo", "cv": "carvertical", "linka": "linka", "pefi": "penguin-finance", "lnchx": "launchx", "0xbtc": "oxbitcoin", "deri": "deri-protocol", "rendoge": "rendoge", "edda": "eddaswap", "asp": "aspire", "vnla": "vanilla-network", "par": "parachute", "fdr": "french-digital-reserve", "urus": "urus-token", "klp": "kulupu", "ong": "ong-social", "tera": "tera-smart-money", "raven": "raven-protocol", "gxt": "gem-exchange-and-trading", "gmee": "gamee", "cvn": "cvcoin", "dvg": "daoventures", "xpat": "pangea", "btcz": "bitcoinz", "twin": "twinci", "aur": "auroracoin", "bas": "basis-share", "paint": "paint", "fsw": "fsw-token", "bskt": "basketcoin", "auscm": "auric-network", "idea": "ideaology", "uncl": "uncl", "wild": "wilder-world", "urqa": "ureeqa", "xeq": "triton", "zig": "zignaly", "xcp": "counterparty", "arcx": "arc-governance", "aga": "aga-token", "ntk": "neurotoken", "dgtx": "digitex-futures-exchange", "tra": "trabzonspor-fan-token", "dappt": "dapp-com", "uniq": "uniqly", "safe": "safe-coin-2", "btcp": "bitcoin-private", "gen": "daostack", "tkn": "tokencard", "geeq": "geeq", "you": "you-chain", "premia": "premia", "ghost": "ghost-by-mcafee", "blk": "blackcoin", "xtk": "xtoken", "ezw": "ezoow", "$anrx": "anrkey-x", "b20": "b20", "btc2x-fli": "btc-2x-flexible-leverage-index", "tky": "thekey", "rmt": "sureremit", "mfb": "mirrored-facebook", "cnn": "cnn", "nord": "nord-finance", "drc": "digital-reserve-currency", "amn": "amon", "kat": "kambria", "amb": "amber", "pipt": "power-index-pool-token", "phr": "phore", "elg": "escoin-token", "dashd": "dash-diamond", "bxc": "bitcoin-classic", "ten": "tokenomy", "wings": "wings", "dyp": "defi-yield-protocol", "phnx": "phoenixdao", "satt": "satt", "euler": "euler-tools", "tao": "taodao", "jup": "jupiter", "hyve": "hyve", "bgov": "bgov", "jur": "jur", "ads": "adshares", "degen": "degen-index", "alias": "spectrecoin", "lua": "lua-token", "yee": "yee", "cc10": "cryptocurrency-top-10-tokens-index", "stv": "sint-truidense-voetbalvereniging", "1337": "e1337", "bpro": "b-protocol", "blt": "bloom", "gro": "growth-defi", "tcap": "total-crypto-market-cap-token", "xlq": "alqo", "snow": "snowswap", "int": "internet-node-token", "maha": "mahadao", "xft": "offshift", "bbc": "tradove", "token": "chainswap", "eosdt": "equilibrium-eosdt", "gswap": "gameswap-org", "bles": "blind-boxes", "bis": "bismuth", "pcnt": "playcent", "xst": "stealthcoin", "mgs": "mirrored-goldman-sachs", "owc": "oduwa-coin", "kton": "darwinia-commitment-token", "pla": "plair", "giv": "givly-coin", "neu": "neumark", "tern": "ternio", "idna": "idena", "bart": "bartertrade", "gum": "gourmetgalaxy", "mabnb": "mirrored-airbnb", "arth": "arth", "hbd": "hive_dollar", "erc20": "erc20", "sepa": "secure-pad", "drt": "domraider", "bkbt": "beekan", "instar": "insights-network", "trtt": "trittium", "vvt": "versoview", "sync": "sync-network", "ugas": "ultrain", "toa": "toacoin", "bcdt": "blockchain-certified-data-token", "dows": "shadows", "sig": "xsigma", "true": "true-chain", "gfarm2": "gains-v2", "pinkm": "pinkmoon", "epan": "paypolitan-token", "avt": "aventus", "fnx": "finnexus", "yield": "yield-protocol", "auc": "auctus", "mfg": "smart-mfg", "play": "herocoin", "wiz": "crowdwiz", "dun": "dune", "yfiii": "dify-finance", "acxt": "ac-exchange-token", "defi+l": "piedao-defi-large-cap", "dime": "dimecoin", "crwny": "crowny-token", "put": "putincoin", "nbx": "netbox-coin", "fair": "fairgame", "vbk": "veriblock", "aid": "aidcoin", "can": "canyacoin", "gleec": "gleec-coin", "ut": "ulord", "glc": "goldcoin", "777": "jackpot", "epic": "epic-cash", "unifi": "unifi", "doki": "doki-doki-finance", "deto": "delta-exchange-token", "prc": "partner", "grc": "gridcoin-research", "smg": "smaugs-nft", "oap": "openalexa-protocol", "uaxie": "unicly-mystic-axies-collection", "exrn": "exrnchain", "mtc": "medical-token-currency", "qrk": "quark", "mic": "mith-cash", "stbu": "stobox-token", "utu": "utu-coin", "spa": "sperax", "sashimi": "sashimi", "nuts": "squirrel-finance", "midas": "midas", "asko": "askobar-network", "mvp": "merculet", "lkr": "polkalokr", "ditto": "ditto", "kek": "cryptokek", "dgx": "digix-gold", "mvi": "metaverse-index", "cloak": "cloakcoin", "cot": "cotrader", "pot": "potcoin", "umask": "unicly-hashmasks-collection", "bitcny": "bitcny", "olt": "one-ledger", "comfi": "complifi", "qun": "qunqun", "etha": "etha-lend", "equad": "quadrant-protocol", "cgt": "cache-gold", "veo": "amoveo", "mdo": "midas-dollar", "cmp": "component", "daps": "daps-token", "agar": "aga-rewards-2", "xpm": "primecoin", "zco": "zebi", "bnsd": "bnsd-finance", "pink": "pinkcoin", "ess": "essentia", "bask": "basketdao", "balpha": "balpha", "surf": "surf-finance", "coll": "collateral-pay", "fry": "foundrydao-logistics", "kangal": "kangal", "sin": "suqa", "kko": "kineko", "ucash": "ucash", "dsd": "dynamic-set-dollar", "tnt": "tierion", "gcr": "global-coin-research", "roya": "royale", "ccx": "conceal", "mm": "mm-token", "snob": "snowball-token", "dis": "tosdis", "obot": "obortech", "arte": "ethart", "assy": "assy-index", "pnode": "pinknode", "snc": "suncontract", "zhegic": "zhegic", "isp": "ispolink", "bitg": "bitcoin-green", "mtn": "medicalchain", "sta": "statera", "spdr": "spiderdao", "sgt": "sharedstake-governance-token", "eved": "evedo", "sata": "signata", "uwl": "uniwhales", "seen": "seen", "efl": "electronicgulden", "tad": "tadpole-finance", "acat": "alphacat", "omni": "omni", "veil": "veil", "chonk": "chonk", "mthd": "method-fi", "inf": "infinitus-token", "smartcredit": "smartcredit-token", "ixi": "ixicash", "uuu": "u-network", "yoyow": "yoyow", "qrx": "quiverx", "sxrp": "sxrp", "let": "linkeye", "th": "team-heretics-fan-token", "sign": "signaturechain", "gear": "bitgear", "klonx": "klondike-finance-v2", "punk-basic": "punk-basic", "nka": "incakoin", "xpc": "experience-chain", "exy": "experty", "scp": "siaprime-coin", "dax": "daex", "ok": "okcash", "sumo": "sumokoin", "inxt": "internxt", "2gt": "2gether-2", "xrc": "bitcoin-rhodium", "cpc": "cpchain", "fwb": "friends-with-benefits-pro", "sale": "dxsale-network", "kif": "kittenfinance", "stzen": "stakedzen", "42": "42-coin", "unidx": "unidex", "mamc": "mirrored-amc-entertainment", "ppp": "paypie", "zcl": "zclassic", "skm": "skrumble-network", "fvt": "finance-vote", "bta": "bata", "hbt": "habitat", "wish": "mywish", "vsf": "verisafe", "flash": "flash-stake", "fls": "flits", "adb": "adbank", "lxt": "litex", "tube": "bittube", "ddd": "scry-info", "vision": "apy-vision", "red": "red", "bet": "eosbet", "force": "force-dao", "banana": "apeswap-finance", "azuki": "azuki", "imt": "moneytoken", "cure": "curecoin", "masq": "masq", "mfi": "marginswap", "prare": "polkarare", "mars": "mars", "soar": "soar-2", "yeed": "yggdrash", "lba": "libra-credit", "qbx": "qiibee", "lotto": "lotto", "eosdac": "eosdac", "aog": "smartofgiving", "thc": "hempcoin-thc", "esp": "espers", "uop": "utopia-genesis-foundation", "tdx": "tidex-token", "bnf": "bonfi", "rel": "release-ico-project", "ac": "acoconut", "pgt": "polyient-games-governance-token", "waif": "waifu-token", "infs": "infinity-esaham", "vibe": "vibe", "start": "bscstarter", "ngc": "naga", "sota": "sota-finance", "pgl": "prospectors-gold", "nty": "nexty", "smty": "smoothy", "catt": "catex-token", "n8v": "wearesatoshi", "gysr": "geyser", "gard": "hashgard", "frc": "freicoin", "cur": "curio", "xbc": "bitcoin-plus", "dat": "datum", "hnst": "honest-mining", "xvix": "xvix", "crw": "crown", "flex": "flex-coin", "mgme": "mirrored-gamestop", "pbr": "polkabridge", "nlc2": "nolimitcoin", "tfl": "trueflip", "ybo": "young-boys-fan-token", "cai": "club-atletico-independiente", "chx": "chainium", "cops": "cops-finance", "kebab": "kebab-token", "mue": "monetaryunit", "astro": "astrotools", "road": "yellow-road", "pasc": "pascalcoin", "oro": "oro", "chads": "chads-vc", "voice": "nix-bridge-token", "evt": "everitoken", "dmst": "dmst", "$based": "based-money", "smly": "smileycoin", "eye": "beholder", "mrc": "meritcoins", "edn": "edenchain", "vault": "vault", "hyc": "hycon", "ctxc": "cortex", "dgcl": "digicol-token", "zora": "zoracles", "becn": "beacon", "mt": "mytoken", "mega": "megacryptopolis", "res": "resfinex-token", "adc": "audiocoin", "defi++": "piedao-defi", "trst": "wetrust", "fera": "fera", "polc": "polka-city", "rnt": "oneroot-network", "tap": "tapmydata", "fti": "fanstime", "xbtc": "xbtc", "pfl": "professional-fighters-league-fan-token", "mcx": "machix", "cali": "calicoin", "tit": "titcoin", "pry": "prophecy", "trio": "tripio", "bti": "bitcoin-instant", "corn": "cornichon", "tent": "snowgem", "rws": "robonomics-web-services", "pgn": "pigeoncoin", "csai": "compound-sai", "mog": "mogwai", "opt": "open-predict-token", "zdex": "zeedex", "2key": "2key", "ktlyo": "katalyo", "jade": "jade-currency", "zp": "zen-protocol", "bnkr": "bankroll-network", "pigx": "pigx", "lead": "lead-token", "zer": "zero", "rem": "remme", "imx": "impermax", "stack": "stacker-ventures", "cns": "centric-cash", "udo": "unido-ep", "cpay": "cryptopay", "d": "denarius", "mgo": "mobilego", "yeti": "yearn-ecosystem-token-index", "tret": "tourist-review-token", "kndc": "kanadecoin", "nanj": "nanjcoin", "four": "the-4th-pillar", "web": "webcoin", "shdc": "shd-cash", "hgold": "hollygold", "aln": "aluna", "yec": "ycash", "dav": "dav", "dfsocial": "defisocial", "nrch": "enreachdao", "rfi": "reflect-finance", "bob": "bobs_repair", "idrt": "rupiah-token", "hyn": "hyperion", "vrc": "vericoin", "nyan-2": "nyan-v2", "dfio": "defi-omega", "dets": "dextrust", "zpae": "zelaapayae", "cat": "cat-token", "rac": "rac", "idh": "indahash", "bull": "buysell", "crdt": "crdt", "bfly": "butterfly-protocol-2", "uct": "ucot", "n3rdz": "n3rd-finance", "mer": "mercury", "stsla": "stsla", "donut": "donut", "updog": "updog", "yft": "yield-farming-token", "bomb": "bomb", "spice": "spice-finance", "hfs": "holderswap", "exrt": "exrt-network", "stbz": "stabilize", "vxt": "virgox-token", "enb": "earnbase", "warp": "warp-finance", "modic": "modern-investment-coin", "bree": "cbdao", "ait": "aichain", "base": "base-protocol", "chart": "chartex", "iic": "intelligent-investment-chain", "renzec": "renzec", "pvt": "pivot-token", "ethix": "ethichub", "excl": "exclusivecoin", "scifi": "scifi-finance", "snet": "snetwork", "box": "contentbox", "hsc": "hashcoin", "add": "add-xyz-new", "afen": "afen-blockchain", "bc": "bitcoin-confidential", "rare": "unique-one", "sada": "sada", "xiot": "xiotri", "ag8": "atromg8", "adm": "adamant-messenger", "deflct": "deflect", "cbm": "cryptobonusmiles", "ptoy": "patientory", "bxy": "beaxy-exchange", "troll": "trollcoin", "zip": "zip", "htre": "hodltree", "dotx": "deli-of-thrones", "polis": "polis", "sfd": "safe-deal", "adel": "akropolis-delphi", "cap": "cap", "build": "build-finance", "taco": "tacos", "dgvc": "degenvc", "gat": "gatcoin", "uat": "ultralpha", "rating": "dprating", "rage": "rage-fan", "zxc": "0xcert", "alch": "alchemy-dao", "xas": "asch", "bcv": "bcv", "eggp": "eggplant-finance", "edu": "educoin", "bitto": "bitto-exchange", "zlot": "zlot", "kgo": "kiwigo", "pirate": "piratecash", "pylon": "pylon-finance", "rox": "robotina", "1wo": "1world", "l3p": "lepricon", "elx": "energy-ledger", "launch": "superlauncher", "aux": "auxilium", "swfl": "swapfolio", "family": "the-bitcoin-family", "fdd": "frogdao-dime", "elec": "electrify-asia", "coni": "coinbene-token", "ufr": "upfiring", "defi+s": "piedao-defi-small-cap", "tx": "transfercoin", "mofi": "mobifi", "otb": "otcbtc-token", "ibfk": "istanbul-basaksehir-fan-token", "mcm": "mochimo", "rpd": "rapids", "cor": "coreto", "wdgld": "wrapped-dgld", "emt": "emanate", "adco": "advertise-coin", "vips": "vipstarcoin", "pie": "defipie", "xdna": "extradna", "ugotchi": "unicly-aavegotchi-astronauts-collection", "gst2": "gastoken", "bcug": "blockchain-cuties-universe-governance", "skull": "skull", "moons": "moontools", "vig": "vig", "tft": "the-famous-token", "pmgt": "perth-mint-gold-token", "fmg": "fm-gallery", "tico": "topinvestmentcoin", "fin": "definer", "metric": "metric-exchange", "azr": "aezora", "fdz": "friendz", "zeit": "zeitcoin", "ldfi": "lendefi", "bto": "bottos", "vtx": "vortex-defi", "nfti": "nft-index", "xaur": "xaurum", "cliq": "deficliq", "yae": "cryptonovae", "znz": "zenzo", "move": "holyheld-2", "btb": "bitball", "dit": "inmediate", "cash": "litecash", "flixx": "flixxo", "crx": "cryptex", "fdo": "firdaos", "tpay": "tokenpay", "krb": "karbo", "fyz": "fyooz", "all": "alliance-fan-token", "inft": "infinito", "zipt": "zippie", "feed": "feed-token", "lobs": "lobstex-coin", "lock": "meridian-network", "nobl": "noblecoin", "vol": "volume-network-token", "mzc": "maza", "font": "font", "sav3": "sav3", "tos": "thingsoperatingsystem", "msr": "masari", "wheat": "wheat-token", "myx": "myx-network", "dogec": "dogecash", "hbn": "hobonickels", "vcn": "versacoin", "gdao": "governor-dao", "atn": "atn", "rvf": "rocket-vault-finance", "8pay": "8pay", "toshi": "toshi-token", "ppblz": "pepemon-pepeballs", "mwg": "metawhale-gold", "dth": "dether", "cdzc": "cryptodezirecash", "wlt": "wealth-locks", "reosc": "reosc-ecosystem", "hush": "hush", "share": "seigniorage-shares", "sub": "substratum", "dacc": "dacc", "pis": "polkainsure-finance", "ogo": "origo", "stk": "stk", "whirl": "whirl-finance", "pst": "primas", "vrs": "veros", "etz": "etherzero", "komet": "komet", "hlc": "halalchain", "swirl": "swirl-cash", "hmq": "humaniq", "foto": "unique-photo", "odin": "odin-protocol", "omx": "project-shivom", "plura": "pluracoin", "ryo": "ryo", "iht": "iht-real-estate-protocol", "sact": "srnartgallery", "ionc": "ionchain-token", "reec": "renewableelectronicenergycoin", "edc": "edc-blockchain", "cv2": "colossuscoin-v2", "kcal": "phantasma-energy", "gex": "globex", "ladz": "ladz", "urac": "uranus", "ors": "origin-sport", "stacy": "stacy", "eko": "echolink", "ftx": "fintrux", "rte": "rate3", "gfx": "gamyfi-token", "ysec": "yearn-secure", "error": "484-fund", "aaa": "app-alliance-association", "monk": "monkey-project", "jntr": "jointer", "spn": "sapien", "totm": "totemfi", "gse": "gsenetwork", "zcc": "zccoin", "fyd": "find-your-developer", "qwc": "qwertycoin", "own": "owndata", "cnus": "coinus", "use": "usechain", "xmon": "xmon", "snov": "snovio", "dogown": "dog-owner", "mnc": "maincoin", "gyen": "gyen", "banca": "banca", "power": "unipower", "pta": "petrachor", "ufo": "ufocoin", "pct": "percent", "imo": "imo", "portal": "portal", "nov": "novara-calcio-fan-token", "ind": "indorse", "peg": "pegnet", "tol": "tolar", "xiv": "project-inverse", "pny": "peony-coin", "tie": "ties-network", "ttn": "titan-coin", "tzc": "trezarcoin", "aidoc": "ai-doctor", "dexg": "dextoken-governance", "evc": "eventchain", "gmat": "gowithmi", "ypie": "piedao-yearn-ecosystem-pie", "xp": "xp", "xnk": "ink-protocol", "ovc": "ovcode", "btc++": "piedao-btc", "ndr": "noderunners", "mtx": "matryx", "meri": "merebel", "ubex": "ubex", "ptt": "proton-token", "boost": "boosted-finance", "holy": "holyheld", "bbp": "biblepay", "dam": "datamine", "nftp": "nft-platform-index", "groot": "growth-root", "bscv": "bscview", "psi": "passive-income", "axi": "axioms", "mmo": "mmocoin", "fjc": "fujicoin", "buzz": "buzzcoin", "adt": "adtoken", "sxag": "sxag", "max": "maxcoin", "tff": "tutti-frutti-finance", "egem": "ethergem", "next": "nextexchange", "xnv": "nerva", "fxt": "fuzex", "spx": "sp8de", "malw": "malwarechain", "blue": "blue", "excc": "exchangecoin", "debase": "debase", "pasta": "spaghetti", "tme": "tama-egg-niftygotchi", "bfi": "bearn-fi", "mntis": "mantis-network", "exf": "extend-finance", "shnd": "stronghands", "telos": "telos-coin", "crea": "creativecoin", "hand": "showhand", "mao": "mao-zedong", "ncdt": "nuco-cloud", "yeld": "yeld-finance", "sphr": "sphere", "dank": "mu-dank", "stop": "satopay", "slm": "solomon-defi", "zut": "zero-utility-token", "loot": "nftlootbox", "xfi": "xfinance", "unic": "unicly", "pgu": "polyient-games-unity", "bos": "boscoin-2", "face": "face", "octi": "oction", "tac": "traceability-chain", "ssp": "smartshare", "cova": "covalent-cova", "zmn": "zmine", "lcs": "localcoinswap", "chnd": "cashhand", "npxsxem": "pundi-x-nem", "pak": "pakcoin", "onc": "one-cash", "ven": "impulseven", "ocp": "omni-consumer-protocol", "unl": "unilock-network", "isla": "insula", "gbx": "gobyte", "doges": "dogeswap", "coil": "coil-crypto", "eca": "electra", "dds": "dds-store", "rvx": "rivex-erc20", "ss": "sharder-protocol", "noahp": "noah-coin", "img": "imagecoin", "snn": "sechain", "btcs": "bitcoin-scrypt", "bits": "bitstar", "thirm": "thirm-protocol", "ecom": "omnitude", "ipc": "ipchain", "ifund": "unifund", "her": "hero-node", "mmaon": "mmaon", "tns": "transcodium", "milk2": "spaceswap-milk2", "bone": "bone", "ric": "riecoin", "trust": "trust", "lyr": "lyra", "rot": "rotten", "semi": "semitoken", "bsty": "globalboost", "tango": "keytango", "mota": "motacoin", "dpy": "delphy", "upx": "uplexa", "woa": "wrapped-origin-axie", "zrc": "zrcoin", "gene": "parkgene", "xwp": "swap", "xdex": "xdefi-governance-token", "degov": "degov", "ion": "ion", "ethv": "ethverse", "ent": "eternity", "sxau": "sxau", "alv": "allive", "grim": "grimcoin", "datx": "datx", "vdx": "vodi-x", "fast": "fastswap", "cspn": "crypto-sports", "hac": "hackspace-capital", "xgg": "10x-gg", "pht": "lightstreams", "abx": "arbidex", "latx": "latiumx", "toc": "touchcon", "vox": "vox-finance", "zpt": "zeepin", "ink": "ink", "bund": "bundles", "fusii": "fusible", "lmy": "lunch-money", "cue": "cue-protocol", "ctask": "cryptotask-2", "udoki": "unicly-doki-doki-collection", "ncc": "neurochain", "eqt": "equitrader", "btcv": "bitcoinv", "xmg": "magi", "dct": "decent", "bkc": "facts", "aval": "avaluse", "tnc": "trinity-network-credit", "mis": "mithril-share", "twa": "adventure-token", "stq": "storiqa", "mbn": "membrana-platform", "fxp": "fxpay", "lnd": "lendingblock", "jamm": "flynnjamm", "bdg": "bitdegree", "almx": "almace-shards", "sib": "sibcoin", "axe": "axe", "cag": "change", "goat": "goatcoin", "dvt": "devault", "ubeeple": "unicly-beeple-collection", "bether": "bethereum", "yvs": "yvs-finance", "gofi": "goswapp", "bbk": "bitblocks-project", "depay": "depay", "ely": "elysian", "rom": "rom-token", "zusd": "zusd", "dft": "defiat", "hgt": "hellogold", "vi": "vid", "tbb": "trade-butler-bot", "sct": "clash-token", "at": "abcc-token", "senpai": "project-senpai", "comb": "combine-finance", "ldoge": "litedoge", "qbt": "qbao", "zsc": "zeusshield", "tbx": "tokenbox", "ggtk": "gg-token", "alt": "alt-estate", "kennel": "token-kennel", "chai": "chai", "vdl": "vidulum", "trc": "terracoin", "poe": "poet", "dyt": "dynamite", "gap": "gapcoin", "ethy": "ethereum-yield", "xlr": "solaris", "lun": "lunyr", "gmc": "gokumarket-credit", "dws": "dws", "bgg": "bgogo", "xbp": "blitzpredict", "cbix": "cubiex", "ntbc": "note-blockchain", "senc": "sentinel-chain", "etm": "en-tan-mo", "crp": "utopia", "fyp": "flypme", "rmpl": "rmpl", "lqd": "liquidity-network", "send": "social-send", "hqx": "hoqu", "steep": "steepcoin", "ethys": "ethereum-stake", "sbnb": "sbnb", "tsf": "teslafunds", "ptm": "potentiam", "pria": "pria", "onl": "on-live", "tcc": "the-champcoin", "cnb": "coinsbit-token", "ozc": "ozziecoin", "renbch": "renbch", "btdx": "bitcloud", "lx": "lux", "x42": "x42-protocol", "wg0": "wrapped-gen-0-cryptokitties", "dogefi": "dogefi", "jet": "jetcoin", "$rope": "rope", "qch": "qchi", "swt": "swarm-city", "pipl": "piplcoin", "flot": "fire-lotto", "pylnt": "pylon-network", "shake": "spaceswap-shake", "lid": "liquidity-dividends-protocol", "s": "sharpay", "plus1": "plusonecoin", "bcdn": "blockcdn", "alley": "nft-alley", "revo": "revomon", "ken": "keysians-network", "nor": "bring", "srh": "srcoin", "saud": "saud", "brdg": "bridge-protocol", "fire": "fire-protocol", "ptn": "palletone", "cheese": "cheese", "zcr": "zcore", "etg": "ethereum-gold", "arq": "arqma", "kerman": "kerman", "svx": "savix", "bnty": "bounty0x", "dope": "dopecoin", "tsuki": "tsuki-dao", "rito": "rito", "ppy": "peerplays", "arms": "2acoin", "alex": "alex", "ieth": "ieth", "ehrt": "eight-hours", "yuki": "yuki-coin", "bntx": "bintex-futures", "c2c": "ctc", "ethbn": "etherbone", "tix": "blocktix", "pch": "popchain", "orcl5": "oracle-top-5", "mec": "megacoin", "spd": "stipend", "mib": "mib-coin", "yfte": "yftether", "bitt": "bittoken", "cato": "catocoin", "fsxu": "flashx-ultra", "ptc": "pesetacoin", "sphtx": "sophiatx", "mat": "bitsum", "d4rk": "darkpaycoin", "swing": "swing", "esbc": "e-sport-betting-coin", "priv": "privcy", "hue": "hue", "rvt": "rivetz", "bouts": "boutspro", "grft": "graft-blockchain", "setc": "setc", "kolin": "kolin", "mush": "mushroom", "rpt": "rug-proof", "wck": "wrapped-cryptokitties", "sxmr": "sxmr", "tch": "tigercash", "tmt": "traxia", "cxn": "cxn-network", "eve": "devery", "sishi": "sishi-finance", "tend": "tendies", "scex": "scex", "trnd": "trendering", "tcore": "tornadocore", "pkg": "pkg-token", "undg": "unidexgas", "corx": "corionx", "lync": "lync-network", "trvc": "thrivechain", "bir": "birake", "beet": "beetle-coin", "1mt": "1million-token", "ucm": "ucrowdme", "deb": "debitum-network", "myb": "mybit-token", "bez": "bezop", "jump": "jumpcoin", "defo": "defhold", "ugc": "ugchain", "amm": "micromoney", "bth": "bithereum", "dem": "deutsche-emark", "esk": "eska", "mwbtc": "metawhale-btc", "quin": "quinads", "bloc": "blockcloud", "ziot": "ziot", "1up": "uptrennd", "asafe": "allsafe", "cmct": "crowd-machine", "wand": "wandx", "aem": "atheneum", "ore": "oreo", "chop": "porkchop", "tcash": "tcash", "wqt": "work-quest", "nbc": "niobium-coin", "vlu": "valuto", "ff": "forefront", "bcpt": "blockmason-credit-protocol", "sds": "alchemint", "type": "typerium", "tdp": "truedeck", "yfd": "yfdfi-finance", "ppdex": "pepedex", "fud": "fudfinance", "slr": "solarcoin", "berry": "rentberry", "haut": "hauteclere-shards-2", "undb": "unibot-cash", "kgc": "krypton-token", "mas": "midas-protocol", "amz": "amazonacoin", "bltg": "bitcoin-lightning", "peps": "pepegold", "women": "womencoin", "kubo": "kubocoin", "nfxc": "nfx-coin", "wfil": "wrapped-filecoin", "a": "alpha-platform", "bear": "arcane-bear", "2give": "2give", "x8x": "x8-project", "pc": "promotionchain", "ntrn": "neutron", "kobo": "kobocoin", "ifex": "interfinex-bills", "r3fi": "r3fi-finance", "dex": "alphadex", "sergs": "sergs", "vgw": "vegawallet-token", "kmpl": "kiloample", "mdg": "midas-gold", "pho": "photon", "baepay": "baepay", "arc": "arcticcoin", "flp": "gameflip", "gem": "cargo-gems", "ags": "aegis", "axiav3": "axia", "glox": "glox-finance", "daiq": "daiquilibrium", "scb": "spacecowboy", "mintme": "webchain", "shdw": "shadow-token", "wvg0": "wrapped-virgin-gen-0-cryptokitties", "uunicly": "unicly-genesis-collection", "ecoin": "ecoin-2", "quan": "quantis", "pwr": "powercoin", "kp4r": "keep4r", "snrg": "synergy", "horus": "horuspay", "swiss": "swiss-finance", "shrmp": "shrimp-capital", "orme": "ormeuscoin", "xbi": "bitcoin-incognito", "first": "harrison-first", "ngot": "ngot", "tsl": "energo", "bsov": "bitcoinsov", "civ": "civitas", "abet": "altbet", "arnx": "aeron", "croat": "croat", "reb2": "rebased", "mon": "moneybyte", "fess": "fess-chain", "crc": "crycash", "rehab": "nft-rehab", "scap": "safecapital", "pop": "popularcoin", "sins": "safeinsure", "metm": "metamorph", "yfdot": "yearn-finance-dot", "insn": "insanecoin", "com": "community-token", "pokelon": "pokelon-finance", "cob": "cobinhood", "ad": "asian-dragon", "vtd": "variable-time-dollar", "bt": "bt-finance", "chl": "challengedac", "topb": "topb", "stu": "bitjob", "mntp": "goldmint", "swift": "swiftcash", "candy": "skull-candy-shards", "fors": "foresight", "seos": "seos", "hippo": "hippo-finance", "lot": "lukki-operating-token", "trk": "truckcoin", "avs": "algovest", "mixs": "streamix", "martk": "martkist", "syn": "synlev", "mcash": "midas-cash", "wiki": "wiki-token", "boli": "bolivarcoin", "swagg": "swagg-network", "dim": "dimcoin", "ffyi": "fiscus-fyi", "iut": "mvg-token", "kfx": "knoxfs", "ecte": "eurocoinpay", "vlo": "velo-token", "genix": "genix", "esh": "switch", "got": "gonetwork", "cred": "verify", "smol": "smol", "labo": "the-lab-finance", "ipl": "insurepal", "gbcr": "gold-bcr", "ird": "iridium", "mol": "molten", "peng": "penguin", "paws": "paws-funds", "seq": "sequence", "hur": "hurify", "svd": "savedroid", "dogy": "dogeyield", "ali": "ailink-token", "inve": "intervalue", "kash": "kids-cash", "shuf": "shuffle-monster", "shmn": "stronghands-masternode", "itl": "italian-lira", "fota": "fortuna", "yfbeta": "yfbeta", "bbo": "bigbom-eco", "space": "spacecoin", "thrt": "thrive", "skin": "skincoin", "bbs": "bbscoin", "fr": "freedom-reserve", "btw": "bitwhite", "plt": "plutus-defi", "vls": "veles", "juice": "moon-juice", "mss": "monster-cash-share", "scr": "scorum", "bugs": "starbugs-shards", "tig": "tigereum", "delta": "deltachain", "btct": "bitcoin-token", "ynk": "yoink", "mxt": "martexcoin", "bon": "bonpay", "mash": "masternet", "bboo": "panda-yield", "evil": "evil-coin", "scriv": "scriv", "dln": "delion", "jan": "coinjanitor", "tob": "tokens-of-babel", "lkn": "linkcoin-token", "pfarm": "farm-defi", "hlix": "helix", "adi": "aditus", "bgtt": "baguette-token", "apw": "apwine", "rfctr": "reflector-finance", "yfbt": "yearn-finance-bit", "aced": "aced", "dfx": "definitex", "nyx": "nyxcoin", "cen": "coinsuper-ecosystem-network", "karma": "karma-dao", "kiwi": "kiwi-token", "pte": "peet-defi", "crypt": "cryptcoin", "gup": "matchpool", "prx": "proxynode", "cgi": "coinshares-gold-and-cryptoassets-index-lite", "opal": "opal", "rex": "rex", "vsx": "vsync", "yfox": "yfox-finance", "bsd": "bitsend", "medibit": "medibit", "adz": "adzcoin", "cps": "capricoin", "bse": "buy-sell", "ablx": "able", "jigg": "jiggly-finance", "yffi": "yffi-finance", "mchc": "mch-coin", "tic": "thingschain", "ytn": "yenten", "wtt": "giga-watt-token", "yui": "yui-hinata", "kind": "kind-ads-token", "dcntr": "decentrahub-coin", "gcn": "gcn-coin", "skym": "soar", "bern": "berncash", "cyl": "crystal-token", "tkp": "tokpie", "wdp": "waterdrop", "glt": "globaltoken", "tri": "trinity-protocol", "ukg": "unikoin-gold", "datp": "decentralized-asset-trading-platform", "jem": "jem", "rupx": "rupaya", "yun": "yunex", "aro": "arionum", "xuez": "xuez", "emd": "emerald-crypto", "inx": "inmax", "etgp": "ethereum-gold-project", "lcp": "litecoin-plus", "intu": "intucoin", "xjo": "joulecoin", "kwh": "kwhcoin", "pyrk": "pyrk", "netko": "netko", "tgame": "truegame", "vgr": "voyager", "arion": "arion", "xta": "italo", "ecash": "ethereum-cash", "bro": "bitradio", "pux": "polypux", "raise": "hero-token", "cpr": "cipher", "sbs": "staysbase", "xkr": "kryptokrona", "enol": "ethanol", "edrc": "edrcoin", "bonk": "bonk-token", "yfpi": "yearn-finance-passive-income", "ben": "bitcoen", "ltb": "litebar", "team": "team-finance", "obee": "obee-network", "cymt": "cybermusic", "tok": "tokok", "mfc": "mfcoin", "gtm": "gentarium", "deep": "deepcloud-ai", "vsl": "vslice", "crad": "cryptoads-marketplace", "fsbt": "forty-seven-bank", "dp": "digitalprice", "naruto2": "naruto-bsc", "sat": "sphere-social", "nat": "natmin-pure-escrow", "bznt": "bezant", "swc": "scanetchain", "eltcoin": "eltcoin", "arco": "aquariuscoin", "medic": "medic-coin", "knt": "kora-network", "pgo": "pengolincoin", "ig": "igtoken", "mcc": "multicoincasino", "xgox": "xgox", "emrals": "emrals", "lana": "lanacoin", "tmn": "ttanslateme-network-token", "aib": "advanced-internet-block", "vikky": "vikkytoken", "xco": "xcoin", "ella": "ellaism", "abs": "absolute", "pomac": "poma", "kts": "klimatas", "cherry": "cherry", "ezy": "eazy", "horse": "ethorse", "chc": "chaincoin", "btcred": "bitcoin-red", "bzx": "bitcoin-zero", "bsds": "basis-dollar-share", "araw": "araw-token", "cpu": "cpuchain", "rugz": "rugz", "yamv2": "yam-v2", "prix": "privatix", "obr": "obr", "hqt": "hyperquant", "zfl": "zedxe", "dvs": "davies", "neva": "nevacoin", "atb": "atbcoin", "lbtc": "litebitcoin", "swipp": "swipp", "yfsi": "yfscience", "vaultz": "vaultz", "gic": "giant", "bcz": "bitcoin-cz", "rigel": "rigel-finance", "rntb": "bitrent", "sdash": "sdash", "dtrc": "datarius-cryptobank", "gun": "guncoin", "war": "yieldwars-com", "btcn": "bitcoinote", "kydc": "know-your-developer", "etgf": "etg-finance", "sxtz": "sxtz", "wgo": "wavesgo", "sno": "savenode", "herb": "herbalist-token", "havy": "havy-2", "nice": "nice", "cbx": "bullion", "kec": "keyco", "xos": "oasis-2", "coke": "cocaine-cowboy-shards", "wrc": "worldcore", "sur": "suretly", "mooi": "moonai", "hb": "heartbout", "etnx": "electronero", "estx": "oryxcoin", "rto": "arto", "chiefs": "kansas-city-chiefs-win-super-bowl", "gcg": "gulf-coin-gold", "ace": "tokenstars-ace", "mst": "mustangcoin", "may": "theresa-may-coin", "veco": "veco", "shb": "skyhub", "usdq": "usdq", "deex": "deex", "milf": "milfies", "$noob": "noob-finance", "cjt": "connectjob", "yffs": "yffs", "abst": "abitshadow-token", "yfuel": "yfuel", "ccn": "custom-contract-network", "asa": "asura", "cof": "coffeecoin", "rpc": "ronpaulcoin", "boat": "boat", "lnc": "blocklancer", "cdm": "condominium", "2x2": "2x2", "genx": "genesis-network", "dmb": "digital-money-bits", "pfr": "payfair", "zzzv2": "zzz-finance-v2", "dfs": "digital-fantasy-sports", "imgc": "imagecash", "ctrt": "cryptrust", "boxx": "boxx", "kwatt": "4new", "help": "help-token", "care": "carebit", "nzl": "zealium", "imp": "ether-kingdoms-token", "gst": "game-stars", "gsr": "geysercoin", "nrp": "neural-protocol", "arm": "armours", "mac": "machinecoin", "strng": "stronghold", "nrve": "narrative", "cnct": "connect", "seal": "seal-finance", "cco": "ccore", "klks": "kalkulus", "toto": "tourist-token", "xd": "scroll-token", "joon": "joon", "ftxt": "futurax", "actp": "archetypal-network", "desh": "decash", "audax": "audax", "mcp": "my-crypto-play", "drm": "dreamcoin", "sinoc": "sinoc", "sove": "soverain", "bacon": "baconswap", "pkb": "parkbyte", "info": "infocoin", "gxx": "gravitycoin", "taj": "tajcoin", "ethplo": "ethplode", "pnx": "phantomx", "cash2": "cash2", "kema": "kemacoin", "anon": "anon", "note": "dnotes", "npc": "npcoin", "xstar": "starcurve", "duo": "duo", "apr": "apr-coin", "infx": "influxcoin", "yfid": "yfidapp", "payx": "paypex", "gin": "gincoin", "mar": "mchain", "impl": "impleum", "aus": "australia-cash", "arepa": "arepacoin", "epc": "experiencecoin", "jiaozi": "jiaozi", "ctsc": "cts-coin", "cou": "couchain", "ams": "amsterdamcoin", "ethm": "ethereum-meta", "noodle": "noodle-finance", "joint": "joint", "drip": "dripper-finance", "bold": "boldman-capital", "stak": "straks", "wbt": "whalesburg", "lno": "livenodes", "arct": "arbitragect", "arb": "arbit", "gtx": "goaltime-n", "dbet": "decentbet", "burn": "blockburn", "snd": "snodecoin", "xgcs": "xgalaxy", "yfrb": "yfrb-finance", "exo": "exosis", "ulg": "ultragate", "itt": "intelligent-trading-tech", "sfcp": "sf-capital", "bit": "bitmoney", "ntr": "netrum", "sierra": "sierracoin", "gdr": "guider", "bloody": "bloody-token", "tour": "touriva", "aqua": "aquachain", "klon": "klondike-finance", "stream": "streamit-coin", "swyftt": "swyft", "bm": "bitcomo", "paxex": "paxex", "tds": "tokendesk", "aias": "aiascoin", "osina": "osina", "lud": "ludos", "dow": "dowcoin", "chan": "chancoin", "cow": "cowry", "gfn": "game-fanz", "zyon": "bitzyon", "mafi": "mafia-network", "kgs": "kingscoin", "kmx": "kimex", "znd": "zenad", "apc": "alpha-coin", "zoc": "01coin", "hydro": "hydro", "tux": "tuxcoin", "mexp": "moji-experience-points", "xczm": "xavander-coin", "jbx": "jboxcoin", "distx": "distx", "dtc": "datacoin", "neet": "neetcoin", "uffyi": "unlimited-fiscusfyi", "ibtc": "ibtc", "hodl": "hodlcoin", "braz": "brazio", "sas": "stand-share", "kkc": "primestone", "house": "toast-finance", "litb": "lightbit", "jmc": "junsonmingchancoin", "rise": "rise-protocol", "guess": "peerguess", "bsgs": "basis-gold-share", "reex": "reecore", "tsd": "true-seigniorage-dollar", "wcoinbase-iou": "deus-synthetic-coinbase-iou", "wtl": "welltrado", "xap": "apollon", "goss": "gossipcoin", "aet": "aerotoken", "eny": "emergency-coin", "rle": "rich-lab-token", "ucn": "uchain", "cct": "crystal-clear", "mnp": "mnpcoin", "xsr": "sucrecoin", "labx": "stakinglab", "mftu": "mainstream-for-the-underground", "btcb": "bitcoinbrand", "nyb": "new-year-bull", "dxo": "dextro", "bul": "bulleon", "ztc": "zent-cash", "fntb": "fintab", "rank": "rank-token", "dalc": "dalecoin", "exn": "exchangen", "ylc": "yolo-cash", "guard": "guardium", "din": "dinero", "vivid": "vivid", "wtr": "water-token-2", "clc": "caluracoin", "gali": "galilel", "scsx": "secure-cash", "zzz": "zzz-finance", "spe": "bitcoin-w-spectrum", "sdusd": "sdusd", "eld": "electrum-dark", "blry": "billarycoin", "roco": "roiyal-coin", "btcui": "bitcoin-unicorn", "yieldx": "yieldx", "faith": "faithcoin", "js": "javascript-token", "dashg": "dash-green", "crcl": "crowdclassic", "sac": "stand-cash", "azum": "azuma-coin", "hlx": "hilux", "exus": "exus-coin", "beverage": "beverage", "agu": "agouti", "mbgl": "mobit-global", "quot": "quotation-coin", "cnmc": "cryptonodes", "mynt": "mynt", "better": "better-money", "orm": "orium", "mano": "mano-coin", "kaaso": "kaaso", "oot": "utrum", "varius": "varius", "saros": "saros", "chtc": "cryptohashtank-coin", "polar": "polaris", "fsd": "freq-set-dollar", "ary": "block-array", "bkx": "bankex", "bdcash": "bigdata-cash", "clg": "collegicoin", "wllo": "willowcoin", "orox": "cointorox", "het": "havethertoken", "lms": "lumos", "dgm": "digimoney", "ssx": "stakeshare", "voise": "voise", "brix": "brixcoin", "nbxc": "nibbleclassic", "ixrp": "ixrp", "kreds": "kreds", "dice": "dice-finance", "idefi": "idefi", "bost": "boostcoin", "sms": "speed-mining-service", "real": "real", "mek": "meraki", "evi": "evimeria", "404": "404", "yffc": "yffc-finance", "aer": "aeryus", "bds": "borderless", "ixtz": "ixtz", "lux": "luxcoin", "atl": "atlant", "zla": "zilla", "ebtc": "ebitcoin", "voco": "provoco", "pirl": "pirl", "idash": "idash", "arg": "argentum", "bze": "bzedge", "smc": "smartcoin", "icex": "icex", "pcn": "peepcoin", "hndc": "hondaiscoin", "cstl": "cstl", "up": "uptoken", "cc": "cryptocart", "mp3": "mp3", "p2p": "p2p-network", "cpt": "cryptaur", "tenfi": "ten", "vey": "vey", "msn": "msn", "ucx": "ucx-foundation", "ubu": "ubu-finance", "bgt": "bgt", "lif": "winding-tree", "zos": "zos", "lcg": "lcg", "htm": "htm", "owl": "owl-token", "lvx": "level01-derivatives-exchange", "h3x": "h3x", "mox": "mox", "yas": "yas", "7up": "7up", "zyx": "zyx", "eox": "eox", "mvl": "mass-vehicle-ledger", "ges": "ges", "yes": "yes", "zom": "zoom-protocol", "rxc": "rxc", "idk": "idk", "3xt": "3xt", "sfb": "sfb", "xtp": "tap", "olo": "olo", "pop!": "pop", "gya": "gya", "kvi": "kvi", "aos": "aos", "zin": "zin", "day": "chronologic", "ecc": "ecc", "eft": "eft", "dad": "decentralized-advertising", "tvt": "tvt", "ize": "ize", "1ai": "1ai", "vbt": "vbt", "b26": "b26", "520": "520", "die": "die", "mex": "mex", "lbk": "legal-block", "hdt": "hdt", "yup": "yup", "mp4": "mp4", "mrv": "mrv", "tmc": "tmc-niftygotchi", "onot": "ono", "fme": "fme", "iab": "iab", "sun": "sun-token", "hex": "hex", "rug": "rug", "sov": "sovereign-coin", "wal": "wal", "tosc": "t-os", "donu": "donu", "pica": "pica", "zeon": "zeon", "novo": "novo", "zyro": "zyro", "vndc": "vndc", "arke": "arke", "plg": "pledgecamp", "aeon": "aeon", "xdai": "xdai", "asta": "asta", "teat": "teal", "zpr": "zper", "mute": "mute", "plex": "plex", "arix": "arix", "bare": "bare", "bcat": "bcat", "peos": "peos", "ruc": "rush", "r64x": "r64x", "sefi": "sefi", "alis": "alis", "olcf": "olcf", "pryz": "pryz", "wbx": "wibx", "iron": "iron-stablecoin", "taxi": "taxi", "nova": "nova", "benz": "benz", "ndau": "ndau", "obic": "obic", "cspc": "chinese-shopping-platform", "hope": "hope-token", "whey": "whey", "mass": "mass", "lbrl": "lbrl", "cez": "cezo", "iten": "iten", "bitz": "bitz", "pika": "pikachu", "etor": "etor", "s4f": "s4fe", "xls": "elis", "kupp": "kupp", "biki": "biki", "rfis": "rfis", "enx": "enex", "g999": "g999", "attn": "attn", "rccc": "rccc", "bolt": "thunderbolt", "bidr": "binanceidr", "apix": "apix", "suni": "suni", "bora": "bora", "reth": "reth", "vybe": "vybe", "punk": "punk", "pick": "pick", "nilu": "nilu", "mogx": "mogu", "elya": "elya", "ymax": "ymax", "amix": "amix", "oryx": "oryx", "gold": "digital-gold-token", "lyfe": "lyfe", "xank": "xank", "r34p": "r34p", "sti": "stib-token", "soge": "soge", "dsys": "dsys", "ston": "ston", "nftb": "nftb", "wav3": "wav3", "tugz": "tugz", "wise": "wise-token11", "weth": "weth", "sg20": "sg20", "gr": "grom", "xfit": "xfit", "vivo": "vivo", "dtmi": "dtmi", "sltc": "sltc", "roc": "roxe", "gasp": "gasp", "n0031": "ntoken0031", "acdc": "volt", "thx": "thorenext", "bu": "bumo", "vidy": "vidy", "yfia": "yfia", "ieos": "ieos", "fil6": "filecoin-iou", "usdl": "usdl", "xch": "chia-iou", "xtrd": "xtrade", "gtc": "global-trust-coin", "utip": "utip", "pway": "pway", "noku": "noku", "bios": "bios", "moac": "moac", "mymn": "mymn", "frat": "frat", "musk": "musk", "efin": "efin", "ng": "ngin", "maro": "ttc-protocol", "amis": "amis", "qusd": "qusd-stablecoin", "zinc": "zinc", "aeur": "aeur", "abbc": "alibabacoin", "hapi": "hapi", "ibnb": "ibnb", "artx": "artx", "lze": "lyze", "xrune": "rune", "qcad": "qcad", "b360": "b360", "cmdx": "cmdx", "exor": "exor", "psrs": "psrs", "kala": "kala", "miss": "miss", "koto": "koto", "arx": "arcs", "joys": "joys", "mini": "mini", "420x": "420x", "waxe": "waxe", "boid": "boid", "azu": "azus", "tun": "tune", "vera": "vera", "bnbc": "bnbc", "ln": "link", "tena": "tena", "crow": "crow-token", "vvsp": "vvsp", "scrv": "scrv", "ioex": "ioex", "cook": "cook", "evan": "evan", "iote": "iote", "vspy": "vspy", "yce": "myce", "lynx": "lynx", "ntm": "netm", "xtrm": "xtrm", "glex": "glex", "camp": "camp", "bast": "bast", "afro": "afro", "ers": "eros", "aly": "ally", "dogz": "dogz", "agt": "aisf", "dray": "dray", "usda": "usda", "dmme": "dmme-app", "olxa": "olxa", "gmb": "gamb", "lucy": "lucy", "trbo": "turbostake", "dnc": "danat-coin", "yfet": "yfet", "asla": "asla", "bsys": "bsys", "many": "manyswap", "sono": "sonocoin", "xfii": "xfii", "ympl": "ympl", "sbet": "sbet", "prot": "prostarter-token", "redi": "redi", "hype": "hype-finance", "post": "postcoin", "xels": "xels", "chbt": "chbt", "bpop": "bpop", "xbnta": "xbnt", "foin": "foincoin", "swop": "swop", "seer": "seer", "pofi": "pofi", "carat": "carat", "xazab": "xazab", "joy": "joy-coin", "tur": "turex", "xmark": "xmark", "merge": "merge", "pzm": "prizm", "ram": "ramifi", "keyt": "rebit", "snflx": "snflx", "lunes": "lunes", "fx1": "fanzy", "amr": "ammbr", "bid": "blockidcoin", "xpo": "x-power-chain", "digex": "digex", "plut": "pluto", "qc": "qovar-coin", "libfx": "libfx", "earnx": "earnx", "clt": "coinloan", "zch": "zilchess", "ptd": "pilot", "flap": "flapp", "toz": "tozex", "slnv2": "slnv2", "eurxb": "eurxb", "asimi": "asimi", "fln": "fline", "atd": "atd", "ccomp": "ccomp", "acoin": "acoin", "hlo": "helio", "vso": "verso", "hdi": "heidi", "ifarm": "ifarm", "hatch": "hatch-dao", "saave": "saave", "ikomp": "ikomp", "usdex": "usdex-2", "alphr": "alphr", "blood": "blood", "cprop": "cprop", "kxusd": "kxusd", "knv": "kanva", "bubo": "budbo", "tup": "tenup", "btr": "bitrue-token", "ilg": "ilgon", "samzn": "samzn", "sar": "saren", "amon": "amond", "xknca": "xknca", "raku": "rakun", "xfe": "feirm", "sheng": "sheng", "grimm": "grimm", "xra": "ratecoin", "grain": "grain-token", "utrin": "utrin", "paper": "paper", "bsha3": "bsha3", "jvz": "jiviz", "xen": "xenon-2", "ecu": "decurian", "alb": "albos", "visio": "visio", "senso": "senso", "bxiot": "bxiot", "piasa": "piasa", "point": "point", "bulls": "bulls", "seele": "seele", "manna": "manna", "con": "converter-finance", "ybusd": "ybusd", "hve2": "uhive", "steel": "steel", "husky": "husky", "stamp": "stamp", "az": "azbit", "ing": "iungo", "atp": "atlas-protocol", "twist": "twist", "veth2": "veth2", "tsr": "tesra", "ksk": "kskin", "aloha": "aloha", "qob": "qobit", "vld": "valid", "gena": "genta", "swace": "swace", "bud": "buddy", "franc": "franc", "myu": "myubi", "yummy": "yummy", "blast": "blast", "seed": "seedswap-token", "apn": "apron", "modex": "modex", "vmr": "vomer", "omb": "ombre", "zwx": "ziwax", "temco": "temco", "tools": "tools", "morc": "dynamic-supply", "xin": "infinity-economics", "nsg": "nasgo", "mla": "moola", "clam": "clams", "altom": "altcommunity-coin", "em": "eminer", "dxiot": "dxiot", "rup": "rupee", "dlike": "dlike", "imusd": "imusd", "wco": "winco", "sbe": "sombe", "bitsz": "bitsz", "u": "ucoin", "uno": "unobtanium", "xfuel": "xfuel", "sklay": "sklay", "fma": "flama", "br34p": "br34p", "egold": "egold", "peach": "peach", "ytusd": "ytusd", "srune": "srune", "imbtc": "the-tokenized-bitcoin", "jwl": "jewel", "stonk": "stonk", "xsnxa": "xsnx", "znko": "zenko", "fla": "fiola", "cms": "comsa", "haz": "hazza", "lkk": "lykke", "mozox": "mozox", "lc": "lightningcoin", "zlp": "zuplo", "viper": "viper", "klt": "klend", "fo": "fibos", "voltz": "voltz", "sgoog": "sgoog", "$aapl": "aapl", "aunit": "aunit", "lucky": "lucky-2", "vidyx": "vidyx", "cdex": "codex", "atx": "aston", "ferma": "ferma", "gapt": "gaptt", "ox": "orcax", "eql": "equal", "clout": "blockclout", "dudgx": "dudgx", "sld": "safelaunchpad", "antr": "antra", "ifx24": "ifx24", "cvr": "polkacover", "pitch": "pitch", "p2pg": "p2pgo", "pazzy": "pazzy", "yusra": "yusra", "kvnt": "kvant", "pgpay": "puregold-token", "ean": "eanto", "ehash": "ehash", "xfg": "fango", "acryl": "acryl", "omega": "omega", "pizza": "pizzaswap", "vinci": "vinci", "xkncb": "xkncb", "byron": "bitcoin-cure", "dby": "dobuy", "ovi": "oviex", "vix": "vixco", "ibank": "ibank", "posh": "shill", "xeuro": "xeuro", "xhd": "xrphd", "bliss": "bliss-2", "byts": "bytus", "burnx": "burnx", "tro": "tro-network", "spok": "spock", "defla": "defla", "kcash": "kcash", "dfnd": "dfund", "fleta": "fleta", "ipfst": "ipfst", "krex": "kronn", "eidos": "eidos", "mooni": "mooni", "vesta": "vesta", "miami": "miami", "xnode": "xnode", "mvr": "mavro", "funjo": "funjo", "cvl": "civil", "memex": "memex", "basic": "basic", "gof": "golff", "seeds": "seeds", "mts": "mtblock", "mri": "mirai", "tks": "tokes", "vnx": "venox", "hplus": "hplus", "xsp": "xswap", "akn": "akoin", "elons": "elons", "trybe": "trybe", "keyfi": "keyfi", "tlr": "taler", "pando": "pando", "rkn": "rakon", "tower": "tower", "rfbtc": "rfbtc", "xax": "artax", "crave": "crave", "bion": "biido", "cyb": "cybex", "ct": "communitytoken", "atmos": "atmos", "gig": "gigecoin", "blurt": "blurt", "mks": "makes", "sop": "sopay", "rlx": "relax-protocol", "xtx": "xtock", "myo": "mycro-ico", "xgm": "defis", "aico": "aicon", "mnguz": "mangu", "trism": "trism", "sts": "sbank", "fil12": "fil12", "lex": "elxis", "oks": "okschain", "tor": "torchain", "ysr": "ystar", "xnc": "xenios", "lgbtq": "pride", "sls": "salus", "upbnb": "upbnb", "sem": "semux", "spt": "spectrum", "unify": "unify", "topia": "topia", "emoj": "emoji", "axl": "axial", "nkc": "nework", "dgn": "degen-protocol", "sconex": "sconex", "2goshi": "2goshi", "xqr": "qredit", "dusa": "medusa", "tofy": "toffee", "tewken": "tewken", "oft": "orient", "naft": "nafter", "roz": "rozeus", "tlo": "talleo", "kabosu": "kabosu", "10set": "tenset", "rabbit": "rabbit", "dtep": "decoin", "polyfi": "polyfi", "orb": "orbitcoin", "bva": "bavala", "alu": "altura", "scribe": "scribe", "wix": "wixlar", "djv": "dejave", "toko": "toko", "xbtg": "bitgem", "meowth": "meowth", "onebtc": "onebtc", "aapx": "ampnet", "upshib": "upshib", "bri": "baroin", "kk": "kkcoin", "lhcoin": "lhcoin", "oneeth": "oneeth", "ama": "mrweb-finance", "dbnk": "debunk", "redbux": "redbux", "revt": "revolt", "nii": "nahmii", "gmr": "gmr-finance", "egx": "eaglex", "jmt": "jmtime", "lotdog": "lotdog", "donk": "donkey", "azx": "azeusx", "melody": "melody", "ign": "ignite", "brtr": "barter", "kel": "kelvpn", "uco": "uniris", "prstx": "presto", "incnt": "incent", "cir": "circleswap", "dbt": "datbit", "fnd": "fundum", "dcore": "decore", "qrn": "qureno", "hdp.\u0444": "hedpay", "kue": "kuende", "fit": "financial-investment-token", "lcnt": "lucent", "sfn": "strains", "dctd": "dctdao", "hbx": "hashbx", "str": "staker", "fpt": "finple", "zcx": "unizen", "pteria": "pteria", "hfi": "hecofi", "ubin": "ubiner", "waf": "waffle", "r3t": "rock3t", "orfano": "orfano", "dsr": "desire", "dfni": "defini", "zoa": "zotova", "rpzx": "rapidz", "azzr": "azzure", "degens": "degens", "vbswap": "vbswap", "gfce": "gforce", "bep": "blucon", "usnbt": "nubits", "bfx": "bitfex", "bst": "bitsten-token", "yoc": "yocoin", "vii": "7chain", "ttr": "tetris", "dxr": "dexter", "pcatv3": "pcatv3", "qi": "qiswap", "pat": "patron", "pixeos": "pixeos", "mns": "monnos", "nlm": "nuclum", "ceds": "cedars", "ilc": "ilcoin", "ocul": "oculor", "mimo": "mimosa", "efk": "refork", "stm": "stream", "prkl": "perkle", "mag": "maggie", "ame": "amepay", "ipm": "timers", "nux": "peanut", "xdag": "dagger", "aquari": "aquari", "stri": "strite", "ilk": "inlock-token", "tyc": "tycoon", "sprink": "sprink", "dacs": "dacsee", "echt": "e-chat", "xlt": "nexalt", "nbu": "nimbus", "wtm": "waytom", "kicks": "sessia", "jui": "juiice", "bpx": "bispex", "hpx": "hupayx", "cntx": "centex", "s1inch": "s1inch", "dxf": "dexfin", "rfx": "reflex", "levelg": "levelg", "dsgn": "design", "sbt": "solbit", "xaavea": "xaavea", "rno": "snapparazzi", "skrp": "skraps", "uted": "united-token", "raux": "ercaux", "gaze": "gazetv", "trat": "tratok", "strk": "strike", "boo": "spookyswap", "sanc": "sancoj", "inn": "innova", "kam": "bitkam", "koduro": "koduro", "anct": "anchor", "r2r": "citios", "ebk": "ebakus", "zcor": "zrocor", "alg": "bitalgo", "entone": "entone", "xsh": "shield", "xinchb": "xinchb", "lemd": "lemond", "lev": "lever-network", "fdn": "fundin", "ras": "raksur", "coup": "coupit", "gneiss": "gneiss", "yac": "yacoin", "uis": "unitus", "onit": "onbuff", "awo": "aiwork", "wbpc": "buypay", "whx": "whitex", "gsfy": "gasify", "dess": "dessfi", "ket": "rowket", "ktt": "k-tune", "cod": "codemy", "rich": "richierich-coin", "fzy": "frenzy", "yfo": "yfione", "a5t": "alpha5", "htmoon": "htmoon", "vancat": "vancat", "cbt": "cryptocurrency-business-token", "vyn": "vyndao", "uponly": "uponly", "kiro": "kirobo", "dogira": "dogira", "ivi": "inoovi", "gunthy": "gunthy", "bstx": "blastx", "mdu": "mdu", "rnx": "roonex", "mor": "morcrypto-coin", "spg": "super-gold", "dka": "dkargo", "arcona": "arcona", "hgro": "helgro", "bceo": "bitceo", "jntr/e": "jntre", "ecob": "ecobit", "eauric": "eauric", "yooshi": "yooshi", "co2b": "co2bit", "lib": "banklife", "in": "incoin", "trdx": "trodex", "mnm": "mineum", "xym": "symbol", "perl": "perlin", "dms": "documentchain", "merl": "merlin", "swamp": "swamp-coin", "agol": "algoil", "xhi": "hicoin", "yco": "y-coin", "byt": "byzbit", "arteon": "arteon", "renfil": "renfil", "exg": "exgold", "iqq": "iqoniq", "nt": "nexdax", "bsy": "bestay", "strn": "saturn-classic-dao-token", "qoob": "qoober", "sefa": "mesefa", "oct": "oraclechain", "dmx": "dymmax", "hd": "hubdao", "rblx": "rublix", "zag": "zigzag", "dexm": "dexmex", "sfr": "safari", "i0c": "i0coin", "bdk": "bidesk", "rhegic": "rhegic", "qmc": "qmcoin", "xab": "abosom", "usg": "usgold", "vsn": "vision-network", "zdc": "zodiac", "s8": "super8", "moneta": "moneta", "omm": "omcoin", "glf": "gallery-finance", "tara": "taraxa", "wok": "webloc", "clx": "celeum", "octa": "octans", "min": "mindol", "dhv": "dehive", "heal": "etheal", "bdx": "beldex", "mct": "master-contract-token", "sic": "sicash", "ett": "efficient-transaction-token", "bay": "bitbay", "ec": "eternal-cash", "nlx": "nullex", "tem": "temtem", "uzz": "azuras", "sead": "seadex", "mdm": "medium", "me": "all-me", "was": "wasder", "apx": "appics", "egcc": "engine", "zdr": "zloadr", "aka": "akroma", "erc223": "erc223", "xincha": "xincha", "fai": "fairum", "wynaut": "wynaut", "gxi": "genexi", "xditto": "xditto", "news": "cryptonewsnet", "evr": "everus", "jll": "jllone", "kzc": "kzcash", "acu": "aitheon", "sxi": "safexi", "xsc": "xscoin", "xce": "cerium", "clv": "clover-finance", "paa": "palace", "att": "africa-trading-chain", "zlw": "zelwin", "shorty": "shorty", "mgx": "margix", "pgf7t": "pgf500", "xaaveb": "xaaveb", "ebst": "eboost", "usd1": "psyche", "gom": "gomics", "btp": "bitcoin-pay", "cso": "crespo", "pan": "panvala-pan", "dns": "bitdns", "csp": "caspian", "bnode": "beenode", "pbl": "publica", "laq": "laq-pay", "oto": "otocash", "cnx": "cryptonex", "pusd": "pegsusd", "eag": "ea-coin", "brat": "brother", "i9c": "i9-coin", "our": "our-pay", "taud": "trueaud", "888": "octocoin", "mpay": "menapay", "gbt": "gulf-bits-coin", "trl": "trolite", "cha": "chaucha", "exp": "exchange-payment-coin", "mql": "miraqle", "wasp": "wanswap", "ekt": "educare", "shrm": "shrooms", "mttcoin": "mttcoin", "wxc": "wiix-coin", "imu": "imusify", "btrm": "betrium", "psb": "pesobit", "cmg": "cmgcoin", "sum": "sumcoin", "caj": "cajutel", "eum": "elitium", "fra": "findora", "buz": "buzcoin", "land": "new-landbox", "zdx": "zer-dex", "bnk": "bankera", "yot": "payyoda", "x-token": "x-token", "torm": "thorium", "mdtk": "mdtoken", "cpz": "cashpay", "lyra": "scrypta", "rlz": "relianz", "chrt": "charity", "thkd": "truehkd", "some": "mixsome", "clb": "clbcoin", "gps": "triffic", "ptr": "payturn", "addy": "adamant", "biop": "biopset", "vnl": "vanilla", "sprts": "sprouts", "crfi": "crossfi", "o3": "o3-swap", "ausc": "auscoin", "tlc": "tl-coin", "pkt": "playkey", "ddm": "ddmcoin", "ctl": "citadel", "si14": "si14bet", "ardx": "ardcoin", "tronish": "tronish", "pcm": "precium", "the": "the-node", "safebtc": "safebtc", "yok": "yokcoin", "gems": "safegem", "trcl": "treecle", "wire": "wire", "maxgoat": "maxgoat", "msb": "magic-e-stock", "mlm": "mktcoin", "trm": "tranium", "mnr": "mineral", "bafe": "bafe-io", "celc": "celcoin", "aby": "artbyte", "cop": "copiosa", "psy": "psychic", "bgc": "be-gaming-coin", "twee": "tweebaa", "bup": "buildup", "fnk": "funkeypay", "flexusd": "flex-usd", "mimatic": "mimatic", "prvs": "previse", "ccxx": "counosx", "wsote": "soteria", "baxs": "boxaxis", "spike": "spiking", "wcx": "wecoown", "peer": "unilord", "ala": "aladiex", "avn": "avantage", "asy": "asyagro", "ohmc": "ohm-coin", "mnmc": "mnmcoin", "ktc": "kitcoin", "boob": "boobank", "moochii": "moochii", "bixcpro": "bixcpro", "ubomb": "unibomb", "fk": "fk-coin", "fnax": "fnaticx", "deq": "dequant", "onevbtc": "onevbtc", "xbg": "bitgrin", "linkusd": "linkusd", "winr": "justbet", "xiro": "xiropht", "dkyc": "datakyc", "x0z": "zerozed", "gadoshi": "gadoshi", "rebound": "rebound", "bono": "bonorum-coin", "fml": "formula", "sto": "storeum", "tlw": "tilwiki", "sola": "solarys", "vana": "nirvana", "mb": "microchain", "ugd": "unigrid", "odex": "one-dex", "xxa": "ixinium", "dion": "dionpay", "swin": "swinate", "vgc": "5g-cash", "kurt": "kurrent", "zum": "zum-token", "pgs": "pegasus", "torpedo": "torpedo", "xmv": "monerov", "iti": "iticoin", "b2b": "b2bcoin-2", "shroud": "shroud-protocol", "bdo": "bdollar", "ix": "x-block", "cctc": "cctcoin", "fey": "feyorra", "buy": "burency", "sxc": "simplexchain", "vtar": "vantaur", "jar": "jarvis", "tcfx": "tcbcoin", "tat": "tatcoin", "xemx": "xeniumx", "unos": "unoswap", "mesh": "meshbox", "wenb": "wenburn", "rx": "raven-x", "opc": "op-coin", "jindoge": "jindoge", "dgmt": "digimax", "igg": "ig-gold", "locg": "locgame", "bte": "btecoin", "quo": "vulcano", "ree": "reecoin", "trop": "interop", "tgbp": "truegbp", "xfyi": "xcredit", "youc": "youcash", "dfo": "defiato", "lkt": "lukutex", "wfx": "webflix", "nld": "newland", "zny": "bitzeny", "mel": "caramelswap", "ufarm": "unifarm", "sam": "samurai", "ath": "atheios", "rech": "rechain", "ibh": "ibithub", "chat": "beechat", "dogedao": "dogedao", "hawk": "hawkdex", "betxc": "betxoin", "palg": "palgold", "enu": "enumivo", "bignite": "bignite", "sjw": "sjwcoin", "xnb": "xeonbit", "dvx": "derivex", "btsg": "bitsong", "prv": "privacyswap", "lhb": "lendhub", "meowcat": "meowcat", "aba": "ecoball", "zwap": "zilswap", "ethp": "ethplus", "vash": "vpncoin", "mouse": "mouse", "satoz": "satozhi", "erotica": "erotica-2", "gaj": "polygaj", "gpt": "grace-period-token", "ril": "rilcoin", "bliq": "bliquid", "aglt": "agrolot", "dxh": "daxhund", "hamtaro": "hamtaro", "gaia": "gaiadao", "onigiri": "onigiri", "mpt": "metal-packaging-token", "xov": "xov", "v": "version", "pmeer": "qitmeer", "cura": "curadai", "bscgold": "bscgold", "xes": "proxeus", "c3": "charli3", "coi": "coinnec", "sap": "swaap-stablecoin", "pzap": "polyzap", "digi": "digible", "rtk": "ruletka", "hal": "halcyon", "vbit": "valobit", "onewing": "onewing", "ube": "ubeswap", "btrn": "biotron", "mak": "makcoin", "bin": "binarium", "sup8eme": "sup8eme", "300": "spartan", "wdx": "wordlex", "marks": "bitmark", "mapc": "mapcoin", "xph": "phantom", "kfc": "chicken", "bim": "bimcoin", "bitc": "bitcash", "trbt": "tribute", "klee": "kleekai", "tdi": "tedesis", "prophet": "prophet", "lc4": "leocoin", "nax": "nextdao", "dmc": "decentralized-mining-exchange", "ork": "orakuru", "m": "m-chain", "pyn": "paycent", "kian": "kianite", "qtcon": "quiztok", "sfm": "sfmoney", "arts": "artista", "rhegic2": "rhegic2", "won": "weblock", "tkmn": "tokemon", "htc": "hitcoin", "bni": "betnomi-2", "afrox": "afrodex", "kuv": "kuverit", "gsm": "gsmcoin", "pm": "pomskey", "bist": "bistroo", "xyz": "jetmint", "drk": "drakoin", "eeth": "eos-eth", "vro": "veraone", "rzb": "rizubot", "hmr": "homeros", "tag": "tagcoin-erc20", "cyfm": "cyberfm", "btv": "bitvote", "ogx": "organix", "swat": "swtcoin", "don": "donnie-finance", "rap": "rapture", "yay": "yayswap", "poocoin": "poocoin", "bfic": "bficoin", "moonpaw": "moonpaw", "ents": "eunomia", "ape": "apecoin", "bly": "blocery", "halv": "halving-coin", "jdc": "jd-coin", "cid": "cryptid", "peth18c": "peth18c", "bonfire": "bonfire", "pt": "predict", "smdx": "somidax", "btcm": "btcmoon", "befx": "belifex", "mora": "meliora", "mepad": "memepad", "ecp": "ecp-technology", "sdgo": "sandego", "ift": "iftoken", "onelink": "onelink", "axnt": "axentro", "dch": "doch-coin", "ebase": "eurbase", "vspacex": "vspacex", "tfd": "etf-dao", "fn": "filenet", "wyx": "woyager", "roo": "roocoin", "lmo": "lumeneo", "fat": "tronfamily", "nyex": "nyerium", "kyan": "kyanite", "ael": "aelysir", "7e": "7eleven", "fnsp": "finswap", "btkc": "beautyk", "gzro": "gravity", "komp": "kompass", "hitx": "hithotx", "rrc": "rrspace", "kal": "kaleido", "ttt": "the-transfer-token", "ntx": "nitroex", "w3b": "w3bpush", "yplt": "yplutus", "dswap": "definex", "xat": "shareat", "pshp": "payship", "bool": "boolean", "b2c": "b2-coin", "vltm": "voltium", "mkey": "medikey", "lar": "linkart", "sgb": "subgame", "xcz": "xchainz", "seko": "sekopay", "net": "netcoin", "nug": "nuggets", "tty": "trinity", "lthn": "intensecoin", "tek": "tekcoin", "bnp": "benepit", "bn": "bitnorm", "xscr": "securus", "xf": "xfarmer", "scl": "sociall", "zik": "zik-token", "mndao": "moondao", "pqt": "prediqt", "tshp": "12ships", "b2u": "b2u-coin", "tpad": "trustpad", "ziti": "ziticoin", "bsp": "ballswap", "gldx": "goldnero", "vns": "vns-coin", "ino": "ino-coin", "yfr": "youforia", "mo": "morality", "mbonk": "megabonk", "mci": "mci-coin", "ants": "fireants", "amkr": "aave-mkr-v1", "cim": "coincome", "isr": "insureum", "snft": "seedswap", "spiz": "space-iz", "bpp": "bitpower", "ytv": "ytv-coin", "moonarch": "moonarch", "vela": "vela", "gldy": "buzzshow", "izer": "izeroium", "busy": "busy-dao", "orly": "orlycoin", "catz": "catzcoin", "bsc": "bitsonic-token", "chee": "cheecoin", "opnn": "opennity", "zg": "zg", "tagr": "tagrcoin", "lvn": "livenpay", "wiz1": "wiz-coin", "ape$": "ape-punk", "ijc": "ijascoin", "vlk": "vulkania", "mojo": "moonjuice", "prs": "pressone", "nole": "nolecoin", "dgl": "dgl-coin", "safenami": "safenami", "nort": "northern", "xrp-bf2": "xrp-bep2", "bela": "belacoin", "shibapup": "shibapup", "pact": "packswap", "icol": "icolcoin", "npo": "npo-coin", "ebsc": "earlybsc", "weed": "weedcash", "szc": "zugacoin", "rnb": "rentible", "alh": "allohash", "alr": "alacrity", "sh": "super-hero", "tkm": "thinkium", "mbbased": "moonbase", "lvl": "levelapp", "trn": "tronnodes", "wtip": "worktips", "html": "htmlcoin", "safestar": "safestar", "moonmoon": "moonmoon", "wpt": "worldpet", "ethpy": "etherpay", "myfi": "myfichain", "koko": "kokoswap", "exmr": "exmr-monero", "dxc": "dex-trade-coin", "hana": "hanacoin", "auop": "opalcoin", "0xmr": "0xmonero", "api": "the-apis", "coom": "coomcoin", "ntrs": "nosturis", "pti": "paytomat", "xgs": "genesisx", "cqt": "covalent", "marx": "marxcoin", "xmm": "momentum", "torro": "bittorro", "ri": "ri-token", "fts": "footballstars", "saferune": "saferune", "xind": "indinode", "nemo": "nemocoin", "vlm": "valireum", "aknc": "aave-knc-v1", "ogods": "gotogods", "nia": "nia-token", "nuko": "nekonium", "bnana": "banana-token", "kdag": "kdag", "shih": "shih-tzu", "safezone": "safezone", "yda": "yadacoin", "blvr": "believer", "fly": "franklin", "rice": "riceswap", "tep": "tepleton", "znc": "zioncoin", "polystar": "polystar", "wit": "witchain", "hotdoge": "hot-doge", "lol": "emogi-network", "ttc": "thetimeschaincoin", "uty": "unitydao", "tar": "tartarus", "topc": "topchain", "gom2": "gomoney2", "bca": "bitcoin-atom", "bith": "bithachi", "hburn": "hypeburn", "wenlambo": "wenlambo", "aenj": "aave-enj-v1", "miro": "mirocana", "tv": "ti-value", "plat": "bitguild", "erowan": "sifchain", "nan": "nantrade", "i9x": "i9x-coin", "gze": "gazecoin", "owdt": "oduwausd", "bnv": "benative", "lxmt": "luxurium", "jobs": "jobscoin", "svb": "sendvibe", "uca": "uca", "syl": "xsl-labs", "pcl": "peculium", "bio": "biocrypt", "gpu": "gpu-coin", "pswap": "polkaswap", "kok": "kok-coin", "safecock": "safecock", "eva": "eva-coin", "ubn": "ubricoin", "meet": "coinmeet", "mkcy": "markaccy", "naz": "naz-coin", "trex": "trexcoin", "mxw": "maxonrow", "fren": "frenchie", "csx": "coinstox", "hypebet": "hype-bet", "swsh": "swapship", "foxd": "foxdcoin", "adai": "aave-dai-v1", "pnl": "true-pnl", "trusd": "trustusd", "upl": "uploadea", "xbs": "bitstake", "blowf": "blowfish", "btcx": "bitcoinx-2", "bkkg": "biokkoin", "riskmoon": "riskmoon", "pxi": "prime-xi", "safebank": "safebank", "hta": "historia", "bshiba": "bscshiba", "sng": "sinergia", "mbud": "moon-bud", "bee": "bee-coin", "wage": "philscurrency", "nicheman": "nicheman", "payb": "paybswap", "vrap": "veraswap", "art": "maecenas", "bcna": "bitcanna", "vip": "limitless-vip", "fraction": "fraction", "lst": "lendroid-support-token", "elongate": "elongate", "bwt": "bittwatt", "tnr": "tonestra", "xln": "lunarium", "mne": "minereum", "trix": "triumphx", "ctt": "castweet", "asnx": "aave-snx-v1", "lips": "lipchain", "ple": "plethori", "black": "blackhole-protocol", "gasg": "gasgains", "mbs": "micro-blood-science", "sym": "symverse", "lime": "limeswap", "prtcle": "particle-2", "amo": "amo", "bag": "bondappetit-gov-token", "fomp": "fompound", "plbt": "polybius", "treat": "treatdao", "gfun": "goldfund-ico", "ftn": "fountain", "dogemoon": "dogemoon", "txc": "tenxcoin", "bmj": "bmj-master-nodes", "cats": "catscoin", "pos": "pos-coin", "mnd": "mindcoin", "ocb": "blockmax", "rdct": "rdctoken", "starship": "starship", "bln": "blacknet", "pvg": "pilnette", "xgk": "goldkash", "tinv": "tinville", "airx": "aircoins", "18c": "block-18", "ltg": "litegold", "timec": "time-coin", "trad": "tradcoin", "crox": "croxswap", "swaps": "nftswaps", "plf": "playfuel", "blu": "bluecoin", "nawa": "narwhale", "bsn": "bastonet", "bnw": "nagaswap", "agn": "agricoin", "bizz": "bizzcoin", "d100": "defi-100", "taste": "tastenft", "runes": "runebase", "ea": "ea-token", "moonstar": "moonstar", "hpot": "hash-pot", "ixt": "insurex", "ragna": "ragnarok", "hdao": "hyperdao", "ecoc": "ecochain", "akc": "akikcoin", "jrc": "finchain", "trp": "tronipay", "slrm": "solareum", "yep": "yep-coin", "cadc": "cad-coin", "defy": "defy-farm", "zuc": "zeuxcoin", "nvc": "novacoin", "ndn": "ndn-link", "stash": "bitstash-marketplace", "100x": "100x-coin", "sme": "safememe", "jrex": "jurasaur", "shit": "shitcoin-token", "lpl": "linkpool", "pinke": "pinkelon", "scol": "scolcoin", "svn": "7finance", "ddtg": "davecoin", "tuna": "tunacoin", "bucks": "swagbucks", "moonshot": "moonshot", "usdf": "usdf", "dhd": "dhd-coin", "tmed": "mdsquare", "kali": "kalicoin", "prdz": "predictz", "gram": "gram", "hca": "harcomia", "srnt": "serenity", "qbz": "queenbee", "botx": "botxcoin", "slc": "support-listing-coin", "guss": "guss-one", "nmt": "novadefi", "tarm": "armtoken", "hibs": "hiblocks", "adl": "adelphoi", "pure": "puriever", "bfl": "bitflate", "song": "songcoin", "hl": "hl-chain", "izi": "izichain", "job": "jobchain", "lf": "linkflow", "zyn": "zynecoin", "mig": "migranet", "nsfw": "xxxnifty", "xqn": "quotient", "lion": "lion-token", "xblzd": "blizzard", "abat": "aave-bat-v1", "enk": "enkronos", "sapp": "sappchain", "cmit": "cmitcoin", "homi": "homihelp", "nsr": "nushares", "drops": "defidrop", "fch": "fanaticos-cash", "aht": "ahatoken", "eds": "endorsit", "wdf": "wildfire", "aim": "ai-mining", "leaf": "leafcoin", "yts": "yetiswap", "kva": "kevacoin", "cross": "crosspad", "oxo": "oxo-farm", "poke": "pokeball", "btshk": "bitshark", "dfk": "defiking", "char": "charitas", "b2g": "bitcoiin", "bbt": "blockbase", "aya": "aryacoin", "morph": "morphose", "lby": "libonomy", "eti": "etherinc", "aren": "aave-ren-v1", "kuma": "kuma-inu", "club": "clubcoin", "pdex": "polkadex", "bell": "bellcoin", "daft": "daftcoin", "disk": "darklisk", "bigo": "bigo-token", "llt": "lifeline", "bpcn": "blipcoin", "gix": "goldfinx", "solarite": "solarite", "azrx": "aave-zrx-v1", "zpay": "zantepay", "fastmoon": "fastmoon", "mrch": "merchdao", "sine": "sinelock", "nss": "nss-coin", "qbit": "qubitica", "ap3": "ap3-town", "cx": "circleex", "ayfi": "ayfi", "omniunit": "omniunit", "vn": "vice-network", "yfim": "yfimobi", "graph": "unigraph", "zne": "zonecoin", "mes": "meschain", "moto": "motocoin", "pine": "pinecoin", "ic": "ignition", "stol": "stabinol", "eswa": "easyswap", "mowl": "moon-owl", "meetone": "meetone", "inrt": "inrtoken", "windy": "windswap", "palt": "palchain", "mmda": "pokerain", "eggplant": "eggplant", "safemusk": "safemusk", "goc": "eligma", "neex": "neexstar", "fll": "feellike", "log": "woodcoin", "saga": "sagacoin", "nvzn": "invizion", "tatm": "tron-atm", "prime": "primedao", "cirq": "cirquity", "pxg": "playgame", "aswap": "arbiswap", "bcx": "bitcoinx", "pok": "poker-io", "libertas": "libertas-token", "big": "thebigcoin", "btcl": "btc-lite", "glass": "ourglass", "alp": "alp-coin", "edgt": "edgecoin-2", "dgw": "digiwill", "isal": "isalcoin", "foge": "fat-doge", "tacocat": "taco-cat", "stpc": "starplay", "dyx": "xcoinpay", "guap": "guapcoin", "rvmt": "rivemont", "polymoon": "polymoon", "wpp": "wpp-token", "gmci": "game-city", "safelight": "safelight", "dream": "dream-swap", "sports": "zensports", "safetesla": "safetesla", "silk": "silkchain", "slf": "solarfare", "4art": "4artechnologies", "grg": "rigoblock", "poll": "clearpoll", "kishu": "kishu-inu", "bazt": "baooka-token", "naut": "astronaut", "hvt": "hirevibes", "honey": "honeycomb-2", "vbtc": "venus-btc", "pfid": "pofid-dao", "btnt": "bitnautic", "bct": "bitcoin-trust", "sdao": "singularitydao", "layerx": "unilayerx", "mgc": "magnachain", "light": "lightning-protocol", "skn": "sharkcoin", "eqz": "equalizer", "bamboo": "bamboo-token-2", "stxym": "stakedxym", "latte": "latteswap", "paddy": "paddycoin", "spaz": "swapcoinz", "hxy": "hex-money", "hlp": "help-coin", "it": "idc-token", "eswap": "eswapping", "dph": "digipharm", "stb": "starblock", "mbit": "mbitbooks", "agvc": "agavecoin", "bspay": "brosispay", "ultra": "ultrasafe", "mch": "meconcash", "eup": "eup-chain", "ume": "ume-token", "alink": "aave-link-v1", "gera": "gera-coin", "apis": "apis-coin", "jfin": "jfin-coin", "kick": "kickico", "esti": "easticoin", "lemo": "lemochain", "pxl": "piction-network", "safelogic": "safelogic", "curve": "curvehash", "zoot": "zoo-token", "nuvo": "nuvo-cash", "xwc": "whitecoin", "safecomet": "safecomet", "laika": "laikacoin", "dfgl": "defi-gold", "candybox": "candy-box", "cell": "cellframe", "dfi": "defichain", "now": "changenow-token", "idl": "idl-token", "akita": "akita-inu", "aab": "aax-token", "bali": "balicoin", "clbk": "cloudbric", "vltc": "venus-ltc", "egc": "ecog9coin", "fox": "fox-finance", "scurve": "lp-scurve", "eubc": "eub-chain", "rth": "rutheneum", "tea": "tea-token", "nnb": "nnb-token", "bchc": "bitcherry", "hint": "hintchain", "niu": "niubiswap", "trump": "trumpcoin", "btcr": "bitcurate", "erz": "earnzcoin", "isdt": "istardust", "7add": "holdtowin", "dexa": "dexa-coin", "bots": "bot-ocean", "arnxm": "armor-nxm", "nanox": "project-x", "ausdc": "aave-usdc-v1", "tco": "tcoin-fun", "mic3": "mousecoin", "deal": "idealcash", "gol": "gogolcoin", "ims": "ims-wallet", "jdi": "jdi-token", "starsb": "star-shib", "drgb": "dragonbit", "ns": "nodestats", "nplc": "plus-coin", "ara": "ara-token", "pvm": "privateum", "mtp": "multiplay", "shd": "shardingdao", "whl": "whaleroom", "fastx": "transfast", "lsh": "leasehold", "more": "legends-room", "odc": "odinycoin", "tbc": "terablock", "boltt": "boltt-coin", "xpb": "transmute", "safeearth": "safeearth", "exm": "exmo-coin", "safepluto": "safepluto", "fullsend": "full-send", "hfil": "huobi-fil", "bak": "baconcoin", "ausdt": "aave-usdt-v1", "betc": "bet-chips", "gbk": "goldblock", "pcb": "451pcbcom", "lama": "llamaswap", "twi": "trade-win", "coshi": "coshi-inu", "atusd": "aave-tusd-v1", "hntc": "hntc-energy-distributed-network", "dbtc": "decentralized-bitcoin", "duk+": "dukascoin", "ezpay": "eazypayza", "bxt": "bitfxt-coin", "happy": "happycoin", "vfil": "venus-fil", "ete": "ethercoin-2", "dsc": "data-saver-coin", "eost": "eos-trust", "btzc": "beatzcoin", "ksc": "kstarcoin", "hejj": "hedge4-ai", "curry": "curryswap", "dic": "daikicoin", "maya": "maya-coin", "fuzz": "fuzzballs", "orbi": "orbicular", "vestx": "vestxcoin", "dynge": "dyngecoin", "pbs": "pbs-chain", "rtm": "raptoreum", "lburst": "loanburst", "btym": "blocktyme", "bxh": "bxh", "love": "love-coin", "bbx": "ballotbox", "ecos": "ecodollar", "rover": "rover-inu", "tzt": "tanzanite", "sfg": "s-finance", "gc": "galaxy-wallet", "bravo": "bravo-coin", "xtnc": "xtendcash", "krill": "polywhale", "fgc": "fantasy-gold", "vlt": "bankroll-vault", "corgi": "corgi-inu", "argp": "argenpeso", "sec": "smilecoin", "asn": "ascension", "smoon": "swiftmoon", "cach": "cachecoin", "rrb": "renrenbit", "stc": "coinstarter", "lmch": "latamcash", "rld": "real-land", "safeorbit": "safeorbit", "lir": "letitride", "fldt": "fairyland", "wifi": "wifi-coin", "pdao": "panda-dao", "moonstorm": "moonstorm", "bbank": "blockbank", "pbase": "polkabase", "gift": "gift-coin", "qbc": "quebecoin", "stxem": "stakedxem", "ira": "deligence", "lov": "lovechain", "bns": "bns-token", "vany": "vanywhere", "glov": "glovecoin", "ank": "apple-network", "limit": "limitswap", "vgtg": "vgtgtoken", "sendwhale": "sendwhale", "kuky": "kuky-star", "mw": "mirror-world-token", "hoo": "hoo-token", "miks": "miks-coin", "inst": "instadapp", "hapy": "hapy-coin", "save": "savetheworld", "solo": "solo-coin", "slv": "silverway", "awbtc": "aave-wbtc-v1", "awg": "aurusgold", "xrge": "rougecoin", "asac": "asac-coin", "cls": "coldstack", "zupi": "zupi-coin", "kashh": "kashhcoin", "vxvs": "venus-xvs", "vest": "vestchain", "amsk": "nolewater", "safetoken": "safetoken", "bitb": "bitcoin-bull", "pegs": "pegshares", "dgp": "dgpayment", "loto": "lotoblock", "thr": "thorecoin", "clm": "coinclaim", "au": "aurumcoin", "sloth": "slothcoin", "crd": "cryptaldash", "pazzi": "paparazzi", "gsmt": "grafsound", "psk": "pool-of-stake", "bixb": "bixb-coin", "payt": "payaccept", "vsxp": "venus-sxp", "gre": "greencoin", "vnt": "inventoryclub", "gator": "alligator-fractal-set", "nter": "nter", "grlc": "garlicoin", "creva": "crevacoin", "lbet": "lemon-bet", "fomo": "fomo-labs", "capp": "crypto-application-token", "crt": "carr-finance", "long": "long-coin", "fcr": "fromm-car", "ez": "easyfi", "pwrb": "powerbalt", "bp": "bunnypark", "yfe": "yfe-money", "evy": "everycoin", "hpy": "hyper-pay", "thrn": "thorncoin", "bna": "bananatok", "ani": "anime-token", "vdai": "venus-dai", "nmst": "nms-token", "tls": "tls-token", "vxc": "vinx-coin", "hgh": "hgh-token", "611": "sixeleven", "amana": "aave-mana-v1", "mtcn": "multiven", "ouro": "ouroboros", "xbe": "xbe-token", "mbm": "mbm-token", "pocc": "poc-chain", "lgold": "lyfe-gold", "dfc": "defiscale", "unft": "ultra-nft", "eplus": "epluscoin", "dkkt": "dkk-token", "asusd": "aave-susd-v1", "cpx": "coinxclub", "nsd": "nasdacoin", "andes": "andes-coin", "lbd": "linkbased", "opti": "optitoken", "yap": "yap-stone", "bnx": "bnx", "ret": "realtract", "zash": "zimbocash", "hss": "hashshare", "flc": "flowchaincoin", "ich": "ideachain", "pivxl": "pivx-lite", "mzg": "moozicore", "darthelon": "darthelon", "cock": "shibacock", "psix": "propersix", "x2p": "xenon-pay", "pluto": "plutopepe", "kanda": "telokanda", "tree": "tree-defi", "swet": "swe-token", "mochi": "mochiswap", "eto": "essek-tov", "crm": "cream", "mswap": "moneyswap", "torq": "torq-coin", "honk": "honk-honk", "vega": "vega-coin", "cbet": "cryptobet", "moontoken": "moontoken", "scu": "securypto", "ba": "batorrent", "dpc": "dappcents", "ons": "one-share", "2248": "2-2-4-4-8", "rew": "rewardiqa", "nar": "nar-token", "rc20": "robocalls", "nokn": "nokencoin", "c8": "carboneum", "spdx": "spender-x", "omc": "ormeus-cash", "luck": "lady-luck", "city": "city-coin", "$king": "king-swap", "mvc": "mileverse", "hebe": "hebeblock", "newton": "newtonium", "newos": "newstoken", "mptc": "mnpostree", "polyshiba": "polyshiba", "dna": "metaverse-dualchain-network-architecture", "lfc": "linfinity", "tknt": "tkn-token", "hub": "minter-hub", "qtf": "quantfury", "hmnc": "humancoin-2", "minty": "minty-art", "xby": "xtrabytes", "nana": "ape-tools", "pgc": "pegascoin", "ryiu": "ryi-unity", "pdai": "prime-dai", "qnc": "qnodecoin", "lv": "lendchain", "mntt": "moontrust", "jind": "jindo-inu", "tcr": "tecracoin", "cbrl": "cryptobrl", "bolc": "boliecoin", "uniusd": "unidollar", "homt": "hom-token", "xtg": "xtg-world", "ato": "eautocoin", "bash": "luckchain", "vjc": "venjocoin", "scs": "speedcash", "abc": "abc-chain", "ecl": "eclipseum", "fex": "fidex-exchange", "xwo": "wooshcoin-io", "carr": "carnomaly", "eland": "etherland", "hurricane": "hurricane", "okt": "okexchain", "vdot": "venus-dot", "entrc": "entercoin", "iai": "iai-token", "yfiig": "yfii-gold", "xscp": "scopecoin", "cxp": "caixa-pay", "kong": "kong-defi", "bgl": "bitgesell", "stro": "supertron", "wtn": "waletoken", "bun": "bunnycoin", "bitci": "bitcicoin", "lland": "lyfe-land", "uba": "unbox-art", "vbch": "venus-bch", "sybc": "sybc-coin", "pton": "foresting", "xamp": "antiample", "ick": "ick-mask", "mytv": "mytvchain", "agri": "agrinovuscoin", "sdfi": "stingdefi", "tdps": "tradeplus", "navy": "boatpilot", "mcau": "meld-gold", "intx": "intexcoin", "bmh": "blockmesh-2", "mvh": "moviecash", "chess": "chesscoin-0-32", "apet": "ape-token", "bito": "bito-coin", "fyznft": "fyznft", "cbr": "cybercoin", "ycurve": "curve-fi-ydai-yusdc-yusdt-ytusd", "cnt": "centurion", "repo": "repo", "ball": "ball-coin", "hnzo": "hanzo-inu", "blfi": "blackfisk", "fsafe": "fair-safe", "vusd": "value-usd", "ponzi": "ponzicoin", "beast": "beast-dao", "flunar": "fairlunar", "koel": "koel-coin", "pass": "passport-finance", "spk": "sparks", "dlx": "dapplinks", "ltk": "litecoin-token", "vect": "vectorium", "pump": "pump-coin", "abusd": "aave-busd-v1", "ramen": "ramenswap", "1gold": "1irstgold", "ship": "shipchain", "forex": "forexcoin", "shpp": "shipitpro", "toki": "tokyo-inu", "lbt": "lbt-chain", "ltz": "litecoinz", "rpepe": "rare-pepe", "vt": "vectoraic", "etx": "ethereumx", "coal": "coalculus", "swise": "stakewise", "bnc": "bnoincoin", "acsi": "acryptosi", "fmt": "finminity", "fsp": "flashswap", "tno": "tnos-coin", "ect": "superedge", "bnz": "bonezyard", "hypr": "hyperburn", "vxrp": "venus-xrp", "skc": "skinchain", "levl": "levolution", "doos": "doos-token", "echo": "echo-token", "phn": "phillionex", "bhiba": "baby-shiba", "tokc": "tokyo", "vlink": "venus-link", "mima": "kyc-crypto", "noahark": "noah-ark", "btcbam": "bitcoinbam", "spup": "spurt-plus", "baby": "baby-token", "bsg": "bitsonic-gas", "las": "alaska-inu", "garuda": "garudaswap", "phiba": "papa-shiba", "dt3": "dreamteam3", "beluga": "belugaswap", "itam": "itam-games", "hshiba": "huskyshiba", "dac": "davinci-coin", "gnt": "greentrust", "zcnox": "zcnox-coin", "milk": "score-milk", "ist": "ishop-token", "lvh": "lovehearts", "tons": "thisoption", "ctc": "culture-ticket-chain", "mfy": "mifty-swap", "grw": "growthcoin", "zarh": "zarcash", "gfarm": "gains-farm", "syfi": "soft-yearn", "expo": "online-expo", "lbr": "liber-coin", "sdog": "small-doge", "ain": "ai-network", "gio": "graviocoin", "cron": "cryptocean", "cntm": "connectome", "vegi": "veggiecoin", "fundx": "funder-one", "ncat": "nyan-cat", "ltn": "life-token", "tking": "tiger-king", "cicc": "caica-coin", "icicb": "icicb-coin", "sprtz": "spritzcoin", "uvu": "ccuniverse", "kxc": "kingxchain", "scorgi": "spacecorgi", "rmoon": "rocketmoon", "nftl": "nftl-token", "vsc": "vsportcoin", "grow": "growing-fi", "smoo": "sheeshmoon", "akm": "cost-coin", "nxl": "next-level", "snowge": "snowgecoin", "bab": "basis-bond", "shark": "polyshark-finance", "carbon": "carboncoin", "cl": "coinlancer", "bynd": "beyondcoin", "tronx": "tronx-coin", "rain": "rain-network", "ami": "ammyi-coin", "vlc": "valuechain", "colx": "colossuscoinxt", "co2": "collective", "dscp": "disciplina-project-by-teachmeplease", "brmv": "brmv-token", "roe": "rover-coin", "jt": "jubi-token", "harta": "harta-tech", "sos": "solstarter", "btsucn": "btsunicorn", "dvc": "dragonvein", "kub": "kublaicoin", "uze": "uze-token", "ypanda": "yieldpanda", "cfl": "cryptoflow", "hora": "hora", "coral": "coral-swap", "fuze": "fuze-token", "gm": "gmcoin", "fmta": "fundamenta", "wdt": "voda-token", "mcf": "moon-chain", "nva": "neeva-defi", "jack": "jack-token", "noiz": "noiz-chain", "feta": "feta-token", "micro": "micromines", "hart": "hara-token", "tvnt": "travelnote", "rope": "rope-token", "xpn": "pantheon-x", "soil": "synth-soil", "plc": "platincoin", "tgn": "terragreen", "zlf": "zillionlife", "robet": "robet-coin", "c4t": "coin4trade", "vusdc": "venus-usdc", "dandy": "dandy", "tsx": "tradestars", "gp": "goldpieces", "nah": "strayacoin", "qac": "quasarcoin", "beer": "beer-money", "ethsc": "ethereumsc", "mob": "mobilecoin", "bhd": "bitcoin-hd", "undo": "undo-token", "ykz": "yakuza-dao", "gb": "goldblocks", "sugar": "sugarchain", "sox": "ethersocks", "jic": "joorschain", "fl": "freeliquid", "lof": "lonelyfans", "divo": "divo-token", "dapp": "dappercoin", "clr": "color", "deva": "deva-token", "sswim": "shiba-swim", "quickchart": "quickchart", "elet": "ether-legends", "bec": "betherchip", "bicas": "bithercash", "yfms": "yfmoonshot", "ogc": "onegetcoin", "hum": "humanscape", "elama": "elamachain", "bwx": "blue-whale", "kim": "king-money", "gero": "gerowallet", "qtv": "quish-coin", "jaguar": "jaguarswap", "ebsp": "ebsp-token", "usds": "stableusd", "roul": "roul-token", "pkoin": "pocketcoin", "dogefather": "dogefather", "dmch": "darma-cash", "enrg": "energycoin", "tavitt": "tavittcoin", "cent": "centercoin", "dogg": "dogg-token", "vprc": "vaperscoin", "erc": "europecoin", "tuber": "tokentuber", "basid": "basid-coin", "ski": "skillchain", "chex": "chex-token", "flt": "fluttercoin", "xbrt": "bitrewards", "frmx": "frmx-token", "escx": "escx-token", "safecookie": "safecookie", "lstr": "meetluna", "csc": "casinocoin", "usdb": "usd-bancor", "dain": "dain-token", "trv": "trustverse", "ggive": "globalgive", "arcee": "arcee-coin", "ueth": "unagii-eth", "$g": "gooddollar", "scm": "simulacrum", "gcx": "germancoin", "blinky": "blinky-bob", "qhc": "qchi-chain", "yland": "yearn-land", "safeicarus": "safelcarus", "pmp": "pumpy-farm", "udai": "unagii-dai", "zest": "thar-token", "yta": "yottacoin", "icr": "intercrone", "sets": "sensitrust", "bnfi": "blaze-defi", "lrg": "largo-coin", "iown": "iown", "sanshu": "sanshu-inu", "euru": "upper-euro", "eurx": "etoro-euro", "coic": "coic", "xpt": "cryptobuyer-token", "hgc": "higamecoin", "webn": "web-innovation-ph", "crn": "chronocoin", "drep": "drep-new", "espro": "esportspro", "rupee": "hyruleswap", "jcc": "junca-cash", "cosm": "cosmo-coin", "daa": "double-ace", "gpkr": "gold-poker", "ucos": "ucos-token", "hcs": "help-coins", "yfis": "yfiscurity", "osc": "oasis-city", "mbc": "microbitcoin", "pod": "payment-coin", "she": "shinechain", "csm": "consentium", "lnko": "lnko-token", "safegalaxy": "safegalaxy", "vbeth": "venus-beth", "tfuel": "theta-fuel", "polt": "polkatrain", "sovi": "sovi-token", "xno": "xeno-token", "bnox": "blocknotex", "cmm": "commercium", "sv7": "7plus-coin", "vusdt": "venus-usdt", "nac": "nami-trade", "oc": "oceanchain", "yfi3": "yfi3-money", "kt": "kuaitoken", "brcp": "brcp-token", "cvxcrv": "convex-crv", "ygoat": "yield-goat", "crex": "crex-token", "xrd": "raven-dark", "spirit": "spiritswap", "crl": "coral-farm", "vbusd": "venus-busd", "elt": "elite-swap", "alm": "allium-finance", "ivy": "ivy-mining", "rwn": "rowan-coin", "chs": "chainsquare", "zaif": "zaif-token", "yea": "yeafinance", "hyp": "hyperstake", "ktv": "kmushicoin", "cng": "cng-casino", "yfmb": "yfmoonbeam", "fto": "futurocoin", "soba": "soba-token", "willie": "williecoin", "pxc": "phoenixcoin", "dtop": "dhedge-top-index", "cyberd": "cyber-doge", "hedg": "hedgetrade", "comfy": "comfytoken", "argo": "argo", "mgp": "mangochain", "spring": "springrole", "os76": "osmiumcoin", "rcube": "retro-defi", "stt": "scatter-cx", "fscc": "fisco", "soda": "soda-token", "spacedoge": "space-doge", "petal": "bitflowers", "bmt": "bmining-token", "g-fi": "gorilla-fi", "ltfg": "lightforge", "cbex": "cryptobexchange", "cleanocean": "cleanocean", "kiz": "kizunacoin", "trib": "contribute", "dtube": "dtube-coin", "slam": "slam-token", "aca": "acash-coin", "moonpirate": "moonpirate", "cyf": "cy-finance", "ecpn": "ecpntoken", "cyt": "cryptokenz", "mongocm": "mongo-coin", "lowb": "loser-coin", "tiim": "triipmiles", "bmch": "bmeme-cash", "ddr": "digi-dinar", "shibm": "shiba-moon", "vx": "vitex", "mad": "mad-network", "ntb": "tokenasset", "invc": "investcoin", "torj": "torj-world", "robo": "robo-token", "ping": "cryptoping", "lce": "lance-coin", "db": "darkbuild-v2", "carbo": "carbondefi", "stlp": "tulip-seed", "soak": "soak-token", "wdr": "wider-coin", "rzn": "rizen-coin", "speed": "speed-coin", "ybear": "yield-bear", "sg": "social-good-project", "shico": "shibacorgi", "bkk": "bkex-token", "rocket": "rocketgame", "szo": "shuttleone", "kgw": "kawanggawa", "evny": "evny-token", "kfi": "klever-finance", "mexc": "mexc-token", "bcnt": "bincentive", "ctcn": "contracoin", "bkita": "baby-akita", "cnyt": "cny-tether", "fotc": "forte-coin", "vdoge": "venus-doge", "nacho": "nacho-coin", "cennz": "centrality", "konj": "konjungate", "brze": "breezecoin", "hptf": "heptafranc", "olive": "olivecash", "smartworth": "smartworth", "bff": "bitcoffeen", "jgn": "juggernaut", "rview": "reviewbase", "stkr": "staker-dao", "hungry": "hungrybear", "tune": "tune-token", "grn": "dascoin", "refraction": "refraction", "usdh": "honestcoin", "stfiro": "stakehound", "cp3r": "compounder", "when": "when-token", "rc": "russell-coin", "pint": "pub-finance", "coy": "coinanalyst", "hybn": "hey-bitcoin", "tsla": "tessla-coin", "dwz": "defi-wizard", "party": "money-party", "gly": "glyph-token", "808ta": "808ta-token", "aurora": "auroratoken", "jshiba": "jomon-shiba", "stax": "stablexswap", "mveda": "medicalveda", "btour": "btour-chain", "burger": "burger-swap", "solace": "solace-coin", "orc": "oracle-system", "clva": "clever-defi", "ddos": "disbalancer", "emax": "ethereummax", "aries": "aries-chain", "bobt": "boboo-token", "navi": "natus-vincere-fan-token", "hiz": "hiz-finance", "gl": "green-light", "fc": "futurescoin", "wemix": "wemix-token", "pal": "playandlike", "idx": "index-chain", "gnto": "goldenugget", "dxy": "dxy-finance", "tlnt": "talent-coin", "sprx": "sprint-coin", "xqc": "quras-token", "bnj": "binjit-coin", "vcash": "vcash-token", "dhold": "diamondhold", "pox": "pollux-coin", "yfarm": "yfarm-token", "ride": "ride-my-car", "famous": "famous-coin", "vollar": "vollar", "hmc": "harmonycoin", "lsilver": "lyfe-silver", "panther": "pantherswap", "boot": "bootleg-nft", "dragon": "dragon-finance", "try": "try-finance", "bdcc": "bitica-coin", "ghd": "giftedhands", "trxc": "tronclassic", "upb": "upbtc-token", "kili": "kilimanjaro", "wleo": "wrapped-leo", "dili": "d-community", "ecr": "ecredit", "pekc": "peacockcoin", "cfxq": "cfx-quantum", "bcvt": "bitcoinvend", "xbn": "xbn", "pet": "battle-pets", "punk-attr-5": "punk-attr-5", "pbom": "pocket-bomb", "btd": "bolt-true-dollar", "f1c": "future1coin", "bccx": "bitconnectx-genesis", "hdn": "hidden-coin", "marsm": "marsmission", "sss": "simple-software-solutions", "kassiahome": "kassia-home", "cca": "counos-coin", "q8e20": "q8e20-token", "drg": "dragon-coin", "remit": "remita-coin", "lsv": "litecoin-sv", "fgp": "fingerprint", "glxc": "galaxy-coin", "pkp": "pikto-group", "mrx": "linda", "tut": "trust-union", "berg": "bergco-coin", "punk-female": "punk-female", "ucr": "ultra-clear", "dfe": "dfe-finance", "pai": "project-pai", "gfnc": "grafenocoin-2", "gldr": "golder-coin", "metis": "metis-token", "dpet": "my-defi-pet", "kip": "khipu-token", "nc": "nayuta-coin", "dcnt": "decenturion", "wbnb": "wbnb", "ctrfi": "chestercoin", "lvt": "lives-token", "zeus": "zuescrowdfunding", "god": "bitcoin-god", "yff": "yff-finance", "mcn": "moneta-verde", "lxc": "latex-chain", "esz": "ethersportz", "cdash": "crypto-dash", "bgx": "bitcoingenx", "trr": "terran-coin", "skrt": "sekuritance", "brb": "rabbit-coin", "cscj": "csc-jackpot", "shokk": "shikokuaido", "rugbust": "rug-busters", "yo": "yobit-token", "mcrn": "macaronswap", "hachiko": "hachiko-inu", "actn": "action-coin", "grwi": "growers-international", "hdac": "hdac", "papp": "papp-mobile", "cub": "crypto-user-base", "iog": "playgroundz", "armx": "armx-unidos", "dnd": "dungeonswap", "gbpu": "upper-pound", "mdao": "martian-dao", "fed": "fedora-gold", "algop": "algopainter", "grew": "green-world", "fbt": "fanbi-token", "papel": "papel", "mkb": "maker-basic", "punk-attr-4": "punk-attr-4", "cbucks": "cryptobucks", "dogdefi": "dogdeficoin", "samo": "samoyedcoin", "dcy": "dinastycoin", "node": "whole-network", "minx": "innovaminex", "supra": "supra-token", "cbix7": "cbi-index-7", "ttm": "tothe-moon", "hg": "hygenercoin", "brilx": "brilliancex", "bnxx": "bitcoinnexx", "zac": "zac-finance", "crg": "cryptogcoin", "ctat": "cryptassist", "nyc": "newyorkcoin", "ioox": "ioox-system", "kp0r": "kp0rnetwork", "cf": "californium", "cakita": "chubbyakita", "nst": "newsolution", "rkt": "rocket-fund", "aidus": "aidus", "munch": "munch-token", "bscs": "bsc-station", "env": "env-finance", "liq": "liquidity-bot-token", "pig": "pig-finance", "yoo": "yoo-ecology", "spkl": "spoklottery", "sipc": "simplechain", "per": "per-project", "hland": "hland-token", "emoji": "emojis-farm", "proud": "proud-money", "zbk": "zbank-token", "ytho": "ytho-online", "tfg1": "energoncoin", "xchf": "cryptofranc", "alc": "alrightcoin", "hyd": "hydra-token", "pola": "polaris-share", "vida": "vidiachange", "zln": "zillioncoin", "baw": "wab-network", "inbox": "inbox-token", "hxn": "havens-nook", "name": "polkadomain", "zerc": "zeroclassic", "poodl": "poodle", "yfip": "yfi-paprika", "erk": "eureka-coin", "scn": "silver-coin", "live": "tronbetlive", "mandi": "mandi-token", "tkc": "turkeychain", "treep": "treep-token", "dbund": "darkbundles", "jac": "jasper-coin", "jnb": "jinbi-token", "fred": "fredenergy", "carb": "carbon-labs", "genes": "genes-chain", "hwi": "hawaii-coin", "wusd": "wrapped-usd", "wgp": "w-green-pay", "but": "bitup-token", "tom": "tom-finance", "htdf": "orient-walt", "codeo": "codeo-token", "ssn": "supersonic-finance", "svc": "satoshivision-coin", "md+": "moon-day-plus", "xpd": "petrodollar", "medi": "mediconnect", "hrd": "hrd", "cbank": "crypto-bank", "ert": "eristica", "mti": "mti-finance", "bvnd": "binance-vnd", "gpyx": "pyrexcoin", "sarco": "sarcophagus", "stark": "stark-chain", "vd": "vindax-coin", "bolo": "bollo-token", "zcrt": "zcore-token", "etf": "entherfound", "tbcc": "tbcc-wallet", "orbyt": "orbyt-token", "smile": "smile-token", "crypl": "cryptolandy", "wsc": "wesing-coin", "porte": "porte-token", "punk-zombie": "punk-zombie", "xxp": "xx-platform", "fyy": "grandpa-fan", "c2o": "cryptowater", "svr": "sovranocoin", "dgc": "digitalcoin", "qark": "qanplatform", "dfm": "defi-on-mcw", "viking": "viking-swap", "fans": "unique-fans", "dltx": "deltaexcoin", "earth": "earth-token", "dt": "dcoin-token", "btcmz": "bitcoinmono", "mc": "monkey-coin", "bridge": "multibridge", "bih": "bithostcoin", "redc": "redchillies", "bnbd": "bnb-diamond", "xrpc": "xrp-classic", "mello": "mello-token", "memes": "memes-token", "jbp": "jb-protocol", "blosm": "blossomcoin", "fetish": "fetish-coin", "carom": "carillonium", "aws": "aurus-silver", "sbgo": "bingo-share", "tbake": "bakerytools", "lnt": "lottonation", "cbp": "cashbackpro", "jus": "just-network", "dfyn": "dfyn-network", "mtr": "meter-stable", "husl": "hustle-token", "wavax": "wrapped-avax", "moar": "moar", "btchg": "bitcoinhedge", "yg": "yearn-global", "pyro": "pyro-network", "pamp": "pamp-network", "soga": "soga-project", "allbi": "all-best-ico", "kft": "knit-finance", "htn": "heartnumber", "alusd": "alchemix-usd", "zuz": "zuz-protocol", "poc": "pangea-cleanup-coin", "ror": "ror-universe", "etna": "etna-network", "btcu": "bitcoin-ultra", "wxdai": "wrapped-xdai", "bcf": "bitcoin-fast", "hogl": "hogl-finance", "btap": "bta-protocol", "wbind": "wrapped-bind", "butter": "butter-token", "yuno": "yuno-finance", "ebox": "ethbox-token", "skill": "cryptoblades", "gogo": "gogo-finance", "bic": "bitcrex-coin", "tst": "touch-social", "ubx": "ubix-network", "vnxlu": "vnx-exchange", "bulk": "bulk-network", "cann": "cannabiscoin", "xdef2": "xdef-finance", "myk": "mykonos-coin", "fcx": "fission-cash", "dragn": "astro-dragon", "bbq": "barbecueswap", "prqboost": "parsiq-boost", "wcc": "wincash-coin", "vkt": "vankia-chain", "unii": "unii-finance", "saft": "safe-finance", "bingus": "bingus-token", "lpc": "lightpaycoin", "vcg": "vipcoin-gold", "fkx": "fortknoxter", "haze": "haze-finance", "bcm": "bitcoinmoney", "rak": "rake-finance", "1mil": "1million-nfts", "balo": "balloon-coin", "yfib": "yfibalancer-finance", "yd-btc-mar21": "yd-btc-mar21", "emrx": "emirex-token", "uc": "youlive-coin", "dcb": "digital-coin", "pow": "eos-pow-coin", "catnip": "catnip-money", "grpl": "grpl-finance-2", "mok": "mocktailswap", "hokk": "hokkaidu-inu", "lnx": "linix", "yfed": "yfedfinance", "onex": "onex-network", "esrc": "echosoracoin", "cnz": "coinzo-token", "vlad": "vlad-finance", "helth": "health-token", "shibco": "shiba-cosmos", "ymen": "ymen-finance", "wxtc": "wechain-coin", "mach": "mach", "yt": "cherry-token", "bbgc": "bigbang-game", "ww": "wayawolfcoin", "obtc": "boringdao-btc", "biot": "biopassport", "kodx": "king-of-defi", "kper": "kper-network", "dixt": "dixt-finance", "seol": "seed-of-love", "wet": "weshow", "dzar": "digital-rand", "nxct": "xchain-token", "phoon": "typhoon-cash", "zep": "zeppelin-dao", "azt": "az-fundchain", "btca": "bitcoin-anonymous", "ft1": "fortune1coin", "mvt": "the-movement", "sfund": "seedify-fund", "icnq": "iconiq-lab-token", "yfos": "yfos-finance", "ttx": "talent-token", "pube": "pube-finance", "xt": "xtcom-token", "zttl": "zettelkasten", "lp": "lepard-coin", "dcw": "decentralway", "cla": "candela-coin", "epg": "encocoinplus", "vers": "versess-coin", "kpc": "koloop-basic", "tpt": "token-pocket", "fridge": "fridge-token", "xlmg": "stellar-gold", "hyper": "hyperchain-x", "sora": "sorachancoin", "pngn": "spacepenguin", "xgc": "xiglute-coin", "kbtc": "klondike-btc", "noel": "noel-capital", "vena": "vena-network", "peri": "peri-finance", "kseed": "kush-finance", "dfn": "difo-network", "grap": "grap-finance", "xts": "xaviera-tech", "cet": "coinex-token", "neww": "newv-finance", "etet": "etet-finance", "orao": "orao-network", "mcan": "medican-coin", "earn$": "earn-network", "acr": "acreage-coin", "sd": "smart-dollar", "cnrg": "cryptoenergy", "trt": "taurus-chain", "elyx": "elynet-token", "rckt": "rocket-token", "quam": "quam-network", "yd-eth-jun21": "yd-eth-jun21", "nvt": "nervenetwork", "agrs": "agoras", "fshn": "fashion-coin", "ccrb": "cryptocarbon", "hate": "heavens-gate", "loa": "loa-protocol", "phl": "placeh", "fnb": "finexbox-token", "koda": "koda-finance", "ryip": "ryi-platinum", "sdm": "sky-dog-moon", "latino": "latino-token", "hugo": "hugo-finance", "neko": "neko-network", "yd-eth-mar21": "yd-eth-mar21", "blcc": "bullers-coin", "modx": "model-x-coin", "eqo": "equos-origin", "moma": "mochi-market", "skb": "sakura-bloom", "wcelo": "wrapped-celo", "lsc": "littlesesame", "wst": "winsor-token", "mhlx": "helixnetwork", "bezoge": "bezoge-earth", "tndr": "thunder-swap", "xwin": "xwin-finance", "tyt": "tianya-token", "shibal": "shiba-launch", "map": "marcopolo", "hp": "heartbout-pay", "usdu": "upper-dollar", "ethbnt": "ethbnt", "fds": "fds", "exe": "8x8-protocol", "viagra": "viagra-token", "wec": "wave-edu-coin", "safemooncash": "safemooncash", "syax": "staked-yaxis", "lift": "lift-kitchen", "bia": "bilaxy-token", "xcon": "connect-coin", "chm": "cryptochrome", "wiken": "project-with", "ivc": "invoice-coin", "mich": "charity-alfa", "deuro": "digital-euro", "yd-btc-jun21": "yd-btc-jun21", "gcz": "globalchainz", "isikc": "isiklar-coin", "yfix": "yfix-finance", "spmk": "space-monkey", "cold": "cold-finance", "tym": "timelockcoin", "load": "load-network", "yape": "gorillayield", "crts": "cryptotipsfr", "ine": "intellishare", "dio": "deimos-token", "loon": "loon-network", "dff": "defi-firefly", "btllr": "betller-coin", "emdc": "emerald-coin", "cord": "cord-defi-eth", "brg": "bridge-oracle", "yeth": "fyeth-finance", "kombat": "crypto-kombat", "ytsla": "ytsla-finance", "codex": "codex-finance", "yrise": "yrise-finance", "adf": "ad-flex-token", "iflt": "inflationcoin", "qwla": "qawalla-token", "ext": "exchain", "bday": "birthday-cake", "exnx": "exenox-mobile", "gmng": "global-gaming", "wtp": "web-token-pay", "yfive": "yfive-finance", "womi": "wrapped-ecomi", "xfc": "football-coin", "wtk": "wadzpay-token", "molk": "mobilink-coin", "crwn": "crown-finance", "ares": "ares-protocol", "yyfi": "yyfi-protocol", "obsr": "observer-coin", "blzn": "blaze-network", "tcp": "the-crypto-prophecies", "dmtc": "dmtc-token", "ftb": "free-tool-box", "hx": "hyperexchange", "vancii": "vanci-finance", "labra": "labra-finance", "zefi": "zcore-finance", "woop": "woonkly-power", "hosp": "hospital-coin", "halo": "halo-platform", "wae": "wave-platform", "gvc": "gemvault-coin", "glo": "glosfer-token", "phtf": "phantom-token", "tai": "tai", "cust": "custody-token", "aplp": "apple-finance", "xns": "xeonbit-token", "wzec": "wrapped-zcash", "fam": "yefam-finance", "eyes": "eyes-protocol", "pmc": "paymastercoin", "o-ocean-mar22": "o-ocean-mar22", "soldier": "space-soldier", "prism": "prism-network", "xag": "xrpalike-gene", "mngo": "mango-markets", "gts": "gt-star-token", "emont": "etheremontoken", "hcut": "healthchainus", "tuda": "tutors-diary", "ltrbt": "little-rabbit", "gcbn": "gas-cash-back", "mina": "mina-protocol-iou", "aura": "aura-protocol", "dx": "dxchain", "epk": "epik-protocol", "scha": "schain-wallet", "bpc": "backpacker-coin", "nbs": "new-bitshares", "ltcb": "litecoin-bep2", "momo": "momo-protocol", "prd": "predator-coin", "nbot": "naka-bodhi-token", "stbb": "stabilize-bsc", "bsh": "bitcoin-stash", "swipe": "swipe-network", "fork": "gastroadvisor", "yfpro": "yfpro-finance", "hnc": "helleniccoin", "atc": "atlantic-coin", "dino": "dino-exchange", "l2p": "lung-protocol", "wmatic": "wmatic", "dogen": "dogen-finance", "hyfi": "hyper-finance", "nmn": "99masternodes", "most": "most-protocol", "swusd": "swusd", "port": "packageportal", "nash": "neoworld-cash", "gpc": "greenpay-coin", "entrp": "hut34-entropy", "brap": "brapper-token", "wnl": "winstars", "qcore": "qcore-finance", "tfc": "treasure-financial-coin", "lem": "lemur-finance", "volts": "volts-finance", "afin": "afin-coin", "xcf": "cenfura-token", "froge": "froge-finance", "cp": "cryptoprofile", "lunar": "lunar-highway", "pearl": "pearl-finance", "tnet": "title-network", "elcash": "electric-cash", "sbdo": "bdollar-share", "geth": "guarded-ether", "b1p": "b-one-payment", "pand": "panda-finance", "payou": "payou-finance", "pfi": "protocol-finance", "kbond": "klondike-bond", "neal": "neal", "vcoin": "tronvegascoin", "wxtz": "wrapped-tezos", "peech": "peach-finance", "rasta": "rasta-finance", "pipi": "pippi-finance", "idon": "idoneus-token", "xrm": "refine-medium", "rbtc": "rootstock", "btf": "btf", "wpx": "wallet-plus-x", "btcf": "bitcoin-final", "src": "simracer-coin", "torocus": "torocus-token", "blc": "bullionschain", "dirty": "dirty-finance", "gdoge": "gdoge-finance", "ganja": "trees-finance", "nfi": "norse-finance", "gent": "genesis-token", "inb": "insight-chain", "bhig": "buckhath-coin", "mxf": "mixty-finance", "btri": "trinity-bsc", "dark": "darkbuild", "elite": "ethereum-lite", "mort": "dynamic-supply-tracker", "69c": "6ix9ine-chain", "lyd": "lydia-finance", "gnsh": "ganesha-token", "awt": "airdrop-world", "whole": "whitehole-bsc", "xao": "alloy-project", "neuro": "neuro-charity", "stakd": "stakd-finance", "rhea": "rheaprotocol", "btad": "bitcoin-adult", "scat": "sad-cat-token", "vdg": "veridocglobal", "ul": "uselink-chain", "amio": "amino-network", "joos": "joos-protocol", "xsm": "spectrum-cash", "onlexpa": "onlexpa-token", "pyr": "vulcan-forged", "slme": "slime-finance", "krypto": "kryptobellion", "vgd": "vangold-token", "jtt": "joytube-token", "diamond": "diamond-token", "fras": "frasindo-rent", "peppa": "peppa-network", "bdog": "bulldog-token", "oac": "one-army-coin", "dscvr": "dscvr-finance", "luc": "play2live", "invox": "invox-finance", "creed": "creed-finance", "brn": "brainaut-defi", "water": "water-finance", "btnyx": "bitonyx-token", "anty": "animalitycoin", "cdy": "bitcoin-candy", "tiox": "trade-token", "hcc": "holiday-chain", "chadlink": "chad-link-set", "dawn": "dawn-protocol", "vinx": "vinx-coin-sto", "acpt": "crypto-accept", "bundb": "unidexbot-bsc", "idt": "investdigital", "gng": "gold-and-gold", "yffii": "yffii-finance", "atls": "atlas", "umc": "universal-marketing-coin", "yfst": "yfst-protocol", "hc8": "hydrocarbon-8", "ztnz": "ztranzit-coin", "lnk": "link-platform", "sch": "schillingcoin", "bf": "bitforex", "hltc": "huobi-litecoin", "spex": "sproutsextreme", "ccy": "cryptocurrency", "ald": "aludra-network", "bfr": "bridge-finance", "snb": "synchrobitcoin", "mzk": "muzika-network", "jsb": "jsb-foundation", "cbd": "greenheart-cbd", "kimchi": "kimchi-finance", "esg": "empty-set-gold", "es": "era-swap-token", "aph": "apholding-coin", "katana": "katana-finance", "kbc": "karatgold-coin", "ltcu": "litecoin-ultra", "nfd": "nifdo-protocol", "xdt": "xwc-dice-token", "xuc": "exchange-union", "umbr": "umbra-network", "chord": "chord-protocol", "cxc": "capital-x-cell", "gnc": "galaxy-network", "vcco": "vera-cruz-coin", "ecoreal": "ecoreal-estate", "wac": "warranty-chain", "atis": "atlantis-token", "miva": "minerva-wallet", "neon": "neonic-finance", "bsk": "bitcoinstaking", "dop": "dopple-finance", "perx": "peerex-network", "eveo": "every-original", "bnsg": "bns-governance", "etr": "electric-token", "shild": "shield-network", "mbull": "mad-bull-token", "dwc": "digital-wallet", "raptor": "raptor-finance", "upxau": "universal-gold", "wtf": "walnut-finance", "new": "newton-project", "fff": "force-for-fast", "kmw": "kepler-network", "owo": "one-world-coin", "ica": "icarus-finance", "mov": "motiv-protocol", "heth": "huobi-ethereum", "ucap": "unicap-finance", "svs": "silver-gateway", "3crv": "lp-3pool-curve", "hdot": "huobi-polkadot", "deve": "divert-finance", "bcash": "bankcoincash", "gvy": "groovy-finance", "osm": "options-market", "prtn": "proton-project", "amc": "anonymous-coin", "npw": "new-power-coin", "cdl": "coindeal-token", "bog": "bogged-finance", "elena": "elena-protocol", "steak": "steaks-finance", "xpose": "xpose-protocol", "upeur": "universal-euro", "snowball": "snowballtoken", "ucoin": "universal-coin", "ethmny": "ethereum-money", "liquid": "netkoin-liquid", "dynmt": "dynamite-token", "lncx": "luna-nusa-coin", "pjm": "pajama-finance", "evo": "dapp-evolution", "roy": "royal-protocol", "ctg": "cryptorg-token", "bpt": "bitplayer-token", "rosn": "roseon-finance", "rick": "infinite-ricks", "mtns": "omotenashicoin", "sho": "showcase-token", "cad": "candy-protocol", "fsc": "five-star-coin", "cspr": "casper-network", "xmc": "monero-classic-xmc", "rsct": "risecointoken", "cvt": "civitas-protocol", "swfi": "swirge-finance", "hdw": "hardware-chain", "uto": "unitopia-token", "sifi": "simian-finance", "ths": "the-hash-speed", "bribe": "bribe-token", "gzil": "governance-zil", "metp": "metaprediction", "erd": "eldorado-token", "mlk": "milk-alliance", "mayp": "maya-preferred-223", "xlab": "xceltoken-plus", "dpr": "deeper-network", "reli": "relite-finance", "thor": "asgard-finance", "ubtc": "united-bitcoin", "dbix": "dubaicoin-dbix", "espi": "spider-ecology", "bbl": "bubble-network", "2based": "2based-finance", "eer": "ethereum-erush", "dgnn": "dragon-network", "gjco": "giletjaunecoin", "hzd": "horizondollar", "foc": "theforce-trade", "wscrt": "secret-erc20", "sofi": "social-finance", "bks": "barkis", "afcash": "africunia-bank", "hnb": "hashnet-biteco", "polven": "polka-ventures", "recap": "review-capital", "dart": "dart-insurance", "sedo": "sedo-pow-token", "wanatha": "wrapped-anatha", "lat": "platon-network", "gs": "genesis-shards", "shrimp": "shrimp-finance", "mcbase": "mcbase-finance", "lyn": "lynchpin_token", "pareto": "pareto-network", "yf4": "yearn4-finance", "onez": "the-nifty-onez", "tcnx": "tercet-network", "chad": "the-chad-token", "btrl": "bitcoinregular", "cavo": "excavo-finance", "cpte": "crypto-puzzles", "dquick": "dragons-quick", "zseed": "sowing-network", "cbtc": "classicbitcoin", "buc": "buyucoin-token", "prdx": "predix-network", "elephant": "elephant-money", "byn": "beyond-finance", "pepr": "pepper-finance", "uskita": "american-akita", "ccake": "cheesecakeswap", "eoc": "everyonescrypto", "print": "printer-finance", "wsienna": "sienna-erc20", "ssj": "super-saiya-jin", "wmpro": "wm-professional", "advc": "advertisingcoin", "udt": "unlock-protocol", "libref": "librefreelencer", "flexethbtc": "flexeth-btc-set", "esce": "escroco", "plst": "philosafe-token", "bpakc": "bitpakcointoken", "mpwr": "empower-network", "spl": "simplicity-coin", "comc": "community-chain", "nftart": "nft-art-finance", "afi": "aries-financial-token", "trdl": "strudel-finance", "wccx": "wrapped-conceal", "ringx": "ring-x-platform", "skt": "sealblock-token", "boc": "bitorcash-token", "ans": "ans-crypto-coin", "pussy": "pussy-financial", "blink": "blockmason-link", "qcx": "quickx-protocol", "hoodrat": "hoodrat-finance", "yfild": "yfilend-finance", "yfarmer": "yfarmland-token", "kmc": "king-maker-coin", "elongd": "elongate-duluxe", "cnp": "cryptonia-poker", "wsta": "wrapped-statera", "sprkl": "sparkle", "chal": "chalice-finance", "shield": "shield-protocol", "nos": "nitrous-finance", "dxts": "destiny-success", "yfiking": "yfiking-finance", "typh": "typhoon-network", "m3c": "make-more-money", "idv": "idavoll-network", "krg": "karaganda-token", "cwv": "cryptoworld-vip", "lic": "lightening-cash", "dimi": "diminutive-coin", "gdl": "gondala-finance", "wag8": "wrapped-atromg8", "xbt": "elastic-bitcoin", "ddrt": "digidinar-token", "infi": "insured-finance", "fol": "folder-protocol", "fico": "french-ico-coin", "emb": "block-collider", "bwb": "bw-token", "weather": "weather-finance", "vct": "valuecybertoken", "bcc": "basis-coin-cash", "trips": "trips-community", "usdj": "just-stablecoin", "ec2": "employment-coin", "dvi": "dvision-network", "nftpunk": "nftpunk-finance", "smpl": "smpl-foundation", "esn": "escudonavacense", "nmp": "neuromorphic-io", "ldn": "ludena-protocol", "gdt": "globe-derivative-exchange", "renbtccurve": "lp-renbtc-curve", "defit": "defit", "slice": "tranche-finance", "hps": "happiness-token", "aens": "aen-smart-token", "axa": "alldex-alliance", "bashtank": "baby-shark-tank", "tin": "tinfoil-finance", "bst1": "blueshare-token", "moonday": "moonday-finance", "tni": "tunnel-protocol", "sheesha": "sheesha-finance", "bips": "moneybrain-bips", "bpriva": "privapp-network", "stpl": "stream-protocol", "uusdc": "unagii-usd-coin", "fish": "penguin-party-fish", "xyx": "burn-yield-burn", "altm": "altmarkets-coin", "fusion": "fusion-energy-x", "craft": "decraft-finance", "mg": "minergate-token", "rlr": "relayer-network", "ufc": "union-fair-coin", "bttr": "bittracksystems", "nyan": "yieldnyan-token", "snbl": "safenebula", "bchip": "bluechips-token", "aevo": "aevo", "usdo": "usd-open-dollar", "kimochi": "kimochi-finance", "rfy": "rfyield-finance", "brzx": "braziliexs-token", "biut": "bit-trust-system", "pld": "pureland-project", "fbn": "five-balance", "spot": "cryptospot-token", "bplc": "blackpearl-chain", "qqq": "qqq-token", "vsd": "value-set-dollar", "kdg": "kingdom-game-4-0", "unicrap": "unicrap", "tori": "storichain-token", "rnrc": "rock-n-rain-coin", "wsb": "wall-street-bets-dapp", "idlesusdyield": "idle-susd-yield", "flm": "flamingo-finance", "wbb": "wild-beast-block", "fxtc": "fixed-trade-coin", "gme": "gamestop-finance", "hpt": "huobi-pool-token", "ccf": "cerberus", "bcr": "bankcoin-reserve", "magi": "magikarp-finance", "whxc": "whitex-community", "xlpg": "stellarpayglobal", "bdigg": "badger-sett-digg", "bxk": "bitbook-gambling", "tomoe": "tomoe", "scho": "scholarship-coin", "cytr": "cyclops-treasure", "supt": "super-trip-chain", "shibaken": "shibaken-finance", "cgc": "cash-global-coin", "bb": "blackberry-token", "usdfl": "usdfreeliquidity", "u8d": "universal-dollar", "sya": "save-your-assets", "tcapethdai": "holistic-eth-set", "mof": "molecular-future", "shx": "stronghold-token", "tryon": "stellar-invictus", "gpo": "galaxy-pool-coin", "jfi": "jackpool-finance", "cnet": "currency-network", "xep": "electra-protocol", "idleusdcyield": "idle-usdc-yield", "ipx": "ipx-token", "saturn": "saturn-network", "syfl": "yflink-synthetic", "tschybrid": "tronsecurehybrid", "hcore": "hardcore-finance", "tcapbtcusdc": "holistic-btc-set", "sensi": "sensible-finance", "ssl": "sergey-save-link", "btrs": "bitball-treasure", "swl": "swiftlance-token", "mally": "malamute-finance", "sny": "syntheify-token", "hds": "hotdollars-token", "goi": "goforit", "ggc": "gg-coin", "idleusdtyield": "idle-usdt-yield", "afc": "apiary-fund-coin", "eurt": "euro-ritva-token", "tkx": "tokenize-xchange", "myid": "my-identity-coin", "roger": "theholyrogercoin", "rtf": "regiment-finance", "pnc": "parellel-network", "mwc": "mimblewimblecoin", "bhc": "billionhappiness", "bbi": "bigboys-industry", "change": "change-our-world", "uhp": "ulgen-hash-power", "bcs": "business-credit-substitute", "mtlmc3": "metal-music-coin", "atfi": "atlantic-finance", "plum": "plumcake-finance", "bci": "bitcoin-interest", "tsc": "time-space-chain", "hole": "super-black-hole", "nye": "newyork-exchange", "degenr": "degenerate-money", "ltfn": "litecoin-finance", "cyc": "cyclone-protocol", "nnn": "novem-gold-token", "west": "waves-enterprise", "mtnt": "mytracknet-token", "vamp": "vampire-protocol", "safedog": "safedog-protocol", "aac": "acute-angle-cloud", "reau": "vira-lata-finance", "dcl": "delphi-chain-link", "bvl": "bullswap-protocol", "mkt": "monkey-king-token", "eosbull": "3x-long-eos-token", "thpt": "helio-power-token", "stars": "mogul-productions", "ce": "crypto-excellence", "okbbull": "3x-long-okb-token", "rvc": "ravencoin-classic", "trxbull": "3x-long-trx-token", "ksp": "klayswap-protocol", "ghp": "global-hash-power", "opcx": "over-powered-coin", "stor": "self-storage-coin", "encx": "enceladus-network", "tmcn": "timecoin-protocol", "mcat20": "wrapped-moon-cats", "xbtx": "bitcoin-subsidium", "mcaps": "mango-market-caps", "goldr": "golden-ratio-coin", "csto": "capitalsharetoken", "meteor": "meteorite-network", "yficg": "yfi-credits-group", "ssf": "safe-seafood-coin", "vbzrx": "vbzrx", "brain": "nobrainer-finance", "agov": "answer-governance", "leobull": "3x-long-leo-token", "sxcc": "southxchange-coin", "asm": "assemble-protocol", "icp": "internet-computer", "ciphc": "cipher-core-token", "spr": "polyvolve-finance", "foxt": "fox-trading-token", "macpo": "macpo", "mps": "mt-pelerin-shares", "tpc": "trading-pool-coin", "bbkfi": "bitblocks-finance", "mdza": "medooza-ecosystem", "sbf": "steakbank-finance", "bnbbull": "3x-long-bnb-token", "xrpbull": "3x-long-xrp-token", "ctf": "cybertime-finance", "rvp": "revolution-populi", "twj": "tronweeklyjournal", "stgz": "stargaze-protocol", "usdap": "bond-appetite-usd", "itf": "ins3-finance-coin", "sicc": "swisscoin-classic", "limex": "limestone-network", "3cs": "cryptocricketclub", "etnxp": "electronero-pulse", "far": "farmland-protocol", "mee": "mercurity-finance", "cbsn": "blockswap-network", "xgt": "xion-global-token", "chow": "chow-chow-finance", "yusdc": "yusdc-busd-pool", "cnc": "global-china-cash", "stnd": "standard-protocol", "sgc": "secured-gold-coin", "ethusdadl4": "ethusd-adl-4h-set", "uusdt": "unagii-tether-usd", "nhc": "neo-holistic-coin", "bctr": "bitcratic-revenue", "gbc": "golden-bridge-coin", "loom": "loom-network-new", "mhsp": "melonheadsprotocol", "xrpbear": "3x-short-xrp-token", "ght": "global-human-trust", "axt": "alliance-x-trading", "catx": "cat-trade-protocol", "okbhedge": "1x-short-okb-token", "trxhedge": "1x-short-trx-token", "puml": "puml-better-health", "satx": "satoexchange-token", "delta rlp": "rebasing-liquidity", "bnbhedge": "1x-short-bnb-token", "trxbear": "3x-short-trx-token", "bafi": "bafi-finance-token", "mco2": "moss-carbon-credit", "xuni": "ultranote-infinity", "mpg": "max-property-group", "copter": "helicopter-finance", "ethmoonx": "eth-moonshot-x-yield-set", "iop": "internet-of-people", "yfb2": "yearn-finance-bit2", "kp3rb": "keep3r-bsc-network", "pvp": "playervsplayercoin", "fz": "frozencoin-network", "eqmt": "equus-mining-token", "hbch": "huobi-bitcoin-cash", "gsa": "global-smart-asset", "hbo": "hash-bridge-oracle", "wszo": "wrapped-shuttleone", "abp": "arc-block-protocol", "kch": "keep-calm", "cpi": "crypto-price-index", "tln": "trustline-network", "pmt": "playmarket", "liqlo": "liquid-lottery-rtc", "if": "impossible-finance", "yhfi": "yearn-hold-finance", "afdlt": "afrodex-labs-token", "unit": "universal-currency", "leobear": "3x-short-leo-token", "ang": "aureus-nummus-gold", "cgb": "crypto-global-bank", "eosbear": "3x-short-eos-token", "awc": "atomic-wallet-coin", "brick": "brick", "tan": "taklimakan-network", "zelda elastic cash": "zelda-elastic-cash", "dzi": "definition-network", "bnbbear": "3x-short-bnb-token", "bbadger": "badger-sett-badger", "aggt": "aggregator-network", "okbbear": "3x-short-okb-token", "eoshedge": "1x-short-eos-token", "xrphedge": "1x-short-xrp-token", "pol": "proof-of-liquidity", "dfly": "dragonfly-protocol", "rtc": "read-this-contract", "rmc": "russian-miner-coin", "btfc": "bitcoin-flash-cash", "zgt": "zg-blockchain-token", "yfie": "yfiexchange-finance", "hsn": "helper-search-token", "msc": "monster-slayer-cash", "ceek": "ceek", "sxpbull": "3x-long-swipe-token", "xjp": "exciting-japan-coin", "wcusd": "wrapped-celo-dollar", "fcd": "future-cash-digital", "xtzbull": "3x-long-tezos-token", "bfht": "befasterholdertoken", "sushibull": "3x-long-sushi-token", "hmng": "hummingbird-finance", "xspc": "spectresecuritycoin", "subx": "startup-boost-token", "plaas": "plaas-farmers-token", "eoshalf": "0-5x-long-eos-token", "cana": "cannabis-seed-token", "vntw": "value-network-token", "wxmr": "wrapped-xmr-btse", "ygy": "generation-of-yield", "hbdc": "happy-birthday-coin", "yskf": "yearn-shark-finance", "mkrbull": "3x-long-maker-token", "vgo": "virtual-goods-token", "wht": "wrapped-huobi-token", "tmh": "trustmarkethub-token", "wmc": "wrapped-marblecards", "gsc": "global-social-chain", "ann": "apexel-natural-nano", "wton": "wrapped-ton-crystal", "trdg": "tardigrades-finance", "bbtc": "binance-wrapped-btc", "btcgw": "bitcoin-galaxy-warp", "ncp": "newton-coin-project", "spy": "satopay-yield-token", "mclb": "millenniumclub", "cix100": "cryptoindex-io", "pxt": "populous-xbrl-token", "ff1": "two-prime-ff1-token", "pci": "pay-coin", "dola": "dola-usd", "climb": "climb-token-finance", "ledu": "education-ecosystem", "refi": "realfinance-network", "sbyte": "securabyte-protocol", "upusd": "universal-us-dollar", "xrphalf": "0-5x-long-xrp-token", "coc": "cocktailbar", "sst": "simba-storage-token", "wsdoge": "doge-of-woof-street", "okbhalf": "0-5x-long-okb-token", "emp": "electronic-move-pay", "vit": "vice-industry-token", "dss": "defi-shopping-stake", "stoge": "stoner-doge", "pnix": "phoenixdefi-finance", "maticbull": "3x-long-matic-token", "gmm": "gold-mining-members", "beth": "binance-eth", "\u2728": "sparkleswap-rewards", "gmc24": "24-genesis-mooncats", "yi12": "yi12-stfinance", "yfiv": "yearn-finance-value", "ymf20": "yearn20moonfinance", "tgco": "thaler", "sushibear": "3x-short-sushi-token", "wx42": "wrapped-x42-protocol", "deor": "decentralized-oracle", "opm": "omega-protocol-money", "aurum": "alchemist-defi-aurum", "nut": "native-utility-token", "lfbtc": "lift-kitchen-lfbtc", "afo": "all-for-one-business", "dollar": "dollar-online", "amf": "asian-model-festival", "sleepy": "sleepy-sloth", "xcmg": "connect-mining-coin", "scv": "super-coinview-token", "wis": "experty-wisdom-token", "sxphedge": "1x-short-swipe-token", "usc": "ultimate-secure-cash", "xtzhedge": "1x-short-tezos-token", "yfc": "yearn-finance-center", "hpay": "hyper-credit-network", "ibeth": "interest-bearing-eth", "mkrbear": "3x-short-maker-token", "teo": "trust-ether-reorigin", "utt": "united-traders-token", "pnixs": "phoenix-defi-finance", "matichedge": "1x-short-matic-token", "sxpbear": "3x-short-swipe-token", "idledaiyield": "idle-dai-yield", "trybbull": "3x-long-bilira-token", "bnfy": "b-non-fungible-yearn", "bvg": "bitcoin-virtual-gold", "thex": "thore-exchange", "gbpx": "etoro-pound-sterling", "bdoge": "blue-eyes-white-doge", "forestplus": "the-forbidden-forest", "rrt": "recovery-right-token", "fredx": "fred-energy-erc20", "terc": "troneuroperewardcoin", "vgt": "vault12", "tmtg": "the-midas-touch-gold", "uenc": "universalenergychain", "usdtbull": "3x-long-tether-token", "atombull": "3x-long-cosmos-token", "xtzbear": "3x-short-tezos-token", "hzt": "black-diamond-rating", "aapl": "apple-protocol-token", "infinity": "infinity-protocol-bsc", "xtzhalf": "0-5x-long-tezos-token", "efg": "ecoc-financial-growth", "upak": "unicly-pak-collection", "sxphalf": "0-5x-long-swipe-token", "xbx": "bitex-global", "acd": "alliance-cargo-direct", "idlewbtcyield": "idle-wbtc-yield", "gtf": "globaltrustfund-token", "bsbt": "bit-storage-box-token", "idletusdyield": "idle-tusd-yield", "btsc": "beyond-the-scene-coin", "xlmbull": "3x-long-stellar-token", "trybbear": "3x-short-bilira-token", "marc": "market-arbitrage-coin", "usd": "uniswap-state-dollar", "zomb": "antique-zombie-shards", "glob": "global-reserve-system", "adabull": "3x-long-cardano-token", "dca": "decentralized-currency-assets", "edi": "freight-trust-network", "ggt": "gard-governance-token", "earn": "yearn-classic-finance", "blo": "based-loans-ownership", "z502": "502-bad-gateway-token", "matichalf": "0-5x-long-matic-token", "linkpt": "link-profit-taker-set", "cft": "coinbene-future-token", "lbxc": "lux-bio-exchange-coin", "seco": "serum-ecosystem-token", "smrat": "secured-moonrat-token", "atombear": "3x-short-cosmos-token", "qtc": "quality-tracing-chain", "ddrst": "digidinar-stabletoken", "wct": "waves-community-token", "incx": "international-cryptox", "usdtbear": "3x-short-tether-token", "float": "float-protocol-float", "evz": "electric-vehicle-zone", "znt": "zenswap-network-token", "yfn": "yearn-finance-network", "ducato": "ducato-protocol-token", "julb": "justliquidity-binance", "vetbull": "3x-long-vechain-token", "gcc": "thegcccoin", "knc": "kyber-network-crystal", "kun": "qian-governance-token", "crs": "cryptorewards", "htg": "hedge-tech-governance", "wows": "wolves-of-wall-street", "atomhedge": "1x-short-cosmos-token", "ddn": "data-delivery-network", "cts": "chainlink-trading-set", "intratio": "intelligent-ratio-set", "dcd": "digital-currency-daily", "balbull": "3x-long-balancer-token", "dant": "digital-antares-dollar", "bed": "bit-ecological-digital", "e2c": "electronic-energy-coin", "leg": "legia-warsaw-fan-token", "nami": "nami-corporation-token", "ltcbull": "3x-long-litecoin-token", "tcat": "the-currency-analytics", "vethedge": "1x-short-vechain-token", "well": "wellness-token-economy", "gspi": "gspi", "ecell": "consensus-cell-network", "dpt": "diamond-platform-token", "gdc": "global-digital-content", "bmp": "brother-music-platform", "yfp": "yearn-finance-protocol", "vetbear": "3x-short-vechain-token", "ihf": "invictus-hyprion-fund", "goz": "goztepe-s-k-fan-token", "call": "global-crypto-alliance", "hth": "help-the-homeless-coin", "paxgbull": "3x-long-pax-gold-token", "yefi": "yearn-ethereum-finance", "adahedge": "1x-short-cardano-token", "xlmbear": "3x-short-stellar-token", "ort": "omni-real-estate-token", "set": "sustainable-energy-token", "zelda summer nuts cash": "zelda-summer-nuts-cash", "uwbtc": "unagii-wrapped-bitcoin", "mcpc": "mobile-crypto-pay-coin", "tgcd": "trongamecenterdiamonds", "ahf": "americanhorror-finance", "hedge": "1x-short-bitcoin-token", "linkrsico": "link-rsi-crossover-set", "yfrm": "yearn-finance-red-moon", "dogebull": "3x-long-dogecoin-token", "ubi": "universal-basic-income", "adabear": "3x-short-cardano-token", "algobull": "3x-long-algorand-token", "ethbull": "3x-long-ethereum-token", "zelda spring nuts cash": "zelda-spring-nuts-cash", "tgic": "the-global-index-chain", "cvcc": "cryptoverificationcoin", "bbb": "bullbearbitcoin-set-ii", "inteth": "intelligent-eth-set-ii", "smnc": "simple-masternode-coin", "smoke": "the-smokehouse-finance", "tgct": "tron-game-center-token", "atomhalf": "0-5x-long-cosmos-token", "algohedge": "1x-short-algorand-token", "dogebear": "3x-short-dogecoin-token", "tomobull": "3x-long-tomochain-token", "bags": "basis-gold-share-heco", "idledaisafe": "idle-dai-risk-adjusted", "uwaifu": "unicly-waifu-collection", "brz": "brz", "ltchedge": "1x-short-litecoin-token", "gve": "globalvillage-ecosystem", "bbe": "bullbearethereum-set-ii", "vbnt": "bancor-governance-token", "adahalf": "0-5x-long-cardano-token", "half": "0-5x-long-bitcoin-token", "mlgc": "marshal-lion-group-coin", "twob": "the-whale-of-blockchain", "balbear": "3x-short-balancer-token", "dogehedge": "1x-short-dogecoin-token", "inex": "internet-exchange-token", "ethbear": "3x-short-ethereum-token", "aipe": "ai-predicting-ecosystem", "bnkrx": "bankroll-extended-token", "pwc": "prime-whiterock-company", "paxgbear": "3x-short-pax-gold-token", "ethhedge": "1x-short-ethereum-token", "ethrsiapy": "eth-rsi-60-40-yield-set-ii", "ltcbear": "3x-short-litecoin-token", "fnxs": "financex-exchange-token", "algobear": "3x-short-algorand-token", "wbcd": "wrapped-bitcoin-diamond", "ems": "ethereum-message-search", "linkbull": "3x-long-chainlink-token", "yfiec": "yearn-finance-ecosystem", "sato": "super-algorithmic-token", "linkbear": "3x-short-chainlink-token", "sup": "supertx-governance-token", "ethmo": "eth-momentum-trigger-set", "upt": "universal-protocol-token", "bsvbull": "3x-long-bitcoin-sv-token", "btceth5050": "btc-eth-equal-weight-set", "ass": "australian-safe-shepherd", "bvol": "1x-long-btc-implied-volatility-token", "aat": "agricultural-trade-chain", "ethhalf": "0-5x-long-ethereum-token", "sxut": "spectre-utility-token", "tomobear": "3x-short-tomochain-token", "paxghalf": "0-5x-long-pax-gold-token", "idleusdtsafe": "idle-usdt-risk-adjusted", "p2ps": "p2p-solutions-foundation", "defibull": "3x-long-defi-index-token", "rae": "rae-token", "basd": "binance-agile-set-dollar", "idleusdcsafe": "idle-usdc-risk-adjusted", "balhalf": "0-5x-long-balancer-token", "pec": "proverty-eradication-coin", "linkhedge": "1x-short-chainlink-token", "cbn": "connect-business-network", "algohalf": "0-5x-long-algorand-token", "bhp": "blockchain-of-hash-power", "dogehalf": "0-5x-long-dogecoin-token", "nyante": "nyantereum", "best": "bitpanda-ecosystem-token", "yefim": "yearn-finance-management", "pbtt": "purple-butterfly-trading", "tomohedge": "1x-short-tomochain-token", "anw": "anchor-neural-world-token", "cmid": "creative-media-initiative", "sxdt": "spectre-dividend-token", "bptn": "bit-public-talent-network", "lega": "link-eth-growth-alpha-set", "cgen": "community-generation", "defibear": "3x-short-defi-index-token", "licc": "life-is-camping-community", "xautbull": "3x-long-tether-gold-token", "bsvbear": "3x-short-bitcoin-sv-token", "brrr": "money-printer-go-brrr-set", "ulu": "universal-liquidity-union", "cmccoin": "cine-media-celebrity-coin", "byte": "btc-network-demand-set-ii", "linkhalf": "0-5x-long-chainlink-token", "htbull": "3x-long-huobi-token-token", "eth2": "eth2-staking-by-poolx", "wcdc": "world-credit-diamond-coin", "fame": "saint-fame", "defihedge": "1x-short-defi-index-token", "cva": "crypto-village-accelerator", "arcc": "asia-reserve-currency-coin", "wgrt": "waykichain-governance-coin", "defihalf": "0-5x-long-defi-index-token", "drgnbull": "3x-long-dragon-index-token", "xac": "general-attention-currency", "xautbear": "3x-short-tether-gold-token", "dcto": "decentralized-crypto-token", "btceth7525": "btc-eth-75-25-weight-set", "bchbull": "3x-long-bitcoin-cash-token", "yfka": "yield-farming-known-as-ash", "bsvhalf": "0-5x-long-bitcoin-sv-token", "rsp": "real-estate-sales-platform", "chft": "crypto-holding-frank-token", "htbear": "3x-short-huobi-token-token", "midbull": "3x-long-midcap-index-token", "ethbtc7525": "eth-btc-75-25-weight-set", "sheesh": "sheesh-it-is-bussin-bussin", "btmxbull": "3x-long-bitmax-token-token", "iqc": "intelligence-quickly-chain", "sbx": "degenerate-platform", "cute": "blockchain-cuties-universe", "btmxbear": "3x-short-bitmax-token-token", "fact": "fee-active-collateral-token", "eth20smaco": "eth_20_day_ma_crossover_set", "xauthalf": "0-5x-long-tether-gold-token", "lpnt": "luxurious-pro-network-token", "cusdtbull": "3x-long-compound-usdt-token", "acc": "asian-african-capital-chain", "kyte": "kambria-yield-tuning-engine", "bitn": "bitcoin-company-network", "yfdt": "yearn-finance-diamond-token", "btcrsiapy": "btc-rsi-crossover-yield-set", "privbull": "3x-long-privacy-index-token", "qdao": "q-dao-governance-token-v1-0", "eth50smaco": "eth-50-day-ma-crossover-set", "bchhedge": "1x-short-bitcoin-cash-token", "thetabull": "3x-long-theta-network-token", "ethrsi6040": "eth-rsi-60-40-crossover-set", "innbc": "innovative-bioresearch", "altbull": "3x-long-altcoin-index-token", "midbear": "3x-short-midcap-index-token", "drgnbear": "3x-short-dragon-index-token", "court": "optionroom-governance-token", "bchbear": "3x-short-bitcoin-cash-token", "btcfund": "btc-fund-active-trading-set", "kncbull": "3x-long-kyber-network-token", "bullshit": "3x-long-shitcoin-index-token", "bxa": "blockchain-exchange-alliance", "bchhalf": "0-5x-long-bitcoin-cash-token", "drgnhalf": "0-5x-long-dragon-index-token", "privbear": "3x-short-privacy-index-token", "kncbear": "3x-short-kyber-network-token", "altbear": "3x-short-altcoin-index-token", "compbull": "3x-long-compound-token-token", "midhalf": "0-5x-long-midcap-index-token", "mlr": "mega-lottery-services-global", "cusdtbear": "3x-short-compound-usdt-token", "cusdthedge": "1x-short-compound-usdt-token", "scds": "shrine-cloud-storage-network", "blct": "bloomzed-token", "etas": "eth-trending-alpha-st-set-ii", "privhedge": "1x-short-privacy-index-token", "uglyph": "unicly-autoglyph-collection", "innbcl": "innovativebioresearchclassic", "mqss": "set-of-sets-trailblazer-fund", "eth12emaco": "eth-12-day-ema-crossover-set", "thetabear": "3x-short-theta-network-token", "eth26emaco": "eth-26-day-ema-crossover-set", "thetahedge": "1x-short-theta-network-token", "tusc": "original-crypto-coin", "eloap": "eth-long-only-alpha-portfolio", "knchalf": "0-5x-long-kyber-network-token", "privhalf": "0-5x-long-privacy-index-token", "compbear": "3x-short-compound-token-token", "cnyq": "cnyq-stablecoin-by-q-dao-v1", "thetahalf": "0-5x-long-theta-network-token", "ibp": "innovation-blockchain-payment", "bloap": "btc-long-only-alpha-portfolio", "tip": "technology-innovation-project", "jpyq": "jpyq-stablecoin-by-q-dao-v1", "greed": "fear-greed-sentiment-set-ii", "comphedge": "1x-short-compound-token-token", "bearshit": "3x-short-shitcoin-index-token", "hedgeshit": "1x-short-shitcoin-index-token", "ethbtcemaco": "eth-btc-ema-ratio-trading-set", "ethbtcrsi": "eth-btc-rsi-ratio-trading-set", "ethemaapy": "eth-26-ema-crossover-yield-set", "althalf": "0-5x-long-altcoin-index-token", "etcbull": "3x-long-ethereum-classic-token", "ustonks-apr21": "ustonks-apr21", "cdsd": "contraction-dynamic-set-dollar", "bbra": "boobanker-research-association", "halfshit": "0-5x-long-shitcoin-index-token", "bcac": "business-credit-alliance-chain", "linkethrsi": "link-eth-rsi-ratio-trading-set", "yvboost": "yvboost", "uch": "universidad-de-chile-fan-token", "madai": "matic-aave-dai", "mayfi": "matic-aave-yfi", "epm": "extreme-private-masternode-coin", "etcbear": "3x-short-ethereum-classic-token", "ntrump": "no-trump-augur-prediction-token", "bocbp": "btc-on-chain-beta-portfolio-set", "bhsc": "blackholeswap-compound-dai-usdc", "mauni": "matic-aave-uni", "malink": "matic-aave-link", "ethpa": "eth-price-action-candlestick-set", "maweth": "matic-aave-weth", "matusd": "matic-aave-tusd", "eth20macoapy": "eth-20-ma-crossover-yield-set-ii", "mausdt": "matic-aave-usdt", "mausdc": "matic-aave-usdc", "maaave": "matic-aave-aave", "ibvol": "1x-short-btc-implied-volatility", "etchalf": "0-5x-long-ethereum-classic-token", "ethmacoapy": "eth-20-day-ma-crossover-yield-set", "ugas-jan21": "ulabs-synthetic-gas-futures-expiring-1-jan-2021", "ebloap": "eth-btc-long-only-alpha-portfolio", "usns": "ubiquitous-social-network-service", "bqt": "blockchain-quotations-index-token", "ylab": "yearn-finance-infrastructure-labs", "pxgold-may2021": "pxgold-synthetic-gold-31-may-2021", "gusdt": "gusd-token", "zjlt": "zjlt-distributed-factoring-network", "cring": "darwinia-crab-network", "exchbull": "3x-long-exchange-token-index-token", "leloap": "link-eth-long-only-alpha-portfolio", "cbe": "cbe", "apeusd-uni-dec21": "apeusd-uni-synthetic-usd-dec-2021", "apeusd-uma-dec21": "apeusd-uma-synthetic-usd-dec-2021", "apeusd-snx-dec21": "apeusd-snx-synthetic-usd-dec-2021", "emtrg": "meter-governance-mapped-by-meter-io", "exchhedge": "1x-short-exchange-token-index-token", "exchbear": "3x-short-exchange-token-index-token", "apeusd-aave-dec21": "apeusd-aave-synthetic-usd-dec-2021", "apeusd-link-dec21": "apeusd-link-synthetic-usd-dec-2021", "exchhalf": "0-5x-long-echange-token-index-token", "dvp": "decentralized-vulnerability-platform", "ddam": "decentralized-data-assets-management", "linkethpa": "eth-link-price-action-candlestick-set", "qdefi": "qdefi-rating-governance-token-v2", "ugas-jun21": "ugas-jun21", "realtoken-8342-schaefer-hwy-detroit-mi": "realtoken-8342-schaefer-hwy-detroit-mi", "realtoken-9336-patton-st-detroit-mi": "realtoken-9336-patton-st-detroit-mi", "dml": "decentralized-machine-learning", "realtoken-20200-lesure-st-detroit-mi": "realtoken-20200-lesure-st-detroit-mi", "pxusd-mar2022": "pxusd-synthetic-usd-expiring-31-mar-2022", "pxusd-mar2021": "pxusd-synthetic-usd-expiring-1-april-2021", "cdr": "communication-development-resources-token", "realtoken-16200-fullerton-ave-detroit-mi": "realtoken-16200-fullerton-avenue-detroit-mi", "pxgold-mar2022": "pxgold-synthetic-gold-expiring-31-mar-2022", "realtoken-10024-10028-appoline-st-detroit-mi": "realtoken-10024-10028-appoline-st-detroit-mi", "bchnrbtc-jan-2021": "bchnrbtc-synthetic", "uusdrbtc-dec": "uusdrbtc-synthetic-token-expiring-31-december-2020", "uusdweth-dec": "yusd-synthetic-token-expiring-31-december-2020", "mario-cash-jan-2021": "mario-cash-jan-2021"};
//end
