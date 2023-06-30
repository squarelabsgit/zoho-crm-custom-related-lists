# Custom related lists in Zoho CRM
Blog Post: https://www.squarelabs.com.au/post/beyond-lookup-fields-building-custom-related-lists-in-zoho-crm

YouTube: https://youtu.be/04HJ1rjc1sA

Traditionally, related lists in Zoho CRM are created using lookup fields, which establish a direct relationship between records. However, Zoho CRM provides an alternative approach by allowing the creation of custom related lists. These lists enable you to display an filter associated data from multiple modules or sources, offering a more flexible and dynamic representation of information.

In this article, I'll take you through a step-by-step guide to building custom related lists in Zoho CRM, as well as some advanced ways to manipulate the data shown in those custom related lists. The example I'll be using in this tutorial is how to show other deals that are associated with the same account on a deal record. I will start off basic and build on it throughout the article and explain the rational behind the changes.

## Configuration & Deployment

To begin we need to setup a related list function. 

1. In settings under developer space select 'Functions'
2. Click 'New Function'
3. Enter a both function and display names and select the category to be 'Related List'
4. Click 'Create'
5. Click 'Edit Arguments'
6. Enter the function argument of 'dealId' and set it to type 'String'
7. Click 'Save'
8. Copy / Write your code and click 'Save'
9. Open any deal record and click 'Add Related List'
10. Click Functions
11. Click the 'Add Now' button next to the function you have created
12. Under argument mapping section next to the dealId argument press the '#' key
13. From the popup select Deals then Deal Id and click 'Done'
14. Click 'Save'

###### Screenshots of the steps to take are in the blog post. Link at the top.

### Data
Custom related lists offer a versatile way to display data from various related records, even if they are not directly linked. This is particularly useful when you need to provide additional context or related details to better understand a record's history or status.

In our example, since deals are not directly linked to each other due to the absence of a lookup field, the system does not provide a related list to display this information. We can however return all deals related to the account using deluge

### XML Format Example
A custom related list function must return the data in an XML String and not just as a list of JSON maps.

This is the following XML format we need to return to display the data.
```xml
<record>
     <row no="0">
          <FL val="Name1">value1</FL>
          <FL val="Name2">value2</FL>
          <FL val="Name3">value3</FL>
     </row>
     <row no="1">
          <FL val="Name1">value1</FL>
          <FL val="Name2">value2</FL>
          <FL val="Name3">value3</FL>
      </row>
</record>
```
We can also return back an message if no data is found in this format.
```xml
<error>
      <message>error message</message>
</error>
```
### XML Errors
If there is an issue with your XML String you will see this error when viewing the related list on the record. When this occurs review your code and run the function inside the script builder to check for errors.

![XML Errors](https://static.wixstatic.com/media/c8c3af_1637ef94c654437899a012a9ab6e9c74~mv2.png)

### V1 Example Code

This is are V1 basic custom related list where we get all the deals associated to the account and then we convert those deals into an XML String.
```js
//Get Deal Details
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get the account associated to the deal
account = dealMap.get("Account_Name");
//Check there is an account associated to the deal
if(!isnull(account))
{
	//Get the Account Id
	accountId = account.get("id");
	//Get all deals related to the account
	relatedDeals = zoho.crm.getRelatedRecords("Deals","Accounts",accountId);
	//Check new list contains at least 1 deal
	if(relatedDeals.size() > 0)
	{
		//Prepare the custom XML related list
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  deal in relatedDeals
		{
			//info deal;
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			responseXML = responseXML + "<FL val='Deal Name'>" + deal.get("Deal_Name") + "</FL>";
			responseXML = responseXML + "<FL val='Stage'>" + deal.get("Stage") + "</FL>";
			responseXML = responseXML + "<FL val='Closing Date'>" + deal.get("Closing_Date") + "</FL>";
			responseXML = responseXML + "<FL val='Amount'>$" + deal.get("Amount") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message returned of there are no other deals for this account.
		responseXML = "<error><message>No Other Deals</message></error>";
	}
}
else
{
	//Message returned of there is no account associated to this deal.
	responseXML = "<error><message>No Account Associated to this Deal</message></error>";
}
info responseXML;
return responseXML;
```

### V1 Example Result

![V1 Result](https://static.wixstatic.com/media/c8c3af_034076b0a2904d9586ecc7825e9aab9e~mv2.png/v1/fill/w_3588,h_1021,al_c,q_90/c8c3af_034076b0a2904d9586ecc7825e9aab9e~mv2.webp)

In this example, we can see all deals associated with the account being displayed on the deal record. However, you may have noticed a few issues with it:

1. The deal we are currently viewing is included in the list
2. There is a 'null' value for a deal that has no closing date
3. The dates are formatted as yyyy-MM-dd
4. The amount value is not formatted
5. The deals listed are not ordered in any particular way
6. There are no links to the records listed

In the next part of the article, we will explore more advanced features to leverage the custom related lists and ensure the data is displayed exactly as desired, addressing all the issues mentioned above.

### Filtering
As a custom related list is created by a custom function this allows us to manipulate the data collected before displaying it. This means we can filter out data we don't want to display or deem irrelevant at the time.

Using our example above, we can update our code to filter out the deal that we are currently viewing and while we are at it, lets also filter out closed deals so we are only showing the the accounts open deals.

### V2 Example Code
```js
//Get Deal Details
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get the account associated to the deal
account = dealMap.get("Account_Name");
//Check there is an account associated to the deal
if(!isnull(account))
{
	//Get the Account Id
	accountId = account.get("id");
	//Get all deals related to the account
	relatedDeals = zoho.crm.getRelatedRecords("Deals","Accounts",accountId);
	/*************FILTERING SECTION START************/
	//Remove the deals we dont want to display
	for each  deal in relatedDeals
	{
		if(deal.get("id") == dealId || deal.get("Stage").contains("Closed"))
		{
			relatedDeals.removeElement(deal);
		}
	}
	/*************FILTERING SECTION END************/
	//Check new list contains at least 1 deal
	if(relatedDeals.size() > 0)
	{
		//Prepare the custom XML related list
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  deal in relatedDeals
		{
			//info deal;
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			responseXML = responseXML + "<FL val='Deal Name'>" + deal.get("Deal_Name") + "</FL>";
			responseXML = responseXML + "<FL val='Stage'>" + deal.get("Stage") + "</FL>";
			responseXML = responseXML + "<FL val='Closing Date'>" + deal.get("Closing_Date") + "</FL>";
			responseXML = responseXML + "<FL val='Amount'>$" + deal.get("Amount") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message returned of there are no other open deals for this account.
		responseXML = "<error><message>No Other Open Deals</message></error>";
	}
}
else
{
	//Message returned of there is no account associated to this deal.
	responseXML = "<error><message>No Account Associated to this Deal</message></error>";
}
info responseXML;
return responseXML;
```

### V2 Example Result

![V2 Example](https://static.wixstatic.com/media/c8c3af_8bd655bff10247fbaa6f4cdbf0224320~mv2.png/v1/fill/w_3588,h_777,al_c,q_90/c8c3af_8bd655bff10247fbaa6f4cdbf0224320~mv2.webp)

### Linking Data & Formatting
Now that we have the right data being displayed in the related list, it is important to create a link to open the corresponding record. This feature is crucial and can be easily achieved in a custom related list. To accomplish this, we need to modify our FL Tag in the XML to include both a link and URL attribute, as shown in the example below:

```js
<FL link='true' url='https://www.url.com' val='Name'>Value</FL>"
```
If your related list contains date and currency values, you will most likely want to format them from the defaulted yyyy-MM-dd. As dates and currencies differ based on country locale this can be a little tricky. If your crm users are located in one location then you can format all dates and currencies to the same format, however if those users are spread out across the globe you might want to inherit their country locale format.

### Date & Time
Each user in the crm selects the country they are located in which defaults the date format for that country locale. e.g. Australia it will be dd/MM/yyyy and in the United States it will be MM/dd/yyyy. Users can also set their time preference which is either 12 or 24 hour time, this data is accessible from the users record and able to be used to format the the date/time when viewing a custom related list.

### Currencies
The way currencies are formatted and displayed also varies by country, the best way to do this is by using a regular expression for the preferred format. By creating a list of the countries that format using decimals as a thousands separator we can check the users locale to the list to format the currency correctly otherwise we default to comma to separate thousands.

Comma thousands separator with decimal fractional separator: 1,234.56
```js
amountValue.toDecimal().round(2).toString().replaceAll("(?<!\.\d)(?<=\d)(?=(?:\d\d\d)+\b)",",")
```
Decimal thousands separator with comma fractional separator: 1.234,56
```js
amountValue.toDecimal().round(2).toString().replaceAll("\.",",").replaceAll(("(?<!,\d)(?<=\d)(?=(?:\d\d\d)+\b)"),".");
```

### V3 Example Code
```js
/*************GETTING USER DATE/TIME & CURRENCY FORMATS START**************/
//Get the current logged in users data
userSearchCriteria = "(email:equals:" + zoho.loginuserid + ")";
userList = zoho.crm.searchRecords("users",userSearchCriteria).get("users");
userMap = userList.get(0);
info userMap;
//get users date & time format
userDateFormat = userMap.get("date_format");
userTimeFormat = userMap.get("time_format");
//get users currency local
countryLocal = userMap.get("country_locale");
countryCurrencyFormatDecimal = {"AR","BR","DK","DE","FR","HU","IL","PL","PH","RU","SE"};
/*************GETTING USER DATE/TIME & CURRENCY FORMATS FORMAT END**************/
//Get Deal Details
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get the account associated to the deal
account = dealMap.get("Account_Name");
//Check there is an account associated to the deal
if(!isnull(account))
{
	//Get the Account Id
	accountId = account.get("id");
	//Get all deals related to the account
	relatedDeals = zoho.crm.getRelatedRecords("Deals","Accounts",accountId);
	//Remove the deals we dont want to display
	for each  deal in relatedDeals
	{
		if(deal.get("id") == dealId || deal.get("Stage").contains("Closed"))
		{
			relatedDeals.removeElement(deal);
		}
	}
	//Check new list contains at least 1 deal
	if(relatedDeals.size() > 0)
	{
		//Prepare the custom XML related list
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  deal in relatedDeals
		{
			/*************FORMATTING START**************/
			//Check the amount is not null and format the value to include a commas.
			if(!isnull(deal.get("Amount")))
			{
				dealAmount = deal.get("Amount");
				//Check which format the currency will be in by checking the users local vs the country list
				if(countryCurrencyFormatDecimal.contains(countryLocal))
				{
					formattedDealAmount = dealAmount.toDecimal().round(2).toString().replaceAll("\.",",").replaceAll("(?<!,\d)(?<=\d)(?=(?:\d\d\d)+\b)",".");
					deal.put("Amount",formattedDealAmount);
				}
				else
				{
					formattedDealAmount = dealAmount.toDecimal().round(2).toString().replaceAll("(?<!\.\d)(?<=\d)(?=(?:\d\d\d)+\b)",",");
					deal.put("Amount",formattedDealAmount);
				}
			}
			else
			{
				//if its null just put a hyphen to prevent 'null'
				deal.put("Amount","-");
			}
			//Check the closing date is not null and format the date
			if(!isnull(deal.get("Closing_Date")))
			{
				formattedClosingDate = deal.get("Closing_Date").replaceAll("T"," ").toString(userDateFormat);
				deal.put("Closing_Date",formattedClosingDate);
			}
			else
			{
				//if its null just put a hyphen to prevent 'null'
				deal.put("Closing_Date","-");
			}
			//Format the created time
			formattedCreatedTime = deal.get("Created_Time").replaceAll("T"," ").toString(userDateFormat + " " + userTimeFormat);
			deal.put("Created_Time",formattedCreatedTime);
			//create a url to the deal
			deal.put("url","https://crm.zoho.com/crm/org813914788/tab/Potentials/" + deal.get("id"));
			/*************FORMATTING END**************/
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			/*************UPDATED LINK START**************/
			responseXML = responseXML + "<FL link='true' url='" + deal.get("url") + "' val='Deal Name'>" + deal.get("Deal_Name") + "</FL>";
			/*************UPDATED LINK END**************/
			responseXML = responseXML + "<FL val='Stage'>" + deal.get("Stage") + "</FL>";
			responseXML = responseXML + "<FL val='Closing Date'>" + deal.get("Closing_Date") + "</FL>";
			responseXML = responseXML + "<FL val='Amount'>$" + deal.get("Amount") + "</FL>";
			responseXML = responseXML + "<FL val='Created Time'>" + deal.get("Created_Time") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message returned of there are no other deals for this account.
		responseXML = "<error><message>No Other Deals</message></error>";
	}
}
else
{
	//Message returned of there is no account associated to this deal.
	responseXML = "<error><message>No Account Associated to this Deal</message></error>";
}
info responseXML;
return responseXML;
```

### V3 Example Result

![V3 Result](https://static.wixstatic.com/media/c8c3af_301a63c8beb84adfbc3452c4e1f60595~mv2.png/v1/fill/w_3588,h_1021,al_c,q_90/c8c3af_301a63c8beb84adfbc3452c4e1f60595~mv2.webp)

### Sorting
A custom related list is displayed in the order that the record resides in the list. So we just need to sort the list by one of the data points right? Yes, however as we are writing in deluge and dealing with a list of JSON maps its not as easy as running a sort function over the list. I have created an article on how to sort a list of maps by a specific field which you can read in more detail for a more technical explanation of the way we are sorting in this example.

### V4 Example Code
```js
//Get the current logged in users data
userSearchCriteria = "(email:equals:" + zoho.loginuserid + ")";
userList = zoho.crm.searchRecords("users",userSearchCriteria).get("users");
userMap = userList.get(0);
info userMap;
//get users date & time format
userDateFormat = userMap.get("date_format");
userTimeFormat = userMap.get("time_format");
//get users currency local
countryLocal = userMap.get("country_locale");
countryCurrencyFormatDecimal = {"AR","BR","DK","DE","FR","HU","IL","PL","PH","RU","SE"};
/*************SORTING START**************/
//required list/map variables for sorting
unsortedKeys = List();
unsortedDealData = Map();
sortedRelatedDeals = List();
/*************SORTING END**************/
//Get Deal Details
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get the account associated to the deal
account = dealMap.get("Account_Name");
//Check there is an account associated to the deal
if(!isnull(account))
{
	//Get the Account Id
	accountId = account.get("id");
	//Get all deals related to the account
	relatedDeals = zoho.crm.getRelatedRecords("Deals","Accounts",accountId);
	//Remove the deals we dont want to display
	for each  deal in relatedDeals
	{
		if(deal.get("id") == dealId || deal.get("Stage").contains("Closed"))
		{
			relatedDeals.removeElement(deal);
		}
		/*************SORTING START**************/
		else
		{
			//Get the value you want to sort with and add the deal ID on the end if there is a chance it might not be unique.
			dealSortingValue = deal.get("Created_Time").replaceAll("T"," ").toString("yyyy-MM-dd HH:mm") + "-" + deal.get("id");
			//add the sorting values to a list
			unsortedKeys.add(dealSortingValue);
			//Add the deals data to the unsorted deal data map with the key and the deal map as the value
			unsortedDealData.put(dealSortingValue,deal);
		}
		/*************SORTING END**************/
	}
	/*************SORTING START**************/
	//Sort the keys
	sortedKeys = unsortedKeys.sort(true);
	//Compile the sorted list in order
	for each  key in sortedKeys
	{
		sortedRelatedDeals.add(unsortedDealData.get(key));
	}
	//write variable back to save having to update variable names further in the function
	relatedDeals = sortedRelatedDeals;
	/*************SORTING END**************/
	//Check new list contains at least 1 deal
	if(relatedDeals.size() > 0)
	{
		//Prepare the custom XML related list
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  deal in relatedDeals
		{
			//Check the amount is not null and format the value to include a commas.
			if(!isnull(deal.get("Amount")))
			{
				dealAmount = deal.get("Amount");
				//Check which format the currency will be in by checking the users local vs the country list
				if(countryCurrencyFormatDecimal.contains(countryLocal))
				{
					formattedDealAmount = dealAmount.toDecimal().round(2).toString().replaceAll("\.",",").replaceAll("(?<!,\d)(?<=\d)(?=(?:\d\d\d)+\b)",".");
					deal.put("Amount",formattedDealAmount);
				}
				else
				{
					formattedDealAmount = dealAmount.toDecimal().round(2).toString().replaceAll("(?<!\.\d)(?<=\d)(?=(?:\d\d\d)+\b)",",");
					deal.put("Amount",formattedDealAmount);
				}
			}
			else
			{
				//if its null just put a hyphen to prevent 'null'
				deal.put("Amount","-");
			}
			//Check the closing date is not null and format the date
			if(!isnull(deal.get("Closing_Date")))
			{
				formattedClosingDate = deal.get("Closing_Date").replaceAll("T"," ").toString(userDateFormat);
				deal.put("Closing_Date",formattedClosingDate);
			}
			else
			{
				//if its null just put a hyphen to prevent 'null'
				deal.put("Closing_Date","-");
			}
			//Format the created time
			formattedCreatedTime = deal.get("Created_Time").replaceAll("T"," ").toString(userDateFormat + " " + userTimeFormat);
			deal.put("Created_Time",formattedCreatedTime);
			//create a url to the deal
			deal.put("url","https://crm.zoho.com/crm/org813914788/tab/Potentials/" + deal.get("id"));
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			responseXML = responseXML + "<FL link='true' url='" + deal.get("url") + "' val='Deal Name'>" + deal.get("Deal_Name") + "</FL>";
			responseXML = responseXML + "<FL val='Stage'>" + deal.get("Stage") + "</FL>";
			responseXML = responseXML + "<FL val='Closing Date'>" + deal.get("Closing_Date") + "</FL>";
			responseXML = responseXML + "<FL val='Amount'>$" + deal.get("Amount") + "</FL>";
			responseXML = responseXML + "<FL val='Created Time'>" + deal.get("Created_Time") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message returned of there are no other deals for this account.
		responseXML = "<error><message>No Other Deals</message></error>";
	}
}
else
{
	//Message returned of there is no account associated to this deal.
	responseXML = "<error><message>No Account Associated to this Deal</message></error>";
}
info responseXML;
return responseXML;
```

### V4 Example Result

![V4 Result](https://static.wixstatic.com/media/c8c3af_69d084398440439788e3c9b773245ed9~mv2.png/v1/fill/w_3588,h_847,al_c,q_90/c8c3af_69d084398440439788e3c9b773245ed9~mv2.webp)

### Dealing with Special Characters
If you use some specific special characters in fields that you want to use in your related list they can cause errors. As we are creating an XML String in our related list some special characters have a predefined meaning and syntax within the XML markup language. These special characters include <, >, ", ', &, and sometimes others, depending on the context.

So how do stop these characters from causing an error in your related list? There are a few options available:

1. You can create a validation rule inside Zoho CRM on fields that are used in the related list, such as Deal Name that restricts the use of these special characters.

![Validation Rule Config](https://static.wixstatic.com/media/c8c3af_7fd3f05bd3e64f039ea07ae7a7ca84db~mv2.png)

![Validation Rule Example](https://static.wixstatic.com/media/c8c3af_ca3e92b6eaa642f3a8a6c65b38c13344~mv2.png)

2. You can use a series of .replaceAll() functions for these 5 characters and entering there corresponding escape sequence. This works on both column name and values.

| Special Character | Escape Sequence |
|------------------|-----------------|
| `<`              | `&lt;`          |
| `>`              | `&gt;`          |
| `"`              | `&quot;`        |
| `'`              | `&apos;`        |
| `&`              | `&amp;`         |

You can do this in the formatting section of the code like this.

```js
escapedDealName = deal.get("Deal_Name").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\"","&quot;").replaceAll("'","&apos;");
deal.put("Deal_Name",escapedDealName);
```
3. You can use a CDATA Section. This only works on the values that are passed through. and this is what it looks like.
```xml
<![CDATA[Special characters in the square brackets are ignored]]>
```
Here is an example including it in the creation of the XML String.
```js
responseXML = responseXML + "<FL val='Deal Name'><![CDATA[" + deal.get("Deal_Name") + "]]></FL>";
```
This is my personal favourite to use, as its cleaner to read in the code.

### V5 Example Code
Other Account Associated Deals V5
```js
//Get the current logged in users data
userSearchCriteria = "(email:equals:" + zoho.loginuserid + ")";
userList = zoho.crm.searchRecords("users",userSearchCriteria).get("users");
userMap = userList.get(0);
info userMap;
//get users date & time format
userDateFormat = userMap.get("date_format");
userTimeFormat = userMap.get("time_format");
//get users currency local
countryLocal = userMap.get("country_locale");
countryCurrencyFormatDecimal = {"AR","BR","DK","DE","FR","HU","IL","PL","PH","RU","SE"};
//required list/map variables for sorting
unsortedKeys = List();
unsortedDealData = Map();
sortedRelatedDeals = List();
//Get Deal Details
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get the account associated to the deal
account = dealMap.get("Account_Name");
//Check there is an account associated to the deal
if(!isnull(account))
{
	//Get the Account Id
	accountId = account.get("id");
	//Get all deals related to the account
	relatedDeals = zoho.crm.getRelatedRecords("Deals","Accounts",accountId);
	//Remove the deals we dont want to display
	for each  deal in relatedDeals
	{
		if(deal.get("id") == dealId || deal.get("Stage").contains("Closed"))
		{
			relatedDeals.removeElement(deal);
		}
		else
		{
			//Get the value you want to sort with and add the deal ID on the end if there is a chance it might not be unique.
			dealSortingValue = deal.get("Created_Time").replaceAll("T"," ").toString("yyyy-MM-dd HH:mm") + "-" + deal.get("id");
			//add the sorting values to a list
			unsortedKeys.add(dealSortingValue);
			//Add the deals data to the unsorted deal data map with the key and the deal map as the value
			unsortedDealData.put(dealSortingValue,deal);
		}
	}
	//Sort the keys
	sortedKeys = unsortedKeys.sort(true);
	//Compile the sorted list in order
	for each  key in sortedKeys
	{
		sortedRelatedDeals.add(unsortedDealData.get(key));
	}
	//write variable back to save having to update variable names further in the function
	relatedDeals = sortedRelatedDeals;
	//Check new list contains at least 1 deal
	if(relatedDeals.size() > 0)
	{
		//Prepare the custom XML related list
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  deal in relatedDeals
		{
			//Check the amount is not null and format the value to include a commas.
			if(!isnull(deal.get("Amount")))
			{
				dealAmount = deal.get("Amount");
				//Check which format the currency will be in by checking the users local vs the country list
				if(countryCurrencyFormatDecimal.contains(countryLocal))
				{
					formattedDealAmount = dealAmount.toDecimal().round(2).toString().replaceAll("\.",",").replaceAll("(?<!,\d)(?<=\d)(?=(?:\d\d\d)+\b)",".");
					deal.put("Amount",formattedDealAmount);
				}
				else
				{
					formattedDealAmount = dealAmount.toDecimal().round(2).toString().replaceAll("(?<!\.\d)(?<=\d)(?=(?:\d\d\d)+\b)",",");
					deal.put("Amount",formattedDealAmount);
				}
			}
			else
			{
				//if its null just put a hyphen to prevent 'null'
				deal.put("Amount","-");
			}
			//Check the closing date is not null and format the date
			if(!isnull(deal.get("Closing_Date")))
			{
				formattedClosingDate = deal.get("Closing_Date").replaceAll("T"," ").toString(userDateFormat);
				deal.put("Closing_Date",formattedClosingDate);
			}
			else
			{
				//if its null just put a hyphen to prevent 'null'
				deal.put("Closing_Date","-");
			}
			//Format the created time
			formattedCreatedTime = deal.get("Created_Time").replaceAll("T"," ").toString(userDateFormat + " " + userTimeFormat);
			deal.put("Created_Time",formattedCreatedTime);
			//create a url to the deal
			deal.put("url","https://crm.zoho.com/crm/org813914788/tab/Potentials/" + deal.get("id"));
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			/*********CDATA EXAMPLE START**********/
			responseXML = responseXML + "<FL link='true' url='" + deal.get("url") + "' val='Deal Name'><![CDATA[" + deal.get("Deal_Name") + "]]></FL>";
			/*********CDATA EXAMPLE END**********/
			responseXML = responseXML + "<FL val='Stage'>" + deal.get("Stage") + "</FL>";
			responseXML = responseXML + "<FL val='Closing Date'>" + deal.get("Closing_Date") + "</FL>";
			responseXML = responseXML + "<FL val='Amount'>$" + deal.get("Amount") + "</FL>";
			responseXML = responseXML + "<FL val='Created Time'>" + deal.get("Created_Time") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message returned of there are no other deals for this account.
		responseXML = "<error><message>No Other Deals</message></error>";
	}
}
else
{
	//Message returned of there is no account associated to this deal.
	responseXML = "<error><message>No Account Associated to this Deal</message></error>";
}
info responseXML;
return responseXML;
```

### V5 Example Result

![V5 Result](https://static.wixstatic.com/media/c8c3af_20bd59e2fa014b42b838e47a329d5432~mv2.png)

I hope this article has equipped you with all the necessary information and practical examples you need to create the ideal custom related list for your Zoho CRM system. By implementing the strategies and techniques outlined here, you can enhance your CRM experience and optimise your data representation. Best of luck in customising your related lists to meet your specific needs!

Need Help? Contact us!

Resources

GitHub Code: https://github.com/squarelabsgit/zoho-crm-custom-related-lists 

Zoho Documentation: https://www.zoho.com/developer/help/build-vertical-crm/customization/related-lists.html 

<a href="http://www.youtube.com/watch?feature=player_embedded&v=04HJ1rjc1sA" target="_blank"><img src="http://img.youtube.com/vi/04HJ1rjc1sA/0.jpg" 
alt="YouTube Video" width="240" height="180" border="10" /></a>
