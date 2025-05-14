(function() {
  'use strict';

  let navAndCommon, settings;
  
  const NavAndCommon = function() {
    this.initialize.apply(this, arguments);
  };

  NavAndCommon.prototype.initialize = function() {
    let commonElms = this.commonElmsAndData();
    this.settingsData = commonElms[0];
    this.sectionElms = commonElms[1];
    this.settingsSectionElms = commonElms[2];

    this.headerElm = document.querySelector('.js-header');
  };

  NavAndCommon.prototype.commonElmsAndData = function() {
    const getSettingsDataFromLocalStorage = () => {
      let settingsData = new Map();
      let settingsDataFromLocalStorage = localStorage.getItem('goalManagementSettingsData');
      if(settingsDataFromLocalStorage!=='undefined') {
        const dataJson = JSON.parse(settingsDataFromLocalStorage);
        settingsData = new Map(dataJson);
      }
      return settingsData;
    };

    let settingsData = getSettingsDataFromLocalStorage();
    let sectionElms = document.querySelectorAll('.js-section');
    let settingsSectionElms = document.querySelectorAll('.js-settingsSection');
    return [settingsData, sectionElms, settingsSectionElms];
  };

  NavAndCommon.prototype.switchPage = function(aIndex, aSectionElms) { //common
    aSectionElms.forEach(elm => {
      elm.classList.add('d-none');
    });
    if(aIndex==null) {
      let isComplete = false;// todo設定まで完了したらcompleteで毎日のtodo表示
      this.settingsData.forEach((val, key) => {
        if(val.status=='complete') {
          isComplete = true;
        }
      });
      aIndex = (isComplete) ? 0 : 1;
    }
    aSectionElms[aIndex].classList.remove('d-none');
  };

  NavAndCommon.prototype.closeGlobalMenu = function() {
    const that = this;
    const navbarNavElm = document.querySelector('.js-navbarNav');
    const globalNavBtnElm = document.querySelector('.js-globalNavBtn');
    const bsCollapse = new bootstrap.Collapse(navbarNavElm, { toggle: false });

    const mediaQueryList = window.matchMedia('(max-width: 992px)');
    let isOpen = false;
    const listener = (event) => {
      if (event.matches) {
        document.addEventListener('click', function(event) {
        isOpen = navbarNavElm.classList.contains('show');
          if (isOpen && !that.headerElm.contains(event.target)) {
            bsCollapse.hide();
          }
        });

        this.navItemElms.forEach( elm => {
          elm.addEventListener('click', function() {
            bsCollapse.hide();
          });
        });
      }
    };

    mediaQueryList.addEventListener('change', listener);
    listener(mediaQueryList);
  };

  NavAndCommon.prototype.hideAndShowGlobalNav = function() {
    if(this.settingsData.size) {
      this.headerElm.classList.remove('d-none');
    }
    else {
      this.headerElm.classList.add('d-none');
    }
  };

  NavAndCommon.prototype.setEvent = function() {
    this.switchPage(null, this.sectionElms);
    this.hideAndShowGlobalNav();

    const globalNavElms = document.querySelectorAll('.js-globalNav');
    const globalNavSettingsElms = document.querySelectorAll('.js-globalNavSettings');
    this.navItemElms = Object.setPrototypeOf( [ ...globalNavElms, ...globalNavSettingsElms ], NodeList.prototype );

    const that = this;
    const sectionIndex = [[0, 2], [0, 4, 5]];
    for(let cnt=0,len=globalNavElms.length;cnt<len;++cnt) {
      globalNavElms[cnt].addEventListener('click', function() {
        that.switchPage(sectionIndex[0][cnt], that.sectionElms);
      });
    }

    for(let cnt=0,len=globalNavSettingsElms.length;cnt<len;++cnt) {
      globalNavSettingsElms[cnt].addEventListener('click', function() {
        that.switchPage(1, that.sectionElms);
        that.switchPage(sectionIndex[1][cnt], that.settingsSectionElms);
      });
    }

    this.closeGlobalMenu();

  };

  NavAndCommon.prototype.run = function() {
    this.setEvent();
  };


  const Settings = function() {
    this.initialize.apply(this, arguments);
  };

  Settings.prototype.initialize = function() {
    let commonElms = navAndCommon.commonElmsAndData();
    this.settingsData = commonElms[0];
    this.sectionElms = commonElms[1];
    this.settingsSectionElms = commonElms[2];
    
    this.saveAndNextBtnElms = document.querySelectorAll('.js-saveAndNextBtn');
    this.inputAlertElms = document.querySelectorAll('.js-inputAlert');
    this.id = 0;

    this.backBtnElms = document.querySelectorAll('.js-backBtn');
    this.goalListElm = this.settingsSectionElms[0].querySelector('.js-goalList');
  };

  Settings.prototype.saveAndNextData = function(aIndex) {
    this.settingsData.set(this.id, this.currentSettingsData);
    localStorage.setItem('goalManagementSettingsData', JSON.stringify([...this.settingsData]));

    navAndCommon.switchPage(aIndex, this.settingsSectionElms);
    this.displayGoalList();
  };

  Settings.prototype.getDate = function(aDiff, aDate) {
    let now = (aDate) ? new Date(aDate) : new Date();
    now.setDate(now.getDate()+aDiff);

    let dateY = now.getFullYear();
    let dateM = now.getMonth() + 1;
    let dateD = now.getDate();
    if(dateM<10) {
      dateM = '0' + dateM;
    }
    if(dateD<10) {
      dateD = '0' + dateD;
    }
    return [dateY, dateM, dateD];
  };

  Settings.prototype.displayGoalList = function() {
    let goalListResult = '';
    this.settingsData.forEach((val, key) => {
      goalListResult += `<div class="d-flex flex-row justify-content-between">
        <div class="flex-grow-1 align-self-center">` + val.goal + `</div>
        <button class="btn js-editSettingBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
          </svg>
        </button>
        <button class="btn js-deleteSettingBtn" data-key="` + key + `">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </button>
      </div>`;
    });

    this.goalListElm.innerHTML = goalListResult;
  };


  Settings.prototype.setEventSettings1 = function() {
    const inputElms = this.settingsSectionElms[0].querySelectorAll('input');
    const selectElm = this.settingsSectionElms[0].querySelector('select');

    const inputGoalElm = inputElms[0];
    const inputRadioElm = inputElms[1];
    const inputPeriodStartElm = inputElms[2];
    const inputPeriodEndElm = inputElms[3];
    const inputModalElm = inputElms[4];

    let diffInDays = 0;

    const setDate = (aDiff, aElm, aDate) => {
      let getDate = this.getDate(aDiff, aDate);
      let dateY = getDate[0];
      let dateM = getDate[1];
      let dateD = getDate[2];
      
      aElm.value = dateY + '-' + dateM + '-' + dateD;
      aElm.min = (aDiff) ? aElm.value : (dateY-1) + '-' + dateM + '-' + dateD;
      aElm.max = (dateY+50) + '-' + dateM + '-' + dateD;
    };

    const hideOrShowGoalList = () => {
      if(this.settingsData.size) {
        this.goalListElm.parentNode.classList.remove('d-none');
      }
      else {
        this.goalListElm.parentNode.classList.add('d-none');
      }
    };

    setDate(0, inputPeriodStartElm);
    setDate(1, inputModalElm);

    const getNextPageIndex = () => {
      if(!inputRadioElm.checked) {
        return 4;
      }
      if(selectElm.value=='w1') {
        return 3;
      }
      if(selectElm.value=='m1' || selectElm.value=='m2' || selectElm.value=='m3') {
        return 2;
      }
      if(selectElm.value=='custom') {
        if(diffInDays<=7) {
          return 4;
        }
        if(diffInDays<=31) {
          return 3;
        }
        if(diffInDays<=365) {
          return 2;
        }
        return 1;
      }
      return 1;
    };

    const that = this;

    this.saveAndNextBtnElms[0].addEventListener('click', function() {
      if(selectElm.value=='custom') {
        const diffInMs = new Date(inputPeriodEndElm.value) - new Date(inputPeriodStartElm.value);
        diffInDays = Math.floor(diffInMs/(1000*60*60*24));  
      }

      that.id = 1; //仮
      that.currentSettingsData = new Map();
      that.currentSettingsData.goal = inputGoalElm.value;
      that.currentSettingsData.status = 1;
      that.currentSettingsData.radioPeriod = inputRadioElm.checked;
      that.currentSettingsData.period = [ inputPeriodStartElm.value, (selectElm.value!='custom') ? selectElm.value : inputPeriodEndElm.value, (selectElm.value!='custom') ? 0 : diffInDays ];

      let nextPageIndex = getNextPageIndex();
      that.saveAndNextData(nextPageIndex);

      if(nextPageIndex==1) {
        that.setEventSettings2();
      }
      else if(nextPageIndex==2) {
        that.setEventSettings3();
      }
    });

    let duplication = false;
    inputGoalElm.addEventListener('keyup', function() {
      that.settingsData.forEach((val, key) => {
        if(val.goal==this.value) {
          that.inputAlertElms[0].textContent = '既に登録済みです';
          that.inputAlertElms[0].classList.remove('d-none');
          this.classList.add('border-danger');
          duplication = true;
        }
        else {
          that.inputAlertElms[0].textContent = '';
          that.inputAlertElms[0].classList.add('d-none');
          this.classList.remove('border-danger');
          duplication = false;
        }
      });
      that.saveAndNextBtnElms[0].disabled = (!duplication && this.value) ? false : true;
    });

    const modalElm = document.querySelector('.js-modal');
    const bsModal = new bootstrap.Modal(modalElm);
    this.tempSelectValue = selectElm.value;
    selectElm.addEventListener('change', function() {
      if(this.value=='custom') {
        bsModal.show();
        setDate(1, inputModalElm, inputPeriodStartElm.value);
      }
      else {
        that.tempSelectValue = this.value;
      }
    });

    modalElm.addEventListener('hide.bs.modal', () => {
      if(document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    const periodCustomBtnElm = document.querySelector('.js-periodCustomBtn');
    periodCustomBtnElm.addEventListener('click', function() {
      inputPeriodEndElm.classList.remove('d-none');
      selectElm.classList.add('d-none');
      inputPeriodEndElm.value = inputModalElm.value;
      inputPeriodEndElm.min = inputModalElm.min;
      inputPeriodEndElm.max = inputModalElm.max;
    });

    const periodCancelBtnElms = document.querySelectorAll('.js-periodCancelBtn');
    periodCancelBtnElms.forEach(elm => {
      elm.addEventListener('click', function() {
        selectElm.value = that.tempSelectValue;
      });
    });

    this.displayGoalList();

    hideOrShowGoalList();
    const deleteSettingBtnElms = document.querySelectorAll('.js-deleteSettingBtn');
    deleteSettingBtnElms.forEach(elm => {
      elm.addEventListener('click', function() {
        that.settingsData.delete(parseInt(this.dataset.key));
        localStorage.setItem('goalManagementSettingsData', JSON.stringify([...that.settingsData]));
        hideOrShowGoalList();
      });
    });
  };

  Settings.prototype.commonElmsAndDataForInput = function(aIndex) {
    const inputAreaElm = this.settingsSectionElms[aIndex].querySelector('.js-inputArea');
    const goalTitleAreaPElm = this.settingsSectionElms[aIndex].querySelector('.js-goalTitleArea p');
    let goalTitleAreaInputOrDiv = (aIndex==1) ? '.js-goalTitleArea input' : '.js-goalTitleArea div'
    let goalTitleAreaInputOrDivElm = this.settingsSectionElms[aIndex].querySelector(goalTitleAreaInputOrDiv);

    this.currentSettingsData = this.settingsData.get(1); //仮

    return [inputAreaElm, goalTitleAreaPElm, goalTitleAreaInputOrDivElm];
  };

  Settings.prototype.getYearlyOrMonthlyDate = function(aMultiplier, aMonth) { //**閏年や月の計算を後で見直し・検討
    let multiplication = 0;
    if(aMonth) {
      multiplication = (aMultiplier==12) ? 365 : 31*aMultiplier;
    }
    else {
      multiplication = 365*aMultiplier;
    }
    let getDate = this.getDate(multiplication, this.currentSettingsData.period[0]);
    let dateY = getDate[0];
    let dateM = getDate[1];
    let dateD = getDate[2];
    let date = dateY + '/' + dateM + '/' + dateD;
    return date;
  };

  Settings.prototype.setEventSettings2 = function() {//年間
    let commonElmsAndDataForInput = this.commonElmsAndDataForInput(1);
    const inputAreaElm = commonElmsAndDataForInput[0];
    const goalTitleAreaPElm = commonElmsAndDataForInput[1];
    const goalTitleAreaInputElm = commonElmsAndDataForInput[2];

    let displayStartDate = this.currentSettingsData.period[0].replace(/-/g, '/');
    let displayEndDate = this.getYearlyOrMonthlyDate(1);

    let result = `<div class="p-2">
    <label for="inputAnnualGoal1">1年目の目標（` + displayStartDate + `から` + displayEndDate + `まで）<span class="text-danger">※</span></label>
    <input type="text" class="form-control my-2" id="inputAnnualGoal1">
    <p class="small text-secondary">例）英検１級を受験して一次試験に合格する</p>
    </div>`;

    let numberOfYears = (this.currentSettingsData.period[2]) ? Math.floor(this.currentSettingsData.period[2]/365) : parseInt(this.currentSettingsData.period[1]);
    let goalTitleAreaTextArray = Array(numberOfYears);
    goalTitleAreaText = displayStartDate + 'から';
    goalTitleAreaTextArray[0] = [ displayStartDate, displayEndDate];

    const getInputAreaHTML = (aCnt, aDisplayStartDate, aDisplayEndDate) => {
      return `<div class="p-2">
        <label for="inputAnnualGoal` + aCnt +  `">` + aCnt + `年目の目標（` + aDisplayStartDate + `から` + aDisplayEndDate + `まで）</label>
        <input type="text" class="form-control my-2" id="inputAnnualGoal` + aCnt + `">
        </div>`;
    };

    if(numberOfYears>1) {
      for(let cnt=2;cnt<=numberOfYears;++cnt) {
        displayStartDate = displayEndDate;
        displayEndDate = this.getYearlyOrMonthlyDate(cnt);
        goalTitleAreaTextArray[(cnt-1)] = [ displayStartDate, displayEndDate ];
        result += getInputAreaHTML(cnt, displayStartDate, displayEndDate);
      }  
    }

    if(this.currentSettingsData.period[2]) {
      let cnt = numberOfYears + 1;
      displayStartDate = displayEndDate;
      displayEndDate = this.currentSettingsData.period[1].replace(/-/g, '/');
      goalTitleAreaTextArray[(cnt-1)] = [ displayStartDate, displayEndDate ];
      result += getInputAreaHTML(cnt, displayStartDate, displayEndDate);
    }
    inputAreaElm.innerHTML = result;

    goalTitleAreaText += displayEndDate + 'までに達成したいこと';
    goalTitleAreaPElm.textContent = goalTitleAreaText;
    goalTitleAreaInputElm.value = this.currentSettingsData.goal;

    const inputElms = inputAreaElm.querySelectorAll('input');
    const that = this;
    inputElms[0].addEventListener('keyup', function() {
      that.saveAndNextBtnElms[1].disabled = (this.value) ? false : true;
    });

    this.saveAndNextBtnElms[1].addEventListener('click', function() {
      let annualGoalArray = Array(numberOfYears);
      for(let cnt=0,len=inputElms.length;cnt<len;++cnt) {
        annualGoalArray[cnt] = inputElms[cnt].value;
      }

      that.id = 1; //仮
      that.currentSettingsData.goalperiodtext = goalTitleAreaText;
      that.currentSettingsData.goalperiodarray = goalTitleAreaTextArray;
      that.currentSettingsData.status = 2;
      that.currentSettingsData.annualgoalarray = annualGoalArray;

      that.saveAndNextData(2);
      that.setEventSettings3();
    });

    this.backBtnElms[0].addEventListener('click', function() {
      navAndCommon.switchPage(0, that.settingsSectionElms);
    });
  };

  Settings.prototype.setEventSettings3 = function() {//月間
    let commonElmsAndDataForInput = this.commonElmsAndDataForInput(2);
    const inputAreaElm = commonElmsAndDataForInput[0];
    const goalTitleAreaPElm = commonElmsAndDataForInput[1];
    const goalTitleAreaDivElm = commonElmsAndDataForInput[2];

    const judgeDisabled = () => {
      let inputElms = inputAreaElm.querySelectorAll('input');
      inputElms.forEach(elm=> {
        elm.addEventListener('keyup', function() {
          that.saveAndNextBtnElms[2].disabled = (!inputElms[0].value.trim() || !inputElms[1].value.trim()) ? true : false;
        });
      });
    };

    const that = this;

    let required = '';
    let year = 0;
    let month = 0;
    let monthCnt = 0;

    if(!this.currentSettingsData.goalperiodarray) {//one year or less
      let getStartDate = this.currentSettingsData.period[0].replace(/-/g, '/');
      let resultText = getStartDate + 'から';
      let getEndDate = '';

      if(this.currentSettingsData.period[2]) { //custom
        getEndDate = this.currentSettingsData.period[1].replace(/-/g, '/');
        resultText += getEndDate + 'までに達成したいこと';
      }
      else {
        let periodObj = {
          'm1': ['3ヶ月', 3],
          'm2': ['半年', 6],
          'm3': ['1年', 12]
        };
        resultText += periodObj[this.currentSettingsData.period[1]][0] + '後' || '';

        getEndDate = this.getYearlyOrMonthlyDate(periodObj[this.currentSettingsData.period[1]][1], true);
        resultText += '（' + getEndDate + '）までに達成したいこと';
      }

      goalTitleAreaPElm.textContent = resultText;
      goalTitleAreaDivElm.innerHTML = '<input class="form-control" type="text" id="inputGoal3" value="' + this.currentSettingsData.goal + '">';
      
      let monthStartCntArray = getStartDate.split('/');
      let monthEndCntArray = getEndDate.split('/');
      monthCnt = parseInt(monthEndCntArray[1]) - parseInt(monthStartCntArray[1]) + 1;
      if(parseInt(monthStartCntArray[0])!=parseInt(monthEndCntArray[0])) {
        monthCnt += 12; 
      }

      let startDateArray = this.currentSettingsData.period[0].split('-');
      let result = '';
      for(let cnt=0;cnt<monthCnt;++cnt) {
        month = parseInt(startDateArray[1]) + cnt;
        month = (month>12) ? month-12 : month;
        required = (cnt<2) ? ' <span class="text-danger">※</span>' : '';
        result += `<div class="p-2">
          <label for="inputMonthly` + cnt + `">` + month + `月の目標` + required + `</label>
          <input type="text" class="form-control my-2" id="inputMonthly` + cnt + `">
        </div>`;
      }
      inputAreaElm.innerHTML = result;
    }
    else {
      const getTextContent = (aStart, aEnd) => {
        return (aStart + 'から' + aEnd + 'までに達成したいこと');
      };

      const select = document.createElement('select');
      goalTitleAreaDivElm.innerHTML = '<select name="selectPeriod3" id="selectPeriod3" class="form-select"></select>';
      const goalTitleAreaSelectElm = goalTitleAreaDivElm.querySelector('select');
      goalTitleAreaPElm.textContent = getTextContent(this.currentSettingsData.goalperiodarray[0][0], this.currentSettingsData.goalperiodarray[0][1]);

      let annualGoalOption = ''
      this.currentSettingsData.annualgoalarray.forEach((val, key) => {
        if(val) {
          annualGoalOption += '<option value="' + key + '">' + (key+1) + '年目：' + val + '</option>'
        }
      });
      goalTitleAreaSelectElm.innerHTML = annualGoalOption;

      let length = this.currentSettingsData.annualgoalarray.length;
      let resultArray = Array(length);
      let startDateArray = '';

      let value = '';

      let selectedIndex = 0;
      let tempInputMonthlyArray = Array(length);

      let startDateLastArray = that.currentSettingsData.goalperiodarray[(length-1)][0].split('/');
      let endDateLastArray = that.currentSettingsData.goalperiodarray[(length-1)][1].split('/');
      let diffInMonths = parseInt(endDateLastArray[1]) - parseInt(startDateLastArray[1]) + 1;

      let length2 = 0;
      const getResultArray = () => {
        for(let cnt=0;cnt<length;++cnt) {
          startDateArray = this.currentSettingsData.goalperiodarray[cnt][0].split('/');
          year = parseInt(startDateArray[0]) + cnt;
          resultArray[cnt] = '';
          length2 = (cnt==(length-1)) ? diffInMonths : 13;
          for(let cnt2=0;cnt2<length2;++cnt2) {
            month = parseInt(startDateArray[1]) + cnt2;
            month = (month>12) ? month-12 : month;
            required = (cnt==0 && cnt2<2) ? ' <span class="text-danger">※</span>' : '';
            value = (tempInputMonthlyArray[cnt]) ? (tempInputMonthlyArray[cnt][cnt2]) ? tempInputMonthlyArray[cnt][cnt2].trim() : '' : '';
            resultArray[cnt] += `<div class="p-2">
              <label for="inputMonthly` + cnt + '-' + cnt2 + `">` + month + `月の目標` + required + `</label>
              <input type="text" class="form-control my-2" id="inputMonthly` + cnt + '-' + cnt2 + `" value="` + value + `">
            </div>`;
          }
        }
        return resultArray;
      };
      inputAreaElm.innerHTML = getResultArray()[selectedIndex];

      goalTitleAreaSelectElm.addEventListener('change', function() {
        let inputMonthlyElms = inputAreaElm.querySelectorAll('input');
        let tempInputMonthlyValueArray = Array(12); //後で変更　日付指定の時は異なる
        inputMonthlyElms.forEach((elm, key) => {
          if(elm.value) {
            tempInputMonthlyValueArray[key] = elm.value;
          }
        });
        tempInputMonthlyArray[selectedIndex] = tempInputMonthlyValueArray;

        selectedIndex = parseInt(this.value);
        goalTitleAreaPElm.textContent = getTextContent(that.currentSettingsData.goalperiodarray[selectedIndex][0], that.currentSettingsData.goalperiodarray[selectedIndex][1]);
        inputAreaElm.innerHTML = getResultArray()[selectedIndex];
        if(!selectedIndex) {
          judgeDisabled();
        }
      });
    }

    judgeDisabled();

    this.backBtnElms[1].addEventListener('click', function() {
      let pageNo = (that.currentSettingsData.goalperiodarray) ? 1 : 0;
      navAndCommon.switchPage(pageNo, that.settingsSectionElms);
    });
  };

  Settings.prototype.setEvent = function() {
    this.setEventSettings1();
  };

  Settings.prototype.run = function() {
    this.setEvent();
  };


  window.addEventListener('DOMContentLoaded', function() {
    navAndCommon = new NavAndCommon();
    navAndCommon.run();

    settings = new Settings();
    settings.run();
  });

}());