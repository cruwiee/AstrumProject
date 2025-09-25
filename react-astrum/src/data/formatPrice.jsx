export function formatPrice(price) {
  return price.includes('BYN') ? price : `${price} BYN`;
}
