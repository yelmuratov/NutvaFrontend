import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    buyerName,
    phone,
    age,
    forWhom,
    problem,
    region,
    comment,
    products
  } = body;

  if (!buyerName || !phone || !age || !forWhom || !problem || !region) {
    return NextResponse.json(
      { message: "Required fields are missing" },
      { status: 400 }
    );
  }

  const baseUrl = "https://crm.nutva.uz/rest/4/0rmhzl4g9pnvvw0c";

  // ID mosligi: frontend ID ↔ Bitrix PRODUCT_ID
  const getProductDetails = (id: string): { name: string, productId: number } => {
    const map: Record<string, { name: string, productId: number }> = {
      "2ca86164-5e10-449d-a854-b80f0173a3f5": { name: "Complex", productId: 5 },
      "0406b946-cd9a-4171-91e2-e9f3e3016596": { name: "Complex Extra", productId: 6 },
      "f3146c53-0e85-49d3-8a8f-017fc7baa97c": { name: "Gelmin Kids", productId: 7 },
      "09de8997-9a58-429d-ba9f-8ac06c6dac05": { name: "Virus Men", productId: 8 },
      "fcda59dd-a987-483b-9f82-9d937b004807": { name: "Fertilia Women", productId: 9 }
    };
    return map[id] || { name: `ID: ${id}`, productId: 0 };
  };

  const getUnitPrice = (id: string, quantity: number): number => {
    const pricing: Record<string, { qty: number, price: number }[]> = {
      "2ca86164-5e10-449d-a854-b80f0173a3f5": [
        { qty: 5, price: 560000 },
        { qty: 3, price: 640000 },
        { qty: 2, price: 990000 },
        { qty: 1, price: 1170000 }
      ],
      "0406b946-cd9a-4171-91e2-e9f3e3016596": [
        { qty: 5, price: 560000 },
        { qty: 3, price: 640000 },
        { qty: 2, price: 990000 },
        { qty: 1, price: 1170000 }
      ],
      "f3146c53-0e85-49d3-8a8f-017fc7baa97c": [
        { qty: 5, price: 220000 },
        { qty: 3, price: 290000 },
        { qty: 2, price: 390000 },
        { qty: 1, price: 490000 }
      ],
      "09de8997-9a58-429d-ba9f-8ac06c6dac05": [
        { qty: 5, price: 390000 },
        { qty: 3, price: 490000 },
        { qty: 2, price: 690000 },
        { qty: 1, price: 860000 }
      ],
      "fcda59dd-a987-483b-9f82-9d937b004807": [
        { qty: 5, price: 390000 },
        { qty: 3, price: 490000 },
        { qty: 2, price: 690000 },
        { qty: 1, price: 860000 }
      ]
    };

    const rules = pricing[id];
    if (!rules) return 0;

    for (const rule of rules) {
      if (quantity >= rule.qty) return rule.price;
    }
    return rules[rules.length - 1].price;
  };

  // 1. Kontaktni tekshirish yoki yaratish
  let contactId: number;
  const duplicateRes = await fetch(`${baseUrl}/crm.duplicate.findbycomm.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "PHONE",
      values: [phone]
    })
  });

  const duplicateData = await duplicateRes.json();
  const isRepeat = duplicateData.result.CONTACT && duplicateData.result.CONTACT.length > 0;

  if (isRepeat) {
    contactId = duplicateData.result.CONTACT[0];
  } else {
    const contactRes = await fetch(`${baseUrl}/crm.contact.add.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          NAME: buyerName,
          PHONE: [{ VALUE: `+${phone}`, VALUE_TYPE: "MOBILE" }]
        }
      })
    });

    const contactData = await contactRes.json();
    if (!contactData.result) {
      return NextResponse.json({ message: "Contact creation failed" }, { status: 500 });
    }
    contactId = contactData.result;
  }

  // 2. Takroriy so‘rovni aniqlash
  let submissionCount = 1;
  if (isRepeat) {
    const timelineRes = await fetch(`${baseUrl}/crm.timeline.comment.list.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filter: {
          ENTITY_ID: contactId,
          ENTITY_TYPE: "contact"
        }
      })
    });
    const timelineData = await timelineRes.json();
    if (timelineData.result) {
      const previousSubmissions = timelineData.result.filter((item: { COMMENT?: string }) =>
        item?.COMMENT?.includes("Yangi so‘rov saytdan")
      );
      submissionCount = previousSubmissions.length + 1;
    }
  }

  const repeatPrefix = isRepeat ? `⚠️ Takroriy so‘rov (${submissionCount})\n` : "";

  // 3. Mahsulotlarni hisoblash va tayyorlash
  let totalAmount = 0;

  const productRows = products.map((p: { productId: string; quantity: number }) => {
    const { productId } = getProductDetails(p.productId);
    const unitPrice = getUnitPrice(p.productId, p.quantity);
    const amount = unitPrice * p.quantity;
    totalAmount += amount;

    return {
      PRODUCT_ID: productId,
      PRICE: unitPrice,
      QUANTITY: p.quantity
    };
  });

  const productListComment = products.map((p: { productId: string; quantity: number }, i: number) => {
    const { name } = getProductDetails(p.productId);
    const unitPrice = getUnitPrice(p.productId, p.quantity);
    const amount = unitPrice * p.quantity;
    return `  ${i + 1}. ${name} - ${p.quantity} dona — ${amount.toLocaleString()} so'm`;
  }).join("\n");

  const firstProductName = getProductDetails(products[0].productId).name;
  const dealTitle = `${buyerName} — ${firstProductName}`;

  // 4. Сделка yaratish (Deal)
  const dealRes = await fetch(`${baseUrl}/crm.deal.add.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        TITLE: dealTitle,
        CONTACT_ID: contactId,
        SOURCE_ID: "WEB",
        CATEGORY_ID: 2,
        STAGE_ID: "C2:EXECUTING",
        OPPORTUNITY: totalAmount,
        CURRENCY_ID: "UZS",
        PRODUCT_ROWS: productRows
      }
    })
  });

  const dealData = await dealRes.json();
  const dealId = dealData.result;

  // 5. Timeline komment
  await fetch(`${baseUrl}/crm.timeline.comment.add.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        ENTITY_ID: dealId,
        ENTITY_TYPE: "deal",
        COMMENT: `${repeatPrefix}📝 Yangi so‘rov saytdan\n👤 Ism: ${buyerName}\n📞 Telefon: +${phone}\n🎂 Yosh: ${age}\n🌍 Hudud: ${region}\n👥 Kim uchun: ${forWhom}\n🧠 Muammo: ${problem}\n💬 Izoh: ${comment || "Yo‘q"}\n\n🛍 Mahsulotlar:\n${productListComment}\n\n💰 Umumiy narx: ${totalAmount.toLocaleString()} so'm`
      }
    })
  });

  return NextResponse.json({ success: true, dealId });
}
