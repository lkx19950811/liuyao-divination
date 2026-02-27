import type { Hexagram, Trigram } from '../types'

export const TRIGRAMS: Record<string, Trigram> = {
  '乾': { name: '乾', symbol: '☰', wuxing: '金', nature: '天', family: '父', direction: '西北', season: '秋冬', binary: '111' },
  '兑': { name: '兑', symbol: '☱', wuxing: '金', nature: '泽', family: '少女', direction: '西', season: '秋', binary: '011' },
  '离': { name: '离', symbol: '☲', wuxing: '火', nature: '火', family: '中女', direction: '南', season: '夏', binary: '101' },
  '震': { name: '震', symbol: '☳', wuxing: '木', nature: '雷', family: '长男', direction: '东', season: '春', binary: '001' },
  '巽': { name: '巽', symbol: '☴', wuxing: '木', nature: '风', family: '长女', direction: '东南', season: '春夏', binary: '110' },
  '坎': { name: '坎', symbol: '☵', wuxing: '水', nature: '水', family: '中男', direction: '北', season: '冬', binary: '010' },
  '艮': { name: '艮', symbol: '☶', wuxing: '土', nature: '山', family: '少男', direction: '东北', season: '冬春', binary: '100' },
  '坤': { name: '坤', symbol: '☷', wuxing: '土', nature: '地', family: '母', direction: '西南', season: '夏秋', binary: '000' }
}

export const TRIGRAM_LIST = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']

export const HEXAGRAMS: Hexagram[] = [
  { id: 1, name: '乾', alias: null, upperTrigram: '乾', lowerTrigram: '乾', binary: '111111', guaci: '元亨利贞。', tuanci: '大哉乾元，万物资始，乃统天。', xiangci: '天行健，君子以自强不息。', wuxing: '金', palace: '乾', description: '乾卦象征天，代表刚健、创造、领导。' },
  { id: 2, name: '坤', alias: null, upperTrigram: '坤', lowerTrigram: '坤', binary: '000000', guaci: '元亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞吉。', tuanci: '至哉坤元，万物资生，乃顺承天。', xiangci: '地势坤，君子以厚德载物。', wuxing: '土', palace: '坤', description: '坤卦象征地，代表柔顺、包容、承载。' },
  { id: 3, name: '屯', alias: null, upperTrigram: '坎', lowerTrigram: '震', binary: '010001', guaci: '元亨利贞，勿用有攸往，利建侯。', tuanci: '屯，刚柔始交而难生。', xiangci: '云雷屯，君子以经纶。', wuxing: '水', palace: '坎', description: '屯卦象征初生，代表创业艰难、万事开头难。' },
  { id: 4, name: '蒙', alias: null, upperTrigram: '艮', lowerTrigram: '坎', binary: '100010', guaci: '亨。匪我求童蒙，童蒙求我。初噬告，再三渎，渎则不告。利贞。', tuanci: '蒙，山下有险，险而止，蒙。', xiangci: '山下出泉，蒙，君子以果行育德。', wuxing: '土', palace: '离', description: '蒙卦象征启蒙，代表教育、学习、开导。' },
  { id: 5, name: '需', alias: null, upperTrigram: '坎', lowerTrigram: '乾', binary: '010111', guaci: '有孚，光亨，贞吉。利涉大川。', tuanci: '需，须也，险在前也。', xiangci: '云上于天，需，君子以饮食宴乐。', wuxing: '水', palace: '坤', description: '需卦象征等待，代表耐心、时机、准备。' },
  { id: 6, name: '讼', alias: null, upperTrigram: '乾', lowerTrigram: '坎', binary: '111010', guaci: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。', tuanci: '讼，上刚下险，险而健，讼。', xiangci: '天与水违行，讼，君子以作事谋始。', wuxing: '金', palace: '离', description: '讼卦象征争讼，代表冲突、争议、诉讼。' },
  { id: 7, name: '师', alias: null, upperTrigram: '坤', lowerTrigram: '坎', binary: '000010', guaci: '贞，丈人吉，无咎。', tuanci: '师，众也。贞，正也。', xiangci: '地中有水，师，君子以容民畜众。', wuxing: '土', palace: '坎', description: '师卦象征军队，代表领导、纪律、团队。' },
  { id: 8, name: '比', alias: null, upperTrigram: '坎', lowerTrigram: '坤', binary: '010000', guaci: '吉。原筮元永贞，无咎。不宁方来，后夫凶。', tuanci: '比，吉也。比，辅也，下顺从也。', xiangci: '地上有水，比，先王以建万国，亲诸侯。', wuxing: '水', palace: '坤', description: '比卦象征亲比，代表团结、合作、亲近。' },
  { id: 9, name: '小畜', alias: null, upperTrigram: '巽', lowerTrigram: '乾', binary: '110111', guaci: '亨。密云不雨，自我西郊。', tuanci: '小畜，柔得位而上下应之，曰小畜。', xiangci: '风行天上，小畜，君子以懿文德。', wuxing: '木', palace: '巽', description: '小畜卦象征小有积蓄，代表积累、等待、准备。' },
  { id: 10, name: '履', alias: null, upperTrigram: '乾', lowerTrigram: '兑', binary: '111011', guaci: '履虎尾，不咥人，亨。', tuanci: '履，柔履刚也。', xiangci: '上天下泽，履，君子以辨上下，安民志。', wuxing: '金', palace: '艮', description: '履卦象征践行，代表谨慎、礼仪、行动。' },
  { id: 11, name: '泰', alias: null, upperTrigram: '坤', lowerTrigram: '乾', binary: '000111', guaci: '小往大来，吉，亨。', tuanci: '泰，小往大来，吉，亨。则是天地交而万物通也。', xiangci: '天地交，泰，后以财成天地之道，辅相天地之宜，以左右民。', wuxing: '土', palace: '坤', description: '泰卦象征通泰，代表顺利、和谐、繁荣。' },
  { id: 12, name: '否', alias: null, upperTrigram: '乾', lowerTrigram: '坤', binary: '111000', guaci: '否之匪人，不利君子贞，大往小来。', tuanci: '否之匪人，不利君子贞，大往小来。则是天地不交而万物不通也。', xiangci: '天地不交，否，君子以俭德辟难，不可荣以禄。', wuxing: '金', palace: '乾', description: '否卦象征闭塞，代表阻碍、困难、不顺。' },
  { id: 13, name: '同人', alias: null, upperTrigram: '乾', lowerTrigram: '离', binary: '111101', guaci: '同人于野，亨。利涉大川，利君子贞。', tuanci: '同人，柔得位得中，而应乎乾，曰同人。', xiangci: '天与火，同人，君子以类族辨物。', wuxing: '金', palace: '离', description: '同人卦象征和同，代表合作、团结、共识。' },
  { id: 14, name: '大有', alias: null, upperTrigram: '离', lowerTrigram: '乾', binary: '101111', guaci: '元亨。', tuanci: '大有，柔得尊位大中，而上下应之，曰大有。', xiangci: '火在天上，大有，君子以遏恶扬善，顺天休命。', wuxing: '火', palace: '乾', description: '大有卦象征大有收获，代表丰盛、成功、富足。' },
  { id: 15, name: '谦', alias: null, upperTrigram: '坤', lowerTrigram: '艮', binary: '000100', guaci: '亨，君子有终。', tuanci: '谦，亨，天道下济而光明，地道卑而上行。', xiangci: '地中有山，谦，君子以裒多益寡，称物平施。', wuxing: '土', palace: '兑', description: '谦卦象征谦虚，代表谦逊、低调、美德。' },
  { id: 16, name: '豫', alias: null, upperTrigram: '震', lowerTrigram: '坤', binary: '001000', guaci: '利建侯行师。', tuanci: '豫，刚应而志行，顺以动，豫。', xiangci: '雷出地奋，豫，先王以作乐崇德，殷荐之上帝，以配祖考。', wuxing: '木', palace: '震', description: '豫卦象征欢乐，代表愉悦、准备、行动。' },
  { id: 17, name: '随', alias: null, upperTrigram: '兑', lowerTrigram: '震', binary: '011001', guaci: '元亨利贞，无咎。', tuanci: '随，刚来而下柔，动而说，随。', xiangci: '泽中有雷，随，君子以向晦入宴息。', wuxing: '金', palace: '震', description: '随卦象征随从，代表顺应、跟随、变通。' },
  { id: 18, name: '蛊', alias: null, upperTrigram: '艮', lowerTrigram: '巽', binary: '100110', guaci: '元亨，利涉大川。先甲三日，后甲三日。', tuanci: '蛊，刚上而柔下，巽而止，蛊。', xiangci: '山下有风，蛊，君子以振民育德。', wuxing: '土', palace: '巽', description: '蛊卦象征整治，代表改革、修复、振兴。' },
  { id: 19, name: '临', alias: null, upperTrigram: '坤', lowerTrigram: '兑', binary: '000011', guaci: '元亨利贞。至于八月有凶。', tuanci: '临，刚浸而长，说而顺，刚中而应，大亨以正，天之道也。', xiangci: '泽上有地，临，君子以教思无穷，容保民无疆。', wuxing: '土', palace: '坎', description: '临卦象征来临，代表亲临、管理、发展。' },
  { id: 20, name: '观', alias: null, upperTrigram: '巽', lowerTrigram: '坤', binary: '110000', guaci: '盥而不荐，有孚颙若。', tuanci: '大观在上，顺而巽，中正以观天下。', xiangci: '风行地上，观，先王以省方观民设教。', wuxing: '木', palace: '乾', description: '观卦象征观察，代表观察、思考、展示。' },
  { id: 21, name: '噬嗑', alias: null, upperTrigram: '离', lowerTrigram: '震', binary: '101001', guaci: '亨，利用狱。', tuanci: '颐中有物，曰噬嗑。', xiangci: '雷电，噬嗑，先王以明罚敕法。', wuxing: '火', palace: '巽', description: '噬嗑卦象征咬合，代表决断、执法、解决。' },
  { id: 22, name: '贲', alias: null, upperTrigram: '艮', lowerTrigram: '离', binary: '100101', guaci: '亨，小利有攸往。', tuanci: '贲，亨，柔来而文刚，故亨。', xiangci: '山下有火，贲，君子以明庶政，无敢折狱。', wuxing: '土', palace: '艮', description: '贲卦象征装饰，代表美化、修饰、文明。' },
  { id: 23, name: '剥', alias: null, upperTrigram: '艮', lowerTrigram: '坤', binary: '100000', guaci: '不利有攸往。', tuanci: '剥，剥也，柔变刚也。', xiangci: '山附于地，剥，上以厚下安宅。', wuxing: '土', palace: '乾', description: '剥卦象征剥落，代表衰落、损失、退守。' },
  { id: 24, name: '复', alias: null, upperTrigram: '坤', lowerTrigram: '震', binary: '000001', guaci: '亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。', tuanci: '复，亨，刚反，动而以顺行。', xiangci: '雷在地中，复，先王以至日闭关，商旅不行，后不省方。', wuxing: '土', palace: '坤', description: '复卦象征回复，代表恢复、回归、新生。' },
  { id: 25, name: '无妄', alias: null, upperTrigram: '乾', lowerTrigram: '震', binary: '111001', guaci: '元亨利贞。其匪正有眚，不利有攸往。', tuanci: '无妄，刚自外来而为主于内，动而健，刚中而应。', xiangci: '天下雷行，物与无妄，先王以茂对时育万物。', wuxing: '金', palace: '震', description: '无妄卦象征真实，代表诚实、正直、意外。' },
  { id: 26, name: '大畜', alias: null, upperTrigram: '艮', lowerTrigram: '乾', binary: '100111', guaci: '利贞，不家食吉，利涉大川。', tuanci: '大畜，刚健笃实辉光，日新其德。', xiangci: '天在山中，大畜，君子以多识前言往行，以畜其德。', wuxing: '土', palace: '艮', description: '大畜卦象征大有积蓄，代表积累、培养、等待。' },
  { id: 27, name: '颐', alias: null, upperTrigram: '艮', lowerTrigram: '震', binary: '100001', guaci: '贞吉。观颐，自求口实。', tuanci: '颐，贞吉，养正则吉也。', xiangci: '山下有雷，颐，君子以慎言语，节饮食。', wuxing: '土', palace: '巽', description: '颐卦象征颐养，代表养育、保养、饮食。' },
  { id: 28, name: '大过', alias: null, upperTrigram: '兑', lowerTrigram: '巽', binary: '011110', guaci: '栋桡，利有攸往，亨。', tuanci: '大过，大者过也。', xiangci: '泽灭木，大过，君子以独立不惧，遁世无闷。', wuxing: '金', palace: '震', description: '大过卦象征过度，代表过度、非常、承担。' },
  { id: 29, name: '坎', alias: null, upperTrigram: '坎', lowerTrigram: '坎', binary: '010010', guaci: '习坎，有孚，维心亨，行有尚。', tuanci: '习坎，重险也，水流而不盈。', xiangci: '水洊至，习坎，君子以常德行，习教事。', wuxing: '水', palace: '坎', description: '坎卦象征险陷，代表困难、危险、考验。' },
  { id: 30, name: '离', alias: null, upperTrigram: '离', lowerTrigram: '离', binary: '101101', guaci: '利贞，亨。畜牝牛，吉。', tuanci: '离，丽也。日月丽乎天，百谷草木丽乎土。', xiangci: '明两作，离，大人以继明照于四方。', wuxing: '火', palace: '离', description: '离卦象征附丽，代表光明、依附、文明。' },
  { id: 31, name: '咸', alias: null, upperTrigram: '兑', lowerTrigram: '艮', binary: '011100', guaci: '亨，利贞，取女吉。', tuanci: '咸，感也。柔上而刚下，二气感应以相与。', xiangci: '山上有泽，咸，君子以虚受人。', wuxing: '金', palace: '兑', description: '咸卦象征感应，代表感应、爱情、沟通。' },
  { id: 32, name: '恒', alias: null, upperTrigram: '震', lowerTrigram: '巽', binary: '001110', guaci: '亨，无咎，利贞，利有攸往。', tuanci: '恒，久也。刚上而柔下。', xiangci: '雷风，恒，君子以立不易方。', wuxing: '木', palace: '震', description: '恒卦象征恒久，代表持久、稳定、坚持。' },
  { id: 33, name: '遁', alias: null, upperTrigram: '乾', lowerTrigram: '艮', binary: '111100', guaci: '亨，小利贞。', tuanci: '遁，亨，遁而亨也。', xiangci: '天下有山，遁，君子以远小人，不恶而严。', wuxing: '金', palace: '乾', description: '遁卦象征退避，代表退让、隐退、回避。' },
  { id: 34, name: '大壮', alias: null, upperTrigram: '震', lowerTrigram: '乾', binary: '001111', guaci: '利贞。', tuanci: '大壮，大者壮也。刚以动，故壮。', xiangci: '雷在天上，大壮，君子以非礼弗履。', wuxing: '木', palace: '坤', description: '大壮卦象征壮大，代表强盛、进取、冲动。' },
  { id: 35, name: '晋', alias: null, upperTrigram: '离', lowerTrigram: '坤', binary: '101000', guaci: '康侯用锡马蕃庶，昼日三接。', tuanci: '晋，进也。明出地上，顺而丽乎大明。', xiangci: '明出地上，晋，君子以自昭明德。', wuxing: '火', palace: '乾', description: '晋卦象征前进，代表晋升、发展、光明。' },
  { id: 36, name: '明夷', alias: null, upperTrigram: '坤', lowerTrigram: '离', binary: '000101', guaci: '利艰贞。', tuanci: '明入地中，明夷。内文明而外柔顺，以蒙大难，文王以之。', xiangci: '明入地中，明夷，君子以莅众，用晦而明。', wuxing: '土', palace: '坎', description: '明夷卦象征光明受损，代表困难、韬光养晦、等待。' },
  { id: 37, name: '家人', alias: null, upperTrigram: '巽', lowerTrigram: '离', binary: '110101', guaci: '利女贞。', tuanci: '家人，女正位乎内，男正位乎外。', xiangci: '风自火出，家人，君子以言有物而行有恒。', wuxing: '木', palace: '巽', description: '家人卦象征家庭，代表家庭、和睦、秩序。' },
  { id: 38, name: '睽', alias: null, upperTrigram: '离', lowerTrigram: '兑', binary: '101011', guaci: '小事吉。', tuanci: '睽，火动而上，泽动而下。', xiangci: '上火下泽，睽，君子以同而异。', wuxing: '火', palace: '艮', description: '睽卦象征乖离，代表矛盾、分歧、对立。' },
  { id: 39, name: '蹇', alias: null, upperTrigram: '坎', lowerTrigram: '艮', binary: '010100', guaci: '利西南，不利东北。利见大人，贞吉。', tuanci: '蹇，难也，险在前也。', xiangci: '山上有水，蹇，君子以反身修德。', wuxing: '水', palace: '兑', description: '蹇卦象征困难，代表艰难、阻碍、反省。' },
  { id: 40, name: '解', alias: null, upperTrigram: '震', lowerTrigram: '坎', binary: '001010', guaci: '利西南，无所往，其来复吉。有攸往，夙吉。', tuanci: '解，险以动，动而免乎险，解。', xiangci: '雷雨作，解，君子以赦过宥罪。', wuxing: '木', palace: '震', description: '解卦象征解脱，代表解决、释放、缓解。' },
  { id: 41, name: '损', alias: null, upperTrigram: '艮', lowerTrigram: '兑', binary: '100011', guaci: '有孚，元吉，无咎，可贞，利有攸往。曷之用？二簋可用享。', tuanci: '损，损下益上，其道上行。', xiangci: '山下有泽，损，君子以惩忿窒欲。', wuxing: '土', palace: '艮', description: '损卦象征减损，代表损失、节制、奉献。' },
  { id: 42, name: '益', alias: null, upperTrigram: '巽', lowerTrigram: '震', binary: '110001', guaci: '利有攸往，利涉大川。', tuanci: '益，损上益下，民说无疆。', xiangci: '风雷，益，君子以见善则迁，有过则改。', wuxing: '木', palace: '巽', description: '益卦象征增益，代表增加、利益、进步。' },
  { id: 43, name: '夬', alias: null, upperTrigram: '兑', lowerTrigram: '乾', binary: '011111', guaci: '扬于王庭，孚号有厉。告自邑，不利即戎，利有攸往。', tuanci: '夬，决也，刚决柔也。', xiangci: '泽上于天，夬，君子以施禄及下，居德则忌。', wuxing: '金', palace: '坤', description: '夬卦象征决断，代表决断、突破、公布。' },
  { id: 44, name: '姤', alias: null, upperTrigram: '乾', lowerTrigram: '巽', binary: '111110', guaci: '女壮，勿用取女。', tuanci: '姤，遇也，柔遇刚也。', xiangci: '天下有风，姤，后以施命诰四方。', wuxing: '金', palace: '乾', description: '姤卦象征相遇，代表邂逅、机遇、意外。' },
  { id: 45, name: '萃', alias: null, upperTrigram: '兑', lowerTrigram: '坤', binary: '011000', guaci: '亨。王假有庙，利见大人，亨，利贞，用大牲吉，利有攸往。', tuanci: '萃，聚也。顺以说，刚中而应，故聚也。', xiangci: '泽上于地，萃，君子以除戎器，戒不虞。', wuxing: '金', palace: '兑', description: '萃卦象征聚集，代表聚集、团结、合作。' },
  { id: 46, name: '升', alias: null, upperTrigram: '坤', lowerTrigram: '巽', binary: '000110', guaci: '元亨，用见大人，勿恤，南征吉。', tuanci: '柔以时升，巽而顺，刚中而应，是以大亨。', xiangci: '地中生木，升，君子以顺德，积小以高大。', wuxing: '土', palace: '震', description: '升卦象征上升，代表晋升、发展、进步。' },
  { id: 47, name: '困', alias: null, upperTrigram: '兑', lowerTrigram: '坎', binary: '011010', guaci: '亨，贞，大人吉，无咎，有言不信。', tuanci: '困，刚掩也。险以说，困而不失其所亨，其唯君子乎。', xiangci: '泽无水，困，君子以致命遂志。', wuxing: '金', palace: '坎', description: '困卦象征困顿，代表困难、困境、考验。' },
  { id: 48, name: '井', alias: null, upperTrigram: '坎', lowerTrigram: '巽', binary: '010110', guaci: '改邑不改井，无丧无得，往来井井。汔至亦未繘井，羸其瓶，凶。', tuanci: '巽乎水而上水，井。井养而不穷也。', xiangci: '木上有水，井，君子以劳民劝相。', wuxing: '水', palace: '震', description: '井卦象征水井，代表资源、滋养、恒久。' },
  { id: 49, name: '革', alias: null, upperTrigram: '兑', lowerTrigram: '离', binary: '011101', guaci: '己日乃孚，元亨利贞，悔亡。', tuanci: '革，水火相息，二女同居，其志不相得，曰革。', xiangci: '泽中有火，革，君子以治历明时。', wuxing: '金', palace: '坎', description: '革卦象征变革，代表改革、变化、创新。' },
  { id: 50, name: '鼎', alias: null, upperTrigram: '离', lowerTrigram: '巽', binary: '101110', guaci: '元吉，亨。', tuanci: '鼎，象也。以木巽火，亨饪也。', xiangci: '木上有火，鼎，君子以正位凝命。', wuxing: '火', palace: '离', description: '鼎卦象征鼎器，代表权力、变革、养育。' },
  { id: 51, name: '震', alias: null, upperTrigram: '震', lowerTrigram: '震', binary: '001001', guaci: '亨。震来虩虩，笑言哑哑，震惊百里，不丧匕鬯。', tuanci: '震，亨。震来虩虩，恐致福也。', xiangci: '洊雷，震，君子以恐惧修省。', wuxing: '木', palace: '震', description: '震卦象征震动，代表震动、惊动、觉醒。' },
  { id: 52, name: '艮', alias: null, upperTrigram: '艮', lowerTrigram: '艮', binary: '100100', guaci: '艮其背，不获其身，行其庭，不见其人，无咎。', tuanci: '艮，止也。时止则止，时行则行。', xiangci: '兼山，艮，君子以思不出其位。', wuxing: '土', palace: '艮', description: '艮卦象征停止，代表静止、停止、克制。' },
  { id: 53, name: '渐', alias: null, upperTrigram: '巽', lowerTrigram: '艮', binary: '110100', guaci: '女归吉，利贞。', tuanci: '渐之进也，女归吉也。', xiangci: '山上有木，渐，君子以居贤德善俗。', wuxing: '木', palace: '艮', description: '渐卦象征渐进，代表渐进、稳步、发展。' },
  { id: 54, name: '归妹', alias: null, upperTrigram: '震', lowerTrigram: '兑', binary: '001011', guaci: '征凶，无攸利。', tuanci: '归妹，天地之大义也。', xiangci: '泽上有雷，归妹，君子以永终知敝。', wuxing: '木', palace: '兑', description: '归妹卦象征嫁出，代表婚姻、归宿、结果。' },
  { id: 55, name: '丰', alias: null, upperTrigram: '震', lowerTrigram: '离', binary: '001101', guaci: '亨，王假之，勿忧，宜日中。', tuanci: '丰，大也。明以动，故丰。', xiangci: '雷电皆至，丰，君子以折狱致刑。', wuxing: '木', palace: '坎', description: '丰卦象征丰盛，代表丰盛、繁荣、鼎盛。' },
  { id: 56, name: '旅', alias: null, upperTrigram: '离', lowerTrigram: '艮', binary: '101100', guaci: '小亨，旅贞吉。', tuanci: '旅，小亨，柔得中乎外而顺乎刚，止而丽乎明。', xiangci: '山上有火，旅，君子以明慎用刑而不留狱。', wuxing: '火', palace: '离', description: '旅卦象征旅行，代表旅行、变动、客居。' },
  { id: 57, name: '巽', alias: null, upperTrigram: '巽', lowerTrigram: '巽', binary: '110110', guaci: '小亨，利有攸往，利见大人。', tuanci: '重巽以申命，刚巽乎中正而志行。', xiangci: '随风，巽，君子以申命行事。', wuxing: '木', palace: '巽', description: '巽卦象征顺从，代表顺从、渗透、命令。' },
  { id: 58, name: '兑', alias: null, upperTrigram: '兑', lowerTrigram: '兑', binary: '011011', guaci: '亨，利贞。', tuanci: '兑，说也。刚中而柔外，说以利贞。', xiangci: '丽泽，兑，君子以朋友讲习。', wuxing: '金', palace: '兑', description: '兑卦象征喜悦，代表喜悦、沟通、和谐。' },
  { id: 59, name: '涣', alias: null, upperTrigram: '巽', lowerTrigram: '坎', binary: '110010', guaci: '亨。王假有庙，利涉大川，利贞。', tuanci: '涣，亨。刚来而不穷，柔得位乎外而上同。', xiangci: '风行水上，涣，先王以享于帝立庙。', wuxing: '木', palace: '离', description: '涣卦象征涣散，代表分散、流通、化解。' },
  { id: 60, name: '节', alias: null, upperTrigram: '坎', lowerTrigram: '兑', binary: '010011', guaci: '亨。苦节不可贞。', tuanci: '节，亨，刚柔分而刚得中。', xiangci: '泽上有水，节，君子以制数度，议德行。', wuxing: '水', palace: '坎', description: '节卦象征节制，代表节制、规范、适度。' },
  { id: 61, name: '中孚', alias: null, upperTrigram: '巽', lowerTrigram: '兑', binary: '110011', guaci: '豚鱼吉，利涉大川，利贞。', tuanci: '中孚，柔在内而刚得中。', xiangci: '泽上有风，中孚，君子以议狱缓死。', wuxing: '木', palace: '艮', description: '中孚卦象征诚信，代表诚信、信任、感化。' },
  { id: 62, name: '小过', alias: null, upperTrigram: '震', lowerTrigram: '艮', binary: '001100', guaci: '亨，利贞，可小事，不可大事。飞鸟遗之音，不宜上宜下，大吉。', tuanci: '小过，小者过而亨也。', xiangci: '山上有雷，小过，君子以行过乎恭，丧过乎哀，用过乎俭。', wuxing: '木', palace: '兑', description: '小过卦象征小有过越，代表适度、谨慎、小事。' },
  { id: 63, name: '既济', alias: null, upperTrigram: '坎', lowerTrigram: '离', binary: '010101', guaci: '亨小，利贞，初吉终乱。', tuanci: '既济，亨小者，亨也。', xiangci: '水在火上，既济，君子以思患而豫防之。', wuxing: '水', palace: '坎', description: '既济卦象征完成，代表成功、完成、圆满。' },
  { id: 64, name: '未济', alias: null, upperTrigram: '离', lowerTrigram: '坎', binary: '101010', guaci: '亨，小狐汔济，濡其尾，无攸利。', tuanci: '未济，亨，柔得中也。', xiangci: '火在水上，未济，君子以慎辨物居方。', wuxing: '火', palace: '离', description: '未济卦象征未完成，代表未完成、继续、希望。' }
]

export function getHexagramById(id: number): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.id === id)
}

export function getHexagramByName(name: string): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.name === name || h.alias === name)
}

export function getHexagramByTrigrams(upper: string, lower: string): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.upperTrigram === upper && h.lowerTrigram === lower)
}

export function getHexagramByBinary(binary: string): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.binary === binary)
}
