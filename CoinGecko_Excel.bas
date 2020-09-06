
'====================================================================================================================================*
'  CoinGecko Google Sheet Feed by Eloise1988
'  ====================================================================================================================================
'  Version:      1.0
'  Project Page: https://github.com/Eloise1988/COINGECKO
'  Copyright:    (c) 2020 by Eloise1988
'
'  License:      GNU General Public License, version 3 (GPL-3.0)
'                http://www.opensource.org/licenses/gpl-3.0.html
'  ------------------------------------------------------------------------------------------------------------------------------------
'  A library for importing CoinGecko's price, volume & market cap feeds into Google spreadsheets. Functions include:
'
'     GECKOPRICE            For use by end users to real-time cryptocurrency prices
'     GECKOVOLUME           For use by end users to real-time cryptocurrency 24h volumes
'     GECKOCAP              For use by end users to real-time cryptocurrency total market caps
'
'
'
'  For bug reports see https://github.com/Eloise1988/COINGECKO/issues
'
'  ------------------------------------------------------------------------------------------------------------------------------------
'Changelog:
'
'  1.0.0  Initial release
' *====================================================================================================================================*/
'
'
 
 
' GECKOPRICE
' * Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The price feed is a ONE-dimensional array.
' * By default, data gets transformed into a number so it looks more like a normal price data import.
' * For example:
' *
' *   =GECKOPRICE("BTC", "USD","$A$1")
' *
' *
' * @param {cryptocurrency}          the cryptocurrency ticker you want the price from
' * @param {against fiat currency}   the fiat currency ex: usd  or eur
' * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
' * @customfunction
' *
' * @return a one-dimensional array containing the price
'




Public Function GECKOPRICE(ticker As String, currency1 As String)

 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 sURL = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sURL
 httpObject.Open "GET", sRequest, False
 httpObject.send
 sGetResult = httpObject.responseText
 lenght_array1 = Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":""")
 lenght_array = UBound(lenght_array1)
 

For i = 1 To lenght_array
    jsnstr = Split(Split(Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":")(i), ",""symbol"":""")(1), """,""market_cap_rank""")
    If jsnstr(0) = ticker Then
        id_coin = Split(Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":""")(i), """,""name""")
        id_coin = id_coin(0)
        Exit For
    End If
Next i
 
sURL = "https://api.coingecko.com/api/v3/simple/price?ids=" + id_coin + "&vs_currencies=" + currency1
sRequest = sURL
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

Price = Split(Split(sGetResult, ":")(2), "}}")

GECKOPRICE = CDbl(Price(0))
 

End Function

'** GECKOVOLUME
' * Imports CoinGecko's cryptocurrency 24h volumes into Google spreadsheets. The feed is a ONE-dimensional array.
' * By default, data gets transformed into a number so it looks more like a normal number data import.
' * For example:
' *
' *   =GECKOVOLUME("BTC", "USD","$A$1")
' *
' *
' * @param {cryptocurrency}          the cryptocurrency ticker you want the 24h volume from
' * @param {against fiat currency}   the fiat currency ex: usd  or eur
' * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
' * @customfunction
' *
' * @return a one-dimensional array containing the 24h volume
' **

Public Function GECKOVOLUME(ticker As String, currency1 As String)

 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 sURL = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sURL
 httpObject.Open "GET", sRequest, False
 httpObject.send
 sGetResult = httpObject.responseText
 lenght_array1 = Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":""")
 lenght_array = UBound(lenght_array1)
 

For i = 1 To lenght_array
    jsnstr = Split(Split(Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":")(i), ",""symbol"":""")(1), """,""market_cap_rank""")
    If jsnstr(0) = ticker Then
        id_coin = Split(Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":""")(i), """,""name""")
        id_coin = id_coin(0)
        Exit For
    End If
Next i
 
sURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency1 + "&ids=" + id_coin
sRequest = sURL
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

volume = Split(Split(sGetResult, """total_volume"":")(1), ",")

GECKOVOLUME = CDbl(volume(0))
     
End Function


'/** GECKOCAP
' * Imports cryptocurrencies total market cap into Google spreadsheets. The feed is a ONE-dimensional array.
' * By default, data gets transformed into a number so it looks more like a normal number data import.
' * For example:
' *
' *   =GECKOCAP("BTC", "USD","$A$1")
' *
' *
' * @param {cryptocurrency}          the cryptocurrency ticker you want the total market cap from
' * @param {against fiat currency}   the fiat currency ex: usd  or eur
' * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
' * @customfunction
' *
' * @return a one-dimensional array containing the total market cap
' **/



 Public Function GECKOCAP(ticker As String, currency1 As String)

 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 sURL = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sURL
 httpObject.Open "GET", sRequest, False
 httpObject.send
 sGetResult = httpObject.responseText
 lenght_array1 = Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":""")
 lenght_array = UBound(lenght_array1)
 

For i = 1 To lenght_array
    jsnstr = Split(Split(Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":")(i), ",""symbol"":""")(1), """,""market_cap_rank""")
    If jsnstr(0) = ticker Then
        id_coin = Split(Split(Split(sGetResult, "{""coins"":[")(1), "{""id"":""")(i), """,""name""")
        id_coin = id_coin(0)
        Exit For
    End If
Next i
 
sURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency1 + "&ids=" + id_coin
sRequest = sURL
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

mkt = Split(Split(sGetResult, """market_cap"":")(1), ",")

GECKOCAP = CDbl(mkt(0))
      
End Function
Public Function GECKOPRICEBYNAME(name As String, currency1 As String)

 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 sURL = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 
 currency1 = LCase(currency1)

 
 
sURL = "https://api.coingecko.com/api/v3/simple/price?ids=" + LCase(name) + "&vs_currencies=" + currency1
sRequest = sURL
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

Price = Split(Split(sGetResult, ":")(2), "}}")

GECKOPRICEBYNAME = CDbl(Price(0))
 

End Function
