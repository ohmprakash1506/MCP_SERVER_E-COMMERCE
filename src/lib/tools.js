import axios from "axios";
import z from "zod";

const BASE_URL = process.env.FAKESTORE_API_BASE_URL || 'https://fakestoreapi.com';
console.log(`Using FakeStore API at ${BASE_URL}`);

export async function discoverTools() {
    return [
        {
            definition:{
                function:{
                    name :"addToCart",
                    description: 'Add an item to the shopping cart',
                    parameters: z.object({
                        userId: z.number().describe('User ID for the cart'),
                        productId: z.number().describe('Product ID to add'),
                        quantity: z.number().min(1).describe('Quantity to add'),
                    })
                }
            },
            function: async ({ userId, productId, quantity }) => {
                const response = await axios.post(`${BASE_URL}/carts`, {
                    userId: userId,
                    date: new Date().toISOString(),
                    products: [{ productId: productId, quantity: quantity }]
                })
                return response.data;
            }
        },
        {
      definition: {
        function: {
          name: 'createProduct',
          description: 'Create a new product (simulated)',
          parameters: z.object({
            title: z.string().describe('Product title'),
            price: z.number().describe('Product price'),
            description: z.string().describe('Product description'),
            image: z.string().url().describe('Product image URL'),
            category: z.string().describe('Product category'),
          }),
        },
      },
      function: async ({ title, price, description, image, category }) => {
        const response = await axios.post(`${BASE_URL}/products`, {
          title,
          price,
          description,
          image,
          category,
        });
        return response.data;
      },
    },
    {
      definition: {
        function: {
          name: 'login',
          description: 'Authenticate a user and get a JWT token',
          parameters: z.object({
            username: z.string().describe('Username'),
            password: z.string().describe('Password'),
          }),
        },
      },
      function: async ({ username, password }) => {
        const response = await axios.post(`${BASE_URL}/auth/login`, { username, password });
        return response.data;
      },
    },
    ]
}