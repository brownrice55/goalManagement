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

    globalNavElms.forEach((elm, index) => {
      elm.addEventListener('click', function() {
        that.switchPage(sectionIndex[0][index], that.sectionElms);
      });
    });

    globalNavSettingsElms.forEach((elm, index) => {
      elm.addEventListener('click', function() {
        that.switchPage(1, that.sectionElms);
        that.switchPage(sectionIndex[1][index], that.settingsSectionElms);
      });
    });

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
    this.inputGoalElms = document.querySelectorAll('.js-inputGoal');
    this.inputAlertElms = document.querySelectorAll('.js-inputAlert');
    this.id = 0;

    this.inputAreaElms = document.querySelectorAll('.js-inputArea');
    this.goalPeriodElms = document.querySelectorAll('.js-goalPeriod');
    this.backBtnElms = document.querySelectorAll('.js-backBtn');
    this.goalListElm = this.settingsSectionElms[0].querySelector('.js-goalList');

    this.selectGoalsElms = document.querySelectorAll('.js-selectGoals');//monthly, weekly

    this.startDateNumArray = Array(3).fill(0);
    this.endDateNumArray = Array(3).fill(0);
  };

  Settings.prototype.saveAndNextData = function(aIndex) {
    this.settingsData.set(this.id, this.currentSettingsData);
    localStorage.setItem('goalManagementSettingsData', JSON.stringify([...this.settingsData]));

    navAndCommon.switchPage(aIndex, this.settingsSectionElms);
    this.displayGoalList();
    if(aIndex!=4) {
      this.saveAndNextBtnElms[aIndex].disabled = true;
    }
  };

  Settings.prototype.getDate = function(aDiff, aDate) {
    let now = (aDate) ? new Date(aDate) : new Date();
    now.setDate(now.getDate()+aDiff);

    let dateY = now.getFullYear();
    let dateM = now.getMonth() + 1;
    let dateD = now.getDate();
    if(dateM<10) {
      dateM = `0${dateM}`;
    }
    if(dateD<10) {
      dateD = `0${dateD}`;
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

  Settings.prototype.setFormValidationForInput = function(aIndex, aInputElm) {
    let duplication = false;
    let isOkForGoal = (aIndex) ? true : false;
    let isOkForInput = false;
    const that = this;
    this.inputGoalElms[aIndex].addEventListener('keyup', function() {
      let thisValue = this.value.trim();
      that.settingsData.forEach((val, key) => {
        let isFirst = true;
        if(val.goal==thisValue) {
          if(aIndex && isFirst) {
            isFirst = false;
            return;
          }
          that.inputAlertElms[aIndex].textContent = '既に登録済みです';
          that.inputAlertElms[aIndex].classList.remove('d-none');
          this.classList.add('border-danger');
          duplication = true;
        }
        else {
          that.inputAlertElms[aIndex].textContent = '';
          that.inputAlertElms[aIndex].classList.add('d-none');
          this.classList.remove('border-danger');
          duplication = false;
        }
      });
      isOkForGoal = (!duplication && thisValue) ? true : false;
      if(aIndex) {
        that.saveAndNextBtnElms[aIndex].disabled = (isOkForGoal && isOkForInput) ? false : true;
      }
      else {
        that.saveAndNextBtnElms[aIndex].disabled = isOkForGoal ? false : true;
      }
    });

    if(aIndex==1) {
      aInputElm.addEventListener('keyup', function() {
        isOkForInput = (this.value.trim()) ? true : false;
        that.saveAndNextBtnElms[aIndex].disabled = (isOkForGoal && isOkForInput) ? false : true;
      });
    }
    else if(aIndex==2 || aIndex==3) {
      aInputElm.forEach(elm=> {
        elm.addEventListener('keyup', function() {
          isOkForInput = (aInputElm[0].value.trim() && aInputElm[1].value.trim()) ? true : false;
          that.saveAndNextBtnElms[aIndex].disabled = (isOkForGoal && isOkForInput) ? false : true;
        });
      });
    }
  };

  Settings.prototype.setEventSettings1 = function() {
    const inputElms = this.settingsSectionElms[0].querySelectorAll('.js-inputSettingsTop');
    const selectElm = this.settingsSectionElms[0].querySelector('select');

    const [inputRadioElm, inputPeriodStartElm, inputPeriodEndElm, inputModalElm] = inputElms;

    let diffInDays = 0;

    const setDate = (aDiff, aElm, aDate) => {
      let getDate = this.getDate(aDiff, aDate);

      let [dateY, dateM, dateD] = getDate;

      aElm.value = `${dateY}-${dateM}-${dateD}`;
      aElm.min = (aDiff) ? aElm.value : `${(dateY-1)}-${dateM}-${dateD}`;
      aElm.max = `${(dateY+50)}-${dateM}-${dateD}`;
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
        if(diffInDays<=31) {//31の部分は要検討***
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
      that.currentSettingsData.goal = that.inputGoalElms[0].value.trim();
      that.currentSettingsData.status = 1;
      that.currentSettingsData.radioPeriod = inputRadioElm.checked;
      that.currentSettingsData.period = [ inputPeriodStartElm.value, (selectElm.value!='custom') ? selectElm.value : inputPeriodEndElm.value, (selectElm.value!='custom') ? 0 : diffInDays, (selectElm.value=='custom') ? inputPeriodEndElm.value.split('-') : 0 ];
      that.startDateNumArray = inputPeriodStartElm.value.split('-').map(Number);

      let nextPageIndex = getNextPageIndex();
      that.saveAndNextData(nextPageIndex);

      if(nextPageIndex==1) {
        that.setEventSettings2();
      }
      else if(nextPageIndex==2) {
        that.setEventSettings3();
      }
      else if(nextPageIndex==3) {
        that.setEventSettings4();
      }
    });

    this.setFormValidationForInput(0, null);

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

  Settings.prototype.getDaysOfTheYear = function(aYear, aMonth) {
    let startYear = (aMonth>2) ? (aYear+1) : aYear;
    if(startYear%100==0 && startYear%400!=0) {
      return 365;
    }
    if(startYear%4==0) {
      return 366;
    }
    return 365;
  };

  Settings.prototype.getTheNumberOfDaysInAMonth = function(aMonth, aDaysOfTheYear) {
    let daysOfTheEachMonths = [31,28,31,30,31,30,31,31,30,31,30,31];
    if(aDaysOfTheYear==366) {
      daysOfTheEachMonths[1] = 29;
    }
    return daysOfTheEachMonths[(aMonth-1)];
  };

  Settings.prototype.getYearlyOrMonthlyDate = function(aMultiplier, aMonth, aStartYear, aStartMonth) {
    let multiplication = 0;
    let daysOfTheYear = this.getDaysOfTheYear(aStartYear, aStartMonth);

    if(aMonth) {
      let theSumOfDays = 0;
      for(let cnt=0;cnt<aMultiplier;++cnt) {
        theSumOfDays += this.getTheNumberOfDaysInAMonth((aStartMonth+cnt), daysOfTheYear);
      }
      multiplication = (aMultiplier==12) ? daysOfTheYear : theSumOfDays;
    }
    else {
      multiplication = daysOfTheYear*aMultiplier;
    }
    let getDate = this.getDate(multiplication, this.currentSettingsData.period[0]);
    this.currentSettingsData.period[3] = getDate;

    let [dateY, dateM, dateD] = getDate;
    let date = `${dateY}/${dateM}/${dateD}`;
    return date;
  };

  Settings.prototype.setEventSettings2 = function() {//年間
    this.currentSettingsData = this.settingsData.get(1); //仮

    let displayStartDateArray = this.startDateNumArray;
    let displayStartDate = this.currentSettingsData.period[0].replace(/-/g, '/');
    let displayEndDate = this.getYearlyOrMonthlyDate(1, false, this.startDateNumArray[0], this.startDateNumArray[1]);

    let result = `<div class="p-2">
    <label for="inputAnnualGoal1">1年目の目標（${displayStartDate}から${displayEndDate}まで）<span class="text-danger">※</span></label>
    <input type="text" class="form-control my-2" id="inputAnnualGoal1">
    <p class="small text-secondary">例）英検１級を受験して一次試験に合格する</p>
    </div>`;

    let numberOfYears = (this.currentSettingsData.period[2]) ? Math.floor(this.currentSettingsData.period[2]/365) : parseInt(this.currentSettingsData.period[1]);
    let goalTitleAreaTextArray = Array(numberOfYears).fill('');
    let goalTitleAreaText = `${displayStartDate}から`;
    goalTitleAreaTextArray[0] = [ displayStartDate, displayEndDate];

    const getInputAreaHTML = (aCnt, aDisplayStartDate, aDisplayEndDate) => {
      return `<div class="p-2">
        <label for="inputAnnualGoal${aCnt}">${aCnt}年目の目標（${aDisplayStartDate}から${aDisplayEndDate}まで）</label>
        <input type="text" class="form-control my-2" id="inputAnnualGoal${aCnt}">
        </div>`;
    };

    if(numberOfYears>1) {
      for(let cnt=2;cnt<=numberOfYears;++cnt) {
        displayStartDate = displayEndDate;
        displayStartDateArray = displayStartDate.split('/').map(Number);
        displayEndDate = this.getYearlyOrMonthlyDate(cnt, false, displayStartDateArray[0], displayStartDateArray[1]);
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
    this.inputAreaElms[0].innerHTML = result;

    goalTitleAreaText += `${displayEndDate}までに達成したいこと`;
    this.goalPeriodElms[0].textContent = goalTitleAreaText;
    this.inputGoalElms[1].value = this.currentSettingsData.goal;

    const inputElms = this.inputAreaElms[0].querySelectorAll('input');
    const that = this;

    this.setFormValidationForInput(1, inputElms[0]);

    this.saveAndNextBtnElms[1].addEventListener('click', function() {

      let annualGoalArray = Array.from(inputElms, elm => elm.value);

      that.id = 1; //仮
      if(that.currentSettingsData.goal!=that.inputGoalElms[1].value.trim()) {
        that.currentSettingsData.goal = that.inputGoalElms[1].value.trim();
      }
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

  Settings.prototype.getDimensionNum = function(aObj) {
    if(!Array.isArray(aObj)) {
      return 0;
    }
    let max = 0;
    for (let cnt=0,len=aObj.length;cnt<len;++cnt) {
      max = Math.max(max, this.getDimensionNum(aObj[cnt]));
    }
    return ++max;
  };

  Settings.prototype.addGoalOptions = function(aIndex) {
    let goalOption = ''
    let inputHTML = '';
    if(!aIndex) {//monthly
      this.currentSettingsData.annualgoalarray.forEach((val, index) => {
        if(val) {
          goalOption += `<option value="${index}">${(index+1)}年目：${val}</option>`;
        }
      });
    }
    else {//aIndex 1:weekly  aIndex 2:todo
      let data = (aIndex==1) ? this.currentSettingsData.monthlygoalsarray : this.currentSettingsData.weeklygoalsarray;
      let dimensionNum = this.getDimensionNum(data);

      const getOptionData = (aVal, aArray) => {
        if(aVal) {
          let string = aArray.filter((array)=>array!=null).join('-');
          return `<option value="${string}">${aVal}</option>`;
        }
      };

      if(dimensionNum==3) {//todo
        data.forEach((array, index) => {
          array.forEach((array2, index2) => {
            array2.forEach((val, index3) => {
              goalOption += getOptionData(val, [index,index2,index3]);
            });
          });
        });
      }
      else if(dimensionNum==2) {
        data.forEach((array, index) => {
          array.forEach((val, index2) => {
            goalOption += getOptionData(val, [index,index2,null]);
          });
        });
      }
      else {
        data.forEach((val, index) => {
          goalOption += getOptionData(val, [index,null,null]);
        });  
      }
    }
    this.selectGoalsElms[aIndex].innerHTML = goalOption;
  };

  Settings.prototype.getWeekArray = function(aYear, aMonth, aDate) {
    let daysOfTheYear = this.getDaysOfTheYear(aYear, aMonth);
    let theNumberOfDaysInAMonth = this.getTheNumberOfDaysInAMonth(aMonth, daysOfTheYear);

    const firstDayOfTheMonth = new Date(`${aYear}-0${aMonth}-0${aDate}`);
    let dayIndexOfFirstDayOfTheMonth = firstDayOfTheMonth.getDay();

    let addendArray = [1, 7, 6, 5, 4, 3, 2];
    let firstMonday = aDate + addendArray[dayIndexOfFirstDayOfTheMonth];

    this.endDateNumArray = this.currentSettingsData.period[3].map(Number);
    let endDate = (aYear==this.endDateNumArray[0] && aMonth==this.endDateNumArray[1]) ? this.endDateNumArray[2] : theNumberOfDaysInAMonth;

    let weekArray = [];
    if((firstMonday-1)>=endDate) {
      weekArray[0] = [aDate, endDate];
      return weekArray;
    }
    weekArray[0] = [aDate, (firstMonday-1)];
    for(let cnt=0;cnt<=5;++cnt) {
      if((firstMonday+6)+7*cnt<=endDate) {
        weekArray[(cnt+1)] = [firstMonday+7*cnt, (firstMonday+6)+7*cnt];
      }
      else if((firstMonday)+7*cnt>endDate) {
        return weekArray;
      }
      else {
        weekArray[(cnt+1)] = [firstMonday+7*cnt, endDate];
        return weekArray;
      }
    }
  };

  Settings.prototype.getInputHtmlArray = function(aTempInputArray, aIsMonthly, aSelectedIndex, aYear, aMonth, aDate) {    
    let resultArray = [];
    let startDateArray = [];
    let value = '';
    let year = 0;
    let month = 0;
    let date = aDate;
    let span = '';
    let requiredClass = '';

    if(aIsMonthly==1) {//monthly
      let lastArray = this.currentSettingsData.goalperiodarray.at(-1);
      let startDateLastNumArray = lastArray[0].split('/').map(Number);
      let endDateLastNumArray = lastArray[1].split('/').map(Number);
      let diffInMonths = (endDateLastNumArray[0]==startDateLastNumArray[0]) ? 1 : 13;
      diffInMonths += endDateLastNumArray[1] - startDateLastNumArray[1];

      this.currentSettingsData.goalperiodarray.forEach((array, index) => {
        startDateArray = array[0].split('/').map(Number);
        resultArray[index] = '';
        let length = (array==lastArray) ? diffInMonths : 13;
        for(let cnt=0;cnt<length;++cnt) {
          month = startDateArray[1] + cnt;
          year = (month<=12) ? startDateArray[0] : startDateArray[0] + 1;
          month = (month>12) ? month-12 : month;
          span = (!index&&!cnt || !index&&cnt==1) ? '<span class="text-danger">※</span>' : '';
          requiredClass = (!index&&!cnt || !index&&cnt==1) ? ' js-required' : '';
          value = (aTempInputArray) ? (aTempInputArray[index]) ? (aTempInputArray[index][cnt]) ? aTempInputArray[index][cnt].trim() : '' : '' : '';
          resultArray[index] += `<div class="p-2">
            <label for="inputMonthly${index}-${cnt}">${year}年${month}月の目標${span}</label>
            <input type="text" class="form-control my-2${requiredClass}" id="inputMonthly${index}-${cnt}" value="${value}" data-period="${year},${month}">
            </div>`;
        }
      });
    }
    else {//weekly
      const getResultArray = (aDimension, aTempInputArray, aCnt, aCnt2, aWeekArray, aYear, aMonth, aStringYearAndMonth, aDate) => {
        let result = '';
        let date = aDate;

        aWeekArray.forEach((array, index) => {
          if(aDimension==3) {
            value = (aTempInputArray[aCnt][aCnt2] && aTempInputArray[aCnt][aCnt2][index]!=null) ? String(aTempInputArray[aCnt][aCnt2][index]).trim() : '';
            span = (!aCnt && !aCnt2 && !index || !aCnt && !aCnt2 && index==1) ? '<span class="text-danger">※</span>' : '';
            requiredClass = (!aCnt && !aCnt2 && !index || !aCnt && !aCnt2 && index==1) ? ' js-required' : '';
          }
          else {
            value = (aTempInputArray[aCnt] && aTempInputArray[aCnt][index]!=null) ? String(aTempInputArray[aCnt][index]).trim() : '';
            span = (!aCnt && !index || !aCnt && index==1) ? '<span class="text-danger">※</span>' : '';
            requiredClass = (!aCnt && !index || !aCnt && index==1) ? ' js-required' : '';
          }
          result += `<div class="p-2">
            <label for="inputWeekly${aCnt}-${index}">${aStringYearAndMonth}${array[0]}から${aStringYearAndMonth}${array[1]}の目標${span}</label>
            <input type="text" class="form-control my-2${requiredClass}" id="inputWeekly${aCnt}-${index}" value="${value}" data-period="${aYear},${aMonth},${array[0]},${array[1]}">
            </div>`;
        });

        return result;
      };

      this.currentSettingsData.monthlygoalsarray.forEach((array, index) => {
        year = aYear;
        month = aMonth;
        let stringYearAndMonth = `${year}/${month}/`;
        let weekArray = this.getWeekArray(year, month, date);
        resultArray[index] = [];
        if(Array.isArray(aSelectedIndex)) {
          array.forEach((_, index2) => {
            resultArray[index][index2] = getResultArray(3, aTempInputArray, index, index2, weekArray, year, month, stringYearAndMonth, date);
          });
        }
        else {
          resultArray[index] = getResultArray(2, aTempInputArray, index, null, weekArray, year, month, stringYearAndMonth, date);
        }
      });
    }
    
    let sectionIndex = (aIsMonthly) ? 1 : 2;
    this.inputAreaElms[sectionIndex].innerHTML = (Array.isArray(aSelectedIndex)) ? resultArray[parseInt(aSelectedIndex[0])][parseInt(aSelectedIndex[1])] : resultArray[aSelectedIndex];
  };

  Settings.prototype.setInitialStateForEventSettings3AndEventSettings4 = function(aIndex, aConditions) {
    const goalTitleAreaDivElms = [this.inputGoalElms[(aIndex+2)].parentNode, this.selectGoalsElms[aIndex].parentNode];
    
    if(aConditions) {
      this.inputGoalElms[(aIndex+2)].value = this.currentSettingsData.goal;
      goalTitleAreaDivElms[0].classList.remove('d-none');
      goalTitleAreaDivElms[1].classList.add('d-none');
    }
    else {
      goalTitleAreaDivElms[0].classList.add('d-none');
      goalTitleAreaDivElms[1].classList.remove('d-none');
    }
  };

  Settings.prototype.judgeDisabledForEventSettings3AndEventSettings4 = function(aIndex, aIsOneOrLess) {
    let inputElms = this.inputAreaElms[(aIndex-1)].querySelectorAll('.js-required');
    const that = this;
    if(aIsOneOrLess) {
      this.setFormValidationForInput(aIndex, inputElms);
    }
    else {
      inputElms.forEach(elm=> {
        elm.addEventListener('keyup', function() {
          that.saveAndNextBtnElms[aIndex].disabled = (String(inputElms[0].value).trim() && String(inputElms[1].value).trim()) ? false : true;
        });
      });  
    }
  };

  Settings.prototype.setEventSettings3 = function() {//月間

    this.setInitialStateForEventSettings3AndEventSettings4(0, !this.currentSettingsData.goalperiodarray);

    const that = this;

    let required = '';
    let year = 0;
    let month = 0;
    let monthCnt = 0;

    let tempInputMonthlyArray = [];
    let tempInputMonthlyArrayPeriod = [];

    if(!this.currentSettingsData.goalperiodarray) {//one year or less
      let getStartDate = this.currentSettingsData.period[0].replace(/-/g, '/');
      let resultText = `${getStartDate}から`;
      let getEndDate = '';

      if(this.currentSettingsData.period[2]) { //custom
        getEndDate = this.currentSettingsData.period[1].replace(/-/g, '/');
        resultText += `${getEndDate}までに達成したいこと`;
      }
      else {
        let periodObj = {
          'm1': ['3ヶ月', 3],
          'm2': ['半年', 6],
          'm3': ['1年', 12]
        };
        resultText += periodObj[this.currentSettingsData.period[1]][0] + '後' || '';
        getEndDate = this.getYearlyOrMonthlyDate(periodObj[this.currentSettingsData.period[1]][1], true, this.startDateNumArray[0], this.startDateNumArray[1]);
        resultText += `（${getEndDate}）までに達成したいこと`;
      }

      this.goalPeriodElms[1].textContent = resultText;

      let monthStartCntArray = getStartDate.split('/').map(Number);
      let monthEndCntArray = getEndDate.split('/').map(Number);
      monthCnt = monthEndCntArray[1] - monthStartCntArray[1] + 1;
      if(monthStartCntArray[0]!=monthEndCntArray[0]) {
        monthCnt += 12; 
      }

      let startDateArray = this.currentSettingsData.period[0].split('-');
      let result = '';
      let span = '';
      let requiredClass = '';
      for(let cnt=0;cnt<monthCnt;++cnt) {
        year = (month==12) ? parseInt(startDateArray[0])+1 : parseInt(startDateArray[0]);
        month = parseInt(startDateArray[1]) + cnt;
        month = (month>12) ? month-12 : month;
        span = (!cnt || cnt==1) ? '<span class="text-danger">※</span>' : '';
        requiredClass = (!cnt || cnt==1) ? ' js-required' : '';
        result += `<div class="p-2">
          <label for="inputMonthly${cnt}">${month}月の目標${span}</label>
          <input type="text" class="form-control my-2${requiredClass}" id="inputMonthly${cnt}" data-period="${year},${month}">
        </div>`;
      }
      this.inputAreaElms[1].innerHTML = result;
    }
    else {
      const getTextContent = (aStart, aEnd) => {
        return `${aStart}から${aEnd}までに達成したいこと`;
      };

      this.goalPeriodElms[1].textContent = getTextContent(this.currentSettingsData.goalperiodarray[0][0], this.currentSettingsData.goalperiodarray[0][1]);

      this.addGoalOptions(0);
      
      let selectedIndex = 0;
      this.getInputHtmlArray(null, true, selectedIndex, null, null, null);

      this.selectGoalsElms[0].addEventListener('change', function() {
        let inputMonthlyElms = that.inputAreaElms[1].querySelectorAll('input');

        let tempInputMonthlyValueArray = Array.from(inputMonthlyElms, elm => (elm.value) ? elm.value : '');
        let tempInputMonthlyValueArrayPeriod = Array.from(inputMonthlyElms, elm => (elm.value) ? elm.dataset.period.split(',') : []);
        
        tempInputMonthlyArray[selectedIndex] = tempInputMonthlyValueArray;
        tempInputMonthlyArrayPeriod[selectedIndex] = tempInputMonthlyValueArrayPeriod;

        selectedIndex = parseInt(this.value);
        that.goalPeriodElms[1].textContent = getTextContent(that.currentSettingsData.goalperiodarray[selectedIndex][0], that.currentSettingsData.goalperiodarray[selectedIndex][1]);

        that.getInputHtmlArray(tempInputMonthlyArray, true, selectedIndex, null, null, null);
        if(!selectedIndex) {
          that.judgeDisabledForEventSettings3AndEventSettings4(2, false);
        }
      });
    
    }

    this.judgeDisabledForEventSettings3AndEventSettings4(2, !this.currentSettingsData.goalperiodarray);

    this.backBtnElms[1].addEventListener('click', function() {
      let pageNo = (that.currentSettingsData.goalperiodarray) ? 1 : 0;
      navAndCommon.switchPage(pageNo, that.settingsSectionElms);
    });

    this.saveAndNextBtnElms[2].addEventListener('click', function() {
      if(that.inputGoalElms[2].value.trim() && that.currentSettingsData.goal!=that.inputGoalElms[2].value.trim()) {
        that.currentSettingsData.goal = that.inputGoalElms[2].value.trim();
      }

      const inputElms = that.inputAreaElms[1].querySelectorAll('input');
      let inputArray = Array.from(inputElms, elm => elm.value);
      let inputArrayPeriod = Array.from(inputElms, elm => elm.dataset.period.split(','));

      that.currentSettingsData.monthlygoalsarray = (tempInputMonthlyArray[0]) ? tempInputMonthlyArray : inputArray;
      that.currentSettingsData.monthlygoalsarrayperiod = (tempInputMonthlyArrayPeriod[0]) ? tempInputMonthlyArrayPeriod : inputArrayPeriod;
      that.currentSettingsData.status = 3;

      that.saveAndNextData(3);
      that.setEventSettings4();
    });
  };

  Settings.prototype.setEventSettings4 = function() {//週間

    const isOneMonth = (this.currentSettingsData.period[1]=='w1') ? true : false;
    const isOneMonthOrLessCustom = (this.currentSettingsData.period[1]!='w1' && this.currentSettingsData.period[2]!=0 && this.currentSettingsData.period[2]<=31) ? true : false;//31の部分は要検討***
    const isOneMonthOrLess = (isOneMonth || isOneMonthOrLessCustom) ? true : false;
    this.setInitialStateForEventSettings3AndEventSettings4(1, isOneMonthOrLess);

    let tempInputWeeklyArray = [];
    let tempInputWeeklyArrayPeriod = [];
    let dimensionNumPeriod = 0;

    let [startYear, startMonth, startDate] = this.startDateNumArray;

    const that = this;

    const getTextContent = (aYear, aMonth, aDate, aIsOneMonthOrLessCustom) => {
      let text = `${aYear}/${aMonth}/${aDate}から`;
      if(aIsOneMonthOrLessCustom) {
        return `${text}${this.currentSettingsData.period[1].replace(/-/g, '/')}までに達成したいこと`;
      }
      if(aDate) {
        let getEndDate = this.getYearlyOrMonthlyDate(1, true, parseInt(aYear), parseInt(aMonth));
        return `${text}1ヶ月後（${getEndDate}）まで達成したいこと`;
      }
      return `${aYear}年${aMonth}月に達成したいこと`;
    };
    
    if(isOneMonthOrLess) {
      this.goalPeriodElms[2].textContent = getTextContent(startYear, startMonth, startDate, isOneMonthOrLessCustom);

      const getWeekDataResultArray = (aYear, aMonth, aDate, aIsTheLast, aMoreRequired) => {
        let year = aYear;
        let month = aMonth;
        let date = (aIsTheLast) ? 1 : aDate;

        let weekArray = this.getWeekArray(year, month, date);
        let stringYearAndMonth = year + '/' + month + '/';
        let span = '';
        let requiredClass = '';
  
        let result = `<p class="px-2">${month}月</p>`;
        weekArray.forEach((array, index) => {
          if(!aIsTheLast) {
            span = (!index || index==1) ? '<span class="text-danger">※</span>' : '';
            requiredClass = (!index || index==1) ? ' js-required' : '';
          }
          else if(aMoreRequired) {
            span = (!index) ? '<span class="text-danger">※</span>' : '';
            requiredClass = (!index) ? ' js-required' : '';
          }
          result += `<div class="p-2">
          <label for="inputWeekly${month}-${index}">${stringYearAndMonth}${array[0]}から${stringYearAndMonth}${array[1]}の目標${span}</label>
          <input type="text" class="form-control my-2${requiredClass}" id="inputWeekly${month}-${index}" data-period="${year},${month},${array[0]},${array[1]}">
          </div>`;
        });
        return [result, ((weekArray.length==1)?true:false)];
      };

      const getNextYearAndMonth = (aStartYear, aStartMonth) => {
        let newMonth = (aStartMonth==12) ? (aStartMonth-11) : (aStartMonth+1);
        let newYear = (aStartMonth==12) ? (aStartYear+1) : aStartYear;
        return [newYear, newMonth];
      };

      let getResultArray = getWeekDataResultArray(startYear, startMonth, startDate, false, true);
      let result = getResultArray[0];
      if((this.endDateNumArray[1]-startMonth)==2 || (startMonth-this.endDateNumArray[1])==10) {
        let nextYearAndMonth = getNextYearAndMonth(startYear, startMonth);
        startYear = nextYearAndMonth[0];
        startMonth = nextYearAndMonth[1];
        getResultArray = getWeekDataResultArray(startYear, startMonth, startDate, true, getResultArray[1]);
        result += getResultArray[0];
      }
      if(this.endDateNumArray[0]!=startYear || (this.endDateNumArray[1]!=startMonth)) {
        getResultArray = getWeekDataResultArray(this.endDateNumArray[0], this.endDateNumArray[1], this.endDateNumArray[2], true, false);
        result += getResultArray[0];
      }

      this.inputAreaElms[2].innerHTML = result;

    }
    else {
      this.addGoalOptions(1);
      dimensionNumPeriod = this.getDimensionNum(this.currentSettingsData.monthlygoalsarrayperiod);

      if(dimensionNumPeriod==3) {
        tempInputWeeklyArray = Array.from(this.currentSettingsData.monthlygoalsarrayperiod, () => []);
        tempInputWeeklyArrayPeriod = Array.from(this.currentSettingsData.monthlygoalsarrayperiod, () => []);
      }

      startYear = (dimensionNumPeriod==3) ? this.currentSettingsData.monthlygoalsarrayperiod[0][0][0] : this.currentSettingsData.monthlygoalsarrayperiod[0][0];
      startMonth = (dimensionNumPeriod==3) ? this.currentSettingsData.monthlygoalsarrayperiod[0][0][1] : this.currentSettingsData.monthlygoalsarrayperiod[0][1];

      this.goalPeriodElms[2].textContent = getTextContent(startYear, startMonth, null);

      let selectedIndex = (dimensionNumPeriod==3) ? Array(2).fill(0) : 0;

      this.getInputHtmlArray(tempInputWeeklyArray, false, selectedIndex, startYear, startMonth, startDate);
      
      this.selectGoalsElms[1].addEventListener('change', function() {
        let inputWeeklyElms = that.inputAreaElms[2].querySelectorAll('input');
        let tempInputWeeklyValueArray = Array.from(inputWeeklyElms, elm => (elm.value) ? elm.value : '');
        let tempInputWeeklyValueArrayPeriod = Array.from(inputWeeklyElms, elm => (elm.value) ? elm.dataset.period : '');

        if(dimensionNumPeriod==3) {
          tempInputWeeklyArray[parseInt(selectedIndex[0])][parseInt(selectedIndex[1])] = tempInputWeeklyValueArray;
          tempInputWeeklyArrayPeriod[parseInt(selectedIndex[0])][parseInt(selectedIndex[1])] = tempInputWeeklyValueArrayPeriod;
        }
        else {
          tempInputWeeklyArray[selectedIndex] = tempInputWeeklyValueArray;
          tempInputWeeklyArrayPeriod[selectedIndex] = tempInputWeeklyValueArrayPeriod;
        }
  
        selectedIndex = (dimensionNumPeriod==3) ? this.value.split('-') : parseInt(this.value);
        startYear = (dimensionNumPeriod==3) ? that.currentSettingsData.monthlygoalsarrayperiod[parseInt(selectedIndex[0])][parseInt(selectedIndex[1])][0] : that.currentSettingsData.monthlygoalsarrayperiod[selectedIndex][0];
        startMonth = (dimensionNumPeriod==3) ? that.currentSettingsData.monthlygoalsarrayperiod[parseInt(selectedIndex[0])][parseInt(selectedIndex[1])][1] : that.currentSettingsData.monthlygoalsarrayperiod[selectedIndex][1];
    
        that.goalPeriodElms[2].textContent = getTextContent(startYear, startMonth, null);
        let targetStartDate = (selectedIndex==0 || selectedIndex[0]=='0' && selectedIndex[1]=='0') ? startDate : 1;
        that.getInputHtmlArray(tempInputWeeklyArray, false, selectedIndex, startYear, startMonth, targetStartDate);
        
        that.judgeDisabledForEventSettings3AndEventSettings4(3, false);
      });
    }

    this.judgeDisabledForEventSettings3AndEventSettings4(3, isOneMonthOrLess);

    this.backBtnElms[2].addEventListener('click', function() {
      let index = (isOneMonthOrLess) ? 0 : 2;
      navAndCommon.switchPage(index, that.settingsSectionElms);
    });

    this.saveAndNextBtnElms[3].addEventListener('click', function() {
      const inputElms = that.inputAreaElms[2].querySelectorAll('input');

      let inputArray = Array.from(inputElms, elm => elm.value);
      let inputArrayPeriod = Array.from(inputElms, elm => elm.dataset.period.split(','));

      that.currentSettingsData.weeklygoalsarray = (tempInputWeeklyArray[0]) ? tempInputWeeklyArray : inputArray;
      that.currentSettingsData.weeklygoalsarrayperiod = (tempInputWeeklyArrayPeriod[0]) ? tempInputWeeklyArrayPeriod : inputArrayPeriod;
      that.currentSettingsData.status = 4;

      that.saveAndNextData(4);
      that.setEventSettings5();
    });
  };

  Settings.prototype.setEventSettings5 = function() {

    let inputAreaHTML = '';
    const frequencyArray = ['毎日', '平日のみ', '土日のみ', 'カスタム'];
    const youbiArray = ['月', '火', '水', '木', '金', '土', '日'];
    const moveupArray = ['前倒しOK'];

    const getInputAreaHtmlSet = (aCnt) => {
      const getInputAreaHtml = (aLength, aArray, aPrefix, aCnt) => {
        let name = '';
        let inputType = 'checkbox';
        let className = 'p-2';

        if(aPrefix=='frequency') {
          name = ' name="frequency-' + aCnt + '"';
          inputType = 'radio';
          className = 'p-2 js-frequencyCheckbox';
        }
        else if(aPrefix=='youbi') {
          className = 'px-2 checkboxDisabled js-youbiCheckbox';
        }

        let result = `<div class="` + className + `">`;
          for(let cnt=0;cnt<aLength;++cnt) {
            result += `<div class="form-check form-check-inline">
            <input class="form-check-input" type="${inputType}"${name} id="${aPrefix}-${aCnt}-${cnt}" value="">
            <label class="form-check-label" for="${aPrefix}-${aCnt}-${cnt}">${aArray[cnt]}</label>
          </div>`;
          }
        result += `</div>`;

        return result;
      }

      let classNameAlert = (!aCnt) ? 'small text-danger d-none' : 'small text-danger d-none js-inputTodoAlertRequired';
      let className = (!aCnt) ? 'form-control mb-2' : 'form-control mb-2 js-inputTodoRequired';
      let result = `<span class="${classNameAlert}"></span>
        <input class="${className}" type="text" id="inputTodo${aCnt}">`;
      result += getInputAreaHtml(4, frequencyArray, 'frequency', aCnt);
      result += getInputAreaHtml(7, youbiArray, 'youbi', aCnt);
      result += getInputAreaHtml(1, moveupArray, 'moveup', aCnt);
      return result;
    };

    let addInputCnt = 3;
    for(let cnt=0;cnt<addInputCnt;++cnt) {
      inputAreaHTML += '<div class="border-bottom py-3">';
      inputAreaHTML += getInputAreaHtmlSet(cnt);
      inputAreaHTML += '</div>';
    }

    this.addGoalOptions(2);
    this.inputAreaElms[3].innerHTML = inputAreaHTML;

    const setRadioAndCheckbox = () => {
      const frequencyCheckboxElms = document.querySelectorAll('.js-frequencyCheckbox');
      const youbiCheckboxDivElms = document.querySelectorAll('.js-youbiCheckbox');
      frequencyCheckboxElms.forEach((elm, index) => {
        let radioInputElms = elm.querySelectorAll('input');
        radioInputElms.forEach((elm2, index2) => {
          elm2.addEventListener('change', function() {
            youbiCheckboxDivElms[index].classList.add('checkboxDisabled');
            if(index2==3) {
              youbiCheckboxDivElms[index].classList.remove('checkboxDisabled');
            }
            let youbiInputElms = youbiCheckboxDivElms[index].querySelectorAll('input');
            youbiInputElms.forEach((elm3, index3) => {
              elm3.checked = false;
              if(index2==0) {
                elm3.checked = true;
              }
              else if(index2==1 && index3!=5 && index3!=6) {
                elm3.checked = true;
              }
              else if(index2==2 && index3==5 || index2==2 && index3==6) {
                elm3.checked = true;
              }
            });
          });
        });
      });
    };

    setRadioAndCheckbox();

    const that = this;

    const addTodoInputBtnElm = document.querySelector('.js-addTodoInputBtn');
    addTodoInputBtnElm.addEventListener('click', function() {
      let divElm = document.createElement('div');
      divElm.className = 'border-bottom py-3';
      divElm.innerHTML = getInputAreaHtmlSet(addInputCnt);
      that.inputAreaElms[3].appendChild(divElm);
      ++addInputCnt;
      setRadioAndCheckbox();
    });

    let selectedIndex = Array(3).fill(0);
    let selectedPeriodArray = Array(4).fill('');
    let selectedPeriodText = '';

    const setSelectedPeriod = () => {
      const [index0, index1, index2] = selectedIndex;
      selectedPeriodArray = this.currentSettingsData.weeklygoalsarrayperiod[index0][index1][index2].split(',');
      selectedPeriodText = `${selectedPeriodArray[0]}/${selectedPeriodArray[1]}/${selectedPeriodArray[2]}から${selectedPeriodArray[0]}/${selectedPeriodArray[1]}/${selectedPeriodArray[3]}/までに達成したいこと`;
      this.goalPeriodElms[3].textContent = selectedPeriodText;
    };
    setSelectedPeriod();


    this.selectGoalsElms[2].addEventListener('change', function() {
      selectedIndex = this.value.split('-').map(Number);
      setSelectedPeriod();
    });


    const completeBtnElm = document.querySelector('.js-completeBtn');
    completeBtnElm.addEventListener('click', function() {
      that.currentSettingsData.status = 'complete';
    });
    
    this.backBtnElms[3].addEventListener('click', function() {
      navAndCommon.switchPage(3, that.settingsSectionElms);
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