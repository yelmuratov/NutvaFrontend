// ✅ Final version: Bitrix deal creation with proper TITLE, mapped product names, dynamic pricing, and total amount

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
    products,

  } = body;

  if (!buyerName || !phone || !age || !forWhom || !problem || !region) {
    return NextResponse.json(
      { message: "Required fields are missing" },
      { status: 400 }
    );
  }

<<<<<<< HEAD
  const baseUrl = "https://crm.nutva.uz/rest/4/0rmhzl4g9pnvvw0c";

  const getProductName = (id: string): string => {
    const map: Record<string, string> = {
      "78a05bcd-d0d8-4f5e-8271-b6b879f06621": "Complex",
      "995cf09c-25fb-475c-baff-2ece1dcb0156": "Complex Extra",
      "913d886c-940e-46c4-8fe4-17db725dbbee": "Gelmin Kids",
      "4dcfe3bc-0c43-4cef-bcf1-3bba8ac0c682": "Virus Men",
      "f9440b15-e98c-4a7f-a8a7-311a431c8fd0": "Fertilia Women"
=======
  const baseUrl = "https://crm.nutva.uz/rest/4/7irbhunnsb0rj0x9";

  const getProductName = (id: string): string => {
    const map: Record<string, string> = {
      "b992bcdb-c472-4c22-8a79-daf18b9d3ea0": "Complex",
      "1bb3b587-7441-4990-9832-a7d0716c0acb": "Complex Extra",
      "8bed60a5-463c-4f4a-bfb3-ea5fc0498fc2": "Gelmin Kids",
      "45a51307-e017-49f0-a250-357ea36d66b7": "Virus (M)",
      "a646aaef-9633-4b42-bfde-01d1eb802038": "Fertilia (J)"
>>>>>>> 4af8e5f04220e86d8ccf23ae88f76758f6bf03d1
    };
    return map[id] || `ID: ${id}`;
  };

  const getUnitPrice = (id: string, quantity: number): number => {
    const pricing: Record<string, { qty: number, price: number }[]> = {
<<<<<<< HEAD
      "78a05bcd-d0d8-4f5e-8271-b6b879f06621": [
=======
      "b992bcdb-c472-4c22-8a79-daf18b9d3ea0": [
>>>>>>> 4af8e5f04220e86d8ccf23ae88f76758f6bf03d1
        { qty: 5, price: 560000 },
        { qty: 3, price: 640000 },
        { qty: 2, price: 990000 },
        { qty: 1, price: 1170000 }
      ],
      "995cf09c-25fb-475c-baff-2ece1dcb0156": [
        { qty: 5, price: 560000 },
        { qty: 3, price: 640000 },
        { qty: 2, price: 990000 },
        { qty: 1, price: 1170000 }
      ],
      "913d886c-940e-46c4-8fe4-17db725dbbee": [
        { qty: 5, price: 220000 },
        { qty: 3, price: 290000 },
        { qty: 2, price: 390000 },
        { qty: 1, price: 490000 }
      ],
      "4dcfe3bc-0c43-4cef-bcf1-3bba8ac0c682": [
        { qty: 5, price: 390000 },
        { qty: 3, price: 490000 },
        { qty: 2, price: 690000 },
        { qty: 1, price: 860000 }
      ],
      "f9440b15-e98c-4a7f-a8a7-311a431c8fd0": [
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

  let totalAmount = 0;
  const productList = products?.length
    ? products
      .map((p: { productId: string; quantity: number }, i: number) => {
        const name = getProductName(p.productId);
        const unitPrice = getUnitPrice(p.productId, p.quantity);
        const amount = unitPrice * p.quantity;
        totalAmount += amount;
        return `  ${i + 1}. ${name} - ${p.quantity} dona — ${amount.toLocaleString()} so'm`;
      })
      .join("\n")
    : "  - Mahsulotlar yo‘q";

  const firstProductName = products?.length
    ? getProductName(products[0].productId)
    : "Buyurtma";

  const dealTitle = `${buyerName} — ${firstProductName}`;

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
      }
    })
  });

  const dealData = await dealRes.json();
  const dealId = dealData.result;

  await fetch(`${baseUrl}/crm.timeline.comment.add.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        ENTITY_ID: dealId,
        ENTITY_TYPE: "deal",
<<<<<<< HEAD
        COMMENT: `${repeatPrefix}📝 Yangi so‘rov saytdan\n👤 Ism: ${buyerName}\n📞 Telefon: +${phone}\n🎂 Yosh: ${age}\n🌍 Hudud: ${region}\n👥 Kim uchun: ${forWhom}\n🧠 Muammo: ${problem}\n💬 Izoh: ${comment || "Yo‘q"}\n\n🛍 Mahsulotlar:\n${productList}\n\n💰 Umumiy narx: ${totalAmount.toLocaleString()} so'm`
=======
        COMMENT: `${repeatPrefix}📝 Yangi so‘rov saytdan\n👤 Ism: ${buyerName}\n📞 Telefon: +${phone}\n🎂 Yosh: ${age}\n🌍 Hudud: ${region}\n👥 Kim uchun: ${forWhom}\n🧠 Muammo: ${problem}\n💬 Izoh: ${comment || "Yo‘q"}\n\n🛍 Mahsulotlar:\n${productList}\n\n💰 Umumiy narx: ${totalAmount.toLocaleString()} so'm\n\n🔗 UTM:\n- Source: ${utm_source || "-"}\n- Medium: ${utm_medium || "-"}\n- Campaign: ${utm_campaign || "-"}\n- Term: ${utm_term || "-"}\n- Content: ${utm_content || "-"}`
>>>>>>> 4af8e5f04220e86d8ccf23ae88f76758f6bf03d1
      }
    })
  });

  return NextResponse.json({ success: true, dealId });
}