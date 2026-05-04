const bookingState = {
    currentPetrolPrice: 95.13, // Default rate for calculations
    isPriceLoaded: false
};

// State/City detect karne ka logic
function detectLocation() {
    const pickup = document.getElementById('pickup').value.trim() || "Saharanpur";
    const drop = document.getElementById('drop').value.toLowerCase();
    
    if (drop.includes("delhi")) return "Delhi";
    if (drop.includes("uttarakhand") || drop.includes("dehradun")) return "Dehradun";
    
    return pickup; 
}

async function fetchPetrolPrice() {
    const priceDisplay = document.getElementById('petrol-price');
    const location = detectLocation();
    
    const url = `https://fuel-petrol-diesel-live-price-india.p.rapidapi.com/petrol_price_city?city=${location}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '28dd538cdbmshe37eb36f7174a92p1cdee0jsna9abc6dec153',
            'x-rapidapi-host': 'fuel-petrol-diesel-live-price-india.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Search for the city price in dynamic response keys
        const priceValue = data[location] || data[location.toLowerCase()];

        if (priceValue) {
            bookingState.currentPetrolPrice = parseFloat(priceValue);
            priceDisplay.innerText = `₹${bookingState.currentPetrolPrice}/L (${location})`;
        } else {
            throw new Error("Price not in data");
        }
    } catch (error) {
        console.warn("API Issue, using default price.");
        priceDisplay.innerText = `₹${bookingState.currentPetrolPrice}/L (Default)`;
    } finally {
        bookingState.isPriceLoaded = true;
        calculateFare(); // Calculate fare even if API fails
    }
}

function calculateFare() {
    const distance = parseFloat(document.getElementById('distance').value) || 0;
    const isAC = document.getElementById('ac-toggle').checked;
    
    // Core Calculation Logic
    const fuelCost = (distance / 15) * bookingState.currentPetrolPrice;
    const serviceFee = distance * 7;
    const acCharge = isAC ? 200 : 0;
    const totalFare = fuelCost + serviceFee + acCharge;

    // Save for WhatsApp
    const hiddenFuel = document.getElementById('hidden-fuel-cost');
    const hiddenService = document.getElementById('hidden-service-fee');
    const hiddenAC = document.getElementById('hidden-ac-charge');
    
    if(hiddenFuel) hiddenFuel.value = fuelCost.toFixed(2);
    if(hiddenService) hiddenService.value = serviceFee.toFixed(2);
    if(hiddenAC) hiddenAC.value = acCharge.toFixed(2);

    // Update Display
    document.getElementById('total-fare').innerText = `₹${totalFare.toFixed(0)}`;
}

// Initial Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchPetrolPrice();
    
    document.getElementById('distance').addEventListener('input', calculateFare);
    document.getElementById('ac-toggle').addEventListener('change', calculateFare);
    document.getElementById('pickup').addEventListener('blur', fetchPetrolPrice);
    document.getElementById('drop').addEventListener('blur', fetchPetrolPrice);
});

// WhatsApp Modal Logic
const contactNumbers = { uncle: "917668227632", father: "919027617032" };

document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const pickup = document.getElementById('pickup').value;
    const drop = document.getElementById('drop').value;
    const total = document.getElementById('total-fare').innerText;

    const msg = `🚨 *New Booking*%0A👤 *Cust:* ${name}%0A📍 *Route:* ${pickup} to ${drop}%0A*Total: ${total}*`;

    document.getElementById('btn-notify-uncle').onclick = () => window.open(`https://wa.me/${contactNumbers.uncle}?text=${msg}`, '_blank');
    document.getElementById('btn-notify-father').onclick = () => window.open(`https://wa.me/${contactNumbers.father}?text=${msg}`, '_blank');
    document.getElementById('success-modal').style.display = 'flex';
});

function closeModal() { document.getElementById('success-modal').style.display = 'none'; }