//
//Refer to YouTube Video: https://youtu.be/04HJ1rjc1sA
//
//Get Deal Details
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get Contact
contact = dealMap.get("Contact_Name");
//Check the is a contact associated to the deal
if(!isnull(contact))
{
	//Get the Contacts Id
	contactId = contact.get("id");
	//Get all deals Related to the Contact
	relatedDeals = zoho.crm.getRelatedRecords("Deals","Contacts",contactId);
	//Prepare the filtered related deals list
	openRelatedDeals = List();
	//Exclude the current deal record and any closed deals, then add them to the openRelatedDeals List
	for each  deal in relatedDeals
	{
		if(deal.get("id") != dealId && !deal.get("Stage").contains("Closed"))
		{
			openRelatedDeals.add(deal);
		}
	}
	//Check new list contains at least 1 open deal to continue
	if(openRelatedDeals.size() > 0)
	{
		//Prepare the custom XML related list
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  openDeal in openRelatedDeals
		{
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			responseXML = responseXML + "<FL link='true' url='<<INSERT ZOHO CRM DEALS URL HERE>>" + openDeal.get("id") + "' val='Deal Name'>" + openDeal.get("Deal_Name") + "</FL>";
			responseXML = responseXML + "<FL val='Stage'>" + openDeal.get("Stage") + "</FL>";
			responseXML = responseXML + "<FL val='Closing Date'>" + openDeal.get("Closing_Date") + "</FL>";
			responseXML = responseXML + "<FL val='Amount'>$" + openDeal.get("Amount") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message returned of there are no other deals open for this contact.
		responseXML = "<error><message>No Other Open Deals</message></error>";
	}
}
else
{
	//Message returned of there is no contact associated to this deal.
	responseXML = "<error><message>No Contact Associated to this Deal</message></error>";
}
info responseXML;
return responseXML;
