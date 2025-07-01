import { NextRequest, NextResponse } from "next/server";

// TYPE DEFINITIONS
type BitrixProduct = {
  productId: string;
  quantity: number;
};

type BitrixRequestBody = {
  buyerName: string;
  phone: string;
  age: number;
  forWhom: string;
  problem: string;
  region: string;
  comment?: string;
  products: BitrixProduct[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

type TimelineComment = {
  COMMENT?: string;
};

type DuplicateResponse = {
  result?: {
    CONTACT?: number[];
  };
};

const baseUrl = "http://10.200.0.71/rest/4/0rmhzl4g9pnvvw0c";

export async function POST(req: NextRequest) {
  const body: BitrixRequestBody = await req.json();

  const {
    buyerName,
    phone,
    age,
    forWhom,
    problem,
    region,
    comment,
    products,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  } = body;

  if (!buyerName || !phone || !age || !forWhom || !problem || !region) {
    return NextResponse.json({ message: "Majburiy maydonlar to‘ldirilmagan" }, { status: 400 });
  }

  if (!products?.length || products.some((p) => !p.productId || !p.quantity)) {
    return NextResponse.json({ message: "Mahsulotlar noto‘g‘ri kiritilgan" }, { status: 400 });
  }

  const getProductName = (id: string): string => {
    const map: Record<string, string> = {
      "b992bcdb-c472-4c22-8a79-daf18b9d3ea0": "Complex",
      "1bb3b587-7441-4990-9832-a7d0716c0acb": "Complex Extra",
      "8bed60a5-463c-4f4a-bfb3-ea5fc0498fc2": "Gelmin Kids",
      "45a51307-e017-49f0-a250-357ea36d66b7": "Virus (M)",
      "a646aaef-9633-4b42-bfde-01d1eb802038": "Fertilia (J)",
    };
    return map[id] || `ID: ${id}`;
  };

  const getUnitPrice = (id: string, quantity: number): number => {
    const pricing: Record<string, { qty: number; price: number }[]> = {
      "b992bcdb-c472-4c22-8a79-daf18b9d3ea0": [
        { qty: 5, price: 560000 },
        { qty: 3, price: 640000 },
        { qty: 2, price: 990000 },
        { qty: 1, price: 1170000 },
      ],
      "1bb3b587-7441-4990-9832-a7d0716c0acb": [
        { qty: 5, price: 560000 },
        { qty: 3, price: 640000 },
        { qty: 2, price: 990000 },
        { qty: 1, price: 1170000 },
      ],
      "8bed60a5-463c-4f4a-bfb3-ea5fc0498fc2": [
        { qty: 5, price: 220000 },
        { qty: 3, price: 290000 },
        { qty: 2, price: 390000 },
        { qty: 1, price: 490000 },
      ],
      "45a51307-e017-49f0-a250-357ea36d66b7": [
        { qty: 5, price: 390000 },
        { qty: 3, price: 490000 },
        { qty: 2, price: 690000 },
        { qty: 1, price: 860000 },
      ],
      "a646aaef-9633-4b42-bfde-01d1eb802038": [
        { qty: 5, price: 390000 },
        { qty: 3, price: 490000 },
        { qty: 2, price: 690000 },
        { qty: 1, price: 860000 },
      ],
    };

    const rules = pricing[id];
    if (!rules) return 0;

    for (const rule of rules) {
      if (quantity >= rule.qty) return rule.price;
    }
    return rules[rules.length - 1].price;
  };

  const cleanedPhone = phone.startsWith("+") ? phone : `+${phone}`;
  let contactId: number;

  try {
    // Step 1: Check for duplicate
    const duplicateRes = await fetch(`${baseUrl}/crm.duplicate.findbycomm.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PHONE", values: [cleanedPhone] }),
    });

    const rawText = await duplicateRes.text();
    let duplicateData: DuplicateResponse;

    try {
      duplicateData = JSON.parse(rawText);
    } catch (err) {
      console.error("Bitrix JSON parse error:", err);
      console.error("Bitrix response:", rawText);
      return NextResponse.json({ message: "Bitrixdan noto‘g‘ri javob keldi" }, { status: 500 });
    }

    const isRepeat = !!(duplicateData.result && Array.isArray(duplicateData.result.CONTACT) && duplicateData.result.CONTACT.length > 0);

    // Step 2: Create contact if not exists
    if (isRepeat) {
      contactId = duplicateData.result!.CONTACT![0];
    } else {
      const contactRes = await fetch(`${baseUrl}/crm.contact.add.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            NAME: buyerName,
            PHONE: [{ VALUE: cleanedPhone, VALUE_TYPE: "MOBILE" }],
          },
        }),
      });

      const contactData = await contactRes.json();
      if (!contactData.result) {
        return NextResponse.json({ message: "Kontakt yaratilmadi" }, { status: 500 });
      }

      contactId = contactData.result;
    }

    // Step 3: Count previous submissions
    let submissionCount = 1;
    if (isRepeat) {
      const timelineRes = await fetch(`${baseUrl}/crm.timeline.comment.list.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filter: {
            ENTITY_ID: contactId,
            ENTITY_TYPE: "contact",
          },
        }),
      });

      const timelineData = await timelineRes.json();
      const previous = (timelineData.result as TimelineComment[]).filter((item) =>
        item.COMMENT?.includes("Yangi so‘rov saytdan")
      );
      submissionCount = previous.length + 1;
    }

    const repeatPrefix = isRepeat ? `⚠️ Takroriy so‘rov (${submissionCount})\n` : "";

    // Step 4: Product List
    let totalAmount = 0;
    const productList = products
      .map((p, i) => {
        const name = getProductName(p.productId);
        const unitPrice = getUnitPrice(p.productId, p.quantity);
        const amount = unitPrice * p.quantity;
        totalAmount += amount;
        return `  ${i + 1}. ${name} - ${p.quantity} dona — ${amount.toLocaleString()} so'm`;
      })
      .join("\n");

    const firstProductName = getProductName(products[0].productId);
    const dealTitle = `${buyerName} — ${firstProductName}`;

    // Step 5: Create Deal
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
        },
      }),
    });

    const dealData = await dealRes.json();
    if (!dealData.result) {
      return NextResponse.json({ message: "Deal yaratilmadi" }, { status: 500 });
    }

    const dealId = dealData.result;

    // Step 6: Add Timeline Comment
    await fetch(`${baseUrl}/crm.timeline.comment.add.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          ENTITY_ID: dealId,
          ENTITY_TYPE: "deal",
          COMMENT: `${repeatPrefix}📝 Yangi so‘rov saytdan\n👤 Ism: ${buyerName}\n📞 Telefon: ${cleanedPhone}\n🎂 Yosh: ${age}\n🌍 Hudud: ${region}\n👥 Kim uchun: ${forWhom}\n🧠 Muammo: ${problem}\n💬 Izoh: ${comment || "Yo‘q"}\n\n🛍 Mahsulotlar:\n${productList}\n\n💰 Umumiy narx: ${totalAmount.toLocaleString()} so'm\n\n🔗 UTM:\n- Source: ${utm_source ?? "-"}\n- Medium: ${utm_medium ?? "-"}\n- Campaign: ${utm_campaign ?? "-"}\n- Term: ${utm_term ?? "-"}\n- Content: ${utm_content ?? "-"}`,
        },
      }),
    });

    return NextResponse.json({ success: true, dealId });
  } catch (error) {
    console.error("Bitrixga yuborishda xatolik:", error);
    return NextResponse.json({ message: "Ichki server xatosi" }, { status: 500 });
  }
}
