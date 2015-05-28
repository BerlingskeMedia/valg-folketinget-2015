app = angular.module "app", []

app.controller "PollController", ($scope, $http) ->
  poll = this
  poll.result =
    total:
      red:
        percent: 0
        mandates: 0
      blue:
        percent: 0
        mandates: 0

  $http.get("gallup.xml",
    transformResponse: (data) ->
      x2js = new X2JS()
      return x2js.xml_str2json(data)
  ).success (data) ->
    latestPoll = data.result.polls.poll[0]
    lastPoll = data.result.polls.poll[1]
    poll.result.updated = new Date(latestPoll.updated.replace(" ", "T"))
    poll.result.doubters = latestPoll.doubters

    for entry in latestPoll.entries.entry
      poll.result[entry.party.letter] = {}
      poll.result[entry.party.letter].name = entry.party.name
      poll.result[entry.party.letter].percent = entry.percent
      poll.result[entry.party.letter].mandates = entry.mandates

      poll.result[entry.party.letter].name = "De Konservative" if entry.party.name is "Det Konservative Folkeparti"
      poll.result[entry.party.letter].name = "De Radikale" if entry.party.name is "Det Radikale Venstre"

      if parseInt(entry.supports) is 9 or parseInt(entry.supports) is 1
        poll.result.total.red.percent += parseFloat(entry.percent)
        poll.result.total.red.mandates += parseFloat(entry.mandates)
      else
        poll.result.total.blue.percent += parseFloat(entry.percent)
        poll.result.total.blue.mandates += parseFloat(entry.mandates)

    poll.result.total.rest = 100 - (poll.result.total.red.percent + poll.result.total.blue.percent)

    for entry in lastPoll.entries.entry
      poll.result[entry.party.letter].percentDeff = (poll.result[entry.party.letter].percent - entry.percent).toFixed(1)
      poll.result[entry.party.letter].mandatesDeff = (poll.result[entry.party.letter].mandates - entry.mandates).toFixed(0)

      if poll.result[entry.party.letter].percentDeff > 0
        poll.result[entry.party.letter].percentDeff = "+" + poll.result[entry.party.letter].percentDeff

      if poll.result[entry.party.letter].mandatesDeff > 0
        poll.result[entry.party.letter].mandatesDeff = "+" + poll.result[entry.party.letter].mandatesDeff

  true

app.directive "headerGraf", () ->
  return {
    restrict: "E",
    templateUrl: "templates/header-graf.html"
  }

app.directive "doubterGraf", () ->
  return {
    restrict: "E",
    templateUrl: "templates/doubter-graf.html"
  }

app.directive "redTotal", () ->
  return {
    restrict: "E",
    templateUrl: "templates/red-total.html"
  }

app.directive "redParties", () ->
  return {
    restrict: "E",
    templateUrl: "templates/red-parties.html"
  }


app.directive "blueTotal", () ->
  return {
    restrict: "E",
    templateUrl: "templates/blue-total.html"
  }

app.directive "blueParties", () ->
  return {
    restrict: "E",
    templateUrl: "templates/blue-parties.html"
  }
