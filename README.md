# COINGECKO
CoinGecko Spreadsheet Feed: Prices, Volumes, Market Cap


######
## PUBLICATION LINKS
###### [Link to Google Sheets public template!](https://docs.google.com/spreadsheets/d/1-QNPo7-gq3vLMoxrCWg_DwTA5dfD9b-Lv-tRVTqo1RE/edit?usp=sharing)   
###### [Link to Coingecko's Youtube video](https://www.youtube.com/watch?v=pgTbiwTna9s) 
###### [Link to Coingecko's API](https://www.coingecko.com/api/documentations/v3#) 
###### [Link to the Medium Publication](https://medium.com/the-cryptocurious/coingecko-prices-volumes-market-caps-in-google-sheets-and-excel-a1a3ee201cb8)
###### [Link to Google Sheet's Set-up](https://medium.com/the-cryptocurious/google-sheet-open-source-cryptotools-set-up-9420e3940a8a)

## FUNCTIONS
|  [GECKOPRICE](#geckoprice) 	|  [GECKOVOLUME](#geckovolume) 	|  [GECKOCAP](#geckocap) 	|  [GECKOPRICEBYNAME](#geckopricebyname)
|  [GECKOATH GECKOATL](#geckoath-geckoatl) 	|  [GECKOCHANGE](#geckochange) 	|  [GECKO24HPRICECHANGE](#gecko24hpricechange) 	|  [GECKOHIST](#geckohist)
|  [GECKOCAPTOT](#geckocaptot) 	|  [GECKOCAPDOMINANCE](#geckocapdominance) 	|  [GECKOSUPPLY](#geckosupply) 	|  [GECKORANK](#geckorank) 	
|  [GECKOCAPDILUTED](#geckocaptot) 	|  [GECKOCHART](#geckocapdominance) 	|  [GECKOHISTBYDAY](#geckosupply) 	|  [GECKO24HIGH GECKO24LOW](#geckorank)
|  [GECKO_ID_DATA](#geckocaptot) 	|  [GECKOLOGO](#geckocapdominance) 	|  [COINGECKO_ID](#geckosupply) 	

## GECKOPRICE
### Imports CoinGecko's cryptocurrency prices into Google spreadsheets. 

![CoingeckoPrice](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckoprice_array.gif)

###### =GECKOPRICE(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOPRICE("BTC", "USD","$A$1")
##### EXAMPLE    =GECKOPRICE(A1:A10)


######

## GECKOVOLUME
### Imports CoinGecko's cryptocurrency volumes into Google spreadsheets. 

![GeckoVolumeEur](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckoVOLUME_array_EUR.gif)

###### =GECKOVOLUME(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOVOLUME("BTC", "USD","$A$1")
##### EXAMPLE    =GECKOVOLUME(A1:A10, "EUR")


######

## GECKOCAP
### Imports CoinGecko's cryptocurrency market capitalization into Google spreadsheets. 

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCAP.gif)

###### =GECKOCAP(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOCAP("BTC", "USD","$A$1")
##### EXAMPLE    =GECKOCAP(A1:A10, "EUR")


######
## GECKOPRICEBYNAME
### Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The Id of cryptocurrency ticker can be found in the following coingecko web page  (https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1)

![GECKOPRICEBYNAME](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOPRICEBYNAME.gif)

###### =GECKOPRICEBYNAME(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOPRICEBYNAME("bitcoinV", "USD","$A$1")

##### NB: The functions GECKOVOLUMEBYNAME, GECKOCAPBYNAME, GECKOCHANGEBYNAME, GECKOLOGOBYNAME can be used in a similar way as GECKOPRICEBYNAME
######

## GECKOATH GECKOATL
### Imports CoinGecko's cryptocurrency All Time High AND Low Prices into Google spreadsheets. 

![GECKOATHL](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckoathatl_array.gif)

###### =GECKOATH(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOATH("BTC", "USD","$A$1")
##### EXAMPLE    =GECKOATH(A1:A10, "EUR")

###### =GECKOATL(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOATL("BTC", "USD","$A$1")
##### EXAMPLE    =GECKOATL(A1:A10, "EUR")

######
## GECKO24HPRICECHANGE
### Imports CoinGecko's 24h Price % change into Google spreadsheets. 

![GECKOATH](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/gecko24hpricechange_array.gif)

###### =GECKOATH(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKO24HPRICECHANGE("BTC", "USD","$A$1")
##### EXAMPLE    =GECKO24HPRICECHANGE(A1:A10, "EUR")

######
######
## GECKOCHANGE
### Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
###### =GECKOCHANGE(ticker,type, nb_days, refresh_cell) 

### GECKO PRICE CHANGE decimal form
![GECKOCHANGEPRICE](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCHANGE2.gif)

##### EXAMPLE    =GECKOCHANGE("BTC","USD","PRICE",1,"$A$1")

### GECKO VOLUME CHANGE 
![GECKOCHANGEVOL](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCHANGE2VOLUME.gif)

##### EXAMPLE    =GECKOCHANGE("BTC","USD","VOLUME",365,"$A$1")

### GECKO MARKET CAP CHANGE
![GECKOCHANGECAP](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCHANGE2MKTCAP.gif)

##### EXAMPLE    =GECKOCHANGE("BTC","USD","MARKETCAP",365,"$A$1")

### GECKOHIST
##### Imports the list of historical prices, volumes, market cap
![GECKOHIST](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOHIST.gif)

##### EXAMPLE    =GECKOHIST("ethereum","usd","price",datevalue("12-31-2020"),datevalue("08-31-2020"))
Depending on the timezone of your sheet either datevalue('mm-dd-yyyy') or datevalue('dd-mm-yyyy')

### GECKOCAPTOT 
##### Imports the current total market cap of cryptocurrencies
![GECKOCAPTOT](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCAPTOT.gif)

##### EXAMPLE    =GECKOCAPTOT()

### GECKOCAPDOMINANCE
##### Imports the % market cap dominance by cryptocurrencies
![GECKOCAPDOMINANCE](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCAPDOMINANCE.gif)

##### EXAMPLE    =GECKOCAPDOMINANCE("BTC")

### GECKOSUPPLY
### Imports the circulating supply 
![GECKOSUPPLY](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOSUPPLY.gif)
##### EXAMPLE    =GECKOSUPPLY("ETH")

### Imports the maximum supply 
![GECKOMAXSUPPLY](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOSUPPLY_MAXSUPPLY.gif)
##### EXAMPLE    =GECKOSUPPLY("BTC","MAX_SUPPLY")

### Imports the total supply 
![GECKOTOTALSUPPLY](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOSUPPLY_TOTALSUPPLY.gif)
##### EXAMPLE    =GECKOSUPPLY("BTC","TOTAL_SUPPLY")

### GECKORANK
##### Imports the ranking of cryptocurrencies by market capitalization ($)
![GECKOCAPDOMINANCE](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckorank_array.gif)

##### EXAMPLE    =GECKORANK("BTC")

## GECKOCAPDILUTED
### Imports CoinGecko's cryptocurrency market diluted capitalization into Google spreadsheets. 

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckocapdiluted.gif)

###### =GECKOCAPDILUTED(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOCAPDILUTED("BTC", "USD","$A$1")
##### EXAMPLE    =GECKOCAPDILUTED(A1:A10, "EUR")

### FORMULA REFRESHING & MAKING SURE NOT TO TRIGGER GOOGLE LIMITS
![TickerBox](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/TickerBoxRefresh.gif)

##### EXAMPLE    =if($C$10=true, GECKOPRICE(B12:B32,"usd",$B$10),"Tick Box to Refresh")



