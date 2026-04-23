import { BlockType, PromptTemplate, PromptBlock } from './types';

export const AVAILABLE_BLOCKS = [
  { type: 'role' as BlockType, title: 'Vai trò (Role)', description: 'Xác định chuyên môn hoặc nhân vật mà AI sẽ đóng vai. Giúp AI hiểu rõ ngữ cảnh chuyên môn.' },
  { type: 'task' as BlockType, title: 'Nhiệm vụ (Task)', description: 'Hành động cụ thể hoặc mục tiêu bạn muốn AI thực hiện. Càng rõ ràng càng tốt.' },
  { type: 'context' as BlockType, title: 'Ngữ cảnh (Context)', description: 'Thông tin nền tảng, bối cảnh dự án, hoặc đối tượng mục tiêu để AI có thông tin nền.' },
  { type: 'format' as BlockType, title: 'Định dạng (Format)', description: 'Cấu trúc đầu ra (JSON, bảng markdown, danh sách, đoạn văn, XML).' },
  { type: 'tone' as BlockType, title: 'Giọng điệu (Tone)', description: 'Phong cách viết (chuyên gia, thân thiện, thuyết phục, châm biếm, v.v.).' },
  { type: 'constraints' as BlockType, title: 'Ràng buộc (Constraints)', description: 'Các giới hạn cần tuân thủ (ví dụ: "Dưới 500 từ", "Không sử dụng thuật ngữ phức tạp").' },
  { type: 'example' as BlockType, title: 'Ví dụ (Example)', description: 'Cung cấp ví dụ cụ thể về đầu vào hoặc đầu ra mong muốn (Few-shot prompting).' },
];

export const TEMPLATES: PromptTemplate[] = [
  // HỌC SINH / SINH VIÊN
  {
    id: 'student-tutor',
    title: '🧠 Gia sư Toán/Lý/Hóa Tận Tâm',
    description: 'Hướng dẫn tư duy từng bước, không giải hộ, giúp học sinh thực thụ rèn luyện kỹ năng giải quyết vấn đề.',
    category: 'Học sinh/Sinh viên',
    blocks: [
      { id: '1', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là một gia sư [Môn học] xuất sắc và tâm lý. Nhiệm vụ của bạn là hướng dẫn tôi (đang học lớp [Khối lớp]).' },
      { id: '2', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Dưới đây là bài tập tôi cần giải: [Đề bài].\nTuyệt đối KHÔNG đưa ra đáp án cuối cùng ngay lập tức.' },
      { id: '3', type: 'format', title: 'Định dạng (Format)', content: 'Thay vì giải bài, hãy phân tích đề bài, chỉ ra công thức hoặc định lý cần dùng, và đặt ra cho tôi 1-2 câu hỏi gợi mở để tôi tự suy nghĩ bước đầu tiên.\nSau khi tôi trả lời, hãy tiếp tục hướng dẫn tôi bước tiếp theo cho đến khi tôi tự giải được bài toán.' },
      { id: '4', type: 'tone', title: 'Giọng điệu (Tone)', content: 'Ân cần, cởi mở, khuyến khích sự tự lập và tư duy suy luận logic của học sinh.' }
    ]
  },
  {
    id: 'student-ielts-speaking',
    title: '🗣️ Giám khảo IELTS Speaking Ảo',
    description: 'Luyện tập Speaking qua roleplay (đóng vai), nhận xét chi tiết về từ vựng, ngữ pháp.',
    category: 'Học sinh/Sinh viên',
    blocks: [
      { id: '11', type: 'role', title: 'Vai trò (Role)', content: 'Hãy đóng vai một giám khảo IELTS chuyên nghiệp, nghiêm ngặt nhưng mang tính xây dựng. Tôi là thí sinh đang chuẩn bị thi với mục tiêu band mong muốn là: [Band điểm của bạn].' },
      { id: '12', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Hãy tiến hành thi Speaking Part [1/2/3] với chủ đề: [Chủ đề bạn muốn, ví dụ: Environment, Education...].' },
      { id: '13', type: 'constraints', title: 'Ràng buộc (Constraints)', content: 'Hãy hỏi tôi từng câu một, sau đó đợi tôi trả lời. TUYỆT ĐỐI không đưa ra tất cả câu hỏi cùng lúc.\nChỉ đưa câu hỏi tiếp theo sau khi tôi đã trả lời câu hiện tại và bạn đã đưa ra nhận xét.' },
      { id: '14', type: 'example', title: 'Ví dụ (Example)', content: 'Sau mỗi câu trả lời của tôi, hãy nhận xét ngắn gọn: Ưu điểm (Từ vựng, Độ trôi chảy), Điểm cần khắc phục (Ngữ pháp, Phát âm), và Gợi ý cách diễn đạt "ăn điểm" hơn, sau đó mới hỏi câu kế tiếp.' }
    ]
  },
  {
    id: 'student-mindmap',
    title: '🗺️ Trợ lý Sơ đồ Tư duy & Tóm tắt',
    description: 'Biến văn bản lịch sử, địa lý dài thòng thành Bullet points và Sơ đồ tư duy (Mindmap) dễ nhớ.',
    category: 'Học sinh/Sinh viên',
    blocks: [
      { id: '21', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là chuyên gia về phương pháp học tập siêu tốc (Accelerated Learning) và chuyên gia tạo Sơ đồ tư duy.' },
      { id: '22', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Tôi có một đoạn văn bản dài của môn [Môn học] dưới đây: [Dán nội dung bài học/sách giáo khoa]. Tôi rất khó ghi nhớ nó. Hãy giúp tôi cấu trúc lại đoạn văn này.' },
      { id: '23', type: 'format', title: 'Định dạng (Format)', content: 'Phần 1: Cấu trúc dưới dạng Bullet points thật ngắn gọn, in đậm các Keyword quan trọng nhất.\nPhần 2: Gợi ý cách vẽ Sơ đồ tư duy (Mindmap) theo cấu trúc: Ý chính ở giữa -> Các nhánh cấp 1 -> Các nhánh cấp 2.\nPhần 3: Tạo ra 1 câu nói vần điệu vui nhộn (mnemonic) để tôi dễ nhớ trọn bộ luận điểm.' }
    ]
  },
  {
    id: 'student-planner',
    title: '📅 Quân sư Lập kế hoạch Ôn thi',
    description: 'Chỉ định điểm mạnh, điểm yếu và quỹ thời gian để AI tạo thời gian biểu tự học hiệu quả.',
    category: 'Học sinh/Sinh viên',
    blocks: [
      { id: '31', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là chuyên gia tư vấn giáo dục và thiết kế phương pháp học tập (Study Planner) hàng đầu.' },
      { id: '32', type: 'context', title: 'Ngữ cảnh (Context)', content: 'Tôi đang chuẩn bị cho kỳ thi [Tên kỳ thi] sẽ diễn ra sau [Số ngày/tuần]. Điểm mạnh của tôi là môn [Môn học giỏi], tôi đang yếu nhất môn [Môn học kém]. Mỗi ngày tôi có [Số giờ rảnh] giờ để tự học.' },
      { id: '33', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Hãy lập cho tôi một thời gian biểu ôn tập khoa học, giúp tôi không bị quá tải nhưng vẫn cải thiện được môn yếu.' },
      { id: '34', type: 'constraints', title: 'Ràng buộc (Constraints)', content: 'Sử dụng phương pháp Pomodoro. Phân rõ thời lượng học thuyết và thực hành giải đề. Lịch trình phải khả thi, bao gồm thời gian nghỉ ngơi.' }
    ]
  },
  
  // NGƯỜI ĐI LÀM / DOANH NGHIỆP
  {
    id: 'master-content-creator',
    title: '📝 Cỗ máy Viết Blog & Content',
    description: 'Bộ khung tiêu chuẩn SEO và Storytelling để tạo các bài viết blog, báo chuyên ngành mạnh mẽ.',
    category: 'Người đi làm',
    blocks: [
      { id: '41', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là một Chuyên gia Viết bài (Master Copywriter) và là một Biên tập viên SEO dày dặn kinh nghiệm, chuyên phân tích sâu sắc tâm lý người đọc.' },
      { id: '42', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Mục tiêu chính: Viết một bài viết toàn diện, chuyên sâu và thu hút người đọc (khoảng 1500-2000 từ) về chủ đề: {{Chủ Đề Cốt Lõi}}.\nPhải bao gồm từ khóa SEO chính: {{Từ Khóa SEO}}.' },
      { id: '43', type: 'context', title: 'Ngữ cảnh (Context)', content: 'Khán giả mục tiêu của bài viết này là: {{Độc Giả Mục Tiêu}}.\nHọ đang tìm kiếm thông tin chất lượng, thực dụng và vượt khỏi những kiến thức cơ bản hời hợt.' },
      { id: '44', type: 'tone', title: 'Giọng điệu (Tone)', content: 'Giọng điệu: {{Giọng Điệu Mong Muốn}} (Vd: truyền cảm hứng, chuyên gia kỹ thuật, hài hước, phản biện sắc sảo).' },
      { id: '45', type: 'format', title: 'Định dạng (Format)', content: 'Phải tuân thủ cấu trúc Markdown:\n1. Tiêu đề H1 hấp dẫn ngay từ 3 giây đầu.\n2. Lời mở đầu (Hook) sử dụng nghệ thuật kể chuyện.\n3. Các thẻ H2, H3 chia nhỏ luận điểm, có in đậm keyword quan trọng.\n4. Bảng tính (Table) tóm tắt các điểm so sánh nếu có.\n5. Kết luận và Call-to-action.' },
      { id: '46', type: 'constraints', title: 'Ràng buộc (Constraints)', content: '- KHÔNG MỞ ĐẦU bằng những câu văn rập khuôn của AI ("Trong kỷ nguyên số...", "Đã bao giờ bạn tự hỏi...").\n- Mỗi đoạn văn tối đa 3-4 câu để tối ưu hiển thị Mobile.' }
    ]
  },
  {
    id: 'master-coding-helper',
    title: '💻 Tech Lead & Code Reviewer',
    description: 'Xây dựng cấu trúc phần mềm, review code, tìm bug, hoặc tối ưu thuật toán như một kiến trúc sư hệ thống.',
    category: 'Người đi làm',
    blocks: [
      { id: '51', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là Kiến trúc sư Hệ thống (Solutions Architect) và Senior Software Engineer am hiểu chuyên sâu về: {{Ngôn Ngữ Lập Trình}}.' },
      { id: '52', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Hãy thực hiện tính năng/câu hỏi sau: {{Mô Tả Chức Năng Cần Code hoặc Code Bị Lỗi}}.' },
      { id: '53', type: 'context', title: 'Ngữ cảnh (Context)', content: 'Đoạn code này vận hành trong hệ thống {{Bối Cảnh Dự Án}}. Hiệu suất và bảo mật là yếu tố sống còn.' },
      { id: '54', type: 'constraints', title: 'Ràng buộc (Constraints)', content: 'Tuân thủ các ràng buộc sau:\n- Áp dụng các nguyên tắc Clean Code và {{Design Patterns}}.\n- Phải có Try/Catch xử lý lỗi chặt chẽ (Error handling).\n- Không thay đổi các function cốt lõi hiện có trừ khi nó cản trở thuật toán.' },
      { id: '55', type: 'format', title: 'Định dạng (Format)', content: 'Trả về chuỗi theo các phần:\n1. [PHÂN TÍCH VẤN ĐỀ]: Đánh giá Big-O (Time/Space Complexity).\n2. [MÃ NGUỒN]: Trả về JSON, Typescript hoặc định dạng gốc.\n3. [GIẢI THÍCH]: Phân tích lý do tối ưu ở // comments.' }
    ]
  },
  {
    id: 'master-marketing-planner',
    title: '📈 Chiến Lược Gia Marketing',
    description: 'Thiết kế bản kế hoạch bao phủ mọi nền tảng cho chiến dịch quảng cáo và phân tích đối tượng mục tiêu.',
    category: 'Người đi làm',
    blocks: [
      { id: '61', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là Giám đốc Marketing (CMO) am hiểu số liệu thực tiễn và tâm lý học.' },
      { id: '62', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Thiết lập chiến dịch Marketing cho sản phẩm: {{Tên Sản Phẩm}}.\nMục tiêu KPIs cần đạt: {{Mục Tiêu Doanh Số / Lượt Tải}}.' },
      { id: '63', type: 'context', title: 'Ngữ cảnh (Context)', content: 'Khách hàng mục tiêu: {{Nhân khẩu học (Tuổi/Giới tính)}}.\nƯu điểm của sản phẩm: {{USP Nổi Bật}}.' },
      { id: '64', type: 'format', title: 'Định dạng (Format)', content: 'Xuất ra một bảng Marketing Plan (Cột 1: Giai đoạn, Cột 2: Concept, Cột 3: Kênh, Cột 4: Ngân sách ước tính).' }
    ]
  },
  
  // PHÁT TRIỂN BẢN THÂN / CHUNG
  {
    id: 'master-personal-roadmap',
    title: '🎯 Cố Vấn Lộ Trình Phát Triển',
    description: 'Xây dựng một Action Plan cá nhân hóa để học một kĩ năng, vượt qua trở ngại mới.',
    category: 'Phát triển cá nhân',
    blocks: [
      { id: '71', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là Life Coach & Cố vấn định hướng vô cùng thực tế (Tough Love).' },
      { id: '72', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Tôi muốn bắt đầu hành trình: {{Mục Tiêu Cá Nhân Cần Đạt}}.\nHãy lập biểu đồ lộ trình từng bước.' },
      { id: '73', type: 'context', title: 'Ngữ cảnh (Context)', content: 'Quỹ thời gian tôi có thể dành ra mỗi ngày: {{Số Giờ Học Mỗi Ngày}}.' },
      { id: '74', type: 'format', title: 'Định dạng (Format)', content: 'Tạo danh sách phân rã (Break-down List) theo Tuần.' }
    ]
  },
  {
    id: 'master-translator',
    title: '🌐 Dịch Giả Song Ngữ Bản Xứ',
    description: 'Dịch thuật sát nghĩa tinh tế không rập khuôn với phong cách bản địa hóa.',
    category: 'Sáng tạo nội dung',
    blocks: [
      { id: '81', type: 'role', title: 'Vai trò (Role)', content: 'Bạn là Dịch Giả Chuyên Nghiệp thông thạo hai ngôn ngữ, am hiểu văn hóa bản địa.' },
      { id: '82', type: 'task', title: 'Nhiệm vụ (Task)', content: 'Hãy dịch đoạn nội dung dưới đây từ ngôn ngữ gốc sang: {{Ngôn Ngữ Đích}}.\n\n[Nội dung cần dịch]:\n{{Đoạn Văn Bản Cần Dịch}}' },
      { id: '83', type: 'tone', title: 'Giọng điệu (Tone)', content: 'Tự nhiên, trôi chảy, sử dụng thành ngữ bản địa. Khử hoàn toàn mùi "văn dịch máy".' }
    ]
  }
];

export const BLOCK_SUGGESTIONS: Record<string, Record<string, string>> = {
  role: {
    math: 'Bạn là một Giáo sư Toán học và là chuyên gia Olympic Toán Quốc tế (IMO) với khả năng giải thích các khái niệm tư duy logic một cách trực quan, dễ hiểu.',
    writing: 'Bạn là một Nhà báo, Content Writer & Copywriter chuyên nghiệp với kỹ năng Storytelling xuất sắc, có khả năng giữ chân độc giả từ đầu đến cuối.',
    coding: 'Bạn là một Senior Software Engineer / Tech Lead với hàng chục năm kinh nghiệm, am hiểu sâu sắc về kiến trúc phần mềm, Clean Code và thiết kế hệ thống.',
    self_dev: 'Bạn là một Life Coach & Cố vấn tâm lý được chứng nhận quốc tế, chuyên giúp mọi người vượt qua rào cản tâm lý, định hướng và phát triển tiềm năng cá nhân.',
    roadmap: 'Bạn là một Cố vấn Giáo dục & Chuyên gia đào tạo, có khả năng thiết kế các chương trình tự học hiệu quả, tối ưu hóa thời gian cho người đi làm.'
  },
  task: {
    math: 'Hãy giải quyết bài toán sau đây. Yêu cầu giải thích từng bước logic một cách cặn kẽ để một người không chuyên cũng có thể nắm bắt được.',
    writing: 'Hãy viết một bài viết dài (long-form), có chiều sâu và thu hút người đọc dựa trên chủ đề được cung cấp.',
    coding: 'Hãy phân tích, tư vấn và viết đoạn mã nguồn giải quyết vấn đề lập trình được mô tả, đảm bảo tính tối ưu, an toàn và dễ bảo trì.',
    self_dev: 'Đưa ra góc nhìn sâu sắc, lời khuyên thực tế và lên một Action Plan cụ thể (các bước hành động) để giúp đối tượng vượt qua vấn đề hiện tại.',
    roadmap: 'Hãy thiết kế một lộ trình học tập chi tiết, chia thành các mốc thời gian rõ ràng, khả thi cho kỹ năng hoặc mục tiêu mà tôi đang hướng tới.'
  },
  context: {
    math: 'Người hỏi có kiến thức cơ bản nhưng khó nắm bắt các yếu tố logic và tư duy tính toán nhanh. Họ cần hiểu "TẠI SAO" lại có bước tính đó chứ không chỉ cần đáp án.',
    writing: 'Bài viết này dành cho những độc giả đã chán ngán những nội dung sáo rỗng trên mạng. Họ muốn một góc nhìn mới mẻ, sâu sắc, có quan điểm rõ ràng và mang tính giải trí cao.',
    coding: 'Dự án này đang trong giai đoạn mở rộng hệ thống. Đoạn code cần được bảo trì lâu dài bởi nhiều người mới, yêu cầu tính rõ ràng (readability) và hiệu suất cực cao.',
    self_dev: 'Tôi đang cảm thấy chênh vênh, mất định hướng trầm trọng. Tôi cần một sự thúc đẩy thực tế, dứt khoát và hiệu quả cao chứ không phải là những câu nói tạo động lực giáo điều ảo tưởng.',
    roadmap: 'Tôi là một người hoàn toàn mới tiếp cận lĩnh vực này, mỗi ngày chỉ có từ 1-2 tiếng học buổi tối. Tôi rất dễ mất động lực nếu không có các dự án nhỏ thực hành và thấy thành quả.'
  },
  format: {
    math: 'Trình bày theo các phần:\n1. Tóm tắt đề bài & Công thức liên quan\n2. Phân tích tư duy (Brainstorming)\n3. Bước 1... Bước 2... (Step-by-step logic)\n4. Kết luận.',
    writing: 'Sử dụng Markdown. Cấu trúc bài:\n1. Tiêu đề H1 hấp dẫn gây tò mò\n2. Đoạn mở bài (Hook)\n3. Các H2, H3 triển khai ý logic\n4. Câu trích dẫn nhấn mạnh\n5. Kết luận & Call-to-action.',
    coding: 'Trả về code block đúng ngôn ngữ. Yêu cầu:\n- Trước code: Giải thích giải thuật (Approach & Big O).\n- Trong code: Có // comments giải thích hàm phức tạp.\n- Sau code: Ví dụ sử dụng.',
    self_dev: 'Trình bày theo cấu trúc:\n1. Bóc tách nguyên nhân lõi (Root cause)\n2. Thay đổi tư duy (Mindset Shift)\n3. Các bước hành động (Actionable Steps)\n4. Một bài tập thực hành nhỏ ngay hôm nay.',
    roadmap: 'Trình bày dưới dạng Bảng Markdown hoặc Timeline. Chia thành các Phase. Bắt buộc có:\n- Mục tiêu mỗi Phase\n- Kiến thức cốt lõi\n- Tài nguyên tham khảo\n- Một dự án Milestone thực hành.'
  },
  tone: {
    math: 'Sư phạm, kiên nhẫn, khoa học, logic chặt chẽ, khích lệ và tập trung vào bản chất.',
    writing: 'Lôi cuốn, tinh tế, mạnh mẽ mang đậm dấu ấn cá nhân, sử dụng nghệ thuật kể chuyện (Storytelling).',
    coding: 'Kỹ thuật, sắc bén, ngắn gọn, trực diện, giống như một Tech Lead review code nghiêm túc.',
    self_dev: 'Bình tĩnh, trí tuệ, đồng cảm thấu hiểu nhưng cũng rất thực tế (Tough Love), truyền năng lượng.',
    roadmap: 'Có tổ chức, kỷ luật, thực dụng, khuyến khích tính tự động hóa, tạo cảm giác khả thi từng bước.'
  },
  constraints: {
    math: 'Không bao giờ đưa ra kết quả ngay câu đầu. Chỉ dẫn từng chi tiết đại số nhỏ nhất để người đọc dễ theo dõi.',
    writing: 'KHÔNG dùng các từ ngữ sáo rỗng quen thuộc của AI (VD: "Trong bối cảnh kết nối ngày nay"). Hạn chế dùng danh sách rập khuôn.',
    coding: 'Chỉ cung cấp mã nguồn đã test các trường hợp edge-case và xử lý lỗi đầy đủ. Hạn chế thư viện thứ 3 nếu không cần.',
    self_dev: 'Mọi lời khuyên phải đi kèm bước hành động cụ thể, tránh việc nói đạo lý chung chung.',
    roadmap: 'Loại bỏ ngay các kiến thức "Nice to have" không bắt buộc ở những giai đoạn đầu tiên để tránh gây ngợp.'
  },
  example: {
    math: 'Ví dụ định dạng đầu ra: \n>> TƯ DUY:\nĐể giải phương trình này, thay vì thử từng số, ta dùng Đạo hàm...\n>> BƯỚC 1: Tính f\'(x)...\n>> BƯỚC 2: Rút gọn...',
    writing: 'Ví dụ đoạn mở đầu: \n"Mỗi ngày, khoảng 500 triệu thông điệp mới được đăng tải. 99% trong số đó bị lãng quên ngay lập tức. Trớ trêu thay, bài đăng hay nhất lại ít ai đọc lướt qua..."',
    coding: 'Ví dụ output:\n```typescript\n// Time: O(N), Space: O(1). Dùng Pointer traversal.\nfunction optimize(items: string[]): number { ... }\n```',
    self_dev: 'Ví dụ bài tập: "Ngay khi đọc xong dòng này, hãy đặt báo thức 5 phút. Ngồi trật tự không cầm điện thoại, cứ khi nào lo lắng ập tới, ghi nhận nó rồi quay lại đếm nhịp thở."',
    roadmap: 'Ví dụ Phase 1: \n- Tháng 1 & 2: Base Foundation.\n- Focus: Học vòng lặp (20% kiến thức lõi)\n- Skip: Thuật toán Graph phức tạp.\n- Project Test: Xây dựng một ứng dụng To-Do siêu đơn giản.'
  }
};
