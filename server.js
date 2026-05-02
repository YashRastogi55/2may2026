const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());

async function readData() {
  try {
    const fileContent = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeData([]);
      return [];
    }
    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/items", async (req, res) => {
  try {
    const items = await readData();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to read data", error: error.message });
  }
});

app.get("/items/:id", async (req, res) => {
  try {
    const items = await readData();
    const item = items.find((entry) => entry.id === Number(req.params.id));

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to read item", error: error.message });
  }
});

app.post("/items", async (req, res) => {
  try {
    const items = await readData();
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const newItem = {
      id: items.length ? items[items.length - 1].id + 1 : 1,
      name,
      price
    };

    items.push(newItem);
    await writeData(items);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to create item", error: error.message });
  }
});

app.put("/items/:id", async (req, res) => {
  try {
    const items = await readData();
    const index = items.findIndex((entry) => entry.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    items[index] = {
      id: items[index].id,
      name,
      price
    };

    await writeData(items);
    res.status(200).json(items[index]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update item", error: error.message });
  }
});

app.patch("/items/:id", async (req, res) => {
  try {
    const items = await readData();
    const index = items.findIndex((entry) => entry.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    items[index] = {
      ...items[index],
      ...req.body,
      id: items[index].id
    };

    await writeData(items);
    res.status(200).json(items[index]);
  } catch (error) {
    res.status(500).json({ message: "Failed to patch item", error: error.message });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    const items = await readData();
    const index = items.findIndex((entry) => entry.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    const deletedItem = items[index];
    items.splice(index, 1);
    await writeData(items);

    res.status(200).json({ message: "Item deleted successfully", deletedItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
