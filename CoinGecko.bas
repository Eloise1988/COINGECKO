
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
'     GECKOCHANGE           For use by end users to real-time cryptocurrency % CHANGE price, volumes, market cap
'     GECKOPRICEBYNAME      For use by end users to real-time cryptocurrency prices with specific name
'     GECKOATH              For use by end users to All Time High cryptocurrency prices
'
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
 Application.Calculation = xlCalculationManual
 Application.ScreenUpdating = False
 Application.StatusBar = "Loadind data. Please Wait..."
 
 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 
 sUrl = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sUrl
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
 
sUrl = "https://api.coingecko.com/api/v3/simple/price?ids=" + id_coin + "&vs_currencies=" + currency1
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

Price = Split(Split(sGetResult, ":")(2), "}}")

GECKOPRICE = CDbl(Price(0))
Application.Calculation = xlCalculationAutomatic
Application.ScreenUpdating = True

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
 Application.Calculation = xlCalculationManual
 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 sUrl = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sUrl
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
 
sUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency1 + "&ids=" + id_coin
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

volume = Split(Split(sGetResult, """total_volume"":")(1), ",")

GECKOVOLUME = CDbl(volume(0))
Application.Calculation = xlCalculationAutomatic
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
 Application.Calculation = xlCalculationManual
 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String

 
 
 sUrl = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sUrl
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
 
sUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency1 + "&ids=" + id_coin
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

mkt = Split(Split(sGetResult, """market_cap"":")(1), ",")

GECKOCAP = CDbl(mkt(0))
Application.Calculation = xlCalculationAutomatic

End Function

' GECKOPRICEBYNAME
' * Imports CoinGecko's cryptocurrency prices into Google spreadsheets. The price feed is a ONE-dimensional array.
' * By default, data gets transformed into a number so it looks more like a normal price data import.
' * For example:
' *
' *   =GECKOPRICEBYNAME("BITCOIN", "USD","$A$1")
' *
' *
' * @param {cryptocurrency}          the cryptocurrency NAME you want the price from? you will find it from the coingecko website name
' * @param {against fiat currency}   the fiat currency ex: usd  or eur
' * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
' * @customfunction
' *
' * @return a one-dimensional array containing the price
'
Public Function GECKOPRICEBYNAME(name As String, currency1 As String)
 Application.Calculation = xlCalculationManual
 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 sUrl = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 
 currency1 = LCase(currency1)
 name = LCase(name)

 
 
sUrl = "https://api.coingecko.com/api/v3/simple/price?ids=" + LCase(name) + "&vs_currencies=" + currency1
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

Price = Split(Split(sGetResult, ":")(2), "}}")

GECKOPRICEBYNAME = CDbl(Price(0))
Application.Calculation = xlCalculationAutomatic

End Function
'/** GECKOCHANGE
' * Imports CoinGecko's cryptocurrency price change, volume change and market cap change into Google spreadsheets.
' * For example:
' *
' *   =GECKOCHANGE("BTC","LTC","price", 7)
' *   =GECKOCHANGE("ETH","USD","volume", 1)
' *   =GECKOCHANGE("YFI","EUR","marketcap",365)
' *
' *
' * @param {ticker}                 the cryptocurrency ticker
' * @param {ticker2}                the cryptocurrency ticker against which you want the %chage
' * @param {price,volume, or marketcap}     the type of change you are looking for
' * @param {nb_days}                 the number of days you are looking for the price change, 365days=1year price change
' * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
' * @customfunction
' *
' * @return a one-dimensional array containing the 7D%  price change on BTC (week price % change).
' **/
Public Function GECKOCHANGE(ticker As String, ticker2 As String, type1 As String, nb_days As Integer)

 Application.Calculation = xlCalculationManual
 Dim httpObject As Object
 Dim sGetResult As String, sGetResult2 As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String, data As String
 
 
 
 sUrl = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 ticker2 = LCase(ticker2)
 type1 = LCase(type1)
 nb_days2 = CStr(nb_days)

 sRequest = sUrl
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
      
      
sUrl = "https://api.coingecko.com/api/v3/coins/" + id_coin + "/market_chart?vs_currency=" + ticker2 + "&days=" + nb_days2
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

sUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + ticker2 + "&ids=" + id_coin
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult2 = httpObject.responseText



If type1 = "price" Then
    Data1 = CDbl(Split(Split(sGetResult2, """current_price"":")(1), ",")(0)) / CDbl(Split(Split(Split(sGetResult, """prices"":[[")(1), "]")(0), ",")(1)) - 1
ElseIf type1 = "volume" Then
    Data1 = CDbl(Split(Split(sGetResult2, """total_volume"":")(1), ",")(0)) / CDbl(Split(Split(Split(sGetResult, """total_volumes"":[[")(1), "]")(0), ",")(1)) - 1
ElseIf type1 = "marketcap" Then
    Data1 = CDbl(Split(Split(sGetResult2, """market_cap"":")(1), ",")(0)) / CDbl(Split(Split(Split(sGetResult, """market_caps"":[[")(1), "]")(0), ",")(1)) - 1
End If




GECKOCHANGE = CDbl(Data1)
Application.Calculation = xlCalculationAutomatic
      

End Function
' GECKOATH
' * Imports CoinGecko's cryptocurrency All Time High Price into Google spreadsheets. The price feed is a ONE-dimensional array.
' * By default, data gets transformed into a number so it looks more like a normal price data import.
' * For example:
' *
' *   =GECKOATH("BTC", "USD","$A$1")
' *
' *
' * @param {cryptocurrency}          the cryptocurrency ticker you want the ATH price from
' * @param {against fiat currency}   the fiat currency ex: usd  or eur
' * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
' * @customfunction
' *
' * @return a one-dimensional array containing the ATH price
'




Public Function GECKOATH(ticker As String, currency1 As String)
 Application.Calculation = xlCalculationManual
 Dim httpObject As Object
 Dim sGetResult As String
 Set httpObject = CreateObject("Microsoft.XMLHTTP")
 Dim i, lenght_array As Integer
 Dim jsnstr() As String
 
 
 
 sUrl = "https://api.coingecko.com/api/v3/search?locale=fr&img_path_only=1"
 ticker = UCase(ticker)
 currency1 = LCase(currency1)

 sRequest = sUrl
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
 
sUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency1 + "&ids=" + id_coin
sRequest = sUrl
httpObject.Open "GET", sRequest, False
httpObject.send
sGetResult = httpObject.responseText

ATH = Split(Split(sGetResult, """ath"":")(1), ",")

GECKOATH = CDbl(ATH(0))
Application.Calculation = xlCalculationAutomatic

End Function

