import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsKeys = await AsyncStorage.getAllKeys();
      const productsStored = await AsyncStorage.multiGet(productsKeys);

      const productsLoaded = productsStored.map(product => {
        return product[1] && JSON.parse(product[1]);
      });
      console.log('carregando carrinho');
      console.log(productsLoaded);

      // await AsyncStorage.clear();
      setProducts(productsLoaded);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let productToStore: Product = {} as Product;

      const findProductExists = products.filter(
        productStored => productStored.id === product.id,
      );

      if (findProductExists[0]) {
        const { id, image_url, price, quantity, title } = findProductExists[0];
        productToStore = {
          id,
          image_url,
          price,
          quantity: quantity + 1,
          title,
        };
      } else {
        productToStore = { ...product, quantity: 1 };
      }

      await AsyncStorage.setItem(
        `@GoMarketplace:${product.id}`,
        JSON.stringify(productToStore),
      );

      const productIndexOnState = products.findIndex(
        productIndex => productIndex.id === product.id,
      );

      const productsStateUpdated = products;
      productsStateUpdated.splice(productIndexOnState, 1);
      productsStateUpdated.push(productToStore);

      setProducts(productsStateUpdated);
    },
    [products],
  );

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
