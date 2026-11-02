// Initial data, generated from the original src/data/products.js. Loaded once into an empty database.
export const SEED = {
 "categories": [
  {
   "id": 1,
   "name": "Namkeen",
   "note": "Royal bhujia, mixes & dalmoth",
   "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStSfT6_rGHxemzsOCFv7HYqqb5zTAGmz-Y1iQYpmG4gA&s=10",
   "tone": "brand",
   "active": true,
   "sortOrder": 1,
   "createdAt": 0
  },
  {
   "id": 2,
   "name": "Khasta Puri",
   "note": "Flaky, golden & traditional",
   "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Z9XhJ7s2Jfh2Njv0UiT6CzE8T8vrL8em1CLChR4dHUVi5vBYuhBsNOA&s=10",
   "tone": "accent",
   "active": true,
   "sortOrder": 2,
   "createdAt": 0
  },
  {
   "id": 3,
   "name": "Corn Puff",
   "note": "Light, airy & chatpata",
   "image": "https://5.imimg.com/data5/ANDROID/Default/2023/4/297400496/FV/JD/VV/23983265/product-jpeg.jpg",
   "tone": "ink",
   "active": true,
   "sortOrder": 3,
   "createdAt": 0
  },
  {
   "id": 4,
   "name": "Sev",
   "note": "Ratlami, garlic & royal plain",
   "image": "https://cdn.tarladalal.com/media/recipe/mainphoto/2025/03/21/sev.webp",
   "tone": "white",
   "active": true,
   "sortOrder": 4,
   "createdAt": 0
  }
 ],
 "products": [
  {
   "id": "n1",
   "name": "Aloo Bhujia",
   "categoryId": 1,
   "weight": "200 g",
   "image": "/images/products/aloo-bhujia.jpg",
   "rating": 4.7,
   "reviews": 512,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "potato",
    "crispy",
    "tea time"
   ],
   "trending": true,
   "description": "Thin, golden potato strands tossed in our house masala. Crisp enough to crackle, light enough to finish the packet.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 85,
     "mrp": 100,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 156,
     "mrp": 200,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 391,
     "mrp": 500,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "n2",
   "name": "Moong Dal",
   "categoryId": 1,
   "weight": "200 g",
   "image": "/images/products/moong-dal.jpg",
   "rating": 4.5,
   "reviews": 340,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "lentil",
    "light",
    "salted"
   ],
   "trending": false,
   "description": "Fried split moong dal with a pinch of rock salt and black pepper. Simple, protein-packed and dangerously snackable.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 90,
     "mrp": 105,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 166,
     "mrp": 210,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 414,
     "mrp": 525,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "n3",
   "name": "Ratlami Sev Mix",
   "categoryId": 1,
   "weight": "400 g",
   "image": "/images/products/ratlami-sev-mix.jpg",
   "rating": 4.8,
   "reviews": 628,
   "spice": "Hot",
   "veg": true,
   "tags": [
    "mix",
    "ratlami",
    "spicy",
    "party"
   ],
   "trending": true,
   "description": "A fiery party mix of clove-pepper ratlami sev, peanuts and crunchy boondi. Keep a glass of chaas nearby.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 75,
     "mrp": 88,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 150,
     "mrp": 175,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 345,
     "mrp": 438,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "n4",
   "name": "Khatta Meetha",
   "categoryId": 1,
   "weight": "400 g",
   "image": "/images/products/khatta-meetha.jpg",
   "rating": 4.4,
   "reviews": 289,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "sweet",
    "tangy",
    "mix"
   ],
   "trending": false,
   "description": "Sweet, sour and a little bit salty. A bit of everything in every handful, loved by kids and grandparents alike.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 70,
     "mrp": 80,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 140,
     "mrp": 160,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 322,
     "mrp": 400,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "n5",
   "name": "Bikaneri Bhujia",
   "categoryId": 1,
   "weight": "400 g",
   "image": "/images/products/bikaneri-bhujia.jpg",
   "rating": 4.9,
   "reviews": 801,
   "spice": "Hot",
   "veg": true,
   "tags": [
    "moth dal",
    "bikaner",
    "classic"
   ],
   "trending": true,
   "description": "The classic moth dal bhujia from Bikaner, made with a traditional recipe and a bold kick of red chilli.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 88,
     "mrp": 100,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 175,
     "mrp": 200,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 403,
     "mrp": 500,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "n6",
   "name": "Peanut Masala",
   "categoryId": 1,
   "weight": "200 g",
   "image": "/images/products/peanut-masala.jpg",
   "rating": 4.6,
   "reviews": 455,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "peanut",
    "besan coated",
    "masala"
   ],
   "trending": false,
   "description": "Crunchy peanuts wrapped in a spiced besan jacket. Ideal with chai, cricket or a long train ride.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 80,
     "mrp": 95,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 147,
     "mrp": 190,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 368,
     "mrp": 475,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "k1",
   "name": "Classic Khasta Puri",
   "categoryId": 2,
   "weight": "400 g",
   "image": "/images/products/classic-khasta-puri.jpg",
   "rating": 4.8,
   "reviews": 590,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "flaky",
    "classic",
    "ajwain"
   ],
   "trending": true,
   "description": "Layered, flaky and golden. Rolled by hand with ajwain and fried slow so every bite goes khasta.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 60,
     "mrp": 70,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 120,
     "mrp": 140,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 276,
     "mrp": 350,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "k2",
   "name": "Masala Khasta",
   "categoryId": 2,
   "weight": "400 g",
   "image": "/images/products/masala-khasta.jpg",
   "rating": 4.6,
   "reviews": 372,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "masala",
    "flaky",
    "spiced"
   ],
   "trending": false,
   "description": "Our classic khasta puri with a punchy chaat masala and chilli dusting. Dangerously moreish.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 65,
     "mrp": 75,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 130,
     "mrp": 150,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 299,
     "mrp": 375,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "k3",
   "name": "Methi Puri",
   "categoryId": 2,
   "weight": "200 g",
   "image": "/images/products/methi-puri.jpg",
   "rating": 4.5,
   "reviews": 418,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "methi",
    "fenugreek",
    "travel"
   ],
   "trending": false,
   "description": "Kasuri methi and wheat flour, rolled thin and fried crisp. A Gujarati-style travel snack that stays fresh for days.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 95,
     "mrp": 110,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 175,
     "mrp": 220,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 437,
     "mrp": 550,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "k4",
   "name": "Mathri",
   "categoryId": 2,
   "weight": "400 g",
   "image": "/images/products/mathri.jpg",
   "rating": 4.7,
   "reviews": 530,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "festival",
    "diwali",
    "crunchy"
   ],
   "trending": true,
   "description": "Festival-style mathri with a short, crumbly bite. Made with pure ghee flavour and black pepper.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 55,
     "mrp": 63,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 110,
     "mrp": 125,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 253,
     "mrp": 313,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "k5",
   "name": "Papdi",
   "categoryId": 2,
   "weight": "200 g",
   "image": "/images/products/papdi.jpg",
   "rating": 4.4,
   "reviews": 266,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "chaat",
    "flat",
    "crisp"
   ],
   "trending": false,
   "description": "Flat, crisp papdi, the base of every great chaat. Also brilliant on its own with green chutney.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 75,
     "mrp": 90,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 138,
     "mrp": 180,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 345,
     "mrp": 450,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "k6",
   "name": "Pani Puri Kit",
   "categoryId": 2,
   "weight": "400 g",
   "image": "/images/products/pani-puri-kit.jpg",
   "rating": 4.9,
   "reviews": 714,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "pani puri",
    "kit",
    "golgappa",
    "party"
   ],
   "trending": true,
   "description": "Hollow crisp puris with tangy pani masala and a spiced filling mix. Golgappa night at home, sorted.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 100,
     "mrp": 120,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 199,
     "mrp": 240,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 458,
     "mrp": 600,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "c1",
   "name": "Masala Corn Puff",
   "categoryId": 3,
   "weight": "200 g",
   "image": "/images/products/masala-corn-puff.jpg",
   "rating": 4.5,
   "reviews": 480,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "masala",
    "puffed",
    "kids"
   ],
   "trending": true,
   "description": "Light, airy corn puffs in our everyday desi masala. Crunchy outside, melts inside.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 60,
     "mrp": 70,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 110,
     "mrp": 140,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 276,
     "mrp": 350,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "c2",
   "name": "Cheese Corn Puff",
   "categoryId": 3,
   "weight": "200 g",
   "image": "/images/products/cheese-corn-puff.jpg",
   "rating": 4.6,
   "reviews": 523,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "cheese",
    "kids",
    "puffed"
   ],
   "trending": false,
   "description": "Golden puffs coated in a creamy cheese seasoning. A lunchbox hero.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 70,
     "mrp": 80,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 129,
     "mrp": 160,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 322,
     "mrp": 400,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "c3",
   "name": "Tangy Tomato Puff",
   "categoryId": 3,
   "weight": "200 g",
   "image": "/images/products/tangy-tomato-puff.jpg",
   "rating": 4.3,
   "reviews": 233,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "tomato",
    "tangy",
    "puffed"
   ],
   "trending": false,
   "description": "Sun-ripe tomato tang with a hint of sweetness. Bright, zesty and gone in a minute.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 65,
     "mrp": 75,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 120,
     "mrp": 150,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 299,
     "mrp": 375,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "c4",
   "name": "Peri-Peri Puff",
   "categoryId": 3,
   "weight": "200 g",
   "image": "/images/products/peri-peri-puff.jpg",
   "rating": 4.6,
   "reviews": 391,
   "spice": "Hot",
   "veg": true,
   "tags": [
    "peri peri",
    "hot",
    "puffed"
   ],
   "trending": true,
   "description": "Smoky peri-peri heat on feather-light puffs. For people who like their snacks to talk back.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 75,
     "mrp": 90,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 138,
     "mrp": 180,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 345,
     "mrp": 450,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "c5",
   "name": "Chatpata Rings",
   "categoryId": 3,
   "weight": "200 g",
   "image": "/images/products/chatpata-rings.jpg",
   "rating": 4.4,
   "reviews": 310,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "rings",
    "chatpata",
    "kids"
   ],
   "trending": false,
   "description": "Crispy corn rings dusted in a chatpata blend of amchur, black salt and chilli. Wear them on your fingers first.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 60,
     "mrp": 70,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 110,
     "mrp": 140,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 276,
     "mrp": 350,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "c6",
   "name": "Mint Chutney Puff",
   "categoryId": 3,
   "weight": "200 g",
   "image": "/images/products/mint-chutney-puff.jpg",
   "rating": 4.5,
   "reviews": 276,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "mint",
    "pudina",
    "cool"
   ],
   "trending": false,
   "description": "Cool pudina and green chutney flavour on crunchy puffs. Fresh like a monsoon evening.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 65,
     "mrp": 75,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 120,
     "mrp": 150,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 299,
     "mrp": 375,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "s1",
   "name": "Plain Sev",
   "categoryId": 4,
   "weight": "200 g",
   "image": "/images/products/plain-sev.jpg",
   "rating": 4.5,
   "reviews": 365,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "besan",
    "topping",
    "bhel"
   ],
   "trending": false,
   "description": "Fine besan sev, lightly salted. Sprinkle on poha, bhel, sabzi or eat it by the fistful.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 70,
     "mrp": 80,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 129,
     "mrp": 160,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 322,
     "mrp": 400,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "s2",
   "name": "Ratlami Sev",
   "categoryId": 4,
   "weight": "200 g",
   "image": "/images/products/ratlami-sev.jpg",
   "rating": 4.8,
   "reviews": 605,
   "spice": "Hot",
   "veg": true,
   "tags": [
    "ratlami",
    "clove",
    "pepper",
    "spicy"
   ],
   "trending": true,
   "description": "Thick, peppery sev from Ratlam with clove, black pepper and a proper kick. The original fire.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 85,
     "mrp": 100,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 156,
     "mrp": 200,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 391,
     "mrp": 500,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "s3",
   "name": "Garlic Sev",
   "categoryId": 4,
   "weight": "200 g",
   "image": "/images/products/garlic-sev.jpg",
   "rating": 4.6,
   "reviews": 342,
   "spice": "Medium",
   "veg": true,
   "tags": [
    "garlic",
    "lasan",
    "bold"
   ],
   "trending": false,
   "description": "Crisp sev with a strong roasted garlic flavour. Not for first dates, perfect for everything else.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 80,
     "mrp": 95,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 147,
     "mrp": 190,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 368,
     "mrp": 475,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "s4",
   "name": "Palak Sev",
   "categoryId": 4,
   "weight": "200 g",
   "image": "/images/products/palak-sev.jpg",
   "rating": 4.3,
   "reviews": 198,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "spinach",
    "green",
    "natural"
   ],
   "trending": false,
   "description": "Sev made with fresh spinach puree for a natural green colour and a gentle earthy taste.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 90,
     "mrp": 105,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 166,
     "mrp": 210,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 414,
     "mrp": 525,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "s5",
   "name": "Lasan Sev",
   "categoryId": 4,
   "weight": "400 g",
   "image": "/images/products/lasan-sev.jpg",
   "rating": 4.5,
   "reviews": 287,
   "spice": "Hot",
   "veg": true,
   "tags": [
    "lasan",
    "garlic",
    "red chilli"
   ],
   "trending": false,
   "description": "Thick red lasan sev with a deep garlic and red chilli punch. Family pack for serious fans.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 48,
     "mrp": 55,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 95,
     "mrp": 110,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 219,
     "mrp": 275,
     "stock": 50,
     "enabled": true
    }
   ]
  },
  {
   "id": "s6",
   "name": "Nylon Sev",
   "categoryId": 4,
   "weight": "400 g",
   "image": "/images/products/nylon-sev.jpg",
   "rating": 4.6,
   "reviews": 421,
   "spice": "Mild",
   "veg": true,
   "tags": [
    "thin",
    "fine",
    "poha",
    "topping"
   ],
   "trending": true,
   "description": "Ultra-fine, almost silky sev that melts on the tongue. The finishing touch for poha, chaat and salads.",
   "active": true,
   "trackStock": true,
   "lowStockAt": 10,
   "sold": 0,
   "createdAt": 0,
   "sizes": [
    {
     "label": "200 g",
     "price": 65,
     "mrp": 75,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "400 g",
     "price": 130,
     "mrp": 150,
     "stock": 50,
     "enabled": true
    },
    {
     "label": "1 kg",
     "price": 299,
     "mrp": 375,
     "stock": 50,
     "enabled": true
    }
   ]
  }
 ]
};

export const SEED_COUPONS = [
  { code: 'TARAN10', description: '10% off your order', type: 'percent', value: 10, minOrder: 0, maxDiscount: 0, usageLimit: 0, used: 0, startsAt: '', endsAt: '', active: true },
  { code: 'CRUNCH15', description: '15% off orders above Rs 500', type: 'percent', value: 15, minOrder: 500, maxDiscount: 150, usageLimit: 0, used: 0, startsAt: '', endsAt: '', active: true },
];

export const SEED_OFFERS = [
  { id: 1, name: 'Festive saving', type: 'percent', value: 5, minOrder: 999, maxDiscount: 100, categoryId: 0, startsAt: '', endsAt: '', active: false },
];

export const SEED_SETTINGS = {
  shopName: 'Taran Hari',
  tagline: 'Ek baar khao, baar baar maango',
  currency: '\u20b9',
  announcement: '',
  deliveryFee: 49,
  freeDeliveryAbove: 499,
  minOrder: 0,
  acceptingOrders: true,
  allowStacking: true,
  gstPercent: 0,
  invoice: { businessName: 'Taran Hari', address: '', phone: '', email: '', gstin: '', footerNote: 'Thank you for shopping with Taran Hari!', upiId: '' },
};

// null = "use the website's built-in default". The admin panel can customise each of these.
export const SEED_CONTENT = {
  home: { heroImage: null, banners: null, blocks: null, videos: null, marquee: null, aboutPhoto: null, aboutText: null, team: null, reviews: null },
  shop: { factoryVideo: null, factoryPoster: null, quotes: null, chaat: null },
  contact: {
    ownerName: 'Kamlesh Verma', ownerRole: 'Founder & Owner, Taran Hari',
    ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    ownerBio: 'Our promise is simple: pure ingredients, uncompromised kitchen hygiene, and authentic recipes that make every teatime special.',
    phoneDisplay: '+91 98765 43210', phoneTel: '+919876543210', whatsapp: '919876543210',
    whatsappMessage: 'Namaste Taran Hari! I would like to enquire about your snacks.',
    email: 'contact@taranhari.com', instagram: 'https://www.instagram.com/', facebook: 'https://www.facebook.com/', youtube: 'https://www.youtube.com/',
    addressShort: 'Add your factory address in /admin', addressFull: '', mapUrl: '', hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  },
};
