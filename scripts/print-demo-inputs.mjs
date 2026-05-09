const demoProducts = [
  {
    name: "Gmail Autopilot",
    category: "AI email assistant",
    input:
      "An AI email assistant that connects to Gmail, reads important emails, drafts replies, and can automatically send responses on behalf of the user.",
  },
  {
    name: "RefundBot",
    category: "Autonomous support agent",
    input:
      "A customer support AI that reads refund requests, decides whether the customer qualifies, and issues refunds automatically for orders under $500.",
  },
  {
    name: "CampusCare Scheduler",
    category: "Student wellness assistant",
    input:
      "An AI assistant for university students that collects mood check-ins, recommends campus resources, and can notify advisors when it detects urgent concerns.",
  },
];

console.log("Sample demo products:\n");

demoProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Category: ${product.category}`);
  console.log(`   Input: ${product.input}\n`);
});
