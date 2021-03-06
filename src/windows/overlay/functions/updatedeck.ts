import {jsonParse, sumOfObject} from 'root/lib/func';
import {asMap} from 'root/lib/type_utils';
import {colorforfilter, manafont, typecolorletter} from 'root/lib/utils';
import {genBattleCardNum} from 'root/windows/overlay/functions/genbattlecardnum';
import {currentMatch, overlayConfig, superclasses} from 'root/windows/overlay/overlay';

export function updateDeck(highlight: number[]): void {
  if (!overlayConfig.metaData) {
    return;
  }
  const meta = overlayConfig.metaData;

  currentMatch.myFullDeck.forEach(card => {
    const mtgaid = meta.allcards[+card.card].mtga_id;
    const crdTxtEl: HTMLElement | null = document.getElementById(`cardnum${mtgaid}me`);
    if (crdTxtEl !== null) {
      crdTxtEl.innerHTML = genBattleCardNum(mtgaid);
    }
  });
  highlight.forEach(mtgaid => {
    const cid = meta.mtgatoinnerid[+mtgaid];
    if (!meta.allcards[+cid]) {
      return;
    }
    const scls = meta.allcards[+cid].supercls;
    if (!currentMatch.cardsBySuperclassLeft.has(scls.toString())) {
      currentMatch.cardsBySuperclassLeft.set(scls.toString(), 1);
    } else {
      const n = currentMatch.cardsBySuperclassLeft.get(scls.toString()) as number;
      currentMatch.cardsBySuperclassLeft.set(scls.toString(), n + 1);
    }

    if (meta.allcards[+cid].is_land === 1) {
      const manajMap = asMap(
        meta.allcards[+cid].colorarr !== '' && meta.allcards[+cid].colorarr !== '[]'
          ? jsonParse(meta.allcards[+cid].colorarr)
          : undefined
      );

      if (manajMap !== undefined) {
        Object.keys(manajMap).forEach(elem => {
          if (!currentMatch.landsLeft.has(elem)) {
            currentMatch.landsLeft.set(elem, 1);
          } else {
            const n = currentMatch.landsLeft.get(elem) as number;
            currentMatch.landsLeft.set(elem, n + 1);
          }
        });
      }
    }

    const crdEl: HTMLElement | null = document.getElementById(`card${mtgaid}me`);
    if (crdEl) {
      crdEl.classList.add('highlightCard');
      setTimeout(() => {
        Array.from(document.getElementsByClassName('highlightCard')).forEach(el => {
          el.classList.remove('highlightCard');
        });
      }, overlayConfig.highlightTimeout);
    }
  });

  for (let scls = 0; scls <= 2; scls++) {
    const sclsEl: HTMLElement | null = document.getElementById(`scls${scls}`);
    if (sclsEl) {
      const cardsBySuperclass = currentMatch.cardsBySuperclass.get(scls.toString());
      const cardsBySuperclassLeft = currentMatch.cardsBySuperclassLeft.get(scls.toString());
      if (cardsBySuperclass !== undefined) {
        const numleft = cardsBySuperclass - (cardsBySuperclassLeft !== undefined ? cardsBySuperclassLeft : 0);
        const cardsPlayed = sumOfObject(currentMatch.decks.me);
        const draw = (100 * (numleft / (currentMatch.totalCards - cardsPlayed))).toFixed(2);
        sclsEl.innerHTML = `<span class="ms ms-${superclasses[scls]}" />${numleft}|${draw}%`;
      }
    }
  }

  for (let cf = 0; cf <= colorforfilter.length - 2; cf++) {
    const clrEl: HTMLElement | null = document.getElementById(`landclr${colorforfilter[cf]}`);
    if (clrEl) {
      const lands = currentMatch.lands.get(colorforfilter[cf]);
      const landsLeft = currentMatch.landsLeft.get(colorforfilter[cf]);
      if (lands !== undefined) {
        const numleft = lands - (landsLeft !== undefined ? landsLeft : 0);
        const cardsPlayed = sumOfObject(currentMatch.decks.me);
        const draw = (100 * (numleft / (currentMatch.totalCards - cardsPlayed))).toFixed(2);
        clrEl.style.display = '';
        clrEl.innerHTML = `<span class="ms ms-${manafont[colorforfilter[cf].toLowerCase()]}" style="color:#${
          typecolorletter[colorforfilter[cf]]
        } !important"></span>${numleft}|${draw}%`;
      } else {
        clrEl.style.display = 'none';
      }
    }
  }
}
