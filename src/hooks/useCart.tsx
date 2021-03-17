import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';
import { cartStorageHelper } from '../util';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = cartStorageHelper.getDecoded();

    return storagedCart || [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: productInStock } = await api.get(`/stock/${productId}`);

      if (productInStock?.amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const productInCart = cart.find(
        (product: Product) => product.id === productId
      );

      const amontOfProductInCart = productInCart?.amount || 0;

      if (productInStock.amount <= amontOfProductInCart) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productInCart) {
        const newCart = cart.map((product) => {
          if (product.id === productId) {
            return {
              ...product,
              amount: product.amount + 1,
            };
          }
          return product;
        });

        setCart(newCart);
        cartStorageHelper.save(newCart);
        return;
      }

      const { data: productToAdd } = await api.get(`/products/${productId}`);

      const newCart = [...cart, { ...productToAdd, amount: 1 }];
      setCart(newCart);
      cartStorageHelper.save(newCart);
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productFound = cart.find((product) => product.id === productId);

      if (!productFound) {
        toast.error('Erro na remoção do produto');
        return;
      }

      const newCart = cart.filter((product) => product.id !== productId);
      setCart(newCart);
      cartStorageHelper.save(newCart);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const { data: productInStock } = await api.get(`/stock/${productId}`);

      if (productInStock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newCart = cart.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            amount,
          };
        }
        return product;
      });

      cartStorageHelper.save(newCart);
      setCart(newCart);
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
