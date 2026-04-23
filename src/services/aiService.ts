import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type AiActionType = 'auto' | 'longer' | 'shorter' | 'professional' | 'casual';

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
