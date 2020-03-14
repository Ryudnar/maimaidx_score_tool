const difficultyArray = ['basic', 'advanced', 'expert', 'master', 'remaster'];


async function fetchHtml(url) {
    return await fetch(url).then(res => res.text());
}


function parseMusicData(elem) {
    let level = $(elem).find('div.music_lv_block').text();
    let name = $(elem).find('div.music_name_block').text().replace('+', '＋');
    let rating = $(elem).find('div.music_score_block.w_120').text().replace('%', '');
    let dxScore = $(elem).find('div.music_score_block.w_180').text();
    let rank = null;
    let comboRank = null;
    let sync = null;
    let imgList = $(elem).find('img')

    for (let k = 0; k < imgList.length; k++) {
        if (imgList[k].src.indexOf('_fc.png') >= 0) {
            comboRank = 'FC'
        } else if (imgList[k].src.indexOf('_fcp.png') >= 0) {
            comboRank = 'FC+'
        } else if (imgList[k].src.indexOf('_ap.png') >= 0) {
            comboRank = 'AP'
        } else if (imgList[k].src.indexOf('_app.png') >= 0) {
            comboRank = 'AP+'
        } else if (imgList[k].src.indexOf('_d.png') >= 0) {
            rank = 'D'
        } else if (imgList[k].src.indexOf('_c.png') >= 0) {
            rank = 'C'
        } else if (imgList[k].src.indexOf('_b.png') >= 0) {
            rank = 'B'
        } else if (imgList[k].src.indexOf('_bb.png') >= 0) {
            rank = 'BB'
        } else if (imgList[k].src.indexOf('_bbb.png') >= 0) {
            rank = 'BBB'
        } else if (imgList[k].src.indexOf('_a.png') >= 0) {
            rank = 'A'
        } else if (imgList[k].src.indexOf('_aa.png') >= 0) {
            rank = 'AA'
        } else if (imgList[k].src.indexOf('_aaa.png') >= 0) {
            rank = 'AAA'
        } else if (imgList[k].src.indexOf('_s.png') >= 0) {
            rank = 'S'
        } else if (imgList[k].src.indexOf('_ss.png') >= 0) {
            rank = 'SS'
        } else if (imgList[k].src.indexOf('_sss.png') >= 0) {
            rank = 'SSS'
        } else if (imgList[k].src.indexOf('_sp.png') >= 0) {
            rank = 'S+'
        } else if (imgList[k].src.indexOf('_ssp.png') >= 0) {
            rank = 'SS+'
        } else if (imgList[k].src.indexOf('_sssp.png') >= 0) {
            rank = 'SSS+'
        } else if (imgList[k].src.indexOf('_fs.png') >= 0) {
            sync = 'FS'
        } else if (imgList[k].src.indexOf('_fsd.png') >= 0) {
            sync = 'FDX'
        } else if (imgList[k].src.indexOf('_fsp.png') >= 0) {
            sync = 'FS+'
        } else if (imgList[k].src.indexOf('_fsdp.png') >= 0) {
            sync = 'FDX+'
        }
    }

    return {
        level: level,
        name: name,
        rating: rating,
        dxScore: dxScore,
        rank: rank,
        comboRank: comboRank,
        sync: sync
    }
}

function parsePatternType(img) {
    if (img.src.indexOf('_standard.png') >= 0) {
        return 'STANDARD'
    } else if (img.src.indexOf('_dx.png') >= 0) {
        return 'DELUXE'
    } else {
        return null;
    }
}


function convertSongObjectToString(obj, difficulty) {
    if (!obj.rating) {
        return null;
    }
    if (difficulty == 'remaster') {
        difficulty = 'Re:MASTER';
    } else {
        difficulty = difficulty.toUpperCase();
    }
    return obj.level + '\t' + obj.name + ' ' + difficulty + ' (' + obj.type.toUpperCase() + ')' + '\t' + obj.rating;
}


function getDifficultyDatas(html, difficulty) {
    return $($.parseHTML(html)).find('.music_' + difficulty.toLowerCase() + '_score_back').map(function(idx, elem) {
        let songObject = parseMusicData(elem);
        let type = null;
        let patternIcons = $(this).siblings('img');
        if (patternIcons.length > 1) {
            type = parsePatternType($(this).siblings('img.music_' + difficulty.toLowerCase() + '_btn_on')[0]);
        } else {
            type = parsePatternType(patternIcons[0]);
        }
        songObject.type = type;
        return convertSongObjectToString(songObject, difficulty);
    }).filter(i => i).get().join('\n');
}


async function getAllDatas() {
    for(let i = 0; i < difficultyArray.length; i++) {
        let url = 'https://maimaidx-eng.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=' + i;
        let htmlData = await fetchHtml(url)
        let additionalString = getDifficultyDatas(htmlData, difficultyArray[i]);
        resultString = resultString + additionalString + (additionalString && '\n');
    }
}


function copyStringToClipboard (str) {
    var el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}


let resultString = '';

getAllDatas().then(() => copyStringToClipboard(resultString))
        .then(() => alert('성공적으로 취득하였습니다.'))
        .catch(() => alert('데이터 취득에 실패했습니다. 다시 시도해주세요.'));