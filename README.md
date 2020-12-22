# COINGECKO
CoinGecko Real Time Spreadsheet Feed: Prices, Volumes, Market Cap



## GECKOPRICE
### Imports CoinGecko's cryptocurrency prices into Google spreadsheets. 

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOPRICEUSD.gif)

###### =GECKOPRICE(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOPRICE("BTC", "USD","$A$1")


######

## GECKOVOLUME
### Imports CoinGecko's cryptocurrency volumes into Google spreadsheets. 

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOVOLUME.gif)

###### =GECKOVOLUME(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOVOLUME("BTC", "USD","$A$1")


######

## GECKOCAP
### Imports CoinGecko's cryptocurrency market capitalization into Google spreadsheets. 

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOCAP.gif)

###### =GECKOCAP(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOCAP("BTC", "USD","$A$1")


######
## GECKOPRICEBYNAME
### Imports CoinGecko's cryptocurrency prices into Google spreadsheets. the id_coin of cryptocurrency ticker is found in web address of Coingecko (https://www.coingecko.com/en/coins/bitcoin/usd)

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOPRICEBYNAME.gif)

###### =GECKOPRICEBYNAME(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOPRICEBYNAME("bitcoinV", "USD","$A$1")

######

## GECKOATH
### Imports CoinGecko's cryptocurrency All Time High Price into Google spreadsheets. 

![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/GECKOATH.gif)

###### =GECKOATH(ticker,currency, refresh_cell) 
##### EXAMPLE    =GECKOATH("BTC", "USD","$A$1")

######
######
## GECKOCHANGE
### Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets. 
###### =GECKOCHANGE(ticker,type, nb_days, refresh_cell) 

### GECKO PRICE CHANGE decimal form
![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckochangeprice.gif)

##### EXAMPLE    =GECKOCHANGE("BTC", "PRICE",1,"$A$1")

### GECKO VOLUME CHANGE decimal form
![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckochangevolume.gif)

##### EXAMPLE    =GECKOCHANGE("BTC", "VOLUME",365,"$A$1")

### GECKO MARKET CAP CHANGE, decimal form
![alt text](https://github.com/Eloise1988/COINGECKO/blob/master/GIF/geckochangemarketcap.gif)

##### EXAMPLE    =GECKOCHANGE("BTC", "MARKETCAP",365,"$A$1")


######
## GOOGLE SHEET EXAMPLE
[Link to Google Sheets!](https://docs.google.com/spreadsheets/d/1QODede4loYFnd9ig_f4vRiO4J4uptxn8zIx3qRsLDeA/edit?usp=sharing)

