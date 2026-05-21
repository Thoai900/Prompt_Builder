import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type AiActionType = 'auto' | 'longer' | 'shorter' | 'professional' | 'casual' | 'fix_contradiction';

export async function generateAutoBlockStream(
  blockType: string, 
  blockTitle: string, 
  currentText: string, 
  contextBlocks: {title: string, content: string}[],
  actionType: AiActionType,
  detailLevel: number,
  onChunk: (chunk: string) => void
) {
  try {
    let blockDirectives = "";
    switch (blockType) {
      case 'role':
      case 'task':
        blockDirectives = "NGUYÊN TẮC: Viết trực diện, đi vào trọng tâm, bám sát các yêu cầu từ kỹ thuật đóng vai.";
        break;
      case 'context':
      case 'example':
        blockDirectives = "NGUYÊN TẮC: Trình bày chi tiết, phân rã thông tin thành nhiều lớp.";
        break;
      case 'constraints':
      case 'format':
        blockDirectives = "NGUYÊN TẮC: Kết xuất dưới dạng danh sách gạch đầu dòng ngắn gọn.";
        break;
      default:
        blockDirectives = "NGUYÊN TẮC: Trình bày với cấu trúc tiêu chuẩn và rõ nghĩa.";
    }

    let detailInstruction = "";
    if (detailLevel === 1) detailInstruction = "YÊU CẦU: RẤT NGẮN GỌN.";
    else if (detailLevel === 2) detailInstruction = "YÊU CẦU: TIÊU CHUẨN.";
    else if (detailLevel === 3) detailInstruction = "YÊU CẦU: CỰC KỲ CHI TIẾT.";

    let actionInstruction = "";
    switch (actionType) {
      case 'longer': actionInstruction = "HÀNH ĐỘNG: Xẻ nhỏ vấn đề, viết dài và sâu sắc hơn."; break;
      case 'shorter': actionInstruction = "HÀNH ĐỘNG: Rút gọn tối đa, bỏ từ nối thừa."; break;
      case 'professional': actionInstruction = "HÀNH ĐỘNG: Đổi giọng văn trịnh trọng, chuyên nghiệp."; break;
      case 'casual': actionInstruction = "HÀNH ĐỘNG: Đổi giọng văn thân thiện, dễ gần."; break;
      case 'fix_contradiction': actionInstruction = "HÀNH ĐỘNG: Rà soát nội dung với ngữ cảnh các khối khác, phát hiện và sửa các lỗi mâu thuẫn logic, đảm bảo tính nhất quán chặt chẽ."; break;
      case 'auto':
      default: actionInstruction = "HÀNH ĐỘNG: Hoàn thiện thông tin tối ưu."; break;
    }

    // Tối ưu Payload bằng cách chỉ lấy title và 50 ký tự đầu tiên của các block khác làm ngữ cảnh
    const optimizedContext = contextBlocks.map(b => `- [${b.title}]: ${b.content.substring(0, 50)}${b.content.length > 50 ? '...' : ''}`).join('\n');

    const systemInstruction = `Bạn là chuyên gia Prompt Engineering.
Phần cần xử lý: [${blockTitle}] (Loại: ${blockType}).
${blockDirectives}
${detailInstruction}
${actionInstruction}

Các phần khác trong Prompt (Ngữ cảnh):
${optimizedContext}

Nội dung hiện tại cho [${blockTitle}]: "${currentText}".
Sinh ra chính xác đoạn nội dung trực tiếp cần thiết để điền vào. KHÔNG GIẢI THÍCH, KHÔNG CHÀO HỎI.`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview', // Update to faster model
      contents: currentText ? `Cải thiện đoạn: ${currentText}` : `Viết phần ${blockTitle}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("AI Stream Generation failed:", error);
    throw error;
  }
}

export async function autoFillVariables(
  profileDescription: string,
  templateContent: string,
  variablesToFill: string[]
): Promise<Record<string, string>> {
  try {
    const systemInstruction = `Bạn là chuyên gia điền biến số (variable filler).
Nhiệm vụ của bạn là dựa vào hồ sơ cá nhân của người dùng và nội dung dự kiến của Prompt, 
hãy suy luận và tự động điền các thông tin phù hợp nhất bằng tiếng Việt cho các biến số được yêu cầu.

[Hồ sơ cá nhân của người dùng]
${profileDescription || 'Chưa thiết lập (hãy tự suy diễn một cách thông thái cho người dùng chung)'}

[Nội dung Prompt tham khảo]
${templateContent}

Bạn phải trả lại **CHỈ MỘT OBJECT JSON**, có key là tên biến, value là giá trị điền. 
KHÔNG MỞ ĐẦU, KHÔNG GIẢI THÍCH, KHÔNG FORMAT MARKDOWN LOẠI BỎ (\`\`\`json). Chỉ thuần túy JSON object string.`;

    const prompt = `Điền các biến sau: ${variablesToFill.join(', ')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    try {
      // Dọn dẹp lỡ có markdown residual
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch(e) {
      console.error("Failed to parse JSON auto-fill", text);
      return {};
    }
  } catch (error) {
    console.error("AI Auto Fill failed:", error);
    throw error;
  }
}

export async function generatePromptFromImage(
  imageBase64: string,
  mimeType: string,
  blocksInfo: { id: string, type: string, title: string }[]
): Promise<Record<string, string>> {
  try {
    const systemInstruction = `Bạn là một "máy quét cấu trúc" cấp cao và Chuyên gia Prompt Engineering.
Nhiệm vụ của bạn là nhận xét, phân tích hình ảnh đầu vào thông qua 3 lớp:
1. Lớp Vision: Nhận diện đối tượng, văn bản, bố cục, sơ đồ, các thành phần giao diện (UI/UX) và các thực thể.
2. Lớp Structuring: Ánh xạ dữ liệu vào các thẻ của Prompt Framework hiện tại.
3. Lớp Refining: Suy luận chuyên sâu về bối cảnh hình ảnh để xuất ra cấu trúc prompt tối ưu nhất.

Dịch ngược các thiết kế (Reverse Engineering) thành cấu trúc <Role>, <Constraints>.
Trích xuất Logic (Logic Extraction) từ Sơ đồ/Flowchart thành <Task>, <Process>.
Ánh xạ ràng buộc (Constraint Mapping): Phân tích màu sắc, không gian để tạo ràng buộc <Constraints>.
Tham chiếu dữ liệu đầu vào: Thiết lập tự động thẻ <Input> nếu hình ảnh là tài liệu, bảng biểu.

Các khối (blocks) hiện tại đang có trong hệ thống Prompt:
${blocksInfo.map(b => `- ID: ${b.id} | Phân loại: ${b.type} | Tiêu đề: ${b.title}`).join('\n')}

Dựa vào phân tích hình ảnh, bạn phải tạo ra nội dung phù hợp cho CÁC KHỐI ĐANG CÓ.
Bạn trả về một JSON Object duy nhất:
{
  "block_id_1": "Nội dung cho khối 1",
  "block_id_2": "Nội dung cho khối 2"
}

KHÔNG TRẢ VỀ BẤT KỲ GÌ KHÁC NGOÀI JSON OBJECT.
Chỉ trả về các key tương ứng với ID của khối (block ID), nội dung được format dưới dạng Markdown hoặc văn bản cực kỳ chất lượng.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          text: `Hãy phân tích hình ảnh này và tạo nội dung cho các khối (blocks) tương ứng chuyên nghiệp nhất.`
        },
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Image to Prompt failed:", error);
    throw error;
  }
}

export async function generateQuickResponse(
  shortInput: string,
  packBlocks?: { type: string, title: string, content: string }[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    let systemInstruction = `Bạn là một AI Assistant cấp cao chuyên xử lý tác vụ nhanh gọn hiệu quả.
    
Người dùng vừa gửi một yêu cầu rất ngắn. Tuy nhiên, hệ thống đã ngầm (invisibly) bọc yêu cầu này trong một cấu trúc tinh vi để đảm bảo chất lượng.
`;

    if (packBlocks && packBlocks.length > 0) {
      systemInstruction += `\n[CÁC RÀNG BUỘC VÀ NGỮ CẢNH BỊ ẨN TỪ HỆ THỐNG]\n`;
      packBlocks.forEach(b => {
        systemInstruction += `- Thẻ <${b.type}>: ${b.content}\n`;
      });
      systemInstruction += `\nBẮT BUỘC TUÂN THỦ CÁC HƯỚNG DẪN TRÊN TRONG QUÁ TRÌNH TRẢ LỜI.\n`;
    } else {
      // Default invisible structure for arbitrary quick prompt
      systemInstruction += `
[CẤU TRÚC NGẦM ĐỊNH TỪ HỆ THỐNG MẶC ĐỊNH]
- Thẻ <Role>: Ngươi là một chuyên gia thực tế, đi thẳng vào vấn đề.
- Thẻ <Constraints>: Trình bày trực tiếp, không vòng vo "Xin chào", "Dưới đây là", sử dụng format rõ ràng (bullet points, markdown table) nếu cần thiết. Không sử dụng các từ ngữ sáo rỗng.
`;
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.1-pro-preview',
      contents: shortInput,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        if (onChunk) {
          onChunk(chunk.text);
        }
      }
    }
    return fullText;
  } catch (error) {
    console.error("AI Quick Generation failed:", error);
    throw error;
  }
}

export async function generateContentForExistingBlocks(
  topic: string,
  blocksInfo: { id: string, type: string, title: string }[]
): Promise<Record<string, string>> {
  try {
    const systemInstruction = `Bạn là chuyên gia Prompt Engineering cấp cao.
Người dùng yêu cầu tự động điền nội dung cho một prompt framework về chủ đề/nhiệm vụ: "${topic}"

Các khối hiện tại đang có trong Prompt:
${blocksInfo.map(b => `- ID: ${b.id} | Phân loại: ${b.type} | Tiêu đề: ${b.title}`).join('\n')}

Bạn phải trả lại một JSON Object. Mỗi key là ID của khối (block ID), value là nội dung tương ứng của khối đó.
Nội dung của mỗi khối phải chi tiết, sát với chủ đề "${topic}", tuân theo quy tắc của chuyên gia Prompt Engineering.
Với thẻ 'thinking', 'anchor', 'self_correction', 'input_data' hãy viết nội dung đặc thù phù hợp nội dung.

Trọng tâm: Cung cấp nội dung CHẤT LƯỢNG CAO, SẴN SÀNG SỬ DỤNG.

BẮT BUỘC trả về ĐÚNG ĐỊNH DẠNG JSON.
KHÔNG MỞ ĐẦU, KHÔNG GIẢI THÍCH, KHÔNG FORMAT MARKDOWN.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Hãy tạo nội dung cho các khối tương ứng để giải quyết nhiệm vụ: "${topic}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Quick Fill failed:", error);
    throw error;
  }
}

export async function generateStructuredTemplateFromTopic(topic: string): Promise<any> {
  try {
    const systemInstruction = `Bạn là một chuyên gia Prompt Engineering đẳng cấp quốc tế.
Nhiệm vụ của bạn là nhận vào chủ đề hoặc nhiệm vụ từ người dùng và xây dựng nên một cấu trúc Prompt chuyên nghiệp và tinh vi bậc nhất theo cấu trúc nhiều mảnh ghép (Multi-block Framework).

Bạn phải chọn phân loại phù hợp nhất cho prompt này trong số: 'Học sinh/Sinh viên', 'Người đi làm', 'Sáng tạo nội dung', 'Phát triển cá nhân', 'Lập trình viên'.
Tạo từ 3 đến 5 tags liên quan. Khối blocks gồm: role, task, context, constraints, format.

Hãy trả về CHỈ MỘT JSON OBJECT khớp với định dạng cấu trúc sau:
{
  "title": "Tên Prompt ngắn gọn, thu hút (ví dụ: Chuyên gia sáng tạo kịch bản TikTok ngắn)",
  "description": "Mô tả mục đích và cách sử dụng cấu trúc prompt này",
  "category": "Chọn 1 trong các mục trên",
  "tags": ["tag1", "tag2", "tag3"],
  "blocks": [
    { "type": "role", "title": "🎭 Vai trò (Role)", "content": "Khai báo vai trò chuyên gia có năng lực vượt trội phù hợp..." },
    { "type": "task", "title": "🎯 Nhiệm vụ (Task)", "content": "Mô tả chi tiết và chính xác hành động cần thực hiện đối với chủ đề..." },
    { "type": "context", "title": "📌 Bối cảnh (Context)", "content": "Cung cấp ngữ cảnh, tình huống thực tế hoặc thông tin nền..." },
    { "type": "constraints", "title": "⚠️ Ràng buộc (Constraints)", "content": "Quy định quy chuẩn chặt chẽ, các điều cấm kỵ (ví dụ: Không dùng từ sáo rỗng, không dông dài)..." },
    { "type": "format", "title": "📋 Định dạng cấu trúc (Format)", "content": "Cấu trúc hiển thị kết quả đầu ra rõ ràng, sắp xếp khoa học..." }
  ]
}

BẮT BUỘC trả về ĐÚNG GIÁ TRỊ JSON cấu trúc như trên. KHÔNG bình luận, KHÔNG giải thích, KHÔNG bọc trong các ký tự markdown dư thừa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Hãy tạo một Framework Prompt cấu trúc hoàn hảo cho nhiệm vụ: "${topic}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);
    
    // Assign random or generated unique IDs to blocks
    if (result.blocks && Array.isArray(result.blocks)) {
      result.blocks = result.blocks.map((b: any, idx: number) => ({
        ...b,
        id: `gen-block-${idx}-${Date.now()}`
      }));
    }
    
    result.id = `gen-tpl-${Date.now()}`;
    return result;
  } catch (error) {
    console.error("AI instant builder from topic failed:", error);
    throw error;
  }
}
