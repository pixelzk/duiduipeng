import { LevelData } from '../types';

export const LEVELS: LevelData[] = [
  {
    level: 1,
    name: "廉洁谚语",
    timeLimit: 120,
    couplets: [
      { id: "1-1", left: "清泉不纳污", right: "归海必清源" },
      { id: "1-2", left: "山高不遮太阳", right: "官高不压百姓" },
      { id: "1-3", left: "饮水要思源", right: "为人要清廉" },
      { id: "1-4", left: "鱼贪饵，容易上钩", right: "人贪利，终落陷阱" },
      { id: "1-5", left: "做事要光明正大", right: "做人要清清白白" },
      { id: "1-6", left: "做人一身正气", right: "为官一尘不染" },
      { id: "1-7", left: "宁以正气清贫谈笑", right: "勿以名利金钱折腰" },
      { id: "1-8", left: "为政清廉从古至今令人称颂", right: "公仆亮节继往开来胜前贤" },
    ]
  },
  {
    level: 2,
    name: "廉洁故事",
    timeLimit: 180,
    couplets: [
      { id: "2-1", left: "两袖清风", right: "于谦" },
      { id: "2-2", left: "不贪为宝", right: "子罕" },
      { id: "2-3", left: "四知太守", right: "杨震" },
      { id: "2-4", left: "一钱太守", right: "刘宠" },
      { id: "2-5", left: "陶母退鱼", right: "陶侃之母" },
      { id: "2-6", left: "悬鱼太守", right: "羊续" },
      { id: "2-7", left: "二不尚书", right: "范景文" },
      { id: "2-8", left: "公仪休拒鱼", right: "公仪休" }
    ]
  },
  {
    level: 3,
    name: "清风正气",
    timeLimit: 300,
    couplets: [
        { id: "3-1", left: "风正一帆悬", right: "潮平两岸阔" },
        { id: "3-2", left: "不要人夸好颜色", right: "只留清气满乾坤" },
        { id: "3-3", left: "出淤泥而不染", right: "濯清涟而不妖" },
        { id: "3-4", left: "粉身碎骨浑不怕", right: "要留清白在人间" },
        { id: "3-5", left: "名节重泰山", right: "利欲轻鸿毛" },
        { id: "3-6", left: "欲影正者端其表", right: "欲下廉者先之身" },
        { id: "3-7", left: "历览前贤国与家", right: "成由勤俭败由奢" },
        { id: "3-8", left: "其身正不令而行", right: "其身不正虽令不从" }
    ]
  }
];