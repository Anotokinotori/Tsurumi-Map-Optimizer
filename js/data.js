// --- DATA DEFINITION ---
// This file contains all the static data used by the application.
// Separating data from logic improves readability and maintainability.

const eliteGroups = {
    'A': { name: 'モシリ炎アビス', iconUrl: 'https://wiki.hoyolab.com/_ipx/f_webp/https://bbs.hoyolab.com/hoyowiki/picture/enemy/Pyro%2520Abyss%2520Mage_icon.png', zoomMapUrl: 'https://assets.st-note.com/img/1738372090-i0Dg36tAbTaRjEHlpQhPr5NY.jpg?width=1200' },
    'B': { name: 'モシリ雷アビス', iconUrl: 'https://wiki.hoyolab.com/_ipx/f_webp/https://bbs.hoyolab.com/hoyowiki/picture/enemy/Electro%2520Abyss%2520Mage_icon.png', zoomMapUrl: 'https://assets.st-note.com/img/1738419313-vIRa5KkjYBwznp1OSoUMZCLG.jpg?width=1200' },
    'C': { name: 'モシリ暴徒', iconUrl: 'https://wiki.hoyolab.com/_ipx/f_webp/https://bbs.hoyolab.com/hoyowiki/picture/enemy/Rock%2520Shieldwall%2520Mitachurl_icon.png', zoomMapUrl: 'https://assets.st-note.com/img/1738419512-Zn6ERGTQCwgakSrmVHjWztFY.jpg?width=1200' },
    'D': { name: 'チライ機兵', iconUrl: 'https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/Ruin_Cruiser_Icon.webp', zoomMapUrl: 'https://assets.st-note.com/img/1738419554-5Vfy0paPscJjSACn4DTvY3Mr.jpg?width=1200' },
    'E': { name: 'オイナ機兵', iconUrl: 'https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/Ruin_Cruiser_Icon.webp', zoomMapUrl: 'https://assets.st-note.com/img/1738419603-5ULFDgf1RN86dZQHnMJoSX3e.jpg?width=1200' },
    'F': { name: 'オイナ暴徒', iconUrl: 'https://wiki.hoyolab.com/_ipx/f_webp/https://bbs.hoyolab.com/hoyowiki/picture/enemy/Rock%2520Shieldwall%2520Mitachurl_icon.png', zoomMapUrl: 'https://assets.st-note.com/img/1738419733-GNO1jErQmFh9p5yP423WgLaH.jpg?width=1200' },
    'G': { name: 'シリコロ暴徒', iconUrl: 'https://wiki.hoyolab.com/_ipx/f_webp/https://bbs.hoyolab.com/hoyowiki/picture/enemy/Rock%2520Shieldwall%2520Mitachurl_icon.png', zoomMapUrl: 'https://assets.st-note.com/img/1738419775-yxGHB6uJZpdh7VDzT2n85osX.jpg?width=1200' },
    'H': { name: 'アウタケ東', iconUrl: 'https://upload-static.hoyoverse.com/hoyolab-wiki/2023/04/21/132746206/f98aad8ddb6a41ae54eb9b81c63f58da_8280051482592802504.png', zoomMapUrl: 'https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%82%A2%E3%82%A6%E3%82%BF%E3%82%B1%E6%9D%B1.png' },
    'I': { name: 'アウタケ西', iconUrl: 'https://upload-static.hoyoverse.com/hoyolab-wiki/2023/04/21/132746206/f98aad8ddb6a41ae54eb9b81c63f58da_8280051482592802504.png', zoomMapUrl: 'https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%82%A2%E3%82%A6%E3%82%BF%E3%82%B1%E8%A5%BF.png' },
    'J': { name: 'ワクカウ', iconUrl: 'https://upload-static.hoyoverse.com/hoyolab-wiki/2023/04/21/132746206/c0b9fccb976922890793a88cefa44525_4478418637550120506.png', zoomMapUrl: 'https://assets.st-note.com/img/1738419878-oLvIuKdDGVEc3RsO6UWrZFH4.jpg?width=1200' },
};
const groupKeys = Object.keys(eliteGroups);
const totalGroups = groupKeys.length;

const actionsData = [
    {id: 2, name: 'ワープ②', affectedGroups: ['A', 'D']},
    {id: 3, name: 'ワープ③', affectedGroups: ['A', 'B', 'C', 'D', 'E', 'J']},
    {id: 4, name: 'ワープ④', affectedGroups: ['B', 'C', 'D', 'E', 'F']},
    {id: 5, name: 'ワープ⑤', affectedGroups: ['B', 'E', 'F', 'G', 'H', 'I']},
    {id: 6, name: 'ワープ⑥', affectedGroups: ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I']},
    {id: 7, name: 'ワープ⑦', affectedGroups: ['A', 'J']},
    {id: 8, name: 'ワープ⑧', affectedGroups: ['J']},
    {id: 9, name: 'ボート⑨', affectedGroups: ['A']},
    {id: 10, name: 'ボート⑩', affectedGroups: ['C', 'D']},
    {id: 11, name: 'ボート⑪', affectedGroups: ['B', 'C', 'D']},
    {id: 12, name: 'ボート⑫', affectedGroups: ['D']},
    {id: 13, name: '歩き⑬', affectedGroups: ['A', 'B', 'C', 'J']},
    {id: 14, name: '歩き⑭', affectedGroups: ['A', 'B', 'J']},
    {id: 15, name: '歩き⑮', affectedGroups: ['E', 'G']},
    {id: 16, name: '歩き⑯', affectedGroups: ['E', 'F', 'G']},
    {id: 17, name: '歩き⑰', affectedGroups: ['A', 'H', 'J']},
    {id: 18, name: 'ポケワ⑱', affectedGroups: ['E']},
    {id: 19, name: '歩き⑲', affectedGroups: ['E', 'F', 'G', 'I']},
    {id: 20, name: 'ボート⑳', affectedGroups: ['H', 'I']},
    {id: 21, name: 'ボート㉑', affectedGroups: ['I']},
];

const actionDetails = {
    2:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202210.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    3:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202231.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    4:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202321.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    5:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202329.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    6:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202336.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    7:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202343.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    8:  { images: ['https://cdn.jsdelivr.net/gh/Anotokinotori/Tsurumi-Route-Optimizer@main/%E3%83%AF%E3%83%BC%E3%83%97/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-09-20%20202349.png'], videoUrl: null, note: 'ワープポイントに移動するだけの操作です。ロードが完了したら、影響範囲を広げないよう、一切移動はせずに他の場所に移動してください。' },
    9:  { images: ['https://assets.st-note.com/img/1740718483-AhlXqnUk7BWjzOoeZcR6D9Y4.jpg?width=1200'], videoUrl: null, note: '意図せぬ精鋭をロードしないよう、目的までの移動ルートに気をつけてください。\n鶴観の七天神像の近くのボートポイントから向かってください' },
    10: { images: ['https://assets.st-note.com/img/1740972735-fGwYadHbXy3MxPjqiACBrN0h.jpg?width=1200'], videoUrl: null, note: '意図せぬ精鋭をロードしないよう、目的までの移動ルートに気をつけてください。\n鶴観の七天神像の近くのボートポイントから向かってください' },
    11: { images: ['https://assets.st-note.com/img/1741059429-fjJvq8DHOs5kcYNUmzW2dKrn.jpg?width=1200'], videoUrl: null, note: '意図せぬ精鋭をロードしないよう、目的までの移動ルートに気をつけてください。\n鶴観の七天神像の近くのボートポイントから向かってください' },
    12: { images: ['https://assets.st-note.com/img/1740718519-C5t0WKmVepqoji19Rc2GZduf.jpg?width=1200'], videoUrl: null, note: '意図せぬ精鋭をロードしないよう、目的までの移動ルートに気をつけてください。\n鶴観の七天神像の近くのボートポイントから向かってください' },
    13: { images: ['https://assets.st-note.com/img/1740019544-fjJrv5VwbpUgatR0FLMODEPG.png?width=1200', 'https://assets.st-note.com/img/1740019502-2BkCqL4znrixluRm7FpjvhOQ.png?width=1200'], videoUrl: 'https://youtu.be/2_xN2PYjrO4?si=0K03Yr1tl74NQ0MF', note: 'ワープ8にワープした段階でワクカウもロードされます。\nその後、移動し、モシリ炎アビスとモシリ雷アビスとモシリ暴徒もロードします。\n目印は草です。\n※ワープ7からだと、アウタケ東とモシリ雷アビスのロード境界付近になり誤ロードのリスクが上がるため、8から向かってます\n極力動画と同じように移動してください。' },
    14: { images: ['https://assets.st-note.com/img/1739947858-im8E9AtCjsr501YZnHWuKxNJ.png?width=1200 ', 'https://assets.st-note.com/img/1739947867-yxzY23VinFgkLKrCtmXqvG0B.png?width=1200'], videoUrl: 'https://youtu.be/fDn-IKfIL-A?si=92PmIUWw-Vgvg34m', note: 'ワープ8にワープした段階でワクカウもロードされます。その後、移動し、モシリ炎アビスとモシリ雷アビスもロードします。目印は杭です。\n極力動画と同じように移動してください。' },
    15: { images: ['https://assets.st-note.com/img/1738380135-LlcU0487Xtbjduk9KzqT6sDa.png?width=1200', 'https://assets.st-note.com/img/1740114869-zBxEZO2v3dAeQusnTYJ0WkNb.png?width=1200'], videoUrl: 'https://youtu.be/FRZu8bq3SEY?si=Ra81bAbgAKu_DGqb', note: '他の精鋭をロードしないようにボートポイントから向かってください。（ポケワを置くかヤシオリ島から海を渡る）\n目印はミントです。\n極力動画と同じように移動してください。' },
    16: { images: ['https://assets.st-note.com/img/1743737811-wB7bQ5n9SjWA04tyDLsJROVf.png?width=1200', 'https://assets.st-note.com/img/1743737778-7VAa6i9QBv2HjXslczhdKoTg.png?width=1200'], videoUrl: 'https://youtu.be/2Ev8hvTaVgo?si=nR242nzcypbrcmbF', note: '他の精鋭をロードしないようにボートポイントから向かってください。（ポケワを置くかヤシオリ島から海を渡る）目印はスイートフワラーと崖の隙間です。\n極力動画と同じように移動してください。' },
    17: { images: ['https://assets.st-note.com/img/1738916671-ORDvWIt8zi692QxAJVKb1rlS.png?width=1200', 'https://assets.st-note.com/img/1738916711-VnxAvW1qJdrGXlOzoHe8Mshk.png?width=1200'], videoUrl: 'https://youtu.be/x8Zcoz0VjzY?si=42_j7YWlgBPT_zR3', note: 'ワープ7にワープした段階でモシリ炎アビスとワクカウもロードされます。その後、移動し、アウタケ東もロードします。目標は雷石です。\n極力動画と同じように移動してください。' },
    18: { images: ['https://assets.st-note.com/img/1738401375-T9NnmahGdqv30Ije4tbpZ6y5.jpg?width=1200', 'https://assets.st-note.com/img/1738374779-0BuAKsWRnoTiSNbltd2qIv4H.png?width=1200'], videoUrl: null, note: 'シリコロのボートポイントです。ポケワを置くのがおすすめですが、セイライ島やヤシオリ島から海を渡って来ても大丈夫です。' },
    19: { images: ['https://assets.st-note.com/img/1741392581-OlQNcjt2W14iaRJymhSG0VdI.png?width=1200', 'https://assets.st-note.com/img/1741392586-2SUxeY4fBXj7z918Tok0nqHu.png?width=1200'], videoUrl: 'https://youtu.be/XbqcgyuE0vw?si=Xf3wZ57Y_nxWjBW8', note: 'オイナ機兵 + シリコロ暴徒 + オイナ暴徒 + アウタケ西 ロード位置\n目印はミントです。\n極力動画と同じように移動してください。' },
    20: { images: ['https://assets.st-note.com/img/1740887637-KEB38rW94bPpH2YI6whCcQ7x.jpg?width=1200'], videoUrl: null, note: '意図せぬ精鋭をロードしないよう、目的までの移動ルートに気をつけてください。\nヤシオリ島からボートで向かいます。\nシリコロ山付近の精鋭をロードしないように大回りしてください。' },
    21: { images: ['https://assets.st-note.com/img/1740464299-tWJOErwCv4B1cnPI57XmoMY3.jpg?width=1200'], videoUrl: null, note: '意図せぬ精鋭をロードしないよう、目的までの移動ルートに気をつけてください。\nヤシオリ島からボートで向かいます。\nシリコロ山付近の精鋭をロードしないように大回りしてください。' },
};

const recommendedConfig = {
    'A': 'C', 'B': 'B', 'C': 'C', 'D': 'C', 'E': 'C',
    'F': 'B', 'G': 'C', 'H': 'C', 'I': 'C', 'J': 'B'
};

const markerPositions = {
    'A': { top: '52%', left: '61%' }, 'B': { top: '48%', left: '54%' }, 'C': { top: '43%', left: '59%' },
    'D': { top: '34%', left: '59%' }, 'E': { top: '34%', left: '44%' }, 'F': { top: '41%', left: '38%' },
    'G': { top: '32%', left: '35%' }, 'H': { top: '50%', left: '32%' }, 'I': { top: '48%', left: '23%' },
    'J': { top: '69%', left: '43%' }
};

const patternMarkerPositions = {
    'A': { 'A': { bottom: '46%', right: '43%' }, 'B': { bottom: '54%', right: '47%' }, 'C': { bottom: '40%', right: '51%' } },
    'B': { 'A': { bottom: '62%', right: '57%' }, 'B': { bottom: '52%', right: '52%' }, 'C': { bottom: '61%', right: '48%' } },
    'C': { 'A': { bottom: '75%', right: '50%' }, 'B': { bottom: '64%', right: '54%' }, 'C': { bottom: '61%', right: '45%' } },
    'D': { 'A': { bottom: '73.5%', right: '28.6%' }, 'B': { bottom: '59.9%', right: '31.3%' }, 'C': { bottom: '57.8%', right: '27.4%' } },
    'E': { 'A': { bottom: '54.1%', right: '36.7%' }, 'B': { bottom: '51.0%', right: '43.2%' }, 'C': { bottom: '73.7%', right: '40.7%' } },
    'F': { 'A': { bottom: '42.9%', right: '49.9%' }, 'B': { bottom: '36.5%', right: '45.0%' }, 'C': { bottom: '48.3%', right: '46.0%' } },
    'G': { 'A': { bottom: '63.0%', right: '49.5%' }, 'B': { bottom: '59.5%', right: '55.4%' }, 'C': { bottom: '63.0%', right: '44.5%' } },
    'H': { 'A': { bottom: '41.3%', right: '58.7%' }, 'B': { bottom: '45.2%', right: '63.4%' }, 'C': { bottom: '47.0%', right: '57.6%' } },
    'I': { 'A': { bottom: '58.4%', right: '66.3%' }, 'B': { bottom: '61.1%', right: '61.0%' }, 'C': { bottom: '51.0%', right: '67.5%' } },
    'J': { 'A': { bottom: '58.0%', right: '40.8%' }, 'B': { bottom: '51.8%', right: '56.5%' }, 'C': { bottom: '28.5%', right: '52.6%' } }
};

const screenshotImageUrls = {
    'A': { 'A': 'https://assets.st-note.com/img/1738372100-wkRfaQDElqCepTY12bHVJszm.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738372108-Ozf8gFbjTZEaGJMDx7qHAoVN.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738420209-Vs9IFoQq3dJxwOGv5RM7Xh0C.jpg?width=1200' },
    'B': { 'A': 'https://assets.st-note.com/img/1738419367-4wCdF5eOLbmtVuDAURYSaIr1.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419379-3mOLkEy16jefW0nvGlctzK9B.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419389-Zm5ra9xD6JU2SKfNzeBHpIl1.jpg?width=1200' },
    'C': { 'A': 'https://assets.st-note.com/img/1738419522-lgzSU9nI2x6ZYhkNfHqiPXOo.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419532-g9URz8f04FckmJtAseBhu7Qj.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419541-1IgcObQjl3dH4rwy2LNM6SP9.jpg?width=1200' },
    'D': { 'A': 'https://assets.st-note.com/img/1738419563-xyMQ1nkuOjbpa6Dwm3KWoYh9.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419572-YuweId6SiyKDBAtWgOlojQGa.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419580-quLQMGeRlbfv0wSgmh8jCINt.jpg?width=1200' },
    'E': { 'A': 'https://assets.st-note.com/img/1738419683-Y3pzloUPmn861idxQvLaMNZy.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419695-t41JA6FX2CeViT9GB3UOdhlK.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419704-xdZlTOuatBockhDLVgsN4I3w.jpg?width=1200' },
    'F': { 'A': 'https://assets.st-note.com/img/1738419747-YfBn7iOzKVekQRAJ9DParxlv.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419755-5CmQ8u0hGFrsfRyZojIH2kpX.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419763-zFvuEZK9nYgd61OsrM5NeRAP.jpg?width=1200' },
    'G': { 'A': 'https://assets.st-note.com/img/1738586151-mkVNDUfHbGTQFJ7M9opaYRK2.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419796-1mHqF5OyP6rEAoU3YZNcuQKj.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419805-MF0UpPyI6cNzqldvXADiuEwg.jpg?width=1200' },
    'H': { 'A': 'https://assets.st-note.com/img/1738419821-2VtSLA5DROoJ0wBClZIxvMTu.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419829-4evqad8bPjYEAmBfpZH9RuT1.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419837-4tSaJMW6y7BzDZQ3fRC2LXqH.jpg?width=1200' },
    'I': { 'A': 'https://assets.st-note.com/img/1738419855-V8XBf5WexFzy60psuQGvmNdY.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738586173-KCQXfOlVjNtUoBn37qg5Fcu0.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419868-YORuncAJ3DgLoZ560WwCv4Uq.jpg?width=1200' },
    'J': { 'A': 'https://assets.st-note.com/img/1738419900-C9ZW6JqmkxnVz5vBrKbAXtDo.jpg?width=1200', 'B': 'https://assets.st-note.com/img/1738419916-pQNEJcL0dXovR7jnTfa8qzeh.jpg?width=1200', 'C': 'https://assets.st-note.com/img/1738419933-zFKX9tqVyjMilUBRdJIWNYrH.jpg?width=1200' }
};
