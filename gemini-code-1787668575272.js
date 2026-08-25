function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  closeCart();
  document.getElementById("checkoutOverlay").classList.add("active");
}

function closeCheckout(event) {
  if (!event || event.target.id === "checkoutOverlay") {
    document.getElementById("checkoutOverlay").classList.remove("active");
  }
}

function togglePaymentView(method) {
  const upiSection = document.getElementById("upiSection");
  upiSection.style.display = method === "UPI" ? "block" : "none";
}

function submitOrder() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const txnId = document.getElementById("upiTxnId").value.trim();

  if (!name || !phone || !address) {
    alert("Please fill in all delivery details.");
    return;
  }

  const orderId = "ORD" + Math.floor(100000 + Math.random() * 900000);
  
  // Display confirmation details
  document.getElementById("confOrderId").innerText = orderId;
  document.getElementById("confPaymentDetails").innerText = paymentMethod === "UPI" 
    ? `Payment via UPI (ID: 9326567293@omni)` 
    : "Payment Method: Cash on Delivery";

  closeCheckout();
  
  // Clear Cart
  cart = [];
  updateCartUI();

  // Show Confirmation Modal
  document.getElementById("confirmationOverlay").classList.add("active");
}

function closeConfirmation() {
  document.getElementById("confirmationOverlay").classList.remove("active");
}