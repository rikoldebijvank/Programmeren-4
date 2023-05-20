# Share A Meal API
___
In dit project is er een API gemaakt voor de share-a-meal casus.
Gebruikers moeten maaltijden kunnen aanmaken en deelnemen aan maaltijden van anderen.
Dit wordt gedaan door eerst een account te registeren, en daarna in te loggen.
Wanneer een gebruiker is ingelogd kan hij zijn data en maaltijden updaten en zichzelf aanmelden voor de maaltijden van anderen.


## Gebruik
___
Hier staan de endpoints van de API. Creeër eerst een gebruiker, log daarna in en gebruik de gekregen token als authenticatie.

### Register new user
#### Request
`POST /api/user` 

Vereist: Alles behalve isActive

    {
        "firstName": <First Name>,
        "lastName": <Last Name>,
        "street": <Street>,
        "city": <City>,
        "isActive": <isActive>,
        "emailAddress": <Email Address>,
        "password": <Password>,
        "phoneNumber": <Phone Number>
    }
#### Response
    {
        "id": <Id>
        "firstName": <First Name>,
        "lastName": <Last Name>,
        "street": <Street>,
        "city": <City>,
        "isActive": <isActive>,
        "emailAddress": <Email Address>,
        "password": <Password>,
        "phoneNumber": <Phone Number>
    }