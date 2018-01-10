
var branch_array = [];  //company name
var category_array = []; //category name
var subcategory_array = []; //subcategory name
var items_array = []; //items name
var total_sales = 0;
var total_items = 0;
var chart1, chart2;
var logined_phone = window.localStorage.getItem('phone_number');

function initSelect(sel_id) {
  var sel = document.getElementById(sel_id);
  sel.options.length = 0;
  var all_opt = document.createElement('option');
  if (sel_id == 'Branch');
    all_opt.innerHTML = 'All';
  if (sel_id == 'category')
    all_opt.innerHTML = 'All Categories';
  if (sel_id == 'sub_category')
    all_opt.innerHTML = 'All Subcategories';
  if (sel_id == 'items')
    all_opt.innerHTML = 'All Items';
  all_opt.value = 'all';
  sel.appendChild(all_opt);
};

function showBranches() {
  var ref = firebase.database().ref('production').child('accounts');
  var sel = document.getElementById('Branch');
  branch_array = [];
  initSelect('Branch');
  ref.once("value").then(function(snapshot) {
    snapshot.forEach(function(childSnap) {
      if (childSnap.child("profile/ownerphone").val() == logined_phone) {
        branch_array.push(childSnap.key);
        var opt = document.createElement('option');
        opt.innerHTML = childSnap.child("profile/company_name").val();
        opt.value = childSnap.key;
        sel.appendChild(opt);
      }
    });
    showCategories();
    initialSearch();
  });
};

function getCategories(current_branch, sel, flag) {
  category_array = [];
  var ref = firebase.database().ref('production').child('accounts/' + current_branch + '/product_categories');
  ref.once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnap) {
      if (!childSnap.child('is_subcategory').val()) {
        category_array.push(childSnap.key);
        var opt = document.createElement('option');
        opt.innerHTML = childSnap.child('title').val();
        opt.value = childSnap.key;
        sel.appendChild(opt);
      }
    });
    if (flag) showSubcategories();
  });
};

function showCategories() {
  var sel = document.getElementById('category');
  initSelect('category');
  var current_branch = document.getElementById('Branch').value;
  if (current_branch == 'all') {
    for (i=0; i<branch_array.length; i++) {
      if (i == branch_array.length - 1) {
        getCategories(branch_array[i], sel, true);
      } else {
        getCategories(branch_array[i], sel, false);
      }
    }
  } else {
    getCategories(current_branch, sel, true);
  }
};

function getSubcategories(current_branch, current_category, sel) {
  subcategory_array = [];
  var ref = firebase.database().ref('production').child('accounts/' + current_branch + '/product_categories');
  ref.once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnap) {
      if (childSnap.child('is_subcategory').val() 
      && (current_category == 'all' || current_category == childSnap.child('parrentCategoryID').val())) {
        subcategory_array.push(childSnap.key);
        var opt = document.createElement('option');
        opt.innerHTML = childSnap.child('title').val();
        opt.value = childSnap.key;
        sel.appendChild(opt);
      }
    });
    showItems();
  });
}

function showSubcategories() {
  var sel = document.getElementById('sub_category');
  initSelect('sub_category');
  var current_branch = document.getElementById('Branch').value;
  var current_category = document.getElementById('category').value;
  if (current_branch == 'all') {
    for (i=0; i<branch_array.length; i++) {
      getSubcategories(branch_array[i], current_category, sel);
    }
  } else {
    getSubcategories(current_branch, current_category, sel);
  }
};

function getItems(current_branch, current_category, current_subcategory, sel) {
  items_array = [];
  var ref = firebase.database().ref('production').child('accounts/' + current_branch + '/items');
  if ((current_category == 'all')&&(current_subcategory == 'all')) {
    ref.once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnap) {
        var opt = document.createElement('option');
        items_array.push(childSnap.child('name').val());
        opt.innerHTML = childSnap.child('name').val();
        opt.value = childSnap.child('name').val();
        sel.appendChild(opt);
      });
    });
  }
  if (current_subcategory != 'all') {
    ref.once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnap) {
        var opt = document.createElement('option');
        if (childSnap.child('category_id').val() == current_subcategory) {
          items_array.push(childSnap.child('name').val());
          opt.innerHTML = childSnap.child('name').val();
          opt.value = childSnap.child('name').val();
          sel.appendChild(opt);
        }
      });
    });
  }
  if ((current_category != 'all')&&(current_subcategory == 'all')) {
    ref.once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnap) {
        if (subcategory_array.length != 0){
          for (var i = 0; i < subcategory_array.length; i++) {
            var opt = document.createElement('option');
            if ((childSnap.child('category_id').val() == current_category) 
            ||(childSnap.child('category_id').val() == subcategory_array[i])){
              items_array.push(childSnap.child('name').val());
              opt.innerHTML = childSnap.child('name').val();
              opt.value = childSnap.child('name').val();
              sel.appendChild(opt);
            }
          }
        }
        if(subcategory_array.length == 0){
          var opt = document.createElement('option');
          if ((childSnap.child('category_id').val() == current_category) 
          ||(childSnap.child('category_id').val() == subcategory_array[i])){
            items_array.push(childSnap.child('name').val());
            opt.innerHTML = childSnap.child('name').val();
            opt.value = childSnap.child('name').val();
            sel.appendChild(opt);
          }
        }
      });
    });
  }
}

function showItems() {
  var sel = document.getElementById('items');
  initSelect('items');
  var current_branch = document.getElementById('Branch').value;
  var current_category = document.getElementById('category').value;
  var current_subcategory = document.getElementById('sub_category').value;
  if (current_branch == 'all') {
    for (i=0; i<branch_array.length; i++)
      getItems(branch_array[i], current_category, current_subcategory, sel);
  } else {
    getItems(current_branch, current_category, current_subcategory, sel);
  }
}

function submitSearch() {
  var current_branch = document.getElementById('Branch').value;
  var current_category = document.getElementById('category').value;
  var current_subcategory = document.getElementById('sub_category').value;
  var current_item = document.getElementById('items').value;
  var start_time = new Date(document.getElementById('start_date').value).setHours(0, 0, 0, 0).valueOf();
  var end_time = new Date(document.getElementById('end_date').value).setHours(0, 0, 0, 0).valueOf();
  end_time = end_time + 24 * 36e5;
  getSales(start_time, end_time, current_branch, current_category, current_subcategory, current_item, false);
}

function initialSearch() {
  getSales(new Date().setHours(0, 0, 0, 0).valueOf() - 6 * 24 * 36e5, undefined, 'all', null, null, null, true);
  
};

function getSales(fromDate, toDate, current_branch, current_category, current_subcategory, current_item, first_time) {
  if (isNaN(toDate)) {
    toDate = new Date().setHours(0, 0, 0, 0).valueOf() + 24 *36e5;
    document.getElementById('title').innerHTML = 'Today Sales';
  }
  if (toDate == fromDate) {
    document.getElementById('title').innerHTML = document.getElementById('start_date').value;
  }
  else {
   document.getElementById('title').innerHTML = 'Total Sales'; 
  }
  var size = isNaN(fromDate) ? 7 : Math.min(7, Math.floor((toDate - fromDate) / (24 * 36e5)));
  var sales_sum = Array(size).fill(0);
  var items_sum = Array(size).fill(0);
  total_sales = 0;
  total_items = 0;

  var branches = current_branch == 'all' ? branch_array : [current_branch];
  var categories = current_category === null ? [] : (current_category == 'all' ? category_array : [current_category]);
  var subcategories = current_subcategory === null ? [] : 
                      (current_subcategory == 'all' ? subcategory_array : [current_subcategory]);
  var items = current_item === null ? [] : (current_item == 'all' ? items_array : [current_item]);

  var ref = firebase.database().ref('production').child('accounts');
  ref.once('value').then(function(snapshot) {
    for (var i in branches) {
      snapshot.child(branches[i] + '/sales').forEach(function(childSnap) {
        var timestamp = childSnap.child('timestamp').val();
        if ((isNaN(fromDate) || timestamp >= fromDate) && timestamp <= toDate) {
          childSnap.child('items').forEach(function(item) {
            var itemName = item.child('name').val();
            var categoryID = item.child('category_id').val().toString();
            if ((!categories.length && !subcategories.length && !items.length) 
              || (items.indexOf(itemName) > -1 
              && (categories.indexOf(categoryID) > -1 || subcategories.indexOf(categoryID) > -1))) {

              var index = (toDate - timestamp - (toDate - timestamp) % (24 * 36e5)) / (24 * 36e5);
              if (index < 7) {
                sales_sum[index] += item.child('count').val() * item.child('price').val();
                items_sum[index] += item.child('count').val();
              }

              total_sales += item.child('count').val() * item.child('price').val();
              total_items += item.child('count').val();
            }
          });
        }
      });
    }
    if (first_time) {
      total_sales = sales_sum[0];
      total_items = items_sum[0];
      document.getElementById('title').innerHTML = 'Today Sales';  
    }
    // if (isfromDate)
    document.getElementById('sum_sales').value = numberWithCommas(total_sales);
    document.getElementById('sum_items').value = numberWithCommas(total_items);
    
    
    sales_sum.reverse();
    items_sum.reverse();


    chart1 = new Chart(document.getElementById("myChart1").getContext('2d'), {
      type: 'bar',
      data: {
        labels: sales_sum.map(function(value, key) {
          return new Date(toDate - (key + 1) * 24 * 36e5).getDate();
        }).reverse(),
        datasets: [{
          data: sales_sum.map(function(value, key) {
            return value;
          }),
          backgroundColor: sales_sum.map(function(value, key) {
            if (first_time && key == sales_sum.length - 1) return 'rgb(95, 194, 175)';
            return 'rgb(171, 171, 171)';
          })
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        },
        legend: {
          display: false
        }
      }
    });

    chart2 = new Chart(document.getElementById("myChart2").getContext('2d'), {
      type: 'bar',
      data: {
        labels: items_sum.map(function(value, key) {
          return new Date(toDate - (key + 1) * 24 * 36e5).getDate();
        }).reverse(),
        datasets: [{
          data: items_sum.map(function(value, key) {
            return value;
          }),
          backgroundColor: items_sum.map(function(value, key) {
            if (first_time && key == items_sum.length - 1) return 'rgb(95, 194, 175)';
            return 'rgb(171, 171, 171)';
          })
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        },
        legend: {
          display: false
        }
      }
    });
  });
};

window.onload = function() {
  /*sash-firebase info*/
  var config = {
    apiKey: "AIzaSyAs4mb7BhQMYe8ntiyT5jXBozGeGiVScDo",
    authDomain: "sash-f621c.firebaseapp.com",
    databaseURL: "https://sash-f621c.firebaseio.com",
    projectId: "sash-f621c",
    storageBucket: "sash-f621c.appspot.com",
    messagingSenderId: "213097256501"
  };

  firebase.initializeApp(config);
  showBranches();
  document.getElementById("sum_sales").value = numberWithCommas(total_sales);
  document.getElementById("sum_items").value = numberWithCommas(total_items);
}

/*start date and end date validation*/
$("#end_date").change(function () {
  var startDate = document.getElementById("start_date").value;
  var endDate = document.getElementById("end_date").value;
  if ((Date.parse(endDate) < Date.parse(startDate))) {
    document.getElementById('end_date').style.borderColor = 'red';
    document.getElementById("end_date").value = "";
  } else {
    document.getElementById('end_date').style.borderColor = 'white';      
  }
});
$("#start_date").change(function () {
  var startDate = document.getElementById("start_date").value;
  var endDate = document.getElementById("end_date").value;
  if ((Date.parse(endDate) < Date.parse(startDate))) {
    document.getElementById('start_date').style.borderColor = 'red';
    document.getElementById("start_date").value = "";
  } else {
    document.getElementById('start_date').style.borderColor = 'white'; 
  }
});

/*3units number*/
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}