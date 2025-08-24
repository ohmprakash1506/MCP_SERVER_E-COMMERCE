import axios from 'axios';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

const BASE_URL = process.env.FAKESTORE_API_BASE_URL || 'https://fakestoreapi.com';

export function registerResources(server) {
  // Resource: List all products
  server.registerResource(
    'products',
    'products://all',
    {
      title: 'All Products',
      description: 'List of all products in the store',
      mimeType: 'application/json',
    },
    async (uri) => {
      const response = await axios.get(`${BASE_URL}/products`);
      console.log(`Fetched products from ${BASE_URL}/products:`, response.data);
      return {
        contents: [{ uri: uri.href, text: JSON.stringify(response.data) }],
      };
    }
  );

  // Resource: Specific product by ID
  server.registerResource(
    'product',
    new ResourceTemplate('product://{id}', { list: undefined }),
    {
      title: 'Product Details',
      description: 'Details for a specific product',
      mimeType: 'application/json',
    },
    async (uri, variables) => {
      const id = variables.id;
      const response = await axios.get(`${BASE_URL}/products/${id}`);
      return {
        contents: [{ uri: uri.href, text: JSON.stringify(response.data) }],
      };
    }
  );

  // Resource: Product categories
  server.registerResource(
    'categories',
    'categories://all',
    {
      title: 'Product Categories',
      description: 'List of all product categories',
      mimeType: 'application/json',
    },
    async (uri) => {
      const response = await axios.get(`${BASE_URL}/products/categories`);
      return {
        contents: [{ uri: uri.href, text: JSON.stringify(response.data) }],
      };
    }
  );
}