async function main() {
  const candidates = [
    {
      name: "Samsung Galaxy S24 Ultra",
      url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Sony WH-1000XM5 Headphones",
      url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Nike Air Max 270",
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Philips Digital Air Fryer XL",
      url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80",
    },
  ];

  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { method: "HEAD" });
      console.log(`${c.name}: status=${res.status}, type=${res.headers.get("content-type")}`);
    } catch (e: any) {
      console.error(`${c.name}: error=${e.message}`);
    }
  }
}

main();
