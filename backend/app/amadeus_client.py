import os
from dotenv import load_dotenv
from amadeus import Client, ResponseError

# Завантажуємо змінні з .env файлу
load_dotenv()

API_KEY = os.getenv("AMADEUS_API_KEY")
API_SECRET = os.getenv("AMADEUS_API_SECRET")

# Ініціалізація клієнта (безпечно)
if not API_KEY or not API_SECRET:
    print("⚠️ WARNING: API Keys not found in .env file")
    amadeus = None
else:
    amadeus = Client(client_id=API_KEY, client_secret=API_SECRET)

def search_flight(origin: str, destination: str, date: str):
    if not amadeus:
        return None
    try:
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=date,
            adults=1,
            currencyCode="PLN",
            max=1
        )
        if not response.data:
            return None
        
        offer = response.data[0]
        return {
            "price": offer["price"]["total"],
            "currency": offer["price"]["currency"],
            "airline": offer["validatingAirlineCodes"][0]
        }
    except ResponseError as error:
        print(f"Amadeus Error: {error}")
        return None