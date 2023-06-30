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
