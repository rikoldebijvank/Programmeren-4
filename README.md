# Share A Meal API
In dit project is er een API gemaakt voor de share-a-meal casus.
Gebruikers moeten maaltijden kunnen aanmaken en deelnemen aan maaltijden van anderen.
Dit wordt gedaan door eerst een account te registeren, en daarna in te loggen.
Wanneer een gebruiker is ingelogd kan hij zijn data en maaltijden updaten en zichzelf aanmelden voor de maaltijden van anderen.


## Gebruik
Hier staan de endpoints van de API. Creeër eerst een gebruiker, log daarna in en gebruik de gekregen token als authenticatie.  
Link: programmeren-4.up.railway.app

### Register New User
#### Request
`POST /api/user` 

Vereist: Alles behalve isActive

    {
        firstName: <String>,
        lastName: <String>,
        street: <String>,
        city: <String>,
        isActive: <0 || 1>,
        emailAddress: <String>,
        password: <String>,
        phoneNumber: <String>
    }
#### Response
    {
        status: 201,
        message: "User successfully registered",
        data: {
            <User Data>
        }
    }

### Add New Meal
#### Request
`POST /api/meal`

Vereist: Name, Description, Price, dateTime, maxAmountOfParticipants, imageUrl

    {
        isVega: <0 || 1>,
        isVegan: <0 || 1>,
        isToTakeHome: <0 || 1>,
        dateTime: <dateTime>,
        maxAmountOfParticipants: <Integer>,
        price: <Double>,
        imageUrl: <String>,
        name: <String>,
        description: <String>,
        allergenes: <String>
    }
#### Response
    {
        status: 201,
        message: "Meal successfully added",
        data: {
            <Meal Data>
        }
    }

### GET Requests
#### Request
`GET /api/user` `GET /api/meal`

#### Response
    {
        status: <status>,
        message: <message>,
        data: [
            {
              <Data>
            }
        ]
    }