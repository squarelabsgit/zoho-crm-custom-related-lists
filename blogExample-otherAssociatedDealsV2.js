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
