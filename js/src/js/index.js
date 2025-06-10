(function() {
  'use strict';

  let navAndCommon, settings, todo;
  
  const NavAndCommon = function() {
    this.initialize.apply(this, arguments);
  };

  NavAndCommon.prototype.initialize = function() {
    let commonElms = this.commonElmsAndData();
    this.settingsData = commonElms[0];
    this.sectionElms = commonElms[1];
    this.settingsSectionElms = commonElms[2];
    this.rewardsData = commonElms[3];

    this.headerElm = document.querySelector('.js-header');
  };

  NavAndCommon.prototype.getDataFromLocalStorage = function(aName) {
    let data = new Map();
    let dataFromLocalStorage = localStorage.getItem(aName);
    if(dataFromLocalStorage!=='undefined') {
      const dataJson = JSON.parse(dataFromLocalStorage);
      data = new Map(dataJson);
    }
    return data;
  };

  NavAndCommon.prototype.commonElmsAndData = function() {
    let settingsData = this.getDataFromLocalStorage('goalManagementSettingsData');
    let sectionElms = document.querySelectorAll('.js-section');
    let settingsSectionElms = document.querySelectorAll('.js-settingsSection');
    let rewardsData = this.getDataFromLocalStorage('goalManagementRewardsData');
    let weeklyTodoData = this.getDataFromLocalStorage('goalManagementWeeklyTodoData');
    return [settingsData, sectionElms, settingsSectionElms, rewardsData, weeklyTodoData];
  };

  NavAndCommon.prototype.commonArray = function() {
    const frequencyArray = ['毎日', '平日のみ', '土日のみ', 'カスタム'];
    const youbiArray = ['月', '火', '水', '木', '金', '土', '日'];
    const othersArray = ['前倒しOK', '隔週'];
    return [ frequencyArray, youbiArray, othersArray ];
  };

  NavAndCommon.prototype.getDimensionNum = function(aObj) {
    if(!Array.isArray(aObj)) {
      return 0;
    }
    let max = 0;
    for (let cnt=0,len=aObj.length;cnt<len;++cnt) {
      max = Math.max(max, this.getDimensionNum(aObj[cnt]));
    }
    return ++max;
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
        if(sectionIndex[0][index]==0) {
          todo.getData();
          todo.displayTodoPage();
        }
      });
    });

    globalNavSettingsElms.forEach((elm, index) => {
      elm.addEventListener('click', function() {
        that.switchPage(1, that.sectionElms);
        that.switchPage(sectionIndex[1][index], that.settingsSectionElms);
        if(sectionIndex[1][index]==5) {
          settings.setEventSettings6();
        }
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
    this.rewardsData = commonElms[3];
    this.weeklyTodoData = commonElms[4];

    this.saveAndNextBtnElms = document.querySelectorAll('.js-saveAndNextBtn');
    this.inputGoalElms = document.querySelectorAll('.js-inputGoal');
    this.inputAlertElms = document.querySelectorAll('.js-inputAlert');
    this.id = 0;
    this.currentSettingsData = {};

    this.inputAreaElms = document.querySelectorAll('.js-inputArea');
    this.goalPeriodElms = document.querySelectorAll('.js-goalPeriod');
    this.backBtnElms = document.querySelectorAll('.js-backBtn');
    this.goalListElm = this.settingsSectionElms[0].querySelector('.js-goalList');

    this.selectGoalsElms = document.querySelectorAll('.js-selectGoals');//monthly, weekly

    this.startDateNumArray = Array(3).fill(0);
    this.endDateNumArray = Array(3).fill(0);

    this.defaultFrequencyArray = [false,false,false,false];
    this.defaultYoubiArray = [false,false,false,false,false,false,false];
    this.defaultOthersArray = [false,false];
  };

  Settings.prototype.saveAndNextData = function(aIndex) {
    this.settingsData.set(this.id, this.currentSettingsData);
    localStorage.setItem('goalManagementSettingsData', JSON.stringify([...this.settingsData]));

    navAndCommon.switchPage(aIndex, this.settingsSectionElms);
    this.displayGoalList();
    if(aIndex<4) {
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
        <div class="flex-grow-1 align-self-center">${val.goal}`;
        if(val.status!='complete') {
          goalListResult += ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cone-striped" viewBox="0 0 16 16">
            <path d="m9.97 4.88.953 3.811C10.159 8.878 9.14 9 8 9s-2.158-.122-2.923-.309L6.03 4.88C6.635 4.957 7.3 5 8 5s1.365-.043 1.97-.12m-.245-.978L8.97.88C8.718-.13 7.282-.13 7.03.88L6.275 3.9C6.8 3.965 7.382 4 8 4s1.2-.036 1.725-.098m4.396 8.613a.5.5 0 0 1 .037.96l-6 2a.5.5 0 0 1-.316 0l-6-2a.5.5 0 0 1 .037-.96l2.391-.598.565-2.257c.862.212 1.964.339 3.165.339s2.303-.127 3.165-.339l.565 2.257z"/>
          </svg>`;
        }
      goalListResult += `</div>
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
    this.deleteSettingBtnElms = document.querySelectorAll('.js-deleteSettingBtn');
  };

  Settings.prototype.setFormValidationForInput = function(aIndex, aInputElm) {
    let duplication = false;
    let isOkForGoal = (aIndex) ? true : false;
    let isOkForInput = false;
    const that = this;
    this.inputGoalElms[aIndex].addEventListener('keyup', function() {
      let thisValue = this.value.trim();
      let duplicationArrayTrueOrFalse = [...that.settingsData].map(val => (val[1].goal==thisValue) ? true : false);
      let duplication = duplicationArrayTrueOrFalse.some(val => val);
      if(!aIndex && duplication || aIndex && duplication && !duplicationArrayTrueOrFalse.at(-1)) {
        that.inputAlertElms[aIndex].textContent = '既に登録済みです';
        that.inputAlertElms[aIndex].classList.remove('d-none');
        this.classList.add('border-danger');
      }
      else {
        that.inputAlertElms[aIndex].textContent = '';
        that.inputAlertElms[aIndex].classList.add('d-none');
        this.classList.remove('border-danger');
      }
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
          let isDisabled = 0;
          aInputElm.forEach(elm=> {
            if(String(elm.value.trim())) {
              ++isDisabled;
            }
          });
          isOkForInput = ((isDisabled==aInputElm.length)) ? true : false;
          that.saveAndNextBtnElms[aIndex].disabled = (isOkForGoal && isOkForInput) ? false : true;
        });
      });
    }
  };

  Settings.prototype.getPeriodArrayForIndefinite = function() {
    const getDateString = (aPeriod, aDiff) => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const date = today.getDate();
      let array = [];
      if(aPeriod=='year') {
        if(!aDiff) {
          array.push(`${year}/${month}/${date}, ${year}/12/12`);
        }
        else {
          array.push(`${year+aDiff}/1/1, ${year+aDiff}/12/12`);
        }
        return array;
      }
      if(aPeriod=='month') {
        let firstMonth = (!aDiff) ? month : 1;
        for(let cnt=0;cnt<12;++cnt) {
          if((firstMonth+cnt)>12) {
            return array;
          }
          array.push([year+aDiff, firstMonth+cnt]);
        }
        return array;
      }
      if(aPeriod=='week') {
        for(let cnt=0;cnt<3;++cnt) {
          let newYear = (month+cnt>12) ? year+1 : year;
          let newMonth = (month+cnt>12) ? month+cnt-12 : month+cnt;
          let newDate = (!cnt) ? date : 1;
          let weekArray = this.getWeekArray(newYear, newMonth, newDate, true);
          array.push(weekArray);
        }
        return array;
      }
    };

    let annualPeriodArray = [];
    let monthlyPeriodArray = [];
    let weeklyPeriodArray = [];
    for(let cnt=0;cnt<3;++cnt) {
      annualPeriodArray.push(getDateString('year',cnt));
      monthlyPeriodArray.push(getDateString('month',cnt));
    }
    weeklyPeriodArray = getDateString('week',null);

    return [annualPeriodArray, monthlyPeriodArray, weeklyPeriodArray];
  };

  Settings.prototype.setRewardsData = function(aShortageArray) {

    let getPeriodArrayForIndefinite = this.getPeriodArrayForIndefinite();
    let annualPeriodArray = getPeriodArrayForIndefinite[0];
    let monthlyPeriodArray = getPeriodArrayForIndefinite[1];
    let weeklyPeriodArray = getPeriodArrayForIndefinite[2];

    const setNewRewardsData = (aVal, aPeriod) => {
      let newVal = {};

      newVal.goal = (!aVal) ? '全ての目標' : aVal.goal;
      newVal.period = (aPeriod) ? aPeriod : aVal.period;
      newVal.annualperiod = (aPeriod=='indefinite') ? annualPeriodArray : aVal.goalperiodarray;
      newVal.monthlyperiod = (aPeriod=='indefinite') ? monthlyPeriodArray : aVal.monthlygoalsarrayperiod;
      newVal.weeklyperiod = (aPeriod=='indefinite') ? weeklyPeriodArray : aVal.weeklygoalsarrayperiod;

      let annualLength = (newVal.annualperiod) ? newVal.annualperiod.length : 0;
      let monthlyLength = (newVal.monthlyperiod) ? newVal.monthlyperiod.length : 0;
      let weeklyLength = newVal.weeklyperiod.length;
      newVal.rewardsannual = {percent: Array(annualLength).fill(0), period: Array(annualLength).fill(''), rewards: Array(annualLength).fill('')};
      newVal.rewardsmonthly = {percent: Array(monthlyLength).fill(0), period: Array(monthlyLength).fill(''), rewards: Array(monthlyLength).fill('')};
      newVal.rewardsweekly = {percent: Array(weeklyLength).fill(0), period: Array(weeklyLength).fill(''), rewards: Array(weeklyLength).fill('')};
      return newVal;
    };

    if(aShortageArray) {
      return setNewRewardsData(aShortageArray[0], aShortageArray[1]);
    }

    this.rewardsData.clear();
    this.rewardsData.set(1000, setNewRewardsData('', 'indefinite'));
    this.settingsData.forEach((val, key) => {
      if(key && val && val.status=='complete') {
        this.rewardsData.set(key, setNewRewardsData(val, val.period[3]));
      }
    });

  };

  Settings.prototype.setEventSettings1 = function() {
    const inputElms = this.settingsSectionElms[0].querySelectorAll('.js-inputSettingsTop');
    const selectElm = this.settingsSectionElms[0].querySelector('select');
    this.deleteSettingBtnElms = document.querySelectorAll('.js-deleteSettingBtn');

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

      that.id = that.settingsData.size + 1;
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
      else if(nextPageIndex==4) {
        that.currentSettingsData.period[3] = 'indefinite';
        that.setEventSettings5();
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

    const sortData = (aData, aIsRewardsData) => {
      let newData = new Map();
      if(aIsRewardsData) {
        newData.set(1000, aData.get(1000));
      }
      let cnt = 1;
      aData.forEach((val, key) => {
        if(val && key!=1000) {
          newData.set(cnt, val);
          ++cnt;  
        }
      });
      return newData;
    };

    this.deleteSettingBtnElms.forEach(elm => {
      elm.addEventListener('click', function() {
        let keyToBeDeleted = parseInt(this.dataset.key);
        that.settingsData.delete(keyToBeDeleted);
        if(!that.rewardsData.size) {
          that.settingsData = sortData(that.settingsData, false);
          that.setRewardsData();
        }
        else {
          that.rewardsData.delete(keyToBeDeleted);
          that.settingsData.forEach((val, key) => {
            if(!that.rewardsData.get(key)) {
              that.rewardsData.set(key, that.setRewardsData([val, val.period[3]]));
            }
          });
          that.settingsData = sortData(that.settingsData, false);
          that.rewardsData = sortData(that.rewardsData, true);
        }

        if(!that.weeklyTodoData.size) {
          todo.setWeeklyTodoData();
        }
        else {
          that.weeklyTodoData.forEach((val, key) => {
            if(parseInt(val.originalKey)==keyToBeDeleted) {
              that.weeklyTodoData.delete(key);
            }
          });
          that.weeklyTodoData = sortData(that.weeklyTodoData, false);
        }

        localStorage.setItem('goalManagementSettingsData', JSON.stringify([...that.settingsData]));
        localStorage.setItem('goalManagementRewardsData', JSON.stringify([...that.rewardsData]));
        localStorage.setItem('goalManagementWeeklyTodoData', JSON.stringify([...that.weeklyTodoData]));
        that.displayGoalList();
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
    this.endDateNumArray = this.currentSettingsData.period[3].map(Number);

    let [dateY, dateM, dateD] = getDate;
    let date = `${dateY}/${dateM}/${dateD}`;
    return date;
  };

  Settings.prototype.setEventSettings2 = function() {//年間
    this.currentSettingsData = this.settingsData.get(this.id);

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
      let dimensionNum = navAndCommon.getDimensionNum(data);

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

  Settings.prototype.getWeekArray = function(aYear, aMonth, aDate, aIsRewards) {
    let daysOfTheYear = this.getDaysOfTheYear(aYear, aMonth);
    let theNumberOfDaysInAMonth = this.getTheNumberOfDaysInAMonth(aMonth, daysOfTheYear);

    const firstDayOfTheMonth = new Date(`${aYear}-0${aMonth}-0${aDate}`);
    let dayIndexOfFirstDayOfTheMonth = firstDayOfTheMonth.getDay();

    let addendArray = [1, 7, 6, 5, 4, 3, 2];
    let firstMonday = aDate + addendArray[dayIndexOfFirstDayOfTheMonth];

    let endDate = (aYear==this.endDateNumArray[0] && aMonth==this.endDateNumArray[1]) ? this.endDateNumArray[2] : theNumberOfDaysInAMonth;

    let weekArray = [];
    if((firstMonday-1)>=endDate) {
      weekArray[0] = aIsRewards ? [`${aYear},${aMonth},${aDate},${endDate}`] : [aDate, endDate];
      return weekArray;
    }
    weekArray[0] = aIsRewards ? [`${aYear},${aMonth},${aDate},${(firstMonday-1)}`] : [aDate, (firstMonday-1)];
    for(let cnt=0;cnt<=5;++cnt) {
      if((firstMonday+6)+7*cnt<=endDate) {
        weekArray[(cnt+1)] = aIsRewards ? [`${aYear},${aMonth},${firstMonday+7*cnt},${(firstMonday+6)+7*cnt}`] : [firstMonday+7*cnt, (firstMonday+6)+7*cnt];
      }
      else if((firstMonday)+7*cnt>endDate) {
        return weekArray;
      }
      else {
        weekArray[(cnt+1)] = aIsRewards ? [`${aYear},${aMonth},${firstMonday+7*cnt},${endDate}`] : [firstMonday+7*cnt, endDate];
        return weekArray;
      }
    }
  };


  Settings.prototype.getInputAreaHtmlSet = function(aCnt, aValue, aRadioCheckedArray, aCheckboxCheckedArray, aCheckboxCheckedArray2) {
    const commonArray = navAndCommon.commonArray();
    const frequencyArray = commonArray[0];
    const youbiArray = commonArray[1];
    const othersArray = commonArray[2];

    let customChecked = false;

    const getInputAreaHtml = (aLength, aArray, aPrefix, aCnt, aValue) => {
      
      let name = '';
      let inputType = 'checkbox';
      let className = 'p-2';
      let checkedArray = [];
      if(aPrefix=='frequency') {
        name = ' name="frequency-' + aCnt + '"';
        inputType = 'radio';
        className = 'p-2 js-frequencyCheckbox';
        checkedArray = aRadioCheckedArray;
      }
      else if(aPrefix=='youbi') {
        className = (customChecked) ? 'px-2 js-youbiCheckbox' : 'px-2 checkboxDisabled js-youbiCheckbox';
        checkedArray = aCheckboxCheckedArray;
      }
      else if(aPrefix=='others') {
        className = 'px-2 js-othersCheckbox';
        checkedArray = aCheckboxCheckedArray2;
      }

      let result = `<div class="` + className + `">`;
        for(let cnt=0;cnt<aLength;++cnt) {
          customChecked = (aPrefix=='frequency' && (checkedArray[3])) ? true : false;
          result += `<div class="form-check form-check-inline">
          <input class="form-check-input" type="${inputType}"${name} id="${aPrefix}-${aCnt}-${cnt}"${(checkedArray[cnt]==true)?' checked':''}>
          <label class="form-check-label" for="${aPrefix}-${aCnt}-${cnt}">${aArray[cnt]}</label>
        </div>`;//後で見直し※1
        }
      result += `</div>`;

      return result;
    }
    
    let classNameAlert = (!aCnt) ? 'small text-danger d-none' : 'small text-danger d-none js-inputTodoAlertRequired';
    let className = (!aCnt) ? 'form-control mb-2 js-inputTodo' : 'form-control mb-2 js-inputTodo js-inputTodoRequired';
    let result = `<span class="${classNameAlert}"></span>
      <input class="${className}" type="text" id="inputTodo${aCnt}" value="${(aValue)?aValue:''}">`;
    result += getInputAreaHtml(this.defaultFrequencyArray.length, frequencyArray, 'frequency', aCnt, aValue);
    result += getInputAreaHtml(this.defaultYoubiArray.length, youbiArray, 'youbi', aCnt, aValue);
    result += getInputAreaHtml(this.defaultOthersArray.length, othersArray, 'others', aCnt, aValue);
    return result;
  };


  Settings.prototype.getInputHtmlArray = function(aTempInputArray, aSectionIndex, aSelectedIndex, aYear, aMonth, aDate, aIsOnlyOneWeek, aLength, aTempRadioTodoArray, aTempCheckboxTodoArray, aTempCheckboxTodoArray2, aDimensionNum) {
    let resultArray = [];
    let startDateArray = [];
    let value = '';
    let year = 0;
    let month = 0;
    let date = aDate;
    let span = '';
    let requiredClass = '';

    if(aSectionIndex==1) {//monthly
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
    else if(aSectionIndex==2) {//weekly
      const getResultArray = (aDimension, aTempInputArray, aCnt, aCnt2, aWeekArray, aYear, aMonth, aStringYearAndMonth, aDate) => {
        let result = '';
        let date = aDate;
        
        aWeekArray.forEach((array, index) => {
          if(aDimension==3) {
            value = (aTempInputArray[aCnt][aCnt2] && aTempInputArray[aCnt][aCnt2][index]!=null) ? String(aTempInputArray[aCnt][aCnt2][index]).trim() : '';
            if(aIsOnlyOneWeek) {
              span = (!aCnt && !aCnt2 && !index) ? '<span class="text-danger">※</span>' : '';
              requiredClass = (!aCnt && !aCnt2 && !index) ? ' js-required' : '';  
            }
            else {
              span = (!aCnt && !aCnt2 && !index || !aCnt && !aCnt2 && index==1) ? '<span class="text-danger">※</span>' : '';
              requiredClass = (!aCnt && !aCnt2 && !index || !aCnt && !aCnt2 && index==1) ? ' js-required' : '';  
            }
          }
          else {
            value = (aTempInputArray[aCnt] && aTempInputArray[aCnt][index]!=null) ? String(aTempInputArray[aCnt][index]).trim() : '';
            if(aIsOnlyOneWeek) {
              span = (!aCnt && !index) ? '<span class="text-danger">※</span>' : '';
              requiredClass = (!aCnt && !index) ? ' js-required' : '';  
            }
            else {
              span = (!aCnt && !index || !aCnt && index==1) ? '<span class="text-danger">※</span>' : '';
              requiredClass = (!aCnt && !index || !aCnt && index==1) ? ' js-required' : '';  
            }
          }
          result += `<div class="p-2">
            <label for="inputWeekly${aCnt}-${index}">${aStringYearAndMonth}${array[0]}から${aStringYearAndMonth}${array[1]}の目標${span}</label>
            <input type="text" class="form-control my-2${requiredClass}" id="inputWeekly${aCnt}-${index}" value="${value}" data-period="${aYear},${aMonth},${array[0]},${array[1]}">
            </div>`;
        });

        return result;
      };

      this.currentSettingsData.monthlygoalsarray.forEach((arrayOrVal, index) => {
        year = aYear;
        month = aMonth;
        let stringYearAndMonth = `${year}/${month}/`;
        let weekArray = this.getWeekArray(year, month, date);
        resultArray[index] = [];
        if(Array.isArray(arrayOrVal)) {
          let array = arrayOrVal;
          array.forEach((val, index2) => {
            resultArray[index][index2] = (val) ? getResultArray(3, aTempInputArray, index, index2, weekArray, year, month, stringYearAndMonth, date) : '';
          });
        }
        else {
          let val = arrayOrVal;
          resultArray[index] = (val) ? getResultArray(2, aTempInputArray, index, null, weekArray, year, month, stringYearAndMonth, date) : '';
        }
      });
    }
    else { // todo

      const getResultArray = (aTempInputArray, aCnt, aCnt2, aCnt3, aYear, aMonth, aDate) => {
        let result = '';
        let date = aDate;
        let radioCheckedArray = [];
        let checkboxCheckedArray = [];
        let checkboxCheckedArray2 = [];
        
        for(let cnt=0;cnt<aLength;++cnt) {
          if(aDimensionNum==3) {//後で見直し※1
            value = (aTempInputArray[aCnt][aCnt2][aCnt3] && aTempInputArray[aCnt][aCnt2][aCnt3][cnt]!=null) ? String(aTempInputArray[aCnt][aCnt2][aCnt3][cnt]).trim() : '';
            radioCheckedArray = (aTempInputArray[aCnt][aCnt2][aCnt3] && aTempInputArray[aCnt][aCnt2][aCnt3][cnt]!=null) ? aTempRadioTodoArray[aCnt][aCnt2][aCnt3][cnt] : this.defaultFrequencyArray;
            checkboxCheckedArray = (aTempInputArray[aCnt][aCnt2][aCnt3] && aTempInputArray[aCnt][aCnt2][aCnt3][cnt]!=null) ? aTempCheckboxTodoArray[aCnt][aCnt2][aCnt3][cnt] : this.defaultYoubiArray;
            checkboxCheckedArray2 = (aTempInputArray[aCnt][aCnt2][aCnt3] && aTempInputArray[aCnt][aCnt2][aCnt3][cnt]!=null) ? aTempCheckboxTodoArray2[aCnt][aCnt2][aCnt3][cnt] : this.defaultOthersArray;
          }
          else if(aDimensionNum==2) {
            value = (aTempInputArray[aCnt][aCnt2] && aTempInputArray[aCnt][aCnt2][cnt]!=null) ? String(aTempInputArray[aCnt][aCnt2][cnt]).trim() : '';
            radioCheckedArray = (aTempInputArray[aCnt][aCnt2] && aTempInputArray[aCnt][aCnt2][cnt]!=null) ? aTempRadioTodoArray[aCnt][aCnt2][cnt] : this.defaultFrequencyArray;
            checkboxCheckedArray = (aTempInputArray[aCnt][aCnt2] && aTempInputArray[aCnt][aCnt2][cnt]!=null) ? aTempCheckboxTodoArray[aCnt][aCnt2][cnt] : this.defaultYoubiArray;
            checkboxCheckedArray2 = (aTempInputArray[aCnt][aCnt2] && aTempInputArray[aCnt][aCnt2][cnt]!=null) ? aTempCheckboxTodoArray2[aCnt][aCnt2][cnt] : this.defaultOthersArray;
          }
          else {
            value = (aTempInputArray[aCnt] && aTempInputArray[aCnt][cnt]!=null) ? String(aTempInputArray[aCnt][cnt]).trim() : '';
            radioCheckedArray = (aTempInputArray[aCnt] && aTempInputArray[aCnt][cnt]!=null) ? aTempRadioTodoArray[aCnt][cnt] : this.defaultFrequencyArray;
            checkboxCheckedArray = (aTempInputArray[aCnt] && aTempInputArray[aCnt][cnt]!=null) ? aTempCheckboxTodoArray[aCnt][cnt] : this.defaultYoubiArray;
            checkboxCheckedArray2 = (aTempInputArray[aCnt] && aTempInputArray[aCnt][cnt]!=null) ? aTempCheckboxTodoArray2[aCnt][cnt] : this.defaultOthersArray;
          }
          result += '<div class="border-bottom py-3">';
          result += this.getInputAreaHtmlSet(cnt, value, radioCheckedArray, checkboxCheckedArray, checkboxCheckedArray2);
          result += '</div>';
        }

        return result;
      };

      this.currentSettingsData.weeklygoalsarray.forEach((arrayOrVal, index) => {
        year = aYear;
        month = aMonth;
        resultArray[index] = [];
        if(aDimensionNum==3) {
          let array = arrayOrVal;
          array.forEach((array2, index2) => {
            resultArray[index][index2] = [];
            array2.forEach((val, index3) => {
              resultArray[index][index2][index3] = (val) ? getResultArray(aTempInputArray, index, index2, index3, year, month, date) : '';
            });
          });
        }
        else if(aDimensionNum==2) {
          let array = arrayOrVal;
          array.forEach((val, index2) => {
            resultArray[index][index2] = (val) ? getResultArray(aTempInputArray, index, index2, null, year, month, date) : '';
          });
        }
        else {
          let val = arrayOrVal;
          resultArray[index] = (val) ? getResultArray(aTempInputArray, index, null, year, month, date) : '';
        }
      });
    }
    
    if(aSectionIndex==3) {
      let selectedIndex = (!Array.isArray(aSelectedIndex)) ? [aSelectedIndex] : aSelectedIndex;
      this.inputAreaElms[aSectionIndex].innerHTML = selectedIndex.reduce((array, index) => array[index], resultArray);
    }
    else {
      this.inputAreaElms[aSectionIndex].innerHTML = (Array.isArray(aSelectedIndex)) ? resultArray[aSelectedIndex[0]][aSelectedIndex[1]] : resultArray[aSelectedIndex];
    }

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
          let isDisabled = 0;
          inputElms.forEach(elm=> {
            if(String(elm.value.trim())) {
              ++isDisabled;
            }
          })
          that.saveAndNextBtnElms[aIndex].disabled = (isDisabled==inputElms.length) ? false : true;
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

    let selectedIndex = 0;

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
        month = parseInt(startDateArray[1]) + cnt;
        year = (month>12) ? parseInt(startDateArray[0])+1 : parseInt(startDateArray[0]);
        month = (month>12) ? month-12 : month;
        span = (!cnt || cnt==1) ? '<span class="text-danger">※</span>' : '';
        requiredClass = (!cnt || cnt==1) ? ' js-required' : '';
        result += `<div class="p-2">
          <label for="inputMonthly${cnt}">${year}年${month}月の目標${span}</label>
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

      this.getInputHtmlArray(null, 1, selectedIndex, null, null, null, false);

      this.selectGoalsElms[0].addEventListener('change', function() {
        let inputMonthlyElms = that.inputAreaElms[1].querySelectorAll('input');

        let tempInputMonthlyValueArray = Array.from(inputMonthlyElms, elm => (elm.value) ? elm.value : '');//←↓ループが増えているのでforEachでpush等にするか後で検討：同パターンまとめるかどうかも検討
        let tempInputMonthlyValueArrayPeriod = Array.from(inputMonthlyElms, elm => (elm.value) ? elm.dataset.period.split(',') : []);
        
        tempInputMonthlyArray[selectedIndex] = tempInputMonthlyValueArray;
        tempInputMonthlyArrayPeriod[selectedIndex] = tempInputMonthlyValueArrayPeriod;

        selectedIndex = parseInt(this.value);
        that.goalPeriodElms[1].textContent = getTextContent(that.currentSettingsData.goalperiodarray[selectedIndex][0], that.currentSettingsData.goalperiodarray[selectedIndex][1]);

        that.getInputHtmlArray(tempInputMonthlyArray, 1, selectedIndex, null, null, null, false);
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

      if(tempInputMonthlyArray[0]) {
        tempInputMonthlyArray[selectedIndex] = inputArray;
        tempInputMonthlyArrayPeriod[selectedIndex] = inputArrayPeriod;  
      }

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
    let selectedIndex = 0;

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

    let isOnlyOneWeek = false;

    if(isOneMonthOrLess) {
      this.goalPeriodElms[2].textContent = getTextContent(startYear, startMonth, startDate, isOneMonthOrLessCustom);

      const getWeekDataResultArray = (aYear, aMonth, aDate, aIsTheFirst, aMoreRequired) => {
        let year = aYear;
        let month = aMonth;
        let date = (aIsTheFirst) ? aDate : 1;

        let weekArray = this.getWeekArray(year, month, date);
        let stringYearAndMonth = year + '/' + month + '/';
        let span = '';
        let requiredClass = '';

        let result = `<p class="px-2">${month}月</p>`;
        weekArray.forEach((array, index) => {
          if(aIsTheFirst) {
            if(weekArray>1) {
              span = (!index || index==1) ? '<span class="text-danger">※</span>' : '';
              requiredClass = (!index || index==1) ? ' js-required' : '';  
            }
            else {
              span = (!index) ? '<span class="text-danger">※</span>' : '';
              requiredClass = (!index) ? ' js-required' : '';  
            }
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

      let getResultArray = getWeekDataResultArray(startYear, startMonth, startDate, true, true);
      let result = getResultArray[0];
      if((this.endDateNumArray[1]-startMonth)==2 || (startMonth-this.endDateNumArray[1])==10) {
        let nextYearAndMonth = getNextYearAndMonth(startYear, startMonth);
        startYear = nextYearAndMonth[0];
        startMonth = nextYearAndMonth[1];
        getResultArray = getWeekDataResultArray(startYear, startMonth, startDate, false, getResultArray[1]);
        result += getResultArray[0];
      }
      if(this.endDateNumArray[0]!=startYear || (this.endDateNumArray[1]!=startMonth)) {
        getResultArray = getWeekDataResultArray(this.endDateNumArray[0], this.endDateNumArray[1], this.endDateNumArray[2], false, false);
        result += getResultArray[0];
      }

      this.inputAreaElms[2].innerHTML = result;

    }
    else {
      this.addGoalOptions(1);
      dimensionNumPeriod = navAndCommon.getDimensionNum(this.currentSettingsData.monthlygoalsarrayperiod);

      if(dimensionNumPeriod==3) {
        tempInputWeeklyArray = Array.from(this.currentSettingsData.monthlygoalsarrayperiod, () => []);
        tempInputWeeklyArrayPeriod = Array.from(this.currentSettingsData.monthlygoalsarrayperiod, () => []);
      }

      startYear = (dimensionNumPeriod==3) ? this.currentSettingsData.monthlygoalsarrayperiod[0][0][0] : this.currentSettingsData.monthlygoalsarrayperiod[0][0];
      startMonth = (dimensionNumPeriod==3) ? this.currentSettingsData.monthlygoalsarrayperiod[0][0][1] : this.currentSettingsData.monthlygoalsarrayperiod[0][1];

      this.goalPeriodElms[2].textContent = getTextContent(startYear, startMonth, null);

      selectedIndex = (dimensionNumPeriod==3) ? Array(2).fill(0) : 0;

      let firstWeek = that.getWeekArray(that.startDateNumArray[0], that.startDateNumArray[1], that.startDateNumArray[2]);
      isOnlyOneWeek = (selectedIndex[0]==0 && selectedIndex[1]==0 && firstWeek.length==1) ? true : false;
      this.getInputHtmlArray(tempInputWeeklyArray, 2, selectedIndex, startYear, startMonth, startDate, isOnlyOneWeek);

      this.selectGoalsElms[1].addEventListener('change', function() {
        let inputWeeklyElms = that.inputAreaElms[2].querySelectorAll('input');
        let tempInputWeeklyValueArray = Array.from(inputWeeklyElms, elm => (elm.value) ? elm.value : '');
        let tempInputWeeklyValueArrayPeriod = Array.from(inputWeeklyElms, elm => (elm.value) ? elm.dataset.period : '');

        if(dimensionNumPeriod==3) {
          tempInputWeeklyArray[selectedIndex[0]][selectedIndex[1]] = tempInputWeeklyValueArray;
          tempInputWeeklyArrayPeriod[selectedIndex[0]][selectedIndex[1]] = tempInputWeeklyValueArrayPeriod;
        }
        else {
          tempInputWeeklyArray[selectedIndex] = tempInputWeeklyValueArray;
          tempInputWeeklyArrayPeriod[selectedIndex] = tempInputWeeklyValueArrayPeriod;
        }

        selectedIndex = (dimensionNumPeriod==3) ? this.value.split('-').map(Number) : parseInt(this.value);
        startYear = (dimensionNumPeriod==3) ? that.currentSettingsData.monthlygoalsarrayperiod[selectedIndex[0]][selectedIndex[1]][0] : that.currentSettingsData.monthlygoalsarrayperiod[selectedIndex][0];
        startMonth = (dimensionNumPeriod==3) ? that.currentSettingsData.monthlygoalsarrayperiod[selectedIndex[0]][selectedIndex[1]][1] : that.currentSettingsData.monthlygoalsarrayperiod[selectedIndex][1];

        that.goalPeriodElms[2].textContent = getTextContent(startYear, startMonth, null);
        let targetStartDate = (selectedIndex==0 || selectedIndex[0]=='0' && selectedIndex[1]=='0') ? startDate : 1;
        that.getInputHtmlArray(tempInputWeeklyArray, 2, selectedIndex, startYear, startMonth, targetStartDate, isOnlyOneWeek);
        
        that.judgeDisabledForEventSettings3AndEventSettings4(3, false);
      });
    }

    this.judgeDisabledForEventSettings3AndEventSettings4(3, isOneMonthOrLess);

    this.backBtnElms[2].addEventListener('click', function() {
      let index = (isOneMonthOrLess) ? 0 : 2;
      navAndCommon.switchPage(index, that.settingsSectionElms);
    });

    this.saveAndNextBtnElms[3].addEventListener('click', function() {
      if(that.inputGoalElms[3].value.trim() && that.currentSettingsData.goal!=that.inputGoalElms[3].value.trim()) {
        that.currentSettingsData.goal = that.inputGoalElms[3].value.trim();
      }

      const inputElms = that.inputAreaElms[2].querySelectorAll('input');

      let inputArray = Array.from(inputElms, elm => elm.value);
      let inputArrayPeriod = Array.from(inputElms, elm => elm.dataset.period);

      if(tempInputWeeklyArray[0]) {
        if(dimensionNumPeriod==3) {
          tempInputWeeklyArray[selectedIndex[0]][selectedIndex[1]] = inputArray;
          tempInputWeeklyArrayPeriod[selectedIndex[0]][selectedIndex[1]] = inputArrayPeriod;  
        }
        else {
          tempInputWeeklyArray[selectedIndex] = inputArray;
          tempInputWeeklyArrayPeriod[selectedIndex] = inputArrayPeriod;    
        }
      }

      that.currentSettingsData.weeklygoalsarray = (tempInputWeeklyArray[0]) ? tempInputWeeklyArray : inputArray;
      that.currentSettingsData.weeklygoalsarrayperiod = (tempInputWeeklyArrayPeriod[0]) ? tempInputWeeklyArrayPeriod : inputArrayPeriod;
      that.currentSettingsData.status = 4;

      that.saveAndNextData(4);
      that.setEventSettings5();
    });
  };


  Settings.prototype.setEventSettings5 = function() {//todo

    const completeBtnElm = document.querySelector('.js-completeBtn');
    let isInputOk = false;
    let isYoubiOk = false;
    let dimensionNum = 0;
    let selectedIndex = 0;

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
                isYoubiOk = true;
              }
              else if(index2==1 && index3!=5 && index3!=6) {
                elm3.checked = true;
                isYoubiOk = true;
              }
              else if(index2==2 && index3==5 || index2==2 && index3==6) {
                elm3.checked = true;
                isYoubiOk = true;
              }
              else if(index2==3) {
                isYoubiOk = false;
              }
            });
            completeBtnElm.disabled = (isInputOk && isYoubiOk) ? false : true;
          });
        });
      });
    };

    const setEventForCompleteBtn = () => {
      const inputTodoElms = this.inputAreaElms[3].querySelectorAll('.js-inputTodo');
      const youbiCheckboxElms = this.inputAreaElms[3].querySelectorAll('.js-youbiCheckbox');
      const frequencyCheckboxElms = this.inputAreaElms[3].querySelectorAll('.js-frequencyCheckbox');

      let isInputOkArray = Array(inputTodoElms.length).fill(false);

      const judgeDisabled = (aIndex) => {
        isInputOkArray = [...inputTodoElms].map(input => {
          return (String(input.value).trim() ? true : false);
        });

        isInputOk = isInputOkArray.some(input => input);
        if(isInputOk) {
          isInputOkArray.forEach(val => {
            if(val) {
              let youbiCheckboxInputElms = youbiCheckboxElms[aIndex].querySelectorAll('input');
              isYoubiOk = [...youbiCheckboxInputElms].some(input=>input.checked);
            }
          });
        }

        completeBtnElm.disabled = (isInputOk && isYoubiOk) ? false : true;

      };

      inputTodoElms.forEach((elm, index) => {
        elm.addEventListener('keyup', function() {
          judgeDisabled(index);
        });
      });

      youbiCheckboxElms.forEach((elm, index) => {
        let youbiCheckboxInputElms = elm.querySelectorAll('input');
        youbiCheckboxInputElms.forEach(elm2 => {
          elm2.addEventListener('click', function() {
            judgeDisabled(index);
          });
        });
      });
    };

    let tempInputTodoArray = [];
    let tempRadioTodoArray = [];
    let tempCheckboxTodoArray = [];
    let tempCheckboxTodoArray2 = [];

    const getTempData = (aInputTodoElms, aRadioTodoDivElms, aCheckboxTodoDivElms, aCheckboxTodoDivElms2) => {
      let tempInputTodoValueArray = Array.from(aInputTodoElms, elm => (elm.value) ? elm.value : '');

      const getTempDataArray = (aDivElms) => {
        let tempDataArray = Array(aDivElms.length);
        aDivElms.forEach((elm, index) => {
          let elms = elm.querySelectorAll('input');
          tempDataArray[index] = [...elms].map(input => input.checked ? true : false);
        });
        return tempDataArray;
      };

      let tempRadioTodoCheckedArray =  getTempDataArray(aRadioTodoDivElms);
      let tempCheckboxTodoCheckedArray =  getTempDataArray(aCheckboxTodoDivElms);
      let tempCheckboxTodoCheckedArray2 =  getTempDataArray(aCheckboxTodoDivElms2);

      return [tempInputTodoValueArray, tempRadioTodoCheckedArray, tempCheckboxTodoCheckedArray, tempCheckboxTodoCheckedArray2];
    };

    if(!this.currentSettingsData.weeklygoalsarrayperiod) {//期間なし

      this.selectGoalsElms[2].innerHTML = `<option value="${this.currentSettingsData.goal}">${this.currentSettingsData.goal}</option>`;

      let result = '';
      for(let cnt=0;cnt<3;++cnt) {
        result += '<div class="border-bottom py-3">';
        result += this.getInputAreaHtmlSet(cnt, '', this.defaultFrequencyArray, this.defaultYoubiArray, this.defaultOthersArray);
        result += '</div>';  
      }
      this.inputAreaElms[3].innerHTML = result;

    }
    else {

      dimensionNum = navAndCommon.getDimensionNum(this.currentSettingsData.weeklygoalsarrayperiod);
      selectedIndex = (dimensionNum>1) ? Array(dimensionNum).fill(0) : 0;
      let selectedPeriodArray = Array(dimensionNum).fill('');
      let selectedPeriodText = '';
      
      const setSelectedPeriod = (aSelectedIndex) => {
        let selectedPeriodValue = (Array.isArray(aSelectedIndex)) ? aSelectedIndex.reduce((accumulator, currentIndex) => accumulator[currentIndex], this.currentSettingsData.weeklygoalsarrayperiod) : this.currentSettingsData.weeklygoalsarrayperiod[aSelectedIndex];
        selectedPeriodArray = selectedPeriodValue.split(',');
  
        selectedPeriodText = `${selectedPeriodArray[0]}/${selectedPeriodArray[1]}/${selectedPeriodArray[2]}から${selectedPeriodArray[0]}/${selectedPeriodArray[1]}/${selectedPeriodArray[3]}までに達成したいこと`;
        this.goalPeriodElms[3].textContent = selectedPeriodText;
        return selectedPeriodArray;
      };
      setSelectedPeriod(selectedIndex);
  
      let [startYear, startMonth, startDate] = this.startDateNumArray;
    
      const that = this;
  
      this.addGoalOptions(2);
  
      if(dimensionNum==3) {
        const length1 = this.currentSettingsData.weeklygoalsarrayperiod.length;
        const length2 = 12;
        const length3 = 6;

        tempInputTodoArray = Array.from({length: length1}, () =>
          Array.from({length: length2}, () =>
            Array.from({length: length3}, () => undefined)
          )
        );
        
        const getNewArray = (aArray) => {
          return Array.from({length: length1}, () =>
            Array.from({length: length2}, () => aArray)
          );
        };

        tempRadioTodoArray = getNewArray(this.defaultFrequencyArray);
        tempCheckboxTodoArray = getNewArray(this.defaultYoubiArray);
        tempCheckboxTodoArray2 = getNewArray(this.defaultOthersArray);
      }
      else if(dimensionNum==2) {
        tempInputTodoArray = Array.from(this.currentSettingsData.weeklygoalsarrayperiod, () => []);
        tempRadioTodoArray = Array.from(this.currentSettingsData.weeklygoalsarrayperiod, () => this.defaultFrequencyArray);
        tempCheckboxTodoArray = Array.from(this.currentSettingsData.weeklygoalsarrayperiod, () => this.defaultYoubiArray);
        tempCheckboxTodoArray2 = Array.from(this.currentSettingsData.weeklygoalsarrayperiod, () => this.defaultOthersArray);
      }

      this.getInputHtmlArray(tempInputTodoArray, 3, selectedIndex, startYear, startMonth, startDate, null, 3, tempRadioTodoArray, tempCheckboxTodoArray, tempCheckboxTodoArray2, dimensionNum);

      this.selectGoalsElms[2].addEventListener('change', function() {
        let inputTodoElms = that.inputAreaElms[3].querySelectorAll('.js-inputTodo');
        let radioTodoDivElms = that.inputAreaElms[3].querySelectorAll('.js-frequencyCheckbox');
        let checkboxTodoDivElms = that.inputAreaElms[3].querySelectorAll('.js-youbiCheckbox');
        let checkboxTodoDivElms2 = that.inputAreaElms[3].querySelectorAll('.js-othersCheckbox');

        const tempData = getTempData(inputTodoElms, radioTodoDivElms, checkboxTodoDivElms, checkboxTodoDivElms2);

        if(dimensionNum==3) {
          tempInputTodoArray[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[0];
          tempRadioTodoArray[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[1];
          tempCheckboxTodoArray[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[2];
          tempCheckboxTodoArray2[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[3];
        }
        else if(dimensionNum==2) {
          tempInputTodoArray[selectedIndex[0]][selectedIndex[1]] = tempData[0];
          tempRadioTodoArray[selectedIndex[0]][selectedIndex[1]] = tempData[1];
          tempCheckboxTodoArray[selectedIndex[0]][selectedIndex[1]] = tempData[2];
          tempCheckboxTodoArray2[selectedIndex[0]][selectedIndex[1]] = tempData[3];
        }
        else {
          tempInputTodoArray[selectedIndex] = tempData[0];
          tempRadioTodoArray[selectedIndex] = tempData[1];
          tempCheckboxTodoArray[selectedIndex] = tempData[2];
          tempCheckboxTodoArray2[selectedIndex] = tempData[3];
        }
  
        selectedIndex = (dimensionNum>1) ? this.value.split('-').map(Number) : parseInt(this.value);
        let startYearAndMonth = setSelectedPeriod(selectedIndex);
  
        startYear = startYearAndMonth[0];
        startMonth = startYearAndMonth[1];

        let targetStartDate = (selectedIndex==0 || selectedIndex[0]=='0' && selectedIndex[1]=='0' || selectedIndex[0]=='0' && selectedIndex[1]=='0' && selectedIndex[2]=='0') ? startDate : 1;
        that.getInputHtmlArray(tempInputTodoArray, 3, selectedIndex, startYear, startMonth, targetStartDate, null, inputTodoElms.length, tempRadioTodoArray, tempCheckboxTodoArray, tempCheckboxTodoArray2, dimensionNum);

        if(selectedIndex==0 || selectedIndex[0]=='0' && selectedIndex[1]=='0' || selectedIndex[0]=='0' && selectedIndex[1]=='0' && selectedIndex[2]=='0') {
          setEventForCompleteBtn();
        }
        setRadioAndCheckbox();

      });
    }

    setEventForCompleteBtn();
    setRadioAndCheckbox();

    const that = this;
    let addInputCnt = 3;
    const addTodoInputBtnElm = document.querySelector('.js-addTodoInputBtn');
    addTodoInputBtnElm.addEventListener('click', function() {
      let divElm = document.createElement('div');
      divElm.className = 'border-bottom py-3';
      divElm.innerHTML = that.getInputAreaHtmlSet(addInputCnt, '', that.defaultFrequencyArray, that.defaultYoubiArray, that.defaultOthersArray);
      that.inputAreaElms[3].appendChild(divElm);
      ++addInputCnt;
      setRadioAndCheckbox();
      setEventForCompleteBtn();
    });

    this.backBtnElms[3].addEventListener('click', function() {
      let index = (!that.currentSettingsData.weeklygoalsarrayperiod) ? 0 : 3;
      navAndCommon.switchPage(index, that.settingsSectionElms);
    });

    completeBtnElm.addEventListener('click', function() {

      selectedIndex = (dimensionNum>1) ? that.selectGoalsElms[2].value.split('-').map(Number) : parseInt(that.selectGoalsElms[2].value);

      let inputTodoElms = that.inputAreaElms[3].querySelectorAll('.js-inputTodo');
      let radioTodoDivElms = that.inputAreaElms[3].querySelectorAll('.js-frequencyCheckbox');
      let checkboxTodoDivElms = that.inputAreaElms[3].querySelectorAll('.js-youbiCheckbox');
      let checkboxTodoDivElms2 = that.inputAreaElms[3].querySelectorAll('.js-othersCheckbox');

      const tempData = getTempData(inputTodoElms, radioTodoDivElms, checkboxTodoDivElms, checkboxTodoDivElms2);

      if(!that.currentSettingsData.weeklygoalsarrayperiod) {
        tempInputTodoArray = tempData[0];
        tempRadioTodoArray = tempData[1];
        tempCheckboxTodoArray = tempData[2];
        tempCheckboxTodoArray2 = tempData[3];
      }
      else {
        if(dimensionNum==3) {
          tempInputTodoArray[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[0];
          tempRadioTodoArray[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[1];
          tempCheckboxTodoArray[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[2];
          tempCheckboxTodoArray2[selectedIndex[0]][selectedIndex[1]][selectedIndex[2]] = tempData[3];
        }
        else if(dimensionNum==2) {
          tempInputTodoArray[selectedIndex[0]][selectedIndex[1]] = tempData[0];
          tempRadioTodoArray[selectedIndex[0]][selectedIndex[1]] = tempData[1];
          tempCheckboxTodoArray[selectedIndex[0]][selectedIndex[1]] = tempData[2];
          tempCheckboxTodoArray2[selectedIndex[0]][selectedIndex[1]] = tempData[3];
        }
        else {
          tempInputTodoArray[selectedIndex] = tempData[0];
          tempRadioTodoArray[selectedIndex] = tempData[1];
          tempCheckboxTodoArray[selectedIndex] = tempData[2];
          tempCheckboxTodoArray2[selectedIndex] = tempData[3];
        }  
      }

      let inputArrays = [];
      
      if(!that.currentSettingsData.weeklygoalsarrayperiod) {
        tempInputTodoArray.forEach((val, index) => {
          if(val && tempCheckboxTodoArray[index]) {
            let todoData = {
              period: 'indefinite',
              todo: val,
              frequency: tempRadioTodoArray[index],
              youbi: tempCheckboxTodoArray[index],
              others: tempCheckboxTodoArray2[index]
            };
            inputArrays.push(todoData);
          }
        });
      }
      else {
        if(dimensionNum>1) {
          tempInputTodoArray.forEach((array, index) => {
            array.forEach((array2, index2) => {
              array2.forEach((val, index3) => {
                if(val && tempCheckboxTodoArray[index][index2][index3]) {
                  let todoData = {
                    period: (dimensionNum==3) ? that.currentSettingsData.weeklygoalsarrayperiod[index][index2][index3] : that.currentSettingsData.weeklygoalsarrayperiod[index][index2],
                    todo: val,
                    frequency: tempRadioTodoArray[index][index2][index3],
                    youbi: tempCheckboxTodoArray[index][index2][index3],
                    others: tempCheckboxTodoArray2[index][index2][index3]
                  };
                  inputArrays.push(todoData);
                }
              });
            });
          });
        }
        else {
          tempInputTodoArray.forEach((array, index) => {
            array.forEach((val, index2) => {
              if(val && tempCheckboxTodoArray[index][index2]) {
                let todoData = {
                  period: that.currentSettingsData.weeklygoalsarrayperiod[index],
                  todo: val,
                  frequency: tempRadioTodoArray[index][index2],
                  youbi: tempCheckboxTodoArray[index][index2],
                  others: tempCheckboxTodoArray2[index][index2]
                };
                inputArrays.push(todoData);
              }
            });
          });
        }
      }

      that.currentSettingsData.todoarray = inputArrays;
      that.currentSettingsData.status = 'complete';
  
      that.saveAndNextData(5);
      that.setEventSettings6();
    });
  };


  Settings.prototype.setEventSettings6 = function() {//ご褒美

    this.settingData = navAndCommon.getDataFromLocalStorage('goalManagementSettingsData');
    this.rewardsData = navAndCommon.getDataFromLocalStorage('goalManagementRewardsData');
    this.currentRewardsData = {};

    const selectRewardsElm = document.querySelector('.js-selectRewards');
    const formAreaRewardsElm = document.querySelector('.js-formAreaRewards');

    const cancelChangesBtnElm = document.querySelector('.js-cancelChangesBtn');
    const saveRewardsBtnElm = document.querySelector('.js-saveRewardsBtn');

    const getFormHTML = (aPeriodData, aIndex, aIsIndefinite) => {
      let index = -1;

      const getOptionHTML = (aArrayOrVal) => {
        let dimensionNum = navAndCommon.getDimensionNum(aArrayOrVal);
        let newVal = '';
        if(aIndex==2 && !Array.isArray(aArrayOrVal)) {//週
          let val = (aArrayOrVal) ? aArrayOrVal.replace(',','年').replace(',','月').replace(',','日〜') : '';
          newVal = (val) ? `<option value="${aArrayOrVal}" data-index="${++index}">${val}日</option>` : '';
          return newVal;
        }
        else if(dimensionNum==1) {
          if(!aIndex) {//年
            if(aIsIndefinite) {
              newVal = (aArrayOrVal) ? `<option value="${aArrayOrVal}" data-index="${++index}">${aArrayOrVal[0].substring(0, 4)}年</option>` : '';
            }
            else {
              let start = (aArrayOrVal[0]) ? aArrayOrVal[0].replace('/','年').replace('/','月') : '';
              let end = (aArrayOrVal[1]) ? aArrayOrVal[1].replace('/','年').replace('/','月') : '';
              newVal = (start && end) ? `<option value="$aArrayOrVal" data-index="${++index}">${start}日〜${end}日</option>` : '';
            }
            return newVal;
          }
          else if(aIndex==1) {//月
            newVal = (aArrayOrVal[0] && aArrayOrVal[1]) ? `<option value="${aArrayOrVal}" data-index="${++index}">${aArrayOrVal[0]}年${aArrayOrVal[1]}月</option>` : '';
            return newVal;
          }
        }
        return aArrayOrVal.map(arrayOrVal => getOptionHTML(arrayOrVal)).join('');
      };

      let optionHTML = getOptionHTML(aPeriodData);

      let result = `<div class="border-bottom mt-5 mb-3 pb-3 js-rewardsDiv">
        <div class="row d-flex align-items-center">
          <div class="col-8">
            <select name="" id="period-${aIndex}" class="form-select">${optionHTML}</select>
          </div>
          <div class="col-4">のご褒美</div>
        </div>
        <div class="js-rewardsInput"></div>
        
      </div>`;
        return result;
    };

    const getInputHtml = (aIndex, aIndex2) => {
      let rewardsInputDataArray = [this.currentRewardsData.rewardsannual, this.currentRewardsData.rewardsmonthly, this.currentRewardsData.rewardsweekly];
      let textareaData = rewardsInputDataArray[aIndex].rewards;
      let inputData = rewardsInputDataArray[aIndex].percent;

      return `<div class="row my-2 d-flex align-items-center">
        <div class="row my-2 p-3">
          <textarea name="" id="rewards-${aIndex}" class="form-control" rows="5">${textareaData[aIndex2]}</textarea>
        </div>
        <div class="col">
          todo達成率
        </div>
        <div class="col">
          <input type="text" name="" id="percent-${aIndex}" class="form-control" value="${inputData[aIndex2]}">
        </div>
        <div class="col">
          %以上でご褒美獲得
        </div>
      </div>`;
    };

    let periodArrayForIndefinite = this.getPeriodArrayForIndefinite();

    if(!this.rewardsData.size) {
      this.setRewardsData();
    }
    else {
      this.settingsData.forEach((val, key) => {
        if(!this.rewardsData.get(key)) {
          this.rewardsData.set(key, this.setRewardsData([val, val.period[3]]));
        }
      });
    }

    let rewardsDataForEdit = new Map(
      Array.from(this.rewardsData, ([key, value]) => [key, JSON.parse(JSON.stringify(value))])
    );

    const getResultHTML = (aPeriodArray, aIsIndefinite) => {
      let result = '';
      aPeriodArray.forEach((val, index) => {
        if(val) {
          result += getFormHTML(val, index, aIsIndefinite);
        }
      });
      return result;
    };

    // reset to its initial state
    let rewardsInput = document.querySelectorAll('.js-rewardsInput');
    
    const setInitialState = () => {
      cancelChangesBtnElm.disabled = true;
      saveRewardsBtnElm.disabled = true;
      let optionHTML = '';
      rewardsDataForEdit.forEach((val, key) => {
        if(val) {
          optionHTML += `<option value="${key}">${val.goal}</option>`;
        }
      });
      selectRewardsElm.innerHTML = optionHTML;

      formAreaRewardsElm.innerHTML = getResultHTML(periodArrayForIndefinite, true);//全ての目標

      rewardsInput = document.querySelectorAll('.js-rewardsInput');
  
      for(let cnt=0,len=rewardsInput.length;cnt<len;++cnt) {
        rewardsInput[cnt].innerHTML = getInputHtml(cnt, 0);
      }
    };

    this.currentId = 1000;
    this.currentRewardsData = rewardsDataForEdit.get(this.currentId);
    setInitialState();

    const that = this;

    let selectElms = formAreaRewardsElm.querySelectorAll('select');

    const setEventSelectPeriod = (aRewardsInput) => {
      selectElms.forEach((elm, index) => {
        elm.addEventListener('change', function() {
          let selectedOption = this.options[this.selectedIndex];
          let selectedOptionIndex = selectedOption.dataset.index;

          if(aRewardsInput.length==1) {
            rewardsInput[index].innerHTML = getInputHtml((index+2), selectedOptionIndex); 
          }
          else if(aRewardsInput.length==2) {
            rewardsInput[index].innerHTML = getInputHtml((index+1), selectedOptionIndex);
          }
          else {
            rewardsInput[index].innerHTML = getInputHtml(index, selectedOptionIndex);
          }
          setEventForStoreNewDataForSave();
        });
      });
    };

    selectRewardsElm.addEventListener('change', function() {
      that.currentId = parseInt(this.value);
      that.currentRewardsData = rewardsDataForEdit.get(that.currentId);
      let isIndefinite = (that.currentRewardsData.period=='indefinite') ? true : false;
      let periodArray = [that.currentRewardsData.annualperiod, that.currentRewardsData.monthlyperiod, that.currentRewardsData.weeklyperiod];
      let result = getResultHTML(periodArray, isIndefinite);

      formAreaRewardsElm.innerHTML = result;
      
      rewardsInput = document.querySelectorAll('.js-rewardsInput');

      // initial
      if(rewardsInput.length==1) {
        rewardsInput[0].innerHTML = getInputHtml(2, 0); 
      }
      else if(rewardsInput.length==2) {
        rewardsInput[0].innerHTML = getInputHtml(1, 0); 
        rewardsInput[1].innerHTML = getInputHtml(2, 0); 
      }
      else {
        for(let cnt=0,len=rewardsInput.length;cnt<len;++cnt) {
          rewardsInput[cnt].innerHTML = getInputHtml(cnt, 0);      
        }
      }

      selectElms = formAreaRewardsElm.querySelectorAll('select');
      setEventSelectPeriod(rewardsInput);
      setEventForStoreNewDataForSave();
    });

    setEventSelectPeriod(rewardsInput);

    const storeNewDataForSave = () => {
      let rewardsDivElms = document.querySelectorAll('.js-rewardsDiv');
      let rewardsInputDataArray = [that.currentRewardsData.rewardsannual, that.currentRewardsData.rewardsmonthly, that.currentRewardsData.rewardsweekly];

      const getAndStoreValuesInTheCurrentData = (aIndex, aIndex2) => {

        let textareaElm = rewardsDivElms[aIndex].querySelector('textarea');
        let inputElm = rewardsDivElms[aIndex].querySelector('input');
        let selectElm = rewardsDivElms[aIndex].querySelector('select');
        let selectOptionElms = rewardsDivElms[aIndex].querySelectorAll('select option');
        let selectOptionElmsLength = selectOptionElms.length;

        let selectedOption = selectElm.options[selectElm.selectedIndex];
        let selectedOptionIndex = selectedOption.dataset.index;

        rewardsInputDataArray[aIndex2].rewards[selectedOptionIndex] = textareaElm.value;
        rewardsInputDataArray[aIndex2].percent[selectedOptionIndex] = parseInt(inputElm.value);
        rewardsInputDataArray[aIndex2].period[selectedOptionIndex] = selectElm.value;
      };

      let dataArray = Array(3);
      if(rewardsDivElms.length==3) {
        getAndStoreValuesInTheCurrentData(0, 0);
        getAndStoreValuesInTheCurrentData(1 ,1);
        getAndStoreValuesInTheCurrentData(2, 2);
      }
      else if(rewardsDivElms.length==2) {
        getAndStoreValuesInTheCurrentData(0, 1);
        getAndStoreValuesInTheCurrentData(1, 2)
      }
      else {
        getAndStoreValuesInTheCurrentData(0, 2);
      }

      rewardsDataForEdit.set(that.currentId, that.currentRewardsData);

    };

    const judgeDisabledForBtns = () => {//後で見直し
      if(this.rewardsData.size!=rewardsDataForEdit.size) {
        return false;
      }

      for (const [key, value] of this.rewardsData) {
        if (!rewardsDataForEdit.has(key) || rewardsDataForEdit.get(key)!==value) {
          return false;
        }
      }

      return true;
    };

    const setEventForStoreNewDataForSave = () => {
      let textareaElms = document.querySelectorAll('.js-formAreaRewards textarea');
      let inputElms = document.querySelectorAll('.js-formAreaRewards input');

      const setEvent = (aElms) => {
        aElms.forEach(elm => {
          elm.addEventListener('keyup', function() {
            storeNewDataForSave();
            cancelChangesBtnElm.disabled = judgeDisabledForBtns();
            saveRewardsBtnElm.disabled = judgeDisabledForBtns();
          });
        });
      };

      setEvent(textareaElms);
      setEvent(inputElms);
    };

    setEventForStoreNewDataForSave();

    cancelChangesBtnElm.addEventListener('click', function() {
      let rewardsDataForEdit = new Map(
        Array.from(that.rewardsData, ([key, value]) => [key, JSON.parse(JSON.stringify(value))])
      );

      // reset to its initial state
      that.currentId = 1000;
      that.currentRewardsData = rewardsDataForEdit.get(that.currentId);
      setInitialState();

    });

    saveRewardsBtnElm.addEventListener('click', function() {
      that.currentId = parseInt(selectRewardsElm.value);
      that.currentRewardsData = rewardsDataForEdit.get(that.currentId);

      storeNewDataForSave();

      that.rewardsData = new Map(
        Array.from(rewardsDataForEdit, ([key, value]) => [key, JSON.parse(JSON.stringify(value))])
      );
      localStorage.setItem('goalManagementRewardsData', JSON.stringify([...that.rewardsData]));
      
      // reset to its initial state
      that.currentId = 1000;
      that.currentRewardsData = rewardsDataForEdit.get(that.currentId);
      setInitialState();

      navAndCommon.switchPage(0, that.sectionElms);
    });
  };

  Settings.prototype.setEvent = function() {
    this.setEventSettings1();
    this.setEventSettings6();
  };

  Settings.prototype.run = function() {
    this.setEvent();
  };


  const Todo = function() {
    this.initialize.apply(this, arguments);
  };

  Todo.prototype.initialize = function() {
    this.getData();
  };

  Todo.prototype.getData = function() {
    this.settingData = navAndCommon.getDataFromLocalStorage('goalManagementSettingsData');
    this.rewardsData = navAndCommon.getDataFromLocalStorage('goalManagementRewardsData');

    this.weeklyTodoData = navAndCommon.getDataFromLocalStorage('goalManagementWeeklyTodoData');
    if(!this.weeklyTodoData.size) {
      this.setWeeklyTodoData();
    }
  };

  Todo.prototype.setWeeklyTodoData = function() {
    let cnt = 0;
    this.settingData.forEach((val, key) => {
      if(val.status=='complete') {
        val.todoarray.forEach((array, index)=> {
          if(array.period=='indefinite') {

          }
          else {
            let periodArray = array.period.split(',').map(Number);
            let stringHead = `${periodArray[0]}-${periodArray[1]}`;
            let arrayLength = periodArray[3] - periodArray[2] + 1;
            let stringArray = Array(arrayLength);
            let stringArrayForDisplay = Array(arrayLength);
            for(let cnt=0;cnt<arrayLength;++cnt) {
              stringArray[cnt] = `${stringHead}-${periodArray[2]+cnt}`;
              stringArrayForDisplay[cnt] = `${periodArray[1]}/${periodArray[2]+cnt}`;
            }
            
            let todoArray = Array.isArray(array.todo) ? array.todo : [array.todo];
            let optionArray = Array.isArray(array.others) ? array.others : [array.others];
            let dimensionNum = navAndCommon.getDimensionNum(array.youbi);

            todoArray.forEach((val2, index2)=> {
              let value = {
                todo: val2,
                goal: val.goal,
                period: array.period,
                youbiArray: (dimensionNum>1) ? array.youbi[index2] : array.youbi,
                option: optionArray[index2],
                arrayIndex: index,
                originalKey: key,
                isAchievedArray: Object.fromEntries(stringArray.map(key => [key, false])),
                stringArray: stringArray,
                stringArrayForDisplay: stringArrayForDisplay
              };
              this.weeklyTodoData.set(++cnt, value);    
            });
          }
        });
      }
    });
  };

  Todo.prototype.getDate = function() {
    let now = new Date();
    let dateY = now.getFullYear();
    let dateM = now.getMonth() + 1;
    let dateD = now.getDate();
    let youbi = now.getDay();
    return [dateY, dateM, dateD, youbi];
  };

  Todo.prototype.displayTodoPage = function() {
    const todaysTodoAreaElm = document.querySelector('.js-todaysTodoArea');
    const notAchievedTodoAreaElm = document.querySelector('.js-notAchievedTodoArea');
    const doneTodoAreaElm = document.querySelector('.js-doneTodoArea');    

    let today = this.getDate();
    const commonArray = navAndCommon.commonArray();
    const frequencyArray = commonArray[0];
    const youbiArray = commonArray[1];
    const othersArray = commonArray[2];
    let youbiIndex = (today[3]==0) ? 6 : (today[3]-1);
    let todayString = `${today[0]}-${today[1]}-${today[2]}`;

    const displayTodoList = () => {
      let resultTodaysTodo = `<p>今日（${today[1]}月${today[2]}日${youbiArray[youbiIndex]}曜日）のtodo</p>`;
      let resultNotAchievedTodo = `<p>今週の未達todo</p>`;
      let resultDoneTodo = `<p>今日の完了済みtodo</p>`;
  
      this.activeGoalList = [];

      this.weeklyTodoData.forEach((val, key) => {
        let periodArray = val.period.split(',').map(Number);

        if(periodArray[0]==today[0] && periodArray[1]==today[1] && periodArray[2]<=today[2] && periodArray[3]>=today[2] && val.youbiArray[youbiIndex]) {
          if(!this.activeGoalList.includes(val.goal)) {
            this.activeGoalList.push(val.goal);
          }
          if(!val.isAchievedArray[todayString]) {
            resultTodaysTodo += `<div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input js-todoCheckbox" id="todo-${key}" data-key="${key}">
                <label class="form-check-label" for="todo-${key}">${val.todo}</label>
              </div>`;
          }
          if(val.isAchievedArray[todayString]) {
            resultDoneTodo += `<div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input js-todoCheckbox" id="done-${key}" data-key="${key}" checked>
            <label class="form-check-label" for="done-${key}"><s class="text-secondary">${val.todo}</s></label>
          </div>`;
          }
          let todaysIndex = val.stringArray.indexOf(todayString);
          val.stringArray.forEach((val2, key2) => {
            if(todayString!=val2 && !val.isAchievedArray[val2] && todaysIndex>key2) {
              resultNotAchievedTodo += `<div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input js-todoCheckboxNotAchieved" id="notAchieved-${val2}-${key}" data-key="${key},${val2}">
              <label class="form-check-label" for="notAchieved-${val2}-${key}">${val.todo}（${val.stringArrayForDisplay[key2]}）</label>
            </div>`;  
            }  
          });
        }
      });
      todaysTodoAreaElm.innerHTML = resultTodaysTodo;
      doneTodoAreaElm.innerHTML = resultDoneTodo;
      notAchievedTodoAreaElm.innerHTML = resultNotAchievedTodo;  
    };
    displayTodoList();

    const todoListAreaElm = document.querySelector('.js-todoListArea');
    let activeGoalListResult = '';
    let activeGoalListArray = [];
    
    this.activeGoalList.forEach(val => {
      activeGoalListResult += `<li>${val}</li>`;
      activeGoalListArray.push(val);
    });
    todoListAreaElm.innerHTML = activeGoalListResult;

    const todoRewardsAreaElm = document.querySelector('.js-todoRewardsArea');

    let rewardsText = '';
    this.rewardsData.forEach((val, key) => {
      val.rewardsweekly.period.forEach((val2, index2) => {
        if(val2 && val2!='undefined') {
          let periodArray = val2.split(',').map(Number);
          if(periodArray[0]==today[0] && periodArray[1]==today[1] && periodArray[2]<=today[2] && periodArray[3]>=today[2]) {
            rewardsText = `「${val.goal}：${val.rewardsweekly.rewards[index2]}（ ${val.rewardsweekly.percent[index2]}%で達成）」`;
          }
        } 
      })
    });

    let optionHTML = `<option value="全ての目標">全ての目標</option>`;
    activeGoalListArray.forEach((val, index) => {
      optionHTML += `<option value="${val}">${val}</option>`;
    });
    todoRewardsAreaElm.innerHTML = `<div class="row">
      <select name="rewardsResult" id="rewardsResult" class="form-select mb-3">${optionHTML}</select>
      <div class="col text-center">今日のtodo達成率<br>33%</div>
      <div class="col text-center">今週のtodo達成率<br>90%</div>
    </div>
    <p class="mt-3">今週のご褒美は${rewardsText}です。達成できるように頑張ろう！</p>`;

    const that = this;
    const setEventChangeTodo = () => {
      let todoCheckboxElms = document.querySelectorAll('.js-todoCheckbox');
      todoCheckboxElms.forEach((elm, index) => {
        elm.addEventListener('change', function() {
          let key = parseInt(this.dataset.key);
          let selectedData = that.weeklyTodoData.get(key);
          selectedData.isAchievedArray[todayString] = this.checked;
          that.weeklyTodoData.set(key, selectedData);
          localStorage.setItem('goalManagementWeeklyTodoData', JSON.stringify([...that.weeklyTodoData]));
          displayTodoList();
          setEventChangeTodo();
        })
      });
    };
    setEventChangeTodo();

    const setEventChangeNotAchievedTodo = () => {
      let todoCheckboxElms = document.querySelectorAll('.js-todoCheckboxNotAchieved');
      todoCheckboxElms.forEach((elm, index) => {
        elm.addEventListener('change', function() {
          let keyArray = this.dataset.key.split(',');
          let key = parseInt(keyArray[0]);
          let selectedData = that.weeklyTodoData.get(key);
          selectedData.isAchievedArray[keyArray[1]] = this.checked;
          that.weeklyTodoData.set(key, selectedData);
          localStorage.setItem('goalManagementWeeklyTodoData', JSON.stringify([...that.weeklyTodoData]));
          displayTodoList();
          setEventChangeNotAchievedTodo();
        })
      });
    };
    setEventChangeNotAchievedTodo();

  };


  Todo.prototype.setEvent = function() {
    this.displayTodoPage();
  };

  Todo.prototype.run = function() {
    this.setEvent();
  };


  window.addEventListener('DOMContentLoaded', function() {
    navAndCommon = new NavAndCommon();
    navAndCommon.run();

    settings = new Settings();
    settings.run();

    todo = new Todo();
    todo.run();
  });

}());