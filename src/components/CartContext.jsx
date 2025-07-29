import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(i => i.productID === action.item.productID);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productID === action.item.productID
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1 }],
      };
    }
    case "REMOVE": {
      return {
        ...state,
        items: state.items.filter(i => i.productID !== action.productID),
      };
    }
    case "UPDATE": {
      return {
        ...state,
        items: state.items.map(i =>
          i.productID === action.productID
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case "CLEAR": {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
}

const initialState = { items: [] };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = item => dispatch({ type: "ADD", item });
  const removeFromCart = productID => dispatch({ type: "REMOVE", productID });
  const updateQuantity = (productID, quantity) => dispatch({ type: "UPDATE", productID, quantity });
  const clearCart = () => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider value={{ cart: state.items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 