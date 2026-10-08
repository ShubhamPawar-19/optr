import { db } from "./db";

const DEMO_BUSINESS_ID = "demo-business";

const properties = [
    {
        businessId: DEMO_BUSINESS_ID,
        title: "Modern 2 BHK Apartment in Dubai Marina",
        city: "Dubai",
        area: "Dubai Marina",
        bedrooms: 2,
        bathrooms: 2,
        price: 1450000,
        currency: "AED",
        description:
            "Modern 2 BHK apartment with marina views, gym, pool, and covered parking.",
        imageUrl: null,
        available: true,
    },
    {
        businessId: DEMO_BUSINESS_ID,
        title: "Luxury 2 BHK in Downtown Dubai",
        city: "Dubai",
        area: "Downtown Dubai",
        bedrooms: 2,
        bathrooms: 2,
        price: 1850000,
        currency: "AED",
        description:
            "Premium 2 BHK apartment near Burj Khalifa and Dubai Mall.",
        imageUrl: null,
        available: true,
    },
    {
        businessId: DEMO_BUSINESS_ID,
        title: "Affordable 2 BHK in JVC",
        city: "Dubai",
        area: "Jumeirah Village Circle",
        bedrooms: 2,
        bathrooms: 2,
        price: 1100000,
        currency: "AED",
        description:
            "Spacious 2 BHK apartment in JVC with modern amenities and community facilities.",
        imageUrl: null,
        available: true,
    },
    {
        businessId: DEMO_BUSINESS_ID,
        title: "Premium 3 BHK in Business Bay",
        city: "Dubai",
        area: "Business Bay",
        bedrooms: 3,
        bathrooms: 3,
        price: 2200000,
        currency: "AED",
        description:
            "Large 3 BHK apartment in Business Bay with city views and premium facilities.",
        imageUrl: null,
        available: true,
    },
    {
        businessId: DEMO_BUSINESS_ID,
        title: "Family 1 BHK in Dubai Hills",
        city: "Dubai",
        area: "Dubai Hills Estate",
        bedrooms: 1,
        bathrooms: 1,
        price: 900000,
        currency: "AED",
        description:
            "Bright 1 BHK apartment in Dubai Hills Estate, ideal for professionals and investors.",
        imageUrl: null,
        available: true,
    },
];

async function main() {
    await db.property.deleteMany();

    await db.property.createMany({
        data: properties,
    });

    console.log(`Seeded ${properties.length} properties`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });