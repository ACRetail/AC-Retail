fetch("products.xlsx")
  .then(res => res.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const products = XLSX.utils.sheet_to_json(sheet);

    displayProducts(products);
  })
  .catch(err => {
    console.log("Excel load failed:", err);
  });