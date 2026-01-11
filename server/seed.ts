import db from "./db";
import { v4 as uuidv4 } from "uuid";

interface QuestionData {
  text: string;
  choices: string[];
  correctAnswerIndex: number;
  category: string;
}

const arabicQuestions: QuestionData[] = [
  { text: "ما هي عاصمة المملكة العربية السعودية؟", choices: ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هو أطول نهر في العالم؟", choices: ["نهر النيل", "نهر الأمازون", "نهر المسيسيبي", "نهر اليانغتسي"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي أكبر دولة عربية من حيث المساحة؟", choices: ["الجزائر", "السعودية", "ليبيا", "مصر"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هو أعلى جبل في العالم؟", choices: ["جبل إيفرست", "جبل كيه تو", "جبل كانغشينجونغا", "جبل ماكالو"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "في أي قارة تقع مصر؟", choices: ["أفريقيا", "آسيا", "أوروبا", "أمريكا الجنوبية"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي عاصمة فرنسا؟", choices: ["باريس", "ليون", "مارسيليا", "نيس"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هو أكبر محيط في العالم؟", choices: ["المحيط الهادئ", "المحيط الأطلسي", "المحيط الهندي", "المحيط المتجمد الشمالي"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي أصغر دولة في العالم؟", choices: ["الفاتيكان", "موناكو", "سان مارينو", "ليختنشتاين"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي عاصمة اليابان؟", choices: ["طوكيو", "أوساكا", "كيوتو", "يوكوهاما"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "أين يقع برج خليفة؟", choices: ["دبي", "أبوظبي", "الدوحة", "الرياض"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي أكبر صحراء في العالم؟", choices: ["الصحراء الكبرى", "صحراء الربع الخالي", "صحراء جوبي", "صحراء كالاهاري"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي عاصمة تركيا؟", choices: ["أنقرة", "إسطنبول", "إزمير", "أنطاليا"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "أين يقع البحر الميت؟", choices: ["بين الأردن وفلسطين", "في مصر", "في تركيا", "في إيران"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي عاصمة الإمارات العربية المتحدة؟", choices: ["أبوظبي", "دبي", "الشارقة", "رأس الخيمة"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هو أطول جسر في العالم؟", choices: ["جسر دانيانغ كونشان الكبير", "جسر البحرين السعودية", "جسر البوسفور", "جسر غولدن غيت"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "أين تقع جزر المالديف؟", choices: ["المحيط الهندي", "المحيط الأطلسي", "البحر الأبيض المتوسط", "المحيط الهادئ"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي عاصمة ماليزيا؟", choices: ["كوالالمبور", "بينانج", "ملقا", "جوهور بهرو"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "أين يقع مضيق هرمز؟", choices: ["بين إيران وعُمان", "بين مصر والسعودية", "بين تركيا واليونان", "بين المغرب وإسبانيا"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي أكبر جزيرة في العالم؟", choices: ["جرينلاند", "مدغشقر", "بورنيو", "سومطرة"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "ما هي عاصمة النمسا؟", choices: ["فيينا", "سالزبورغ", "غراتس", "لينتس"], correctAnswerIndex: 0, category: "جغرافيا" },

  { text: "من هو مؤسس الدولة الأموية؟", choices: ["معاوية بن أبي سفيان", "عبدالملك بن مروان", "الوليد بن عبدالملك", "عمر بن عبدالعزيز"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "في أي عام فُتحت القسطنطينية؟", choices: ["1453م", "1492م", "1517م", "1258م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من هو القائد الذي فتح مصر؟", choices: ["عمرو بن العاص", "خالد بن الوليد", "سعد بن أبي وقاص", "طارق بن زياد"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "متى وقعت معركة بدر؟", choices: ["السنة الثانية للهجرة", "السنة الثالثة للهجرة", "السنة الرابعة للهجرة", "السنة الأولى للهجرة"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من هو الخليفة الراشدي الأول؟", choices: ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "في أي عام تأسست الدولة السعودية الثالثة؟", choices: ["1932م", "1902م", "1945م", "1924م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من فتح الأندلس؟", choices: ["طارق بن زياد", "موسى بن نصير", "عقبة بن نافع", "يوسف بن تاشفين"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "متى سقطت الخلافة العباسية؟", choices: ["1258م", "1453م", "1187م", "1099م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من قاد المسلمين في معركة حطين؟", choices: ["صلاح الدين الأيوبي", "نور الدين زنكي", "عماد الدين زنكي", "الظاهر بيبرس"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "في أي عام كانت هجرة النبي ﷺ إلى المدينة؟", choices: ["622م", "610م", "632م", "615م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من هو مؤسس الدولة العباسية؟", choices: ["أبو العباس السفاح", "أبو جعفر المنصور", "هارون الرشيد", "المأمون"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "متى وقعت الحرب العالمية الأولى؟", choices: ["1914-1918م", "1939-1945م", "1904-1905م", "1870-1871م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من بنى الأهرامات المصرية؟", choices: ["الفراعنة", "الرومان", "اليونان", "الفرس"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "متى استقلت الجزائر عن فرنسا؟", choices: ["1962م", "1954م", "1956م", "1960م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من هو القائد الذي هزم التتار في عين جالوت؟", choices: ["سيف الدين قطز", "الظاهر بيبرس", "صلاح الدين", "نور الدين زنكي"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "في أي عام تأسست جامعة الدول العربية؟", choices: ["1945م", "1948م", "1952م", "1936م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من اكتشف أمريكا؟", choices: ["كريستوفر كولومبوس", "أمريجو فسبوتشي", "فاسكو دا غاما", "ماجلان"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "متى سقطت غرناطة آخر معاقل المسلمين في الأندلس؟", choices: ["1492م", "1485م", "1500م", "1479م"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "من هو مؤسس الدولة الفاطمية؟", choices: ["عبيد الله المهدي", "المعز لدين الله", "الحاكم بأمر الله", "العزيز بالله"], correctAnswerIndex: 0, category: "تاريخ" },
  { text: "متى تم توحيد ألمانيا؟", choices: ["1871م", "1848م", "1890م", "1866م"], correctAnswerIndex: 0, category: "تاريخ" },

  { text: "ما هو العنصر الأكثر وفرة في الكون؟", choices: ["الهيدروجين", "الهيليوم", "الأكسجين", "الكربون"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي سرعة الضوء تقريباً؟", choices: ["300,000 كم/ثانية", "150,000 كم/ثانية", "500,000 كم/ثانية", "100,000 كم/ثانية"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو أكبر كوكب في المجموعة الشمسية؟", choices: ["المشتري", "زحل", "أورانوس", "نبتون"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو العنصر الكيميائي الذي رمزه O؟", choices: ["الأكسجين", "الذهب", "الأوزميوم", "الأوليفين"], correctAnswerIndex: 0, category: "علوم" },
  { text: "كم عدد عظام جسم الإنسان البالغ؟", choices: ["206", "208", "204", "210"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو أصغر كوكب في المجموعة الشمسية؟", choices: ["عطارد", "المريخ", "بلوتو", "الزهرة"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي وحدة قياس القوة؟", choices: ["نيوتن", "جول", "واط", "باسكال"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو غاز الطهي؟", choices: ["البروبان والبيوتان", "الميثان", "الهيدروجين", "الأكسجين"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو أقرب كوكب للشمس؟", choices: ["عطارد", "الزهرة", "الأرض", "المريخ"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي أكبر خلية في جسم الإنسان؟", choices: ["البويضة", "خلية الدم الحمراء", "الخلية العصبية", "خلية العضلات"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو المعدن الأكثر وفرة في القشرة الأرضية؟", choices: ["الألومنيوم", "الحديد", "النحاس", "الذهب"], correctAnswerIndex: 0, category: "علوم" },
  { text: "كم يستغرق ضوء الشمس للوصول إلى الأرض؟", choices: ["8 دقائق", "1 دقيقة", "30 دقيقة", "1 ساعة"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو العضو الأكبر في جسم الإنسان؟", choices: ["الجلد", "الكبد", "المخ", "القلب"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي درجة غليان الماء؟", choices: ["100 درجة مئوية", "90 درجة مئوية", "110 درجة مئوية", "80 درجة مئوية"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو الكوكب الأحمر؟", choices: ["المريخ", "المشتري", "زحل", "عطارد"], correctAnswerIndex: 0, category: "علوم" },
  { text: "كم عدد كروموسومات الإنسان؟", choices: ["46", "44", "48", "42"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو الغاز الذي تتنفسه النباتات؟", choices: ["ثاني أكسيد الكربون", "الأكسجين", "النيتروجين", "الهيدروجين"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي الفترة التي يدور فيها القمر حول الأرض؟", choices: ["27 يوماً تقريباً", "30 يوماً", "14 يوماً", "45 يوماً"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هو العنصر الأساسي في الجبس؟", choices: ["الكالسيوم", "الصوديوم", "البوتاسيوم", "المغنيسيوم"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي سرعة الصوت في الهواء تقريباً؟", choices: ["340 م/ث", "300 م/ث", "400 م/ث", "250 م/ث"], correctAnswerIndex: 0, category: "علوم" },

  { text: "كم عدد أركان الإسلام؟", choices: ["خمسة", "أربعة", "ستة", "ثلاثة"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي أول سورة نزلت من القرآن الكريم؟", choices: ["سورة العلق", "سورة الفاتحة", "سورة البقرة", "سورة المدثر"], correctAnswerIndex: 0, category: "دين" },
  { text: "كم عدد سور القرآن الكريم؟", choices: ["114", "113", "115", "116"], correctAnswerIndex: 0, category: "دين" },
  { text: "من هو خاتم الأنبياء والمرسلين؟", choices: ["محمد ﷺ", "عيسى عليه السلام", "موسى عليه السلام", "إبراهيم عليه السلام"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هو الركن الخامس من أركان الإسلام؟", choices: ["حج البيت", "الصيام", "الزكاة", "الصلاة"], correctAnswerIndex: 0, category: "دين" },
  { text: "أين نزل الوحي على النبي ﷺ لأول مرة؟", choices: ["غار حراء", "غار ثور", "المسجد الحرام", "المسجد النبوي"], correctAnswerIndex: 0, category: "دين" },
  { text: "كم عدد أسماء الله الحسنى؟", choices: ["99", "100", "98", "97"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي السورة التي تُسمى قلب القرآن؟", choices: ["سورة يس", "سورة الرحمن", "سورة الملك", "سورة الكهف"], correctAnswerIndex: 0, category: "دين" },
  { text: "من هو أول مؤذن في الإسلام؟", choices: ["بلال بن رباح", "عمر بن الخطاب", "عبدالله بن أم مكتوم", "أبو بكر الصديق"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي أطول سورة في القرآن الكريم؟", choices: ["سورة البقرة", "سورة آل عمران", "سورة النساء", "سورة المائدة"], correctAnswerIndex: 0, category: "دين" },
  { text: "كم عدد الصلوات المفروضة في اليوم؟", choices: ["خمس صلوات", "ثلاث صلوات", "أربع صلوات", "ست صلوات"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي السورة التي لا تبدأ بالبسملة؟", choices: ["سورة التوبة", "سورة الفاتحة", "سورة البقرة", "سورة الإخلاص"], correctAnswerIndex: 0, category: "دين" },
  { text: "من هو النبي الذي ابتلعه الحوت؟", choices: ["يونس عليه السلام", "نوح عليه السلام", "موسى عليه السلام", "عيسى عليه السلام"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي أقصر سورة في القرآن الكريم؟", choices: ["سورة الكوثر", "سورة الإخلاص", "سورة الفلق", "سورة الناس"], correctAnswerIndex: 0, category: "دين" },
  { text: "من هو أول من أسلم من الرجال؟", choices: ["أبو بكر الصديق", "عمر بن الخطاب", "علي بن أبي طالب", "عثمان بن عفان"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي ليلة القدر؟", choices: ["ليلة نزول القرآن", "ليلة الإسراء", "ليلة الهجرة", "ليلة المولد"], correctAnswerIndex: 0, category: "دين" },
  { text: "كم مرة ذُكر اسم محمد ﷺ في القرآن؟", choices: ["4 مرات", "5 مرات", "3 مرات", "6 مرات"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي أركان الإيمان؟", choices: ["ستة أركان", "خمسة أركان", "أربعة أركان", "سبعة أركان"], correctAnswerIndex: 0, category: "دين" },
  { text: "من هو النبي الملقب بأبي الأنبياء؟", choices: ["إبراهيم عليه السلام", "نوح عليه السلام", "آدم عليه السلام", "موسى عليه السلام"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هي السورة التي تُسمى سنام القرآن؟", choices: ["سورة البقرة", "سورة الفاتحة", "سورة الإخلاص", "سورة يس"], correctAnswerIndex: 0, category: "دين" },

  { text: "من كتب رواية الأيام؟", choices: ["طه حسين", "نجيب محفوظ", "توفيق الحكيم", "يوسف إدريس"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو شاعر الفلاسفة؟", choices: ["أبو العلاء المعري", "المتنبي", "أبو تمام", "البحتري"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب مقدمة ابن خلدون؟", choices: ["ابن خلدون", "ابن رشد", "الغزالي", "ابن سينا"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو أمير الشعراء؟", choices: ["أحمد شوقي", "حافظ إبراهيم", "محمود سامي البارودي", "إيليا أبو ماضي"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب رواية ثلاثية القاهرة؟", choices: ["نجيب محفوظ", "طه حسين", "توفيق الحكيم", "يحيى حقي"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو شاعر النيل؟", choices: ["حافظ إبراهيم", "أحمد شوقي", "البحتري", "المتنبي"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب كتاب الأغاني؟", choices: ["أبو الفرج الأصفهاني", "الجاحظ", "ابن المقفع", "أبو حيان التوحيدي"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو صاحب ديوان المتنبي؟", choices: ["أبو الطيب المتنبي", "أبو العلاء المعري", "أبو نواس", "البحتري"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب كليلة ودمنة؟", choices: ["ابن المقفع", "الجاحظ", "الأصفهاني", "ابن خلدون"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو شاعر المرأة؟", choices: ["نزار قباني", "محمود درويش", "أدونيس", "سميح القاسم"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب البيان والتبيين؟", choices: ["الجاحظ", "ابن المقفع", "أبو الفرج الأصفهاني", "الأصمعي"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو شاعر الثورة الفلسطينية؟", choices: ["محمود درويش", "سميح القاسم", "توفيق زياد", "فدوى طوقان"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب طوق الحمامة؟", choices: ["ابن حزم الأندلسي", "ابن رشد", "ابن عربي", "الغزالي"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو مؤلف ألف ليلة وليلة؟", choices: ["مجهول", "الجاحظ", "ابن المقفع", "أبو نواس"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب رسالة الغفران؟", choices: ["أبو العلاء المعري", "المتنبي", "الجاحظ", "ابن المقفع"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو أول عربي يحصل على جائزة نوبل للآداب؟", choices: ["نجيب محفوظ", "طه حسين", "توفيق الحكيم", "يوسف إدريس"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب الإمتاع والمؤانسة؟", choices: ["أبو حيان التوحيدي", "الجاحظ", "ابن المقفع", "الأصفهاني"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو صاحب قصيدة البردة؟", choices: ["البوصيري", "المتنبي", "أحمد شوقي", "حافظ إبراهيم"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من كتب عبقرية عمر؟", choices: ["العقاد", "طه حسين", "نجيب محفوظ", "توفيق الحكيم"], correctAnswerIndex: 0, category: "أدب" },
  { text: "من هو شاعر السيف والقلم؟", choices: ["أبو فراس الحمداني", "المتنبي", "البحتري", "أبو تمام"], correctAnswerIndex: 0, category: "أدب" },

  { text: "في أي رياضة يُستخدم مصطلح Ace؟", choices: ["التنس", "كرة القدم", "السباحة", "الجمباز"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "كم عدد لاعبي فريق كرة القدم في الملعب؟", choices: ["11 لاعباً", "10 لاعبين", "12 لاعباً", "9 لاعبين"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "في أي بلد أُقيمت كأس العالم 2022؟", choices: ["قطر", "روسيا", "البرازيل", "ألمانيا"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "من هو الهداف التاريخي لكأس العالم؟", choices: ["ميروسلاف كلوزه", "رونالدو البرازيلي", "جيرد مولر", "فونتين"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "كم تبلغ مدة شوط كرة القدم؟", choices: ["45 دقيقة", "40 دقيقة", "50 دقيقة", "35 دقيقة"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "ما هي الرياضة التي يُمارسها تايغر وودز؟", choices: ["الغولف", "التنس", "السباحة", "ألعاب القوى"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "كم مرة فازت البرازيل بكأس العالم؟", choices: ["5 مرات", "4 مرات", "6 مرات", "3 مرات"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "من هو الملقب بالجوهرة السوداء؟", choices: ["بيليه", "مارادونا", "رونالدينيو", "رونالدو"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "ما هي الألعاب الأولمبية الشتوية؟", choices: ["ألعاب تُقام على الثلج والجليد", "ألعاب تُقام في الشتاء فقط", "ألعاب للدول الباردة", "ألعاب للرياضات المائية"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "كم عدد لاعبي فريق كرة السلة في الملعب؟", choices: ["5 لاعبين", "6 لاعبين", "7 لاعبين", "4 لاعبين"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "من هو أسرع رجل في العالم؟", choices: ["يوسين بولت", "كارل لويس", "مو فرح", "تايسون غاي"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "ما هي جنسية ميسي؟", choices: ["أرجنتيني", "برازيلي", "إسباني", "برتغالي"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "كم يبلغ طول سباق الماراثون؟", choices: ["42.195 كم", "40 كم", "45 كم", "50 كم"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "من هو الهداف التاريخي لمنتخب مصر؟", choices: ["حسام حسن", "محمود الخطيب", "أحمد حسن", "عماد متعب"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "في أي بلد نشأت رياضة الجودو؟", choices: ["اليابان", "الصين", "كوريا", "تايلاند"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "كم عدد حلقات الشعار الأولمبي؟", choices: ["5 حلقات", "4 حلقات", "6 حلقات", "7 حلقات"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "من هو أكثر لاعب حصولاً على الكرة الذهبية؟", choices: ["ليونيل ميسي", "كريستيانو رونالدو", "ميشيل بلاتيني", "يوهان كرويف"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "ما هي مدة مباراة كرة السلة؟", choices: ["4 أشواط × 12 دقيقة", "4 أشواط × 10 دقائق", "شوطان × 20 دقيقة", "4 أشواط × 15 دقيقة"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "من هو أول عربي يفوز بكأس العالم للأندية؟", choices: ["ماجد عبدالله", "سامي الجابر", "نور الدين النيبت", "مصطفى حجي"], correctAnswerIndex: 0, category: "رياضة" },
  { text: "في أي رياضة يُستخدم مضرب الريشة؟", choices: ["الريشة الطائرة", "التنس", "تنس الطاولة", "الاسكواش"], correctAnswerIndex: 0, category: "رياضة" },

  { text: "من اخترع المصباح الكهربائي؟", choices: ["توماس إديسون", "نيكولا تسلا", "ألكسندر غراهام بيل", "جيمس واط"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الهاتف؟", choices: ["ألكسندر غراهام بيل", "توماس إديسون", "نيكولا تسلا", "غولييلمو ماركوني"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الطائرة؟", choices: ["الأخوان رايت", "ليوناردو دافنشي", "جورج كايلي", "صامويل لانغلي"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع المحرك البخاري؟", choices: ["جيمس واط", "توماس نيوكومن", "توماس سافري", "ريتشارد تريفيثيك"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الراديو؟", choices: ["غولييلمو ماركوني", "نيكولا تسلا", "توماس إديسون", "هنريخ هيرتز"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع السيارة؟", choices: ["كارل بنز", "هنري فورد", "غوتليب دايملر", "نيكولاس كونيو"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع التلسكوب؟", choices: ["هانز ليبرشي", "غاليليو غاليلي", "يوهانس كيبلر", "إسحاق نيوتن"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع البنسلين؟", choices: ["ألكسندر فليمنغ", "لويس باستور", "روبرت كوخ", "إدوارد جينر"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الديناميت؟", choices: ["ألفريد نوبل", "توماس إديسون", "نيكولا تسلا", "جيمس واط"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الطباعة؟", choices: ["يوهانس غوتنبرغ", "ويليام كاكستون", "كاي لون", "تسي لون"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع التلفزيون؟", choices: ["جون لوجي بيرد", "فيلو فارنسوورث", "بوريس روزينغ", "فلاديمير زفوريكين"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع اللقاحات؟", choices: ["إدوارد جينر", "لويس باستور", "روبرت كوخ", "ألكسندر فليمنغ"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع البارود؟", choices: ["الصينيون القدماء", "العرب", "الفرس", "اليونان"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الإنترنت؟", choices: ["تيم بيرنرز لي", "فينت سيرف", "روبرت كان", "لاري روبرتس"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع البطارية؟", choices: ["أليساندرو فولتا", "توماس إديسون", "مايكل فاراداي", "بنجامين فرانكلين"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع المجهر؟", choices: ["أنتوني فان ليفينهوك", "روبرت هوك", "غاليليو غاليلي", "زاكاريا يانسن"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الكاميرا؟", choices: ["جوزيف نيسفور نييبس", "لويس داغير", "جورج إيستمان", "توماس إديسون"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع البوصلة؟", choices: ["الصينيون القدماء", "العرب", "الإغريق", "الفينيقيون"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الورق؟", choices: ["الصينيون القدماء", "المصريون القدماء", "العرب", "الإغريق"], correctAnswerIndex: 0, category: "اختراعات" },
  { text: "من اخترع الثلاجة الكهربائية؟", choices: ["كارل فون ليندن", "ويليس كاريير", "جيمس هاريسون", "فريدريك وينسلو تايلور"], correctAnswerIndex: 0, category: "اختراعات" },

  { text: "ما هي عملة اليابان؟", choices: ["الين", "الوون", "اليوان", "الروبية"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هو لون السماء في يوم صافٍ؟", choices: ["أزرق", "أخضر", "أحمر", "أصفر"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد أيام السنة الميلادية؟", choices: ["365 يوم", "360 يوم", "366 يوم", "354 يوم"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هو الحيوان الوطني للهند؟", choices: ["النمر البنغالي", "الفيل", "الأسد", "الطاووس"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هي لغة البرازيل الرسمية؟", choices: ["البرتغالية", "الإسبانية", "الإنجليزية", "الفرنسية"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد ألوان قوس قزح؟", choices: ["7 ألوان", "5 ألوان", "6 ألوان", "8 ألوان"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هو أكبر حيوان على وجه الأرض؟", choices: ["الحوت الأزرق", "الفيل الأفريقي", "الزرافة", "وحيد القرن"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هي عاصمة كندا؟", choices: ["أوتاوا", "تورونتو", "فانكوفر", "مونتريال"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد قارات العالم؟", choices: ["7 قارات", "5 قارات", "6 قارات", "8 قارات"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هي أكبر قارة في العالم؟", choices: ["آسيا", "أفريقيا", "أمريكا الشمالية", "أوروبا"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هو الحيوان الأسرع في العالم؟", choices: ["الفهد", "الأسد", "النمر", "الغزال"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد أرجل العنكبوت؟", choices: ["8 أرجل", "6 أرجل", "10 أرجل", "4 أرجل"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هي أصغر قارة في العالم؟", choices: ["أستراليا", "أوروبا", "أنتاركتيكا", "أمريكا الجنوبية"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد أضلاع المثلث؟", choices: ["3 أضلاع", "4 أضلاع", "5 أضلاع", "6 أضلاع"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هو الكوكب الذي نعيش عليه؟", choices: ["الأرض", "المريخ", "الزهرة", "المشتري"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هي أكبر دولة في العالم من حيث المساحة؟", choices: ["روسيا", "كندا", "الصين", "الولايات المتحدة"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد أسنان الإنسان البالغ؟", choices: ["32 سن", "28 سن", "30 سن", "34 سن"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هو الطائر الذي لا يستطيع الطيران؟", choices: ["النعامة", "النسر", "الصقر", "البجعة"], correctAnswerIndex: 0, category: "عام" },
  { text: "ما هي عاصمة إيطاليا؟", choices: ["روما", "ميلانو", "فلورنسا", "البندقية"], correctAnswerIndex: 0, category: "عام" },
  { text: "كم عدد أشهر السنة؟", choices: ["12 شهر", "10 أشهر", "11 شهر", "13 شهر"], correctAnswerIndex: 0, category: "عام" },

  { text: "ما هي ناتج 25 × 4؟", choices: ["100", "90", "110", "80"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو الجذر التربيعي لـ 144؟", choices: ["12", "14", "11", "13"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي 15% من 200؟", choices: ["30", "25", "35", "20"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو ناتج 7 × 8؟", choices: ["56", "54", "58", "52"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم عدد درجات الزاوية القائمة؟", choices: ["90 درجة", "180 درجة", "45 درجة", "60 درجة"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو ناتج 100 ÷ 4؟", choices: ["25", "20", "30", "24"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي 2 مرفوع للقوة 5؟", choices: ["32", "16", "64", "8"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو مجموع زوايا المثلث؟", choices: ["180 درجة", "360 درجة", "90 درجة", "270 درجة"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي 3 × 3 × 3؟", choices: ["27", "18", "24", "21"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هي قيمة π تقريباً؟", choices: ["3.14", "2.14", "4.14", "3.41"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو ناتج 1000 - 567؟", choices: ["433", "443", "423", "453"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم ضعف العدد 45؟", choices: ["90", "100", "85", "95"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو العدد الأولي بين هذه الأعداد؟", choices: ["7", "9", "15", "21"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي 50 + 75 + 25؟", choices: ["150", "140", "160", "145"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو ناتج 12 × 11؟", choices: ["132", "122", "142", "112"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي نصف 500؟", choices: ["250", "200", "300", "225"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو ناتج 81 ÷ 9؟", choices: ["9", "8", "10", "7"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي 20% من 500؟", choices: ["100", "50", "150", "200"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "ما هو المضاعف المشترك الأصغر لـ 4 و 6؟", choices: ["12", "24", "6", "18"], correctAnswerIndex: 0, category: "رياضيات" },
  { text: "كم يساوي 5 مضروب (5!)؟", choices: ["120", "25", "60", "100"], correctAnswerIndex: 0, category: "رياضيات" },

  { text: "ما هو الفيتامين الذي يُنتجه الجسم عند التعرض للشمس؟", choices: ["فيتامين د", "فيتامين أ", "فيتامين سي", "فيتامين ب"], correctAnswerIndex: 0, category: "صحة" },
  { text: "كم لتر من الدم في جسم الإنسان البالغ تقريباً؟", choices: ["5 لترات", "3 لترات", "7 لترات", "10 لترات"], correctAnswerIndex: 0, category: "صحة" },
  { text: "ما هو العضو المسؤول عن تنقية الدم؟", choices: ["الكلى", "الكبد", "الرئتين", "القلب"], correctAnswerIndex: 0, category: "صحة" },
  { text: "كم عدد نبضات القلب الطبيعية في الدقيقة؟", choices: ["60-100 نبضة", "40-60 نبضة", "100-120 نبضة", "120-150 نبضة"], correctAnswerIndex: 0, category: "صحة" },
  { text: "ما هو الهرمون المسؤول عن تنظيم السكر في الدم؟", choices: ["الأنسولين", "الأدرينالين", "الثيروكسين", "الكورتيزول"], correctAnswerIndex: 0, category: "صحة" },
  { text: "أين تقع الغدة الدرقية؟", choices: ["في الرقبة", "في الرأس", "في البطن", "في الصدر"], correctAnswerIndex: 0, category: "صحة" },
  { text: "ما هو أكبر عضو داخلي في جسم الإنسان؟", choices: ["الكبد", "الرئة", "المعدة", "القلب"], correctAnswerIndex: 0, category: "صحة" },
  { text: "كم عدد الأسنان اللبنية عند الأطفال؟", choices: ["20 سن", "24 سن", "16 سن", "28 سن"], correctAnswerIndex: 0, category: "صحة" },
  { text: "ما هي فصيلة الدم الأكثر شيوعاً؟", choices: ["O موجب", "A موجب", "B موجب", "AB موجب"], correctAnswerIndex: 0, category: "صحة" },
  { text: "كم عدد عضلات جسم الإنسان تقريباً؟", choices: ["600 عضلة", "400 عضلة", "800 عضلة", "1000 عضلة"], correctAnswerIndex: 0, category: "صحة" },

  { text: "من رسم لوحة الموناليزا؟", choices: ["ليوناردو دافنشي", "مايكل أنجلو", "رافائيل", "بيكاسو"], correctAnswerIndex: 0, category: "فن" },
  { text: "ما هي اللغة الأكثر تحدثاً في العالم؟", choices: ["الماندرين الصينية", "الإنجليزية", "الإسبانية", "العربية"], correctAnswerIndex: 0, category: "ثقافة" },
  { text: "ما هو رمز عنصر الذهب؟", choices: ["Au", "Ag", "Fe", "Cu"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي عاصمة أستراليا؟", choices: ["كانبرا", "سيدني", "ملبورن", "بريسبان"], correctAnswerIndex: 0, category: "جغرافيا" },
  { text: "من ألف كتاب الأم؟", choices: ["الإمام الشافعي", "الإمام مالك", "الإمام أحمد", "الإمام أبو حنيفة"], correctAnswerIndex: 0, category: "دين" },
  { text: "ما هو أول بنك إسلامي في العالم؟", choices: ["بنك دبي الإسلامي", "بنك فيصل الإسلامي", "بنك البركة", "مصرف الراجحي"], correctAnswerIndex: 0, category: "اقتصاد" },
  { text: "ما هي أقدم جامعة في العالم؟", choices: ["جامعة القرويين", "جامعة الأزهر", "جامعة بولونيا", "جامعة أكسفورد"], correctAnswerIndex: 0, category: "تعليم" },
  { text: "من اكتشف قانون الجاذبية؟", choices: ["إسحاق نيوتن", "ألبرت أينشتاين", "غاليليو غاليلي", "نيكولا كوبرنيكوس"], correctAnswerIndex: 0, category: "علوم" },
  { text: "ما هي درجة تجمد الماء؟", choices: ["0 درجة مئوية", "-10 درجة مئوية", "10 درجة مئوية", "5 درجة مئوية"], correctAnswerIndex: 0, category: "علوم" },
  { text: "من هو مخترع الكتابة؟", choices: ["السومريون", "المصريون", "الفينيقيون", "البابليون"], correctAnswerIndex: 0, category: "تاريخ" },
];

export function seedQuestions() {
  const existingCount = db.prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
  
  if (existingCount.count >= 200) {
    console.log(`Database already has ${existingCount.count} questions. Skipping seed.`);
    return;
  }

  console.log("Seeding Arabic questions...");
  
  const insertStmt = db.prepare(
    "INSERT OR IGNORE INTO questions (id, text, choices, correct_answer_index, category) VALUES (?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((questions: QuestionData[]) => {
    for (const q of questions) {
      insertStmt.run(
        uuidv4(),
        q.text,
        JSON.stringify(q.choices),
        q.correctAnswerIndex,
        q.category
      );
    }
  });

  insertMany(arabicQuestions);

  const newCount = db.prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
  console.log(`Seeded ${newCount.count} Arabic questions successfully!`);
}

seedQuestions();
