import { EvaluationType, QuestionProgress } from "./types";

export const DEFAULT_QUESTIONS_BY_TYPE: Record<EvaluationType, QuestionProgress[]> = {
  [EvaluationType.MMSE]: [
    {
      id: "mmse_1",
      category: "時間定向感",
      title: "今日日期與時間",
      prompt: "「阿公/阿嬤，請問今天是中華民國幾年？現在是幾月？今天是幾號？星期幾？現在大致是什麼季節？」",
      testerAdvice: "受測者必須逐一回答。不要給予暗示。若受測者因中風語言障礙可以點頭、寫字或手勢表達認同。",
      maxScore: 5,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "民國年份正確 (1分)", scoreContribution: 1, checked: false },
        { label: "月份正確 (1分)", scoreContribution: 1, checked: false },
        { label: "日期號數正確 (1分)", scoreContribution: 1, checked: false },
        { label: "星期幾正確 (1分)", scoreContribution: 1, checked: false },
        { label: "季節正確 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_2",
      category: "空間定向感",
      title: "身處場所與位置",
      prompt: "「我們現在在哪個縣市？這間醫院（或建築）叫什麼名字？我們現在在幾樓？這條街叫什麼名字？這裡是什麼國家？」",
      testerAdvice: "確認受測者知曉當下所處具體地理與空間環境，考核認知地圖。若在自宅，醫院可替換為自宅或社區名稱。",
      maxScore: 5,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "縣市正確 (1分)", scoreContribution: 1, checked: false },
        { label: "機構/醫院/建築名稱正確 (1分)", scoreContribution: 1, checked: false },
        { label: "樓層正確 (1分)", scoreContribution: 1, checked: false },
        { label: "街道名稱/鄰里正確 (1分)", scoreContribution: 1, checked: false },
        { label: "國家名稱正確 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_3",
      category: "短期記憶註冊",
      title: "詞彙立即覆述與記憶",
      prompt: "「我等一下會唸三個東西的名字，請您跟著我唸一遍，並把這三個東西記下來，因為幾分鐘後我會再考考您。這三個東西是：【蘋果、桌子、銅板】。請您唸一遍。」",
      testerAdvice: "第一次覆述用於評分。如果受測者第一次沒記住，您可以重複唸至多五次，直到長輩能全部覆述（以供後續延遲回憶測試），但評分只看第一次回答。",
      maxScore: 3,
      score: 0,
      widgetType: "recall_words",
      wordsToRemember: ["蘋果", "桌子", "銅板"],
      checkedPoints: [
        { label: "蘋果 (1分)", scoreContribution: 1, checked: false },
        { label: "桌子 (1分)", scoreContribution: 1, checked: false },
        { label: "銅板 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_4",
      category: "注意力與計算力",
      title: "100 連續減 7",
      prompt: "「請您用 100 連續減去 7，然後一直往下減。100 減 7 是多少？再來呢...（連續往下減 5 次）」",
      testerAdvice: "提示：長輩需依序心算回答：93、86、79、72、65。若中間算錯，但下一次在錯的基礎上減對了，後者仍可給分。(例如：100-7=92 (錯)，92-7=85 (對了，在此步驟給分))。",
      maxScore: 5,
      score: 0,
      widgetType: "calculation",
      checkedPoints: [
        { label: "第一步: 93 (1分)", scoreContribution: 1, checked: false },
        { label: "第二步: 86 (1分)", scoreContribution: 1, checked: false },
        { label: "第三步: 79 (1分)", scoreContribution: 1, checked: false },
        { label: "第四步: 72 (1分)", scoreContribution: 1, checked: false },
        { label: "第五步: 65 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_5",
      category: "短期延遲回憶",
      title: "詞彙延遲回想",
      prompt: "「阿公/阿嬤，您還記得剛才我請您記下來的那三個東西是什麼嗎？」",
      testerAdvice: "此段不給任何提示。受測者若能自發性回憶出任意一詞即得1分。順序不限。",
      maxScore: 3,
      score: 0,
      widgetType: "recall_words",
      wordsToRemember: ["蘋果", "桌子", "銅板"],
      checkedPoints: [
        { label: "蘋果 (1分)", scoreContribution: 1, checked: false },
        { label: "桌子 (1分)", scoreContribution: 1, checked: false },
        { label: "銅板 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_6",
      category: "語言與指物命名",
      title: "實物指認與命名",
      prompt: "（請評估者將隨身的原子筆和手錶亮給長輩看）「請問我拿著的這個東西是什麼？這一個呢？」",
      testerAdvice: "必須能準確說出「原子筆/筆」和「手錶/錶/鐘」，若有嚴重口齒不清但概念明確亦可，但不能用「寫字的」或「看時間的」抽象功能替代實體名詞。",
      maxScore: 2,
      score: 0,
      widgetType: "naming",
      checkedPoints: [
        { label: "正確認出並命名【原子筆】(1分)", scoreContribution: 1, checked: false },
        { label: "正確認出並命名【手錶】(1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_7",
      category: "語言覆述",
      title: "覆述短語",
      prompt: "「請跟著我複述這一句話：【大家齊心協力過生活】」",
      testerAdvice: "必須完整、準確且一次性唸對。發音可以稍有地方口音（如台語習慣），但不能有字詞顛倒、字詞遺漏或加字。",
      maxScore: 1,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "精準無誤複述 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_8",
      category: "三段式指令",
      title: "複雜指令執行能力",
      prompt: "「現在請聽清楚我的指令並照著做：【用您的右手拿這張紙，把它對摺，然後放在您的大腿上。】」",
      testerAdvice: "請在桌上平鋪一張信紙/ A4 紙。一口氣說完三步驟，中途不可有任何重複或催促，觀察其是否按順序執行完畢。",
      maxScore: 3,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "用右手拿紙 (1分)", scoreContribution: 1, checked: false },
        { label: "雙手對摺紙張 (1分)", scoreContribution: 1, checked: false },
        { label: "放到大腿上 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_9",
      category: "語言與閱讀理解",
      title: "執行書面命令",
      prompt: "「請看著卡片上的這行字，並照著上面的指示去做。」（醫師出示字卡，上面醒目寫著：【閉上您的眼睛】）",
      testerAdvice: "不要讀出聲音給受測者聽。只提供卡片，看他是否能讀懂並做出「閉上眼睛」這個動作。若長輩只把字唸出來，可提醒：「請照卡片的意思做動作。」",
      maxScore: 1,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "識讀並完成「閉眼」動作 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_10",
      category: "自行寫造句",
      title: "中文書寫與造句",
      prompt: "「請您在這張空白紙上，隨意寫出一個完整的中文句子。句子必須有完整的意義、有主詞和動詞。例如：今天天氣很好。」",
      testerAdvice: "句子必須通順，並含有主詞與動詞/形容詞(即主謂結構完整)。錯別字不算錯，但必須表達一個完整的想法。口唸不給分，若長輩關節炎嚴重不便寫字，可由本量表特殊核計（或嘗試以最精準口頭敘事代替並註記）。",
      maxScore: 1,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "句子結構完整且具實質意義 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "mmse_11",
      category: "視覺圖形結構",
      title: "交叉五角形結構模仿",
      prompt: "「請您用筆在畫布上，模仿畫出跟這張圖卡上一模一樣的圖案。」（顯示兩個交叉疊合的立體五角形）",
      testerAdvice: "標準：兩個圖形皆必須為五角形(有5個角)，且兩個圖形必須相交。相交的位置必須形成一個四邊形/交叉口。邊線稍微傾斜或邊長不等可以接受，但不可有封口不全或角數不對。",
      maxScore: 1,
      score: 0,
      widgetType: "drawing",
      checkedPoints: [
        { label: "成功畫出兩個相交的五角形 (1分)", scoreContribution: 1, checked: false }
      ]
    }
  ],
  [EvaluationType.MOCA]: [
    {
      id: "moca_1",
      category: "視覺空間與執行功能",
      title: "交錯連線測驗 (Trail Making)",
      prompt: "「請您在大螢幕畫布上交錯進行連線。規律是：數字連到注音，再連到數字，再連到注音。也就是從 1 連到 ㄅ，再連到 2，再連到 ㄆ，一路連到最後的 5。請用手指或滑鼠連線。」",
      testerAdvice: "標準：受測者不能出現連線交叉混亂。路徑必須是 1 ➔ ㄅ ➔ 2 ➔ ㄆ ➔ 3 ➔ ㄇ ➔ 4 ➔ ㄈ ➔ 5。如有任何錯誤且未自行糾正，計 0 分。",
      maxScore: 1,
      score: 0,
      widgetType: "serial_trail",
      checkedPoints: [
        { label: "交錯連線無誤 (1 ⮕ ㄅ ⮕ 2 ⮕ ㄆ ⮕ 3 ⮕ ㄇ ⮕ 4 ⮕ ㄈ ⮕ 5) (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_2",
      category: "視覺空間與執行功能",
      title: "三維立方體模仿",
      prompt: "「請您在右邊的畫布上，盡可能精準地模仿模仿畫出這個立體正方形（立方體）。」",
      testerAdvice: "要求繪製出完整的三維效果。要素：1) 整體結構為三維立體；2) 所有線條基本平行且相接；3) 不能遗漏任何一條稜線。若畫成一般的平面正方形，計 0 分。",
      maxScore: 1,
      score: 0,
      widgetType: "drawing",
      checkedPoints: [
        { label: "立體感完整且線條大致平行相接 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_3",
      category: "視覺空間與執行功能",
      title: "畫鐘測驗 (CDT)",
      prompt: "「請您在空白畫布上畫一個代表時鐘的圓圈，把 1 到 12 的數字都標在正確的位置，然後畫上時針和分針，指著 11 點 10 分。」",
      testerAdvice: "觀察長輩空間規劃。11點10分的分針必須指在數字2上，時針指在11上（微偏向12更佳）。",
      maxScore: 3,
      score: 0,
      widgetType: "drawing",
      checkedPoints: [
        { label: "圓圈完整：封閉、少有畸形 (1分)", scoreContribution: 1, checked: false },
        { label: "數字位置：1~12無遺漏，位置勻稱，無反轉 (1分)", scoreContribution: 1, checked: false },
        { label: "指針時差：短針朝向11, 長針精準指向2 (10分的位置意指2) (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_4",
      category: "語言命名",
      title: "動物識圖與命名",
      prompt: "「請問這三張卡片上的動物分別叫什麼名字？」(出示：獅子、犀牛、駱駝)',",
      testerAdvice: "必須名詞精確。獅子、犀牛（獨角獸不可）、駱駝（單雙峰皆可）。",
      maxScore: 3,
      score: 0,
      widgetType: "naming",
      checkedPoints: [
        { label: "正確認得【獅子】並命名 (1分)", scoreContribution: 1, checked: false },
        { label: "正確認得【犀牛】並命名 (1分)", scoreContribution: 1, checked: false },
        { label: "正確認得【駱駝】並命名 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_5",
      category: "短期記憶登錄",
      title: "五個字詞記憶階段 (不計分)",
      prompt: "「我會唸五個詞彙給您聽。請聽好並跟著我唸一次。在心裡記住它們，因為等等還會請您回想。開始：【紅包、火車、茉莉、絲綢、紅色】。請複述一遍。」",
      testerAdvice: "本步驟為記憶建立期，此處不計分。請連續測兩次，即使第二次全部答對，也必須提醒長輩「晚點會再測試」。",
      maxScore: 0,
      score: 0,
      widgetType: "recall_words",
      wordsToRemember: ["紅包", "火車", "茉莉", "絲綢", "紅色"],
      checkedPoints: []
    },
    {
      id: "moca_6",
      category: "注意力與工作記憶",
      title: "數字順背與倒背",
      prompt: "「現在我們要進行數字背誦。我會先唸一串數字，請您照著順序背出來：【2 - 1 - 8 - 5 - 4】。接著，我會唸另外一組，請您『倒過來』背出來，例如我説 7-4-2，您要說 2-4-7。請聽：【7 - 4 - 2】。」",
      testerAdvice: "順背：2-1-8-5-4 (對得1分)；倒背：7-4-2 背成 2-4-7 (對得1分)。中途語速限制為每秒一個數字。",
      maxScore: 2,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "順唸正確 (2-1-8-5-4) (1分)", scoreContribution: 1, checked: false },
        { label: "倒唸正確 (2-4-7) (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_7",
      category: "注意力與專注力",
      title: "拍手聽覺抑制測驗",
      prompt: "「我等一下會唸一段英文字母。每次您聽到我唸字母『A』的時候，請您在桌上輕輕拍一下手。如果我唸其他的字母，請不要拍。準備好了嗎？」(英文序列: F-A-C-D-E-A-M-N-O-A-F-A-A-B)",
      testerAdvice: "語速約一秒一個。計算犯錯數。如果錯誤次數 ≤ 1次（漏拍或錯拍都算），則得 1 分；若錯 2 次及以上，得 0 分。",
      maxScore: 1,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "全對或僅有1次以下失誤 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_8",
      category: "抽象思維",
      title: "異中求同（相似性辨析）",
      prompt: "「阿公/阿嬤，請問『橘子』和『香蕉』有什麼共同點呢？（暖身題，標準答：都是水果）。那請問『火車』與『腳踏車』有什麼共同點？還有『手錶』與『尺』有什麼共同點呢？」",
      testerAdvice: "標準：『火車/腳踏車』 ⮕ 都是交通工具、都可以搭乘、出外工具（回答『都有輪子』『都是鐵做的』等具體特徵不給分）。『手錶/尺』 ⮕ 都是測量/度量工具、測量時空長度（回答『都有刻度/數字』不給分）。",
      maxScore: 2,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "火車與腳踏車：歸納出「交通工具/運輸」抽象概念 (1分)", scoreContribution: 1, checked: false },
        { label: "手錶與直尺：歸納出「測量事物/計量工具」抽象概念 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_9",
      category: "語言流暢度",
      title: "一分鐘動物列舉",
      prompt: "「現在請您在一分鐘之內，盡快且盡可能地說出您知道的所有『動物』的名字。譬如：狗、貓。請盡量多說，我會幫您計時統計。3、2、1，請開始！」",
      testerAdvice: "使用下方碼表計時計數。在一分鐘（60秒）內，若受測者能說出 11 個及以上的不同動物名字，計 1 分。字詞重複不累積計入。",
      maxScore: 1,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "一分鐘內成功列舉 11 個以上不同動物 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_10",
      category: "短期延遲回憶",
      title: "5字詞延遲回憶測驗",
      prompt: "「剛才我請您記下來的那五個詞，經過了一會兒，現在請您試著回想看看是哪五個字詞？」",
      testerAdvice: "受測者此處獨立回想。答對一個得1分（順序無關）。\n若沒想出來，可給予提示（類別提示如：第一個是過年給小輩的紅包；或選擇提示：是紅包、春聯還是燈籠？），但提示答對不計入此處標準分（可於個案作答歷程備註）。",
      maxScore: 5,
      score: 0,
      widgetType: "recall_words",
      wordsToRemember: ["紅包", "火車", "茉莉", "絲綢", "紅色"],
      checkedPoints: [
        { label: "紅包 (1分)", scoreContribution: 1, checked: false },
        { label: "火車 (1分)", scoreContribution: 1, checked: false },
        { label: "茉莉 (1分)", scoreContribution: 1, checked: false },
        { label: "絲綢 (1分)", scoreContribution: 1, checked: false },
        { label: "紅色 (1分)", scoreContribution: 1, checked: false }
      ]
    },
    {
      id: "moca_11",
      category: "時空定向感",
      title: "定向感綜合測試",
      prompt: "「最後一題，請問今天是西元/民國幾年？幾月？幾日？星期幾？我們現在在什麼地方/場所？我們現在在哪個縣市？」",
      testerAdvice: "必須精準。年份、月份、日期、星期、地點名稱、縣市名稱。答錯一項扣1分。",
      maxScore: 6,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "年份正確 (1分)", scoreContribution: 1, checked: false },
        { label: "月份正確 (1分)", scoreContribution: 1, checked: false },
        { label: "日期正確 (1分)", scoreContribution: 1, checked: false },
        { label: "星期正確 (1分)", scoreContribution: 1, checked: false },
        { label: "當前機構/室別位置正確 (1分)", scoreContribution: 1, checked: false },
        { label: "行政區/縣市正確 (1分)", scoreContribution: 1, checked: false }
      ]
    }
  ],
  [EvaluationType.CDT]: [
    {
      id: "cdt_single",
      category: "畫鐘測試",
      title: "CDT畫鐘測驗 (完整版)",
      prompt: "「阿公/阿嬤，請在下面這個畫布上面，幫我用筆畫一個大大的圓形時鐘。先把 1 到 12 的數字都填寫上去，最後，幫我畫上時針跟分針，而指針的位置必須精準畫在【11點10分】。」",
      testerAdvice: "本項為老年精神醫學核心檢測，評估頂葉(Parietal lobe)視覺空間、執行計畫與抗干擾能力。\n長輩如果把分針畫在數字10而非2，代表受字面「10分」干擾，為额叶執行功能受損重要表徵。圓形不重疊或數字全擠在半邊提示偏側忽視或視覺規劃障礙。",
      maxScore: 3,
      score: 0,
      widgetType: "drawing",
      checkedPoints: [
        { label: "圓形完整性 (1分)：必須是一個大致封閉的圓形，輪廓無巨大開口或不合比例的變形。", scoreContribution: 1, checked: false },
        { label: "數字擺放 (1分)：12個數字(1-12)完整且順序無錯，空間大致均勻分布在圓周內圈。", scoreContribution: 1, checked: false },
        { label: "指針時差 (1分)：繪製了長短不同的時針與分針。分針精確指在數字2，時針指在數字11。若兩針一樣長或指向錯，得0分。", scoreContribution: 1, checked: false }
      ]
    }
  ],
  [EvaluationType.CASI]: [
    {
      id: "casi_1",
      category: "長期記憶常識",
      title: "台灣三大傳統節日與元首認知",
      prompt: "「阿公/阿嬤，請問台灣一年之中，最出名、大家最常慶祝的三個传统大節日是什麼？另外，請問您知道現代的台灣總統是誰嗎？」",
      testerAdvice: "傳統三大節日標準：春節（過年）、端午節、中秋節。回答元宵或清明不計分，但考慮本土，若長輩描述清晰過年、划龍舟、吃粽子、吃月餅可通融計之。總統名需回答出完整中文名（若因近期大選政黨更迭，可依據時事正確回答計分）。",
      maxScore: 10,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "節日一個正確：春節/過年 (2分)", scoreContribution: 2, checked: false },
        { label: "節日二個正確：端午節/龍舟 (2分)", scoreContribution: 2, checked: false },
        { label: "節日三個正確：中秋節/月餅 (2分)", scoreContribution: 2, checked: false },
        { label: "台灣總統名字正確 (4分)", scoreContribution: 4, checked: false }
      ]
    },
    {
      id: "casi_2",
      category: "抽象思考與常理解釋",
      title: "抽象思考與危機情境解決力",
      prompt: "「現在請回答我三個日常生活的常識題。 第一：如果您在路上撿到一封信，上面貼好了郵票也寫有了地址，請問您會怎麼做？ 第二：我們為什麼需要洗衣服？ 第三：我們在過馬路時，為什麼一定要遵守紅綠燈規則？」",
      testerAdvice: "標準回答與逻辑：\n1. 信件：送交警察局、或直接丟進郵筒(得4分)。其他如「置之不理」或「撕掉」得0分。\n2. 洗衣服：保持乾淨、除臭、衛生避免生病、衣服穿久會髒(得4分)。僅說「好看」得1分。\n3. 紅綠燈：防止車禍、保障行人安全、遵守交通法規(得4分)。不清楚或描述混亂者得 0 分。",
      maxScore: 12,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "信件處理：投遞郵筒或交由警察等適宜回答 (4分)", scoreContribution: 4, checked: false },
        { label: "洗衣服邏輯：衛生、除汙、防菌等核心意義 (4分)", scoreContribution: 4, checked: false },
        { label: "紅綠燈規則：交通安全、非混亂之避險秩序觀念 (4分)", scoreContribution: 4, checked: false }
      ]
    },
    {
      id: "casi_3",
      category: "定向力",
      title: "中文化時空定向感",
      prompt: "「阿公/阿嬤，請問今天是民國哪一年？今天是什麼月份？今天是幾號？星期幾？另外我們現在身處哪一個縣市？我們現在在這棟大樓的第幾樓？」",
      testerAdvice: "CASI定向比重較高。請注意逐項計分，不可隨便四捨五入。若月份或日期相差在一日之內不予放寬，除非當天跨夜或長輩極度近盲。",
      maxScore: 18,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "民國年份答對 (4分)", scoreContribution: 4, checked: false },
        { label: "月份答對 (3分)", scoreContribution: 3, checked: false },
        { label: "日期號數答對 (3分)", scoreContribution: 3, checked: false },
        { label: "星期幾答對 (3分)", scoreContribution: 3, checked: false },
        { label: "所在縣市答對 (3分)", scoreContribution: 3, checked: false },
        { label: "所在樓層答對 (2分)", scoreContribution: 2, checked: false }
      ]
    },
    {
      id: "casi_4",
      category: "心算力與注意力",
      title: "自發連續心算與專注",
      prompt: "「現在請您用心算回答我：100 連續減去 7 得多少？ 接著，您回答的這個數字再減去 7，是多少？」",
      testerAdvice: "考驗工作記憶容量。100 - 7 = 93 （得 5 分）。 93 - 7 = 86 （得 5 分）。總共兩步減算，合計10分。中途不給提示算式。",
      maxScore: 10,
      score: 0,
      widgetType: "calculation",
      checkedPoints: [
        { label: "100 - 7 = 93 答對 (5分)", scoreContribution: 5, checked: false },
        { label: "93 - 7 = 86 答對 (5分)", scoreContribution: 5, checked: false }
      ]
    },
    {
      id: "casi_5",
      category: "短期延遲記憶 (干擾後)",
      title: "三詞彙二次回憶測試與提示輔助",
      prompt: "「（在測試前先請長輩跟念記住：【玉山、公車、報紙】並在中間進行了定向等其他測驗干擾 5-10 分鐘，此處發問：） 阿公/阿嬤，等了這麼久，還記得刚才最前面的那三個東西嗎？」",
      testerAdvice: "受測者回答計分規則：\n- 無提示(自發)答對一詞：5分。\n- 若答不出，給予類別提示（如：一個是台灣最高的山、一個是馬路上的大巴士、一個是天天要看的閱讀刊物），提示後答對：3分。\n- 提示也錯者：0分。",
      maxScore: 15,
      score: 0,
      widgetType: "recall_words",
      wordsToRemember: ["玉山", "公車", "報紙"],
      checkedPoints: [
        { label: "【玉山】自行想出 (5分)", scoreContribution: 5, checked: false },
        { label: "【玉山】給予提示「是一座山」後答對 (3分)", scoreContribution: 3, checked: false },
        { label: "【公車】自行想出 (5分)", scoreContribution: 5, checked: false },
        { label: "【公車】給予提示「路上大台載人客的車」後答對 (3分)", scoreContribution: 3, checked: false },
        { label: "【報紙】自行想出 (5分)", scoreContribution: 5, checked: false },
        { label: "【報紙】給予提示「天天看有寫新聞的紙」後答對 (3分)", scoreContribution: 3, checked: false }
      ]
    },
    {
      id: "casi_6",
      category: "語言流暢度",
      title: "一分鐘水果種類列舉",
      prompt: "「阿公/阿嬤，等一下我會計時一分鐘（60秒）。請您在時間內，盡快說出您所知道的『水果』名字，越多越好。例如西瓜、芭樂等。預備，開始！」",
      testerAdvice: "計時計數長輩詞彙搜尋密度。重複說的不累計。\n計分標準：\n- 說出 10 種及以上：10分；\n- 說出 5-9 種：5分；\n- 說出 1-4 種：2分；\n- 0種：0分。",
      maxScore: 10,
      score: 0,
      widgetType: "standard_checklist",
      checkedPoints: [
        { label: "列舉 10 種以上水果 (給10分)", scoreContribution: 10, checked: false },
        { label: "列舉 5 - 9 種水果 (給5分) [不與10分重複勾選]", scoreContribution: 5, checked: false },
        { label: "列舉 1 - 4 種水果 (給2分) [不與上兩項共用]", scoreContribution: 2, checked: false }
      ]
    },
    {
      id: "casi_7",
      category: "視覺構造力",
      title: "交疊三角形與正方形仿畫",
      prompt: "「現在請您利用手指或滑鼠，在右邊白板上模仿圖卡，畫出相互交疊在一起的一個正方形與一個三角形。」",
      testerAdvice: "標準：必須成功畫出一個完整的正方形（四邊形）與一個三角形，且這兩個圖形有一角是交叉重疊在內部的。如果沒有重疊或者圖形漏角，給予扣分。完整重疊且四邊/三邊清晰得10分。",
      maxScore: 10,
      score: 0,
      widgetType: "drawing",
      checkedPoints: [
        { label: "圖形重疊結構正確、且分別為完整的三角形與正方形 (10分)", scoreContribution: 10, checked: false },
        { label: "只畫出圖形但沒有交叉重合、或一邊沒接好 (給5分)", scoreContribution: 5, checked: false }
      ]
    },
    {
      id: "casi_8",
      category: "語言與理解",
      title: "本土物件指認與命名、口頭仿說",
      prompt: "「（醫師分別指向桌上的三個物件，或圖片：【原子筆】、【開水杯/茶杯】、【剪刀】） 請告訴我這些東西叫什麼？最後，請跟著我複述一次這句話：【吃水果拜樹頭】。」",
      testerAdvice: "命名原子筆(或筆)-得3分；茶杯(或杯子)-得3分；剪刀-得3分。 複述本土諺語「吃水果拜樹頭」字詞完全正確-得6分。",
      maxScore: 15,
      score: 0,
      widgetType: "naming",
      checkedPoints: [
        { label: "正確認出並命名【原子筆】(3分)", scoreContribution: 3, checked: false },
        { label: "正確認出並命名【茶杯/杯子】(3分)", scoreContribution: 3, checked: false },
        { label: "正確認出並命名【剪刀】(3分)", scoreContribution: 3, checked: false },
        { label: "口頭完整覆述「吃水果拜樹頭」無添加漏字 (6分)", scoreContribution: 6, checked: false }
      ]
    }
  ]
};

export function getCognitiveStatusDescription(type: EvaluationType, score: number): string {
  switch (type) {
    case EvaluationType.MMSE:
      if (score >= 24) return "基本認知功能正常";
      if (score >= 18) return "輕度認知功能障礙 (疑似輕度失智症)";
      if (score >= 10) return "中度認知功能衰退";
      return "重度認知功能衰退";
    case EvaluationType.MOCA:
      if (score >= 26) return "基本認知功能正常 (MoCA篩檢較嚴格)";
      if (score >= 18) return "輕度認知障礙 (MCI)";
      if (score >= 10) return "中度認知功能受損";
      return "重度認知功能受損";
    case EvaluationType.CDT:
      if (score === 3) return "視覺空間與執行功能正常";
      if (score === 2) return "疑似早期輕微執行功能受損";
      return "執行/規畫功能明顯衰退";
    case EvaluationType.CASI:
      if (score >= 80) return "認知功能大致正常";
      if (score >= 60) return "疑似輕度認知功能障礙 (MCI)";
      if (score >= 40) return "疑似中度認知障礙";
      return "疑似重度認知功能障礙";
    default:
      return "待評估";
  }
}
