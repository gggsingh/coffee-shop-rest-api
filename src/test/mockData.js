const mockData = {
  menuItems: [
    {
      id: "1",
      name: "Espresso",
      price: 3.0,
      imageFileName: "espresso.jpg",
    },
    { id: "2", name: "Latte", price: 4.0, imageFileName: "latte.jpg" },
    {
      id: "3",
      name: "Cappuccino",
      price: 4.5,
      imageFileName: "cappuccino.jpg",
    },
  ],
  menuItemDescriptionMap: {
    1: "Espresso is not merely a drink; it is a cultural phenomenon woven into the very fabric of daily life.",
    2: "At its core, the latte is a celebration of craftsmanship. It starts with a shot—or two—of robust espresso, extracted with precision to ensure that every drop is imbued with deep, complex flavors. This concentrated coffee serves as the foundation upon which the magic unfolds. Steamed milk is then introduced, transformed into a silky texture that envelops the espresso in a warm embrace. The final touch—a delicate layer of frothy milk foam—adds an ethereal quality, inviting both visual and tactile delight.",
    3: "In the grand theater of coffee culture, where aromas swirl and flavors collide, there exists a beverage that stands as a paragon of balance and artistry—the cappuccino. This enchanting concoction, a triumphant blend of robust espresso, creamy steamed milk, and a crown of velvety foam, is not merely a drink; it is an experience that encapsulates the very essence of coffee craftsmanship and cultural heritage.",
  },
  orders: [
    {
      id: "1",
      items: ["1"],
      totalPrice: 3,
      loyaltyNumber: "123456789",
      name: "John",
      status: "pending",
    },
    {
      id: "2",
      items: ["2"],
      totalPrice: 2,
      loyaltyNumber: "987654321",
      name: "Jane",
      status: "completed",
    },
  ],
  loyaltyAccounts: [
    { name: "John", loyaltyNumber: "123456789", balance: 10 },
    { name: "Jane", loyaltyNumber: "987654321", balance: 20 },
  ],
};

module.exports = mockData;
